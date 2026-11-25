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
import { assertMonth, derive } from '../services/money';
import { createGoal, endGoal, goalBudget } from '../services/goal';
import { createHabit, habitWeek, toggleCheck } from '../services/habit';
import { dangNhap, dangNhapGoogle } from '../services/auth';
import { nhapBo } from '../services/nhapBo';
import { xuatBo } from '../services/xuatBo';
import { chayNep, dungNep, nhanLaiNgay, taoNep, tuChoiNgay } from '../services/nep';
import { kiemDoLuong, xoaDem } from './chanDoLuong';
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
  nepId: string | null;
}): TimeEntry => ({
  id: e.id,
  date: e.date,
  minutes: e.minutes,
  bucket: e.bucket,
  nepId: e.nepId,
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

const toContractMoney = (month: string, m: Money | null): MoneyMonth => ({
  month,
  netIncome: m?.netIncome ?? null,
  monthlyExpense: m?.monthlyExpense ?? null,
  debtPayment: m?.debtPayment ?? null,
  debtBalance: m?.debtBalance ?? null,
  netWorth: m?.netWorth ?? null,
});

// ─────────────────────────────────────────────────────── handlers

const health: PublicHandler = async (): Promise<Res> => ({ status: 200, body: { ok: true } });

/** Bản sao lưu đầy đủ. Một lần gọi, lấy tất cả, kể cả thứ đã kết thúc hoặc đã dừng. */
const getExport: Handler = async (_req, deps, userId) => ({
  status: 200,
  body: await xuatBo(deps.db, userId),
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
  kiemDoLuong(ip, 'google');
  const out = await dangNhapGoogle(deps.auth, body.idToken);
  xoaDem(ip, 'google');
  return { status: 200, body: out };
};

const postLogin: PublicHandler = async (req, deps) => {
  const body = asObject(req.body);
  const username = String(body.username ?? '');
  // Cloudflare Tunnel đặt IP thật vào cf-connecting-ip; chạy trực tiếp thì không có,
  // lúc đó vẫn đếm được theo tên đăng nhập.
  const ip = req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for'] ?? '';
  kiemDoLuong(ip, username);
  const out = await dangNhap(deps.auth, username, String(body.password ?? ''));
  xoaDem(ip, username);
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

// ── nếp: khai một luật, Mira tự ghi, người dùng từ chối khi không đạt

const listNep: Handler = async (_req, deps, userId) => ({
  status: 200,
  body: await deps.nep.findActive(userId),
});

const postNep: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  const nep = await taoNep({ nep: deps.nep, timeEntries: deps.timeEntries }, userId, {
    title: String(b.title ?? ''),
    bucket: b.bucket,
    minutes: b.minutes,
    golden: b.golden,
    days: b.days,
  });
  return { status: 201, body: nep };
};

/** Chạy mọi nếp tới hôm nay. Gọi lại nhiều lần không sinh trùng. */
const postChayNep: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  const ra = await chayNep(
    { nep: deps.nep, timeEntries: deps.timeEntries },
    userId,
    String(b.date ?? ''),
  );
  return { status: 200, body: ra };
};

const postNepEnd: Handler = async (req, deps, userId) => ({
  status: 200,
  body: await dungNep({ nep: deps.nep, timeEntries: deps.timeEntries }, userId, req.params.id ?? ''),
});

const postTuChoi: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  await tuChoiNgay(
    { nep: deps.nep, timeEntries: deps.timeEntries },
    userId,
    req.params.id ?? '',
    String(b.date ?? ''),
  );
  return { status: 204, body: undefined };
};

const postNhanLai: Handler = async (req, deps, userId) => {
  const b = asObject(req.body);
  await nhanLaiNgay(
    { nep: deps.nep, timeEntries: deps.timeEntries },
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
  const entry = await deps.timeEntries.create(userId, {
    date: assertDate(String(body.date ?? ''), 'date'),
    minutes: readMinutes(body.minutes, 'minutes'),
    bucket: readBucket(body.bucket, 'bucket'),
    golden: body.golden === true,
    note: readText(body.note, 'note'),
  });
  return { status: 201, body: toContractEntry(entry) };
};

const patchTimeEntry: Handler = async (req, deps, userId) => {
  const body = asObject(req.body);
  const id = req.params.id ?? '';
  const updated = await deps.timeEntries.update(userId, id, {
    minutes: body.minutes === undefined ? undefined : readMinutes(body.minutes, 'minutes'),
    bucket: body.bucket === undefined ? undefined : readBucket(body.bucket, 'bucket'),
    golden: body.golden === undefined ? undefined : body.golden === true,
    note: body.note === undefined ? undefined : readText(body.note, 'note'),
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

const postRevisit: Handler = async (req, deps, userId) => {
  const body = asObject(req.body);
  const moment = await answerRevisit(deps, userId, req.params.id ?? '', {
    answer: body.answer as SaltAnswer,
  });
  return { status: 200, body: toContractMoment(moment) };
};

const getMoney: Handler = async (req, deps, userId) => {
  const month = assertMonth(req.params.month ?? '');
  const row = await deps.money.findByMonth(userId, month);
  return { status: 200, body: { month: toContractMoney(month, row), derived: derive(row) } };
};

const putMoney: Handler = async (req, deps, userId) => {
  const month = assertMonth(req.params.month ?? '');
  const body = asObject(req.body);
  const saved = await deps.money.upsert(userId, month, {
    netIncome: readVnd(body.netIncome, 'netIncome'),
    monthlyExpense: readVnd(body.monthlyExpense, 'monthlyExpense'),
    debtPayment: readVnd(body.debtPayment, 'debtPayment'),
    debtBalance: readVnd(body.debtBalance, 'debtBalance'),
    netWorth: readVnd(body.netWorth, 'netWorth'),
  });
  return { status: 200, body: { month: toContractMoney(month, saved), derived: derive(saved) } };
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
  const ketQua = await nhapBo(deps.db, userId, req.body);
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

  { method: 'GET', path: '/money/:month', handler: getMoney },
  { method: 'PUT', path: '/money/:month', handler: putMoney },

  { method: 'GET', path: '/goals', handler: listGoals },
  { method: 'POST', path: '/goals', handler: postGoal },
  { method: 'GET', path: '/goals/budget', handler: getGoalBudget },
  { method: 'POST', path: '/goals/:id/end', handler: postGoalEnd },

  { method: 'POST', path: '/import', handler: postImport },
  { method: 'GET', path: '/export', handler: getExport },

  { method: 'GET', path: '/nep', handler: listNep },
  { method: 'POST', path: '/nep', handler: postNep },
  { method: 'POST', path: '/nep/chay', handler: postChayNep },
  { method: 'POST', path: '/nep/:id/end', handler: postNepEnd },
  { method: 'POST', path: '/nep/:id/tu-choi', handler: postTuChoi },
  { method: 'POST', path: '/nep/:id/nhan-lai', handler: postNhanLai },

  { method: 'GET', path: '/habits/week', handler: getHabitWeek },
  { method: 'POST', path: '/habits', handler: postHabit },
  { method: 'POST', path: '/habits/:id/check', handler: postHabitCheck },
  { method: 'POST', path: '/habits/:id/end', handler: postHabitEnd },
];

export type { AppDeps, Req };
