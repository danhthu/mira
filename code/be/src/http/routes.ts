/**
 * Bảng route. Mỗi operation trong `code/contract/openapi.yaml` có đúng một handler ở đây.
 * Thứ tự trong mỗi handler: đọc tham số (400) → gọi service (404/409) → trả kết quả.
 *
 * Không có endpoint nào trả về điểm số, chuỗi ngày hay xếp hạng — đó là ràng buộc cứng
 * của sản phẩm, không phải chuyện còn thiếu.
 */
import type {
  Goal,
  GoalTier,
  Moment,
  MomentKind,
  MoneyMonth,
  SaltAnswer,
  TimeBucket,
  TimeEntry,
  TimeEntrySource,
} from '@mira/contract';
import type { AppDeps, Handler, PublicHandler, Req, Res } from './engine';
import { asObject, requireQuery } from './engine';
// TIME_BUCKETS lấy từ constants nội bộ chứ không từ @mira/contract: mọi import từ
// contract trong `be` phải là `import type` để tầng này không phụ thuộc runtime vào
// một package ESM, trong khi `be` biên dịch sang CommonJS.
import { TIME_BUCKETS } from '../shared/constants';
import { badRequest, notFound } from '../shared/errors';
import { assertDate, weekSummary } from '../services/time';
import { answerRevisit, createMoment, dueForRevisit } from '../services/moment';
import { assertMonth, buildMonthWithDerived } from '../services/money';
import {
  createMoneyCategory,
  renameMoneyCategory,
  archiveMoneyCategory,
  readMoneyCategory,
} from '../services/moneyCategory';
import {
  createMoneyEntry,
  updateMoneyEntry,
  deleteMoneyEntry,
} from '../services/moneyEntry';
import { createGoal, deleteGoal, endGoal, goalBudget, updateGoal } from '../services/goal';
import { createHabit, habitWeek, toggleCheck } from '../services/habit';
import { login, loginWithGoogle } from '../services/auth';
import { importSnapshot } from '../services/importSnapshot';
import { exportSnapshot } from '../services/exportSnapshot';
import { runRoutines, endRoutine, unskipDay, createRoutine, skipDay } from '../services/routine';
import { parseByRules } from '../services/parseSentence';
import {
  archiveCategory,
  readCategory,
  renameCategory,
  createCategory,
} from '../services/category';
import { createReminder, updateReminder, deleteReminder, skipReminder } from '../services/reminder';
import { checkRateLimit, resetCounter, PARSE_THRESHOLD } from './rateLimit';
import type { Money } from '../entities/Money';

// ─────────────────────────────────────────────────────── đọc tham số

function readBucket(value: unknown, field: string): TimeBucket {
  if (typeof value !== 'string' || !TIME_BUCKETS.includes(value as TimeBucket)) {
    throw badRequest(`${field} phải là một trong: ${TIME_BUCKETS.join(', ')}`);
  }
  return value as TimeBucket;
}

function readMinutes(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw badRequest(`${field} phải là số phút nguyên dương`);
  }
  return value;
}

/** VND nguyên hoặc null tường minh. `undefined` nghĩa là không gửi ô này lên. */
function readVnd(value: unknown, field: string): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw badRequest(`${field} phải là số VND nguyên hoặc null`);
  }
  return value;
}

function readText(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw badRequest(`${field} phải là chuỗi`);
  return value;
}

// ─────────────────────────────────────────────────────── đổi entity sang hợp đồng

const toContractEntry = (e: {
  id: string;
  date: string;
  minutes: number;
  bucket: TimeBucket;
  golden: boolean;
  note: string | null;
  source: TimeEntrySource;
  routineId: string | null;
  categoryId: string | null;
}): TimeEntry => ({
  id: e.id,
  date: e.date,
  minutes: e.minutes,
  bucket: e.bucket,
  routineId: e.routineId,
  categoryId: e.categoryId,
  golden: e.golden,
  note: e.note,
  source: e.source,
});

const toContractMoment = (m: {
  id: string;
  date: string;
  kind: MomentKind;
  text: string | null;
  revisitAt: string | null;
  revisitAnswer: SaltAnswer | null;
}): Moment => ({
  id: m.id,
  date: m.date,
  kind: m.kind,
  text: m.text,
  revisitAt: m.revisitAt,
  revisitAnswer: m.revisitAnswer,
});

const toContractGoal = (g: {
  id: string;
  tier: GoalTier;
  title: string;
  weeklyMinutes: number;
  sourceBucket: TimeBucket;
  startedOn: string;
  expiresOn: string | null;
  endedOn: string | null;
  handedOverTo: string | null;
}): Goal => ({
  id: g.id,
  tier: g.tier,
  title: g.title,
  weeklyMinutes: g.weeklyMinutes,
  sourceBucket: g.sourceBucket,
  startedOn: g.startedOn,
  expiresOn: g.expiresOn,
  endedOn: g.endedOn,
  handedOverTo: g.handedOverTo,
});



// ─────────────────────────────────────────────────────── handlers

const health: PublicHandler = async (): Promise<Res> => ({ status: 200, body: { ok: true } });

/** Bản sao lưu đầy đủ. Một lần gọi, lấy tất cả, kể cả thứ đã kết thúc hoặc đã dừng. */
const getExport: Handler = async (_req, deps, userId) => ({
  status: 200,
  body: await exportSnapshot(deps.db, userId),
});

// ── tài khoản: ba route công khai, ngoài /health
//
// `POST /auth/register` **đã bỏ** ngày 25/11/2026. Người mới vào bằng Google, và lần đầu
// đăng nhập là lần tài khoản được tạo. Giữ một route đăng ký không có màn nào gọi tới
// chỉ là một cánh cửa mở mà không ai nhìn.

const postGoogle: PublicHandler = async (req, deps) => {
  const body = asObject(req.body);
  // Chặn cả ở đây: kiểm chữ ký token tốn một lượt tải JWKS và một lượt mã hoá.
  const ip = req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for'] ?? '';
  checkRateLimit(ip, 'google');
  const out = await loginWithGoogle(deps.auth, body.idToken);
  resetCounter(ip, 'google');
  return { status: 200, body: out };
};

const postLogin: PublicHandler = async (req, deps) => {
  const body = asObject(req.body);
  const username = String(body.username ?? '');
  // Cloudflare Tunnel đặt IP thật vào cf-connecting-ip; chạy trực tiếp thì không có,
  // lúc đó vẫn đếm được theo tên đăng nhập.
  const ip = req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for'] ?? '';
  checkRateLimit(ip, username);
  const out = await login(deps.auth, username, String(body.password ?? ''));
  resetCounter(ip, username);
  return { status: 200, body: out };
};

/** Ai đang đăng nhập. Dùng để web biết token còn sống hay đã hết hạn. */
const getMe: Handler = async (_req, deps, userId) => {
  const user = await deps.users.findById(userId);
  if (user === null) throw notFound('Tài khoản không còn tồn tại');
  return {
    status: 200,
    body: { id: user.id, username: user.username, displayName: user.displayName },
  };
};

/**
 * Đọc một câu thành đề xuất. **Không ghi gì cả.**
 *
 * Luật trước, AI sau. Người dùng duyệt rồi client mới gọi các route ghi đã có — nên
 * đường ghi vẫn là đường đã kiểm, không có cửa sau nào mới.
 */
const postDoc: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  const cau = String(b.cau ?? '').trim();
  if (cau === '') throw badRequest('Chưa có câu nào để đọc.');
  if (cau.length > 500) throw badRequest('Câu dài quá 500 ký tự.');

  // Ngày "hôm nay" do client gửi: máy chủ ở múi giờ nào là chuyện của máy chủ, còn "hôm
  // qua" là hôm qua của người đang gõ. Thiếu thì mới lấy đồng hồ máy chủ.
  const homNay = assertDate(String(b.ngay ?? new Date().toISOString().slice(0, 10)), 'ngay');

  // Chặn dò khoá: mỗi lần gọi AI là tiền thật.
  const ip = req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for'] ?? '';
  checkRateLimit(ip, `doc|${userId}`, PARSE_THRESHOLD);

  // Danh mục người dùng tự đặt là từ khoá tốt nhất đang có — tốt hơn danh sách gõ cứng
  // trong `docCau`. Khớp được thì câu chat ghi ra mục ĐÃ phân loại, nên màn Thời gian
  // không đầy dòng trắng và cái danh mục họ vừa làm không thành vô dụng.
  const categories = await deps.categories.findActive(userId);
  const bc = { today: homNay, categories, moneyCategories: await deps.moneyCategories.findActive(userId) };

  // CHỈ CÓ TẦNG LUẬT. Không gọi LLM, không cần khoá API.
  //
  // Trước đây câu nào luật không đọc được thì đẩy sang Claude, và vì chưa có khoá nên
  // người dùng nhận về đúng một dòng: "Máy chủ chưa cấu hình ANTHROPIC_API_KEY". Đó là
  // lỗi của máy chủ nói bằng giọng máy chủ, ném vào mặt người đang ghi nhật ký.
  //
  // Founder chốt bỏ hẳn đường đó. Nghĩa là luật phải gánh hết, nên luật đã đổi: thời
  // lượng cộng tên việc là đủ ghi, ô thì đoán và nói rõ là đoán. Còn lại mới trả 'chiu',
  // và lúc đó client nói một câu tiếng người chứ không đọc tên biến môi trường.
  const kq = parseByRules(cau, bc);

  // Ghi lại ĐÚNG câu mà luật không đọc nổi.
  //
  // Không có dòng này thì "Mira chưa hiểu câu này" chỉ người dùng nhìn thấy, còn người
  // sửa luật thì mù: đáp trả vẫn là 200, log vẫn sạch, và cái lỗ trong bộ từ khoá không
  // bao giờ lộ ra. Mỗi câu ở đây là một từ khoá còn thiếu, hoặc một dạng câu chưa nghĩ tới.
  //
  // Chỉ ghi câu CHỊU, không ghi câu đọc được: đây là nhật ký đời sống, không phải chỗ
  // đổ toàn bộ những gì người ta gõ vào. Và log này nằm trên máy của chính chủ.
  if (kq.source === 'unparsed') {
    console.warn(JSON.stringify({ level: 40, time: Date.now(), tag: 'doc_chiu', cau }));
  }

  // Giữ lại từng lượt: câu nguyên văn + Mira hiểu ra gì.
  //
  // Đây là dữ liệu để sau này huấn luyện một mô hình chạy tại chỗ — xem migration 009.
  // Hàng quý nhất là hàng 'chiu': mỗi câu như vậy là một lỗ trong `parse-rules.json`.
  //
  // LỖI Ở ĐÂY KHÔNG ĐƯỢC LÀM HỎNG LỜI GỌI. Người dùng đang gõ một câu để ghi nhật ký;
  // kho dữ liệu huấn luyện trục trặc là việc của chúng ta, không phải của họ. Thà mất
  // một hàng huấn luyện còn hơn mất một mục nhật ký.
  try {
    await deps.chatLog.add(userId, cau, homNay, kq.source, kq);
  } catch (e: unknown) {
    console.warn(
      JSON.stringify({
        level: 40,
        time: Date.now(),
        tag: 'chat_log_hong',
        text: e instanceof Error ? e.message : String(e),
      }),
    );
  }

  return { status: 200, body: kq };
};

// ── nhắc: hẹn giờ gợi người dùng quay lại ghi
//
// Máy chủ CHỈ giữ ý định (mấy giờ, những thứ mấy) và danh sách ngày đã bỏ qua. Nó không
// tự gửi gì, và cũng không trả lời được câu "lời nhắc nào đang tới hạn" — trả lời được
// câu đó nghĩa là đã đoán múi giờ của người dùng, và đoán sai thì lời nhắc 21:00 nhảy
// ra lúc 14:00. Việc so giờ nằm ở client, nơi duy nhất biết mấy giờ thật.

const listReminders: Handler = async (req, deps, userId) => {
  const from = assertDate(String(req.query.from ?? ''), 'from');
  const to = assertDate(String(req.query.to ?? ''), 'to');
  const [ds, boQua] = await Promise.all([
    deps.reminders.findAll(userId),
    deps.reminders.skipsInRange(userId, from, to),
  ]);
  return { status: 200, body: { reminders: ds, skips: boQua } };
};

const postReminder: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  return { status: 201, body: await createReminder(deps, userId, { at: b.at, days: b.days, text: b.text }) };
};

const patchReminder: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  return { status: 200, body: await updateReminder(deps, userId, req.params.id ?? '', b) };
};

const deleteReminderRoute: Handler = async (req, deps, userId) => {
  await deleteReminder(deps, userId, req.params.id ?? '');
  return { status: 204, body: undefined };
};

const postSkipReminder: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  await skipReminder(deps, userId, req.params.id ?? '', assertDate(String(b.date ?? ''), 'date'));
  return { status: 204, body: undefined };
};

// ── danh mục: tên việc người dùng tự đặt, nằm trong một trong bốn ô

const listCategories: Handler = async (_req, deps, userId) => ({
  status: 200,
  body: await deps.categories.findActive(userId),
});

const postCategory: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  return {
    status: 201,
    body: await createCategory(deps, userId, {
      name: b.name,
      bucket: b.bucket,
      golden: b.golden,
      icon: b.icon,
      color: b.color,
    }),
  };
};

const patchCategory: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  return {
    status: 200,
    body: await renameCategory(deps, userId, req.params.id ?? '', {
      name: b.name,
      golden: b.golden,
      icon: b.icon,
      color: b.color,
    }),
  };
};

/** Cất đi, không xoá: mục giờ cũ còn trỏ về nó và lịch sử không được đổi. */
const postCategoryArchive: Handler = async (req, deps, userId) => ({
  status: 200,
  body: await archiveCategory(deps, userId, req.params.id ?? ''),
});

// ── nếp: khai một luật, Mira tự ghi, người dùng từ chối khi không đạt

const listRoutines: Handler = async (_req, deps, userId) => ({
  status: 200,
  body: await deps.routines.findActive(userId),
});

const postRoutine: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  const dm = await readCategory(deps, userId, b.categoryId);
  const nep = await createRoutine(
    { routines: deps.routines, timeEntries: deps.timeEntries },
    userId,
    {
      title: String(b.title ?? ''),
      bucket: b.bucket,
      minutes: b.minutes,
      golden: b.golden,
      days: b.days,
    },
    dm,
  );
  return { status: 201, body: nep };
};

/** Chạy mọi nếp tới hôm nay. Gọi lại nhiều lần không sinh trùng. */
const postRunRoutines: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  const ra = await runRoutines(
    { routines: deps.routines, timeEntries: deps.timeEntries },
    userId,
    String(b.date ?? ''),
  );
  return { status: 200, body: ra };
};

const postRoutineEnd: Handler = async (req, deps, userId) => ({
  status: 200,
  body: await endRoutine({ routines: deps.routines, timeEntries: deps.timeEntries }, userId, req.params.id ?? ''),
});

const postSkipDay: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  await skipDay(
    { routines: deps.routines, timeEntries: deps.timeEntries },
    userId,
    req.params.id ?? '',
    String(b.date ?? ''),
  );
  return { status: 204, body: undefined };
};

const postUnskipDay: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  await unskipDay(
    { routines: deps.routines, timeEntries: deps.timeEntries },
    userId,
    req.params.id ?? '',
    String(b.date ?? ''),
  );
  return { status: 204, body: undefined };
};

const listTimeEntries: Handler = async (req, deps, userId) => {
  const from = assertDate(requireQuery(req, 'from'), 'from');
  const to = assertDate(requireQuery(req, 'to'), 'to');
  const rows = await deps.timeEntries.findByDateRange(userId, from, to);
  return { status: 200, body: rows.map(toContractEntry) };
};

const createTimeEntry: Handler = async (req, deps, userId) => {
  const body = asObject(req.body);
  const dm = await readCategory(deps, userId, body.categoryId);
  const entry = await deps.timeEntries.create(userId, {
    date: assertDate(String(body.date ?? ''), 'date'),
    minutes: readMinutes(body.minutes, 'minutes'),
    // Có danh mục thì ô lấy TỪ DANH MỤC, không lấy từ client. Client gửi ô khác với ô
    // của danh mục thì một trong hai sai, và danh mục mới là thứ người dùng đã khai.
    bucket: dm?.bucket ?? readBucket(body.bucket, 'bucket'),
    golden: dm === null ? body.golden === true : body.golden === undefined ? dm.golden : body.golden === true,
    note: readText(body.note, 'note'),
    categoryId: dm?.id ?? null,
  });
  return { status: 201, body: toContractEntry(entry) };
};

const patchTimeEntry: Handler = async (req, deps, userId) => {
  const body = asObject(req.body);
  const id = req.params.id ?? '';
  const dm = body.categoryId === undefined ? null : await readCategory(deps, userId, body.categoryId);

  /**
   * ĐỔI Ô THÌ BỎ DANH MỤC, trừ khi cùng lúc chọn danh mục mới.
   *
   * Một danh mục thuộc đúng MỘT ô — "Đọc" của công việc khác "Đọc" của cá nhân. Trước
   * đây sửa riêng ô mà không gửi danh mục thì danh mục cũ ở lại, và mục giờ trỏ sang một
   * danh mục của ô khác. Catalog gom theo `ô|danh mục`, nên kết quả là cùng một cái tên
   * hiện dưới hai nhóm việc: "Chơi với con" nằm trong cả Gia đình lẫn Lãng phí.
   *
   * Lỗi này đã có thật trong dữ liệu, đúng một hàng, và chỉ lộ ra khi catalog gom lại —
   * trước đó danh sách phẳng chỉ hiện tên danh mục nên không ai thấy gì sai.
   *
   * Bỏ chứ không ép ô theo danh mục: người dùng vừa nói "việc này thuộc ô khác", và
   * giữ lại cái nhãn của ô cũ là cãi lại họ.
   */
  const doiO = body.bucket !== undefined && body.categoryId === undefined;

  const updated = await deps.timeEntries.update(userId, id, {
    minutes: body.minutes === undefined ? undefined : readMinutes(body.minutes, 'minutes'),
    bucket: dm?.bucket ?? (body.bucket === undefined ? undefined : readBucket(body.bucket, 'bucket')),
    golden: body.golden === undefined ? undefined : body.golden === true,
    note: body.note === undefined ? undefined : readText(body.note, 'note'),
    categoryId: doiO ? null : body.categoryId === undefined ? undefined : (dm?.id ?? null),
  });
  if (updated === null) throw notFound('Không có mục giờ với id này');
  return { status: 200, body: toContractEntry(updated) };
};

const deleteTimeEntry: Handler = async (req, deps, userId) => {
  const removed = await deps.timeEntries.softDelete(userId, req.params.id ?? '');
  if (removed === null) throw notFound('Không có mục giờ với id này');
  return { status: 204 };
};

const getWeek: Handler = async (req, deps, userId) => {
  const summary = await weekSummary(
    { timeEntries: deps.timeEntries, wakingMinutesPerWeek: deps.wakingMinutesPerWeek },
    userId,
    requireQuery(req, 'weekStart'),
  );
  return { status: 200, body: summary };
};

const listMoments: Handler = async (req, deps, userId) => {
  const from = assertDate(requireQuery(req, 'from'), 'from');
  const to = assertDate(requireQuery(req, 'to'), 'to');
  const rows = await deps.moments.findByDateRange(userId, from, to);
  return { status: 200, body: rows.map(toContractMoment) };
};

const postMoment: Handler = async (req, deps, userId) => {
  const body = asObject(req.body);
  const moment = await createMoment(deps, userId, {
    date: String(body.date ?? ''),
    kind: body.kind as MomentKind,
    text: readText(body.text, 'text'),
  });
  return { status: 201, body: toContractMoment(moment) };
};

const listDueMoments: Handler = async (req, deps, userId) => {
  const rows = await dueForRevisit(deps, userId, requireQuery(req, 'on'));
  return { status: 200, body: rows.map(toContractMoment) };
};

/**
 * Xoá mềm một hạt.
 *
 * Mở đường này vì màn chat ghi **tự động**: không có nút Ghi thì một câu đọc nhầm thành
 * hạt muối sẽ nằm trong hũ 42 ngày mà không gỡ được. Hũ đếm hạt để biết tuần nặng hay
 * nhẹ, nên một hạt sai làm lệch đúng chỗ đang đếm.
 *
 * `softDelete` đã có sẵn trong repository từ trước; ở đây chỉ nối dây ra ngoài.
 */
const patchMoment: Handler = async (req, deps, userId) => {
  const body = asObject(req.body);
  if (body.kind !== undefined && body.kind !== 'candy' && body.kind !== 'salt') {
    throw badRequest('kind phải là candy hoặc salt');
  }
  const ra = await deps.moments.update(userId, req.params.id ?? '', {
    text: body.text === undefined ? undefined : readText(body.text, 'text'),
    kind: body.kind as MomentKind | undefined,
  });
  // Hạt muối đã trả lời câu hỏi lại thì câu UPDATE không khớp — nói đúng lý do, đừng
  // trả về "không tìm thấy" cho một hạt đang nằm sờ sờ trên màn hình.
  if (ra === null) {
    throw notFound('Không sửa được hạt này. Hạt muối đã trả lời câu hỏi lại thì khoá.');
  }
  return { status: 200, body: toContractMoment(ra) };
};

const deleteMoment: Handler = async (req, deps, userId) => {
  const ra = await deps.moments.softDelete(userId, req.params.id ?? '');
  if (ra === null) throw notFound('Không có hạt nào như vậy.');
  return { status: 204, body: undefined };
};

const postRevisit: Handler = async (req, deps, userId) => {
  const body = asObject(req.body);
  const moment = await answerRevisit(deps, userId, req.params.id ?? '', {
    answer: body.answer as SaltAnswer,
  });
  return { status: 200, body: toContractMoment(moment) };
};

const getMoney: Handler = async (req, deps, userId) => {
  const month = assertMonth(req.params.month ?? '');
  return { status: 200, body: await buildMonthWithDerived(deps, userId, month) };
};

/**
 * Chỉ còn ghi được HAI Ô MỨC.
 *
 * Năm ô dòng chảy là tổng các khoản. Nhận chúng ở đây sẽ tạo ra hai đường ghi cho cùng
 * một con số, và đường nào thắng thì tuỳ thứ tự gọi — đúng cái bẫy "một sự thật, hai
 * chỗ ghi". Gửi lên thì từ chối thẳng, kèm câu chỉ đường.
 */
const putMoney: Handler = async (req, deps, userId) => {
  const month = assertMonth(req.params.month ?? '');
  const body = asObject(req.body);

  const dongChay = ['netIncome', 'monthlyExpense', 'investment', 'wastedMoney', 'debtPayment'];
  const lam = dongChay.filter((k) => body[k] !== undefined);
  if (lam.length > 0) {
    throw badRequest(
      `${lam.join(', ')} là ô tổng từ các khoản, không ghi thẳng được. Dùng POST /money-entries.`,
    );
  }

  await deps.money.upsert(userId, month, {
    debtBalance: readVnd(body.debtBalance, 'debtBalance'),
    netWorth: readVnd(body.netWorth, 'netWorth'),
  });
  return { status: 200, body: await buildMonthWithDerived(deps, userId, month) };
};

// ── danh mục tiền: khuôn y hệt danh mục thời gian

const listMoneyCategories: Handler = async (_req, deps, userId) => ({
  status: 200,
  body: await deps.moneyCategories.findActive(userId),
});

const postMoneyCategory: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  return {
    status: 201,
    body: await createMoneyCategory(deps, userId, {
      name: b.name,
      cell: b.cell,
      icon: b.icon,
      color: b.color,
    }),
  };
};

const patchMoneyCategory: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  return {
    status: 200,
    body: await renameMoneyCategory(deps, userId, req.params.id ?? '', {
      name: b.name,
      icon: b.icon,
      color: b.color,
    }),
  };
};

/** Cất đi, không xoá: khoản cũ còn trỏ về nó và lịch sử không được đổi. */
const postMoneyCategoryArchive: Handler = async (req, deps, userId) => ({
  status: 200,
  body: await archiveMoneyCategory(deps, userId, req.params.id ?? ''),
});

// ── khoản tiền

const listMoneyEntries: Handler = async (req, deps, userId) => {
  const from = assertDate(requireQuery(req, 'from'), 'from');
  const to = assertDate(requireQuery(req, 'to'), 'to');
  return { status: 200, body: await deps.moneyEntries.findByDateRange(userId, from, to) };
};

const postMoneyEntry: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  const dm = await readMoneyCategory(deps, userId, b.categoryId);
  return {
    status: 201,
    body: await createMoneyEntry(
      deps,
      userId,
      { date: b.date, amount: b.amount, cell: b.cell, note: b.note },
      dm,
    ),
  };
};

const patchMoneyEntry: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  const dm = b.categoryId === undefined ? undefined : await readMoneyCategory(deps, userId, b.categoryId);
  return {
    status: 200,
    body: await updateMoneyEntry(
      deps,
      userId,
      req.params.id ?? '',
      { date: b.date, amount: b.amount, cell: b.cell, note: b.note },
      dm,
    ),
  };
};

const deleteMoneyEntryRoute: Handler = async (req, deps, userId) => {
  await deleteMoneyEntry(deps, userId, req.params.id ?? '');
  return { status: 204, body: undefined };
};

const listGoals: Handler = async (req, deps, userId) => {
  const tier = req.query.tier as GoalTier | undefined;
  const rows =
    req.query.includeEnded === 'true'
      ? await deps.goals.findAll(userId, tier)
      : await deps.goals.findActive(userId, tier);
  return { status: 200, body: rows.map(toContractGoal) };
};

const postGoal: Handler = async (req, deps, userId) => {
  const body = asObject(req.body);
  const tier = body.tier;
  if (tier !== 'long' && tier !== 'quarter' && tier !== 'rhythm') {
    throw badRequest('tier phải là long, quarter hoặc rhythm');
  }
  const goal = await createGoal(deps, userId, {
    tier,
    title: String(body.title ?? ''),
    weeklyMinutes: readMinutes(body.weeklyMinutes, 'weeklyMinutes'),
    sourceBucket: body.sourceBucket === undefined ? undefined : readBucket(body.sourceBucket, 'sourceBucket'),
  });
  return { status: 201, body: toContractGoal(goal) };
};

const patchGoal: Handler = async (req, deps, userId) => {
  const body = asObject(req.body);
  const goal = await updateGoal(deps, userId, req.params.id ?? '', {
    title: body.title === undefined ? undefined : String(body.title),
    weeklyMinutes:
      body.weeklyMinutes === undefined ? undefined : readMinutes(body.weeklyMinutes, 'weeklyMinutes'),
  });
  return { status: 200, body: toContractGoal(goal) };
};

const deleteGoalRoute: Handler = async (req, deps, userId) => {
  await deleteGoal(deps, userId, req.params.id ?? '');
  return { status: 204, body: undefined };
};

const postGoalEnd: Handler = async (req, deps, userId) => {
  const body = asObject(req.body ?? {});
  const goal = await endGoal(deps, userId, req.params.id ?? '', {
    handOverTo: body.handOverTo === undefined ? null : readText(body.handOverTo, 'handOverTo'),
  });
  return { status: 200, body: toContractGoal(goal) };
};

const getGoalBudget: Handler = async (req, deps, userId) => {
  const budget = await goalBudget(deps, userId, requireQuery(req, 'weekStart'));
  return { status: 200, body: budget };
};

// ── thói quen: đếm theo tuần, không có endpoint nào trả về chuỗi ngày hay điểm
const getHabitWeek: Handler = async (req, deps, userId) => {
  const rows = await habitWeek(deps, userId, requireQuery(req, 'weekStart'));
  return { status: 200, body: rows };
};

const postHabit: Handler = async (req, deps, userId) => {
  const body = asObject(req.body);
  const habit = await createHabit(
    deps,
    userId,
    String(body.title ?? ''),
    readMinutes(body.targetPerWeek, 'targetPerWeek'),
  );
  return {
    status: 201,
    body: {
      id: habit.id,
      title: habit.title,
      targetPerWeek: habit.targetPerWeek,
      startedOn: habit.startedOn,
      endedOn: habit.endedOn,
    },
  };
};

const postHabitCheck: Handler = async (req, deps, userId) => {
  const body = asObject(req.body);
  await toggleCheck(deps, userId, req.params.id ?? '', String(body.date ?? ''), body.done !== false);
  return { status: 204 };
};

const postHabitEnd: Handler = async (req, deps, userId) => {
  const ended = await deps.habits.end(userId, req.params.id ?? '');
  if (ended === null) throw notFound('Không có thói quen đang chạy với id này');
  return {
    status: 200,
    body: {
      id: ended.id,
      title: ended.title,
      targetPerWeek: ended.targetPerWeek,
      startedOn: ended.startedOn,
      endedOn: ended.endedOn,
    },
  };
};

/** Nhập cả bộ dữ liệu, thay toàn bộ cái đang có của người này. */
const postImport: Handler = async (req, deps, userId) => {
  const ketQua = await importSnapshot(deps.db, userId, req.body);
  return { status: 200, body: ketQua };
};

// ─────────────────────────────────────────────────────── bảng

export interface Route {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  /** Route không có cờ này đều đòi token hợp lệ — mặc định là đóng, không phải mở. */
  handler: Handler | PublicHandler;
  cong_khai?: true;
}

export const routes: readonly Route[] = [
  { method: 'GET', path: '/health', handler: health, cong_khai: true },

  { method: 'POST', path: '/auth/google', handler: postGoogle, cong_khai: true },
  { method: 'POST', path: '/auth/login', handler: postLogin, cong_khai: true },
  { method: 'GET', path: '/auth/me', handler: getMe },

  { method: 'GET', path: '/time-entries', handler: listTimeEntries },
  { method: 'POST', path: '/time-entries', handler: createTimeEntry },
  { method: 'GET', path: '/time-entries/week', handler: getWeek },
  { method: 'PATCH', path: '/time-entries/:id', handler: patchTimeEntry },
  { method: 'DELETE', path: '/time-entries/:id', handler: deleteTimeEntry },

  { method: 'GET', path: '/moments', handler: listMoments },
  { method: 'POST', path: '/moments', handler: postMoment },
  { method: 'GET', path: '/moments/due', handler: listDueMoments },
  { method: 'POST', path: '/moments/:id/revisit', handler: postRevisit },
  { method: 'PATCH', path: '/moments/:id', handler: patchMoment },
  { method: 'DELETE', path: '/moments/:id', handler: deleteMoment },
  { method: 'GET', path: '/reminders', handler: listReminders },
  { method: 'POST', path: '/reminders', handler: postReminder },
  { method: 'PATCH', path: '/reminders/:id', handler: patchReminder },
  { method: 'DELETE', path: '/reminders/:id', handler: deleteReminderRoute },
  { method: 'POST', path: '/reminders/:id/skip', handler: postSkipReminder },

  { method: 'GET', path: '/money/:month', handler: getMoney },
  { method: 'PUT', path: '/money/:month', handler: putMoney },

  { method: 'GET', path: '/money-categories', handler: listMoneyCategories },
  { method: 'POST', path: '/money-categories', handler: postMoneyCategory },
  { method: 'PATCH', path: '/money-categories/:id', handler: patchMoneyCategory },
  { method: 'POST', path: '/money-categories/:id/archive', handler: postMoneyCategoryArchive },

  { method: 'GET', path: '/money-entries', handler: listMoneyEntries },
  { method: 'POST', path: '/money-entries', handler: postMoneyEntry },
  { method: 'PATCH', path: '/money-entries/:id', handler: patchMoneyEntry },
  { method: 'DELETE', path: '/money-entries/:id', handler: deleteMoneyEntryRoute },

  { method: 'GET', path: '/goals', handler: listGoals },
  { method: 'POST', path: '/goals', handler: postGoal },
  { method: 'GET', path: '/goals/budget', handler: getGoalBudget },
  { method: 'PATCH', path: '/goals/:id', handler: patchGoal },
  { method: 'DELETE', path: '/goals/:id', handler: deleteGoalRoute },
  { method: 'POST', path: '/goals/:id/end', handler: postGoalEnd },

  { method: 'POST', path: '/import', handler: postImport },
  { method: 'GET', path: '/export', handler: getExport },

  { method: 'POST', path: '/parse', handler: postDoc },

  { method: 'GET', path: '/categories', handler: listCategories },
  { method: 'POST', path: '/categories', handler: postCategory },
  { method: 'PATCH', path: '/categories/:id', handler: patchCategory },
  { method: 'POST', path: '/categories/:id/archive', handler: postCategoryArchive },

  { method: 'GET', path: '/routines', handler: listRoutines },
  { method: 'POST', path: '/routines', handler: postRoutine },
  { method: 'POST', path: '/routines/run', handler: postRunRoutines },
  { method: 'POST', path: '/routines/:id/end', handler: postRoutineEnd },
  { method: 'POST', path: '/routines/:id/skip', handler: postSkipDay },
  { method: 'POST', path: '/routines/:id/unskip', handler: postUnskipDay },

  { method: 'GET', path: '/habits/week', handler: getHabitWeek },
  { method: 'POST', path: '/habits', handler: postHabit },
  { method: 'POST', path: '/habits/:id/check', handler: postHabitCheck },
  { method: 'POST', path: '/habits/:id/end', handler: postHabitEnd },
];

export type { AppDeps, Req };
