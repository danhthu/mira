import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  BUCKET_LABEL_VI,
  MONEY_CELL_LABEL_VI,
  type ParseResult,
  type MoneyMonthUpdate,
  type Intent,
  type MoneyFlowCell,
} from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { quickSuggestion } from '../../lib/suggestion';
import { entrySignature } from '../../lib/duplicate';
import { AnswerQuestion, type AnswerSource } from './AnswerQuestion';
import { remindersDue, loggedManually, shiftWeekday, type Reminder } from '../../lib/reminder';
import { addDays, labelDay, monthOf, today, weekStartOf } from '../../lib/date';
import { minutes as fmtMinutes, months as fmtMonths, vnd, UNKNOWN } from '../../lib/format';
import {
  ONBOARD_STEPS,
  SKIP_ALL,
  isNo,
  loadSkipped,
  pendingSteps,
  saveSkipped,
} from '../../lib/onboarding';
import { oldGrainCaption, oldGrainRange, pickOldGrain } from '../../lib/oldGrain';
import { EditWritten } from './EditWritten';
import './Chat.css';

/**
 * Màn Nhật ký, dạng chat.
 *
 * VÌ SAO ĐỔI. Đếm trên bản cũ (`docs/10-kich-ban-khai-va-ghi.md`): 54 thao tác trước khi
 * thấy con số đầu tiên, 11 thao tác mỗi ngày, và phải hiểu bốn khái niệm (ô, danh mục,
 * giờ vàng, thứ trong tuần) mới khai được một nếp. Ba chỗ hỏng đó có chung một gốc:
 * người dùng phải dịch đời mình sang mô hình dữ liệu của Mira.
 *
 * Một dòng chat đảo chiều dịch đó. Ô và danh mục trở thành thứ Mira suy ra, không phải
 * thứ người dùng phải khai.
 *
 * LUẬT CỨNG: KHÔNG BAO GIỜ TỰ GHI. Mira đọc câu, đề xuất, người dùng bấm "Ghi" rồi mới
 * ghi. Và đường ghi vẫn là các route cũ đã kiểm, không có cửa sau nào mới. Một dòng bịa
 * làm hỏng niềm tin vào cả trăm dòng thật.
 */
interface Dong {
  readonly id: number;
  readonly ai: 'toi' | 'mira';
  readonly chu?: string;
  readonly ketQua?: ParseResult;
  readonly saved?: boolean;
  /** Đang ghi: hiện "Đang ghi…" chứ không hiện nút gì. */
  readonly saving?: boolean;
  /** Đủ thông tin để gỡ lại đúng những gì vừa ghi. */
  readonly veT?: WriteTrace;
  readonly undone?: boolean;
  /** Ghi hỏng giữa chừng thì phải nói ra, không được im. */
  readonly saveError?: string;
  /**
   * Tên những mục hôm nay ĐÃ có trước lần ghi này.
   *
   * Soát một lần lúc ghi rồi giữ lại, không tính lại khi vẽ: ghi xong thì chính mục vừa
   * ghi nằm trong tập đã có, nên tính lại lúc nào cũng ra "trùng".
   */
  readonly trung?: readonly string[];
  /**
   * Ý đã sửa trong khay, theo vị trí trong `ketQua.yChi`. `null` là đã xoá.
   * Thẻ vẽ theo cái này nếu có, để khung chat nói đúng số đang nằm trong nhật ký.
   */
  readonly sua?: Readonly<Record<number, Intent | null>>;
}

/**
 * Vết của một lần ghi, để hoàn tác.
 *
 * Mục giờ và hạt gỡ bằng id. Ô tiền thì **không có id để xoá** — nó là một con số của cả
 * tháng — nên phải chụp lại giá trị cũ trước khi đổi rồi đặt về đúng cái đó.
 */
interface WriteTrace {
  readonly time: string[];
  readonly grain: string[];
  /** Lời nhắc vừa đặt. Gỡ bằng id, giống mục giờ. */
  readonly reminder: string[];
  /**
   * Khoản tiền vừa ghi, gỡ bằng id.
   *
   * Trước đây chỗ này nhớ giá trị CŨ CỦA Ô để Hoàn tác ghi đè lại. Cách ấy mong manh:
   * giữa lúc ghi và lúc gỡ mà có khoản khác vào thì ghi đè xoá luôn cả khoản ấy.
   */
  readonly money: string[];
  /** Hai ô MỨC vẫn ghi đè, nên vẫn phải nhớ giá trị cũ. */
  readonly moneyLevel: { readonly month: string; readonly previous: MoneyMonthUpdate }[];
  /** Id bản ghi theo vị trí ý trong `yChi`, để chạm một thẻ là mở đúng mục mà sửa. */
  readonly byIndex: Record<number, string>;
}

/** Khoảng ngày dùng để rút phím Ghi nhanh. Hai tuần: đủ thấy nếp, chưa kịp nguội. */
const SUGGESTION_WINDOW_DAYS = 14;

/** Khoảng ngày đếm hạt khi trả lời "hũ ra sao". 90 ngày — bằng màn Sáu tháng. */
const GRAIN_WINDOW_DAYS = 90;

let lineCounter = 0;

/**
 * Câu mẫu trên màn chat trống.
 *
 * 27/11/2026: rút từ 21 câu chia ba nhóm xuống 8 câu một hàng, theo ý Founder — 21 câu
 * đẩy ô gõ xuống tận đáy, và tên nhóm là thứ người ta không cần đọc. Mỗi thứ Mira ghi
 * vẫn có ít nhất một câu: giờ, tiền, hạt, lời nhắc. Chạm là điền vào ô gõ để sửa rồi gửi.
 */
const GOI_Y: readonly string[] = [
  'họp 2 tiếng',
  'chơi với con 1 tiếng',
  'chạy bộ 30 phút',
  'ăn trưa 60k',
  'cà phê 35k',
  'lương tháng này 18 triệu',
  'hôm nay vui, con tự xúc hết bát cơm',
  'nhắc tôi uống nước lúc 3 giờ chiều',
];

/**
 * Câu của một phím Ghi nhanh, để điền vào ô gõ: "đi lại đi làm 2h", "nhà cửa 30 phút",
 * "lướt điện thoại 5h06". Dạng nào cũng là dạng bộ đọc đã có bài kiểm.
 */
function cauNhanh(label: string, minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const thoiLuong =
    h === 0 ? `${m} phút` : m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
  return `${label.toLowerCase()} ${thoiLuong}`;
}

/** Có ít nhất một ý ghi được. Câu chỉ toàn "chưa hiểu" và "không ghi" thì là không. */
const ghiDuoc = (kq: ParseResult): boolean =>
  kq.yChi.some(
    (y) => y.kind === 'time' || y.kind === 'grain' || y.kind === 'money' || y.kind === 'reminder',
  );

/**
 * Cuộc chat sống NGOÀI màn, để chuyển tab rồi quay lại vẫn còn thẻ, còn nút Hoàn tác.
 *
 * 27/11/2026: ghi một câu, sang Tài chính xem số, quay lại thì thẻ mất — muốn sửa phải đi
 * đường vòng. Để ở biến cấp module chứ không `useState`: một lần ghi đang chạy khi người
 * ta rời màn vẫn cập nhật được dòng của nó ("Đang ghi…" thành "Đã ghi").
 *
 * Chỉ trong bộ nhớ, không xuống ổ: tải lại trang là hết. Lời chat là thứ riêng tư nhất;
 * giữ trên máy lâu hơn một phiên là việc phải hỏi người dùng trước.
 */
let giuChat: { day: string; dong: Dong[] } = { day: '', dong: [] };
const KHONG_DONG: Dong[] = [];
const nguoiNghe = new Set<() => void>();
function ngheChat(f: () => void): () => void {
  nguoiNghe.add(f);
  return () => nguoiNghe.delete(f);
}
function datChat(day: string, f: Dong[] | ((d: Dong[]) => Dong[])): void {
  const cu = giuChat.day === day ? giuChat.dong : KHONG_DONG;
  giuChat = { day, dong: typeof f === 'function' ? f(cu) : f };
  nguoiNghe.forEach((l) => l());
}

export function ChatScreen() {
  const day = today();
  const dong = useSyncExternalStore(ngheChat, () =>
    giuChat.day === day ? giuChat.dong : KHONG_DONG,
  );
  const setDong = (f: Dong[] | ((d: Dong[]) => Dong[])): void => datChat(day, f);
  const [cau, setCau] = useState('');
  const [reading, setDangDoc] = useState(false);
  const duoi = useRef<HTMLDivElement>(null);
  const oGo = useRef<HTMLInputElement>(null);
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(() => loadSkipped());

  const tomTat = useAsync(async () => {
    const [cuTu, cuDen] = oldGrainRange(day);
    // Chạy nếp TRƯỚC khi đọc, như màn Thời gian (27/11/2026). App mở vào Nhật ký: không
    // chạy ở đây thì ba ô số đầu màn thiếu giờ nếp cho tới khi ai đó mở Thời gian. Hỏng
    // thì thôi, màn vẫn chạy — nếp chỉ đỡ việc gõ.
    await store.runRoutines(day).catch(() => []);
    const [summary, money, ganDay, nhac, hatDs, danhMuc, muoiToiHan, hatXua, nep] =
      await Promise.all([
        store.weekSummary(weekStartOf(day)),
        store.getMoney(monthOf(day)),
        // Hai tuần đổ lại, để rút phím Ghi nhanh. Lấy cả đời thì phím tắt đóng băng theo
        // thói quen năm ngoái, mà việc của màn này là ghi chuyện hôm nay.
        store.listTimeEntries(addDays(day, -SUGGESTION_WINDOW_DAYS), day),
        store.listReminders(day, day),
        // Hũ 90 ngày, để trả lời "hũ ra sao". Cùng một lượt song song với mọi thứ khác nên
        // không thêm nhịp chờ nào.
        store.listMoments(addDays(day, -GRAIN_WINDOW_DAYS), day),
        // Tên danh mục cho phím Ghi nhanh. Hỏng thì phím chỉ thiếu nhãn, màn vẫn chạy.
        store.listCategories().catch(() => []),
        // Hai thứ kéo người ta quay lại. Trước 26/11/2026 chúng nằm ở hai màn không ai mở.
        store.momentsDue(day).catch(() => []),
        store.listMoments(cuTu, cuDen).catch(() => []),
        store.listRoutines().catch(() => []),
      ]);

    // Việc nào nếp đã lo hôm nay thì không mời ghi tay nữa: chạm phím là ghi hai lần.
    const thu = String(((new Date(`${day}T00:00:00`).getDay() + 6) % 7) + 1);
    const nepHomNay = nep.filter((n) => n.days.includes(thu));
    const doNepLo = (e: (typeof ganDay)[number]): boolean =>
      e.routineId !== null ||
      nepHomNay.some((n) =>
        n.categoryId !== null
          ? n.categoryId === e.categoryId
          : n.bucket === e.bucket &&
            n.title.trim().toLowerCase() === (e.note ?? '').trim().toLowerCase(),
      );

    // Giờ lấy từ đồng hồ TRÌNH DUYỆT, không phải máy chủ: "21:00" nghĩa là chín giờ tối
    // chỗ người dùng đang ngồi.
    const bayGio = new Date();
    const denHan = remindersDue(nhac.reminders, nhac.skips, {
      date: day,
      phutHienTai: bayGio.getHours() * 60 + bayGio.getMinutes(),
      saved: loggedManually(ganDay, day),
    });

    const hat = {
      keo: hatDs.filter((h) => h.kind === 'candy').length,
      muoi: hatDs.filter((h) => h.kind === 'salt').length,
    };

    return {
      summary,
      money,
      goi: quickSuggestion(
        ganDay.filter((e) => !doNepLo(e)),
        undefined,
        new Map(danhMuc.map((d) => [d.id, d.name])),
      ),
      denHan,
      ganDay,
      hat,
      muoiToiHan: muoiToiHan.length,
      hatCu: pickOldGrain(hatXua),
    };
  }, [day]);

  /**
   * LÀM QUEN QUA CHAT: câu Mira đang chờ người mới trả lời, hoặc null khi đã đủ.
   *
   * Tính từ dữ liệu, không từ một cờ "đã onboard": khai bên tab khác cũng tính, đổi máy
   * không bị hỏi lại, Hoàn tác thì câu hỏi tự quay về. Xem `lib/onboarding.ts`.
   *
   * Chưa tải xong thì CHƯA hỏi gì. Hỏi trước rồi rút lại khi dữ liệu về là một câu hỏi
   * nháy lên rồi biến mất trước mặt người đã khai đủ.
   */
  const conLai =
    tomTat.data === null || skipped.has(SKIP_ALL)
      ? []
      : pendingSteps(
          {
            netIncome: tomTat.data.money.month.netIncome,
            monthlyExpense: tomTat.data.money.month.monthlyExpense,
            debtPayment: tomTat.data.money.month.debtPayment,
            debtBalance: tomTat.data.money.month.debtBalance,
            netWorth: tomTat.data.money.month.netWorth,
            buckets: new Set(tomTat.data.ganDay.map((e) => e.bucket)),
            timeCount: tomTat.data.ganDay.length,
            grains: tomTat.data.hat.keo + tomTat.data.hat.muoi,
          },
          skipped,
        );
  const buoc = conLai[0] ?? null;

  function boQuaBuoc(id: string): void {
    const moi = new Set(skipped).add(id);
    setSkipped(moi);
    saveSkipped(moi);
  }

  /** Bấm câu mẫu: điền vào ô gõ để SỬA SỐ rồi gửi. Gửi thẳng thì ghi số của người khác. */
  function dien(mau: string): void {
    setCau(mau);
    oGo.current?.focus();
  }

  /**
   * Chữ ký của những mục giờ ĐÃ có trong ngày, để nhận ra lần ghi trùng.
   *
   * Dùng `ref` chứ không phải `state`, và tự thêm vào ngay khi ghi xong thay vì chờ tải
   * lại: Mira ghi tự động, nên hai câu gõ liền nhau có thể chạy trước khi `tomTat` kịp
   * tải lại. Chờ tải lại thì lần trùng thứ hai lọt lưới — đúng cái vừa xảy ra thật.
   */
  const known = useRef<Set<string>>(new Set());
  useEffect(() => {
    const ds = tomTat.data?.ganDay ?? [];
    known.current = new Set(ds.filter((e) => e.date === day).map((e) => entrySignature(e)));
  }, [tomTat.data, day]);

  useEffect(() => {
    // Cuộn CHÍNH khung trò chuyện. `scrollIntoView` cuộn mọi tổ tiên cuộn được, kể cả
    // khung ngoài: dòng chat dài lên là cả màn bị kéo theo, thanh tab trồi lên giữa màn
    // và ô gõ tụt xuống dưới nó. Bắt được ngày 26/11/2026 khi thêm tám câu làm quen.
    //
    // Màn trống thì KHÔNG cuộn: khối câu mẫu cao hơn khung, cuộn xuống đáy là mở app ra
    // đã mất dòng hướng dẫn đầu tiên.
    if (dong.length === 0 && buoc === null) return;
    const khung = duoi.current?.parentElement;
    khung?.scrollTo({ top: khung.scrollHeight, behavior: 'smooth' });
  }, [dong, buoc?.id]);

  /**
   * Lời chốt khi vừa trả lời xong câu làm quen cuối.
   *
   * Trước đó hết câu hỏi là hết: câu thứ tám biến mất và người mới ngồi nhìn một khung
   * chat không nói gì. Chỉ nói MỘT lần, và chỉ khi phiên này thật sự đã hỏi — người dùng
   * lâu mở app ra không nghe "xong phần làm quen".
   */
  const daHoi = useRef(false);
  const coDuLieu = tomTat.data !== null;
  const dangTai = tomTat.loading;
  const thoiHoi = skipped.has(SKIP_ALL);
  useEffect(() => {
    if (buoc !== null) {
      daHoi.current = true;
      return;
    }
    if (!daHoi.current || !coDuLieu || dangTai) return;
    daHoi.current = false;
    if (thoiHoi) return;
    setDong((d) => [
      ...d,
      {
        id: (lineCounter += 1),
        ai: 'mira',
        chu: 'Xong phần làm quen. Từ giờ cứ gõ như vừa rồi, mỗi việc một câu. Ghi chi tiêu thêm vài ngày nữa là ô “tháng tự do” hiện số.',
      },
    ]);
  }, [buoc, coDuLieu, dangTai, thoiHoi]);

  async function gui(): Promise<void> {
    const text = cau.trim();
    if (text === '' || reading) return;
    setCau('');
    setDong((d) => [...d, { id: (lineCounter += 1), ai: 'toi', chu: text }]);

    // Đang được hỏi mà đáp "không" thì đó là câu trả lời, không phải một dòng nhật ký.
    // Đem đi đọc thì hũ có thêm một hạt muối ghi chữ "không".
    const dangHoi = buoc;
    if (dangHoi !== null && isNo(text)) {
      boQuaBuoc(dangHoi.id);
      setDong((d) => [...d, { id: (lineCounter += 1), ai: 'mira', chu: 'Được, bỏ qua câu này.' }]);
      return;
    }

    setDangDoc(true);
    try {
      let ketQua = await store.doc(text, day);
      // Được hỏi "tháng này mang về bao nhiêu" thì người ta đáp "18 triệu". Câu cụt ấy
      // đứng một mình không đọc được; ghép với điều Mira vừa hỏi thì đọc được. Chỉ thử
      // lại khi lần đầu KHÔNG ghi được gì — câu đã rõ nghĩa thì không ai sửa hộ.
      if (dangHoi !== null && dangHoi.prefix !== null && !ghiDuoc(ketQua)) {
        const lan2 = await store.doc(`${dangHoi.prefix} ${text}`, day);
        if (ghiDuoc(lan2)) ketQua = lan2;
      }
      const id = (lineCounter += 1);
      const canSave = ketQua.yChi.some(
        (y) =>
          y.kind === 'time' || y.kind === 'grain' || y.kind === 'money' || y.kind === 'reminder',
      );
      // Soát trùng TRƯỚC khi ghi, vì ghi xong là chính nó nằm trong tập đã có.
      const trung = duplicateNamesOf(ketQua.yChi);
      setDong((d) => [...d, { id, ai: 'mira', ketQua, saving: canSave, trung }]);
      // Ghi ngay, không chờ bấm nút. Đổi lại phải có đường gỡ: xem `ghi`.
      if (canSave) void ghi(id, ketQua.yChi);
    } catch (cause: unknown) {
      setDong((d) => [
        ...d,
        {
          id: (lineCounter += 1),
          ai: 'mira',
          chu: cause instanceof Error ? cause.message : 'Không đọc được câu này.',
        },
      ]);
    } finally {
      setDangDoc(false);
    }
  }

  /**
   * Ghi theo **ngày của từng ý chí**, không phải hôm nay.
   *
   * "hôm qua ngủ 7 tiếng" trước đây ghi vào hôm nay: đúng số phút, sai ngày, và không có
   * chỗ nào trên giao diện báo. Giờ máy chủ trả `ngay` kèm mỗi mục và client ghi đúng
   * cái đó. Danh mục cũng vậy — khớp được thì mục giờ ra đã phân loại.
   */
  /** Chữ ký của một ý chí giờ, cùng công thức với mục đã nằm trong sổ. */
  function rateKey(y: Extract<Intent, { kind: 'time' }>): string {
    return entrySignature({
      date: y.date,
      minutes: y.minutes,
      bucket: y.bucket,
      note: y.categoryId === null ? y.name : null,
      categoryId: y.categoryId,
    });
  }

  /** Tên những mục đã có sẵn trong ngày. Gọi TRƯỚC khi ghi. */
  function duplicateNamesOf(yChi: readonly Intent[]): readonly string[] {
    return yChi
      .filter((y): y is Extract<Intent, { kind: 'time' }> => y.kind === 'time')
      .filter((y) => known.current.has(rateKey(y)))
      .map((y) => y.name);
  }

  async function ghi(id: number, yChi: readonly Intent[]): Promise<void> {
    const veT: WriteTrace = {
      time: [],
      grain: [],
      money: [],
      moneyLevel: [],
      reminder: [],
      byIndex: {},
    };
    try {
      for (const [i, y] of yChi.entries()) {
        if (y.kind === 'time') {
          const ra = await store.createTimeEntry({
            date: y.date,
            minutes: y.minutes,
            bucket: y.bucket,
            golden: y.golden,
            note: y.categoryId === null ? y.name : null,
            categoryId: y.categoryId,
          });
          veT.time.push(ra.id);
          veT.byIndex[i] = ra.id;
          // Thêm ngay, không chờ tải lại: câu kế tiếp có thể tới trước khi tải xong.
          known.current.add(rateKey(y));
        } else if (y.kind === 'grain') {
          const ra = await store.createMoment({ date: y.date, kind: y.grain, text: y.text });
          veT.grain.push(ra.id);
          veT.byIndex[i] = ra.id;
        } else if (y.kind === 'reminder') {
          const ra = await store.createReminder({ at: y.at, days: y.days, text: y.text });
          veT.reminder.push(ra.id);
          veT.byIndex[i] = ra.id;
        } else if (y.kind === 'money') {
          if (y.adds) {
            // Ô dòng chảy: một khoản mới, đúng như bấm dấu + bên màn Tài chính.
            const ra = await store.createMoneyEntry({
              date: y.date,
              amount: y.vnd,
              cell: y.cell as MoneyFlowCell,
              categoryId: y.categoryId,
            });
            veT.money.push(ra.id);
            veT.byIndex[i] = ra.id;
          } else {
            // Ô mức: đọc trước khi ghi, để Hoàn tác trả lại đúng con số cũ.
            const hienCo = (await store.getMoney(y.month)).month;
            veT.moneyLevel.push({ month: y.month, previous: { [y.cell]: hienCo[y.cell] } });
            await store.saveMoney(y.month, { [y.cell]: y.vnd });
          }
        }
      }
      setDong((d) => d.map((x) => (x.id === id ? { ...x, saved: true, saving: false, veT } : x)));
    } catch (cause: unknown) {
      // Hỏng giữa chừng: phần đã ghi vẫn còn, nên phải nói ra và vẫn cho gỡ phần đó.
      setDong((d) =>
        d.map((x) =>
          x.id === id
            ? {
                ...x,
                saving: false,
                saved: true,
                veT,
                saveError: cause instanceof Error ? cause.message : 'Ghi hỏng giữa chừng.',
              }
            : x,
        ),
      );
    }
    tomTat.reload();
  }

  /** Thẻ đang mở trong khay sửa: dòng nào, ý thứ mấy. */
  const [dangSua, setDangSua] = useState<{ readonly dongId: number; readonly i: number } | null>(
    null,
  );
  const dongSua = dangSua === null ? undefined : dong.find((d) => d.id === dangSua.dongId);
  const ySua =
    dangSua === null || dongSua?.ketQua === undefined
      ? null
      : (dongSua.sua?.[dangSua.i] ?? dongSua.ketQua.yChi[dangSua.i] ?? null);
  const idSua = dangSua === null ? null : (dongSua?.veT?.byIndex[dangSua.i] ?? null);

  /** Khay sửa xong: vẽ lại thẻ theo số mới, hoặc đánh dấu đã xoá và rút id khỏi vết gỡ. */
  function suaXong(moi: Intent | null): void {
    if (dangSua === null || idSua === null) return;
    const { dongId, i } = dangSua;
    setDong((ds) =>
      ds.map((x) => {
        if (x.id !== dongId) return x;
        const sua = { ...(x.sua ?? {}), [i]: moi };
        if (moi !== null || x.veT === undefined) return { ...x, sua };
        // Đã xoá thì Hoàn tác không được gỡ lại id ấy lần nữa — máy chủ sẽ trả 404.
        const bo = (ids: string[]): string[] => ids.filter((v) => v !== idSua);
        const veT: WriteTrace = {
          ...x.veT,
          time: bo(x.veT.time),
          grain: bo(x.veT.grain),
          money: bo(x.veT.money),
          reminder: bo(x.veT.reminder),
        };
        return { ...x, sua, veT };
      }),
    );
    setDangSua(null);
    tomTat.reload();
  }

  /** Bỏ qua một lời nhắc, đúng hôm nay thôi. Tắt hẳn thì vào màn Tôi. */
  async function boQua(nh: Reminder): Promise<void> {
    await store.skipReminder(nh.id, day);
    tomTat.reload();
  }

  /**
   * Gỡ lại đúng những gì vừa ghi.
   *
   * Không có nút này thì "tự động ghi" là máy viết vào nhật ký của người mà người không
   * cản được. Founder nói "auto ghi, người dùng reject nếu không đạt" — muốn reject thì
   * phải có đường gỡ, nếu không thì nửa sau câu đó không tồn tại.
   */
  async function hoanTac(id: number, veT: WriteTrace): Promise<void> {
    for (const gioId of veT.time) await store.deleteTimeEntry(gioId);
    for (const hatId of veT.grain) await store.deleteMoment(hatId);
    for (const nhacId of veT.reminder) await store.deleteReminder(nhacId);
    for (const id of veT.money) await store.deleteMoneyEntry(id);
    for (const t of veT.moneyLevel) await store.saveMoney(t.month, t.previous);
    setDong((d) => d.map((x) => (x.id === id ? { ...x, undone: true } : x)));
    tomTat.reload();
  }

  const summary = tomTat.data?.summary ?? null;
  const derived = tomTat.data?.money.derived ?? null;
  const waste = summary?.slices.find((s) => s.bucket === 'waste') ?? null;
  /**
   * Giờ Gia đình tuần — thay chỗ ô "giờ vàng tuần".
   *
   * Giờ vàng là tập con của Gia đình, và Founder tạm bỏ khái niệm đó. Ô này giữ nguyên
   * chỗ, nguyên màu, nguyên phép so với tuần trước — chỉ đổi mẫu số từ "một phần Gia
   * đình" sang "cả Gia đình".
   */
  const giaDinh = summary?.slices.find((s) => s.bucket === 'family')?.minutes ?? null;
  const giaDinhTruoc =
    summary?.previous?.slices.find((s) => s.bucket === 'family')?.minutes ?? null;

  /**
   * Nguyên liệu để Mira trả lời câu hỏi.
   *
   * Toàn bộ lấy từ những gì màn này ĐÃ tải — không thêm một lời gọi mạng nào. Người ta
   * hỏi "tuần này bao nhiêu" thì câu trả lời phải hiện ngay, không phải quay vòng tròn
   * thêm một nhịp nữa.
   */
  const source: AnswerSource = {
    summary,
    money: tomTat.data?.money.month ?? null,
    derived,
    homNayDs: (tomTat.data?.ganDay ?? []).filter((e) => e.date === day),
    keo: tomTat.data?.hat.keo ?? 0,
    muoi: tomTat.data?.hat.muoi ?? 0,
  };
  const goi = tomTat.data?.goi ?? [];
  const denHan = tomTat.data?.denHan ?? [];

  /**
   * Chênh giờ vàng so tuần trước.
   *
   * `previous` đã là **null khi không so được** — tuần trước trống, hoặc tuần này ghi ít
   * ngày hơn. Máy chủ giữ chốt đó, client không được tự nối lại: so tổng 3 ngày với tổng
   * 7 ngày thì cái gì cũng "giảm", và Mira từng báo "lãng phí giảm 26h" đúng kiểu đó.
   */
  const lechVang =
    summary?.previous == null || giaDinh === null || giaDinhTruoc === null
      ? null
      : giaDinh - giaDinhTruoc;

  /** Lãng phí chiếm bao nhiêu phần giờ tỉnh. Chưa ghi gì thì không có mẫu số để chia. */
  const tyLePhi =
    summary === null || summary.wakingMinutes === 0 || waste === null || waste.minutes === 0
      ? null
      : Math.round((waste.minutes * 100) / summary.wakingMinutes);

  return (
    <div className="chat">
      <div className="chat__dau">
        <div>
          <div className="title" style={{ fontSize: 21 }}>
            {labelDay(day)}
          </div>
          <div className="sm" style={{ marginTop: 2 }}>
            Mira
          </div>
        </div>
        <Link to="/toi" className="sm">
          Tôi ›
        </Link>
      </div>

      {/*
        Ba con số, không phải mười hai. Đây là màn để GÕ, phần đọc số nằm ở các tab kia.

        Mỗi ô có thêm một DÒNG ĐỌC THỨ HAI. Một con số trần thì ngày thứ chín không còn
        gì để nhìn — mà giữ cho mới mẻ là đòn bẩy +49% trong giả lập. Dòng thứ hai nói
        con số ấy đang đi hướng nào, hoặc nó lớn cỡ nào so với cả ngày.

        Dòng ấy VẮNG khi chưa đủ căn cứ, không điền bừa một số 0.
      */}
      <div className="chat__so">
        <Link to="/tai-chinh" className="chat__o chat__o--tudo">
          <b>{fmtMonths(derived?.freeCapitalMonths ?? null)}</b>
          <span>tháng tự do</span>
          {derived?.thinExpense === true && <i className="chat__phu">ghi chi thêm vài ngày</i>}
          {derived?.surplusPerMille != null && (
            <i className="chat__phu">dư {Math.round(derived.surplusPerMille / 10)}% thu nhập</i>
          )}
        </Link>
        <Link to="/thoi-gian/family" className="chat__o chat__o--vang">
          <b style={{ color: 'var(--green)' }}>
            {giaDinh === null || giaDinh === 0 ? UNKNOWN : fmtMinutes(giaDinh)}
          </b>
          <span>gia đình tuần</span>
          {lechVang !== null && (
            <i
              className="chat__phu"
              style={{ color: lechVang >= 0 ? 'var(--green)' : 'var(--fg-muted)' }}
            >
              {lechVang >= 0 ? '▲' : '▼'} {fmtMinutes(Math.abs(lechVang))} so tuần trước
            </i>
          )}
        </Link>
        <Link to="/thoi-gian/waste" className="chat__o chat__o--phi">
          <b style={{ color: 'var(--amber)' }}>
            {waste === null || waste.minutes === 0 ? UNKNOWN : fmtMinutes(waste.minutes)}
          </b>
          <span>lãng phí tuần</span>
          {tyLePhi !== null && <i className="chat__phu">≈ {tyLePhi}% giờ tỉnh</i>}
        </Link>
      </div>

      <div className="chat__cuon">
        {/*
          Lời nhắc đã quá giờ, nằm NGAY TRONG dòng trò chuyện chứ không phải một hộp
          thoại nhảy ra. Mở Mira lên là thấy, cùng chỗ với mọi thứ khác Mira nói.

          Nó biến mất ngay khi có mục ghi tay đầu tiên trong ngày — lời nhắc tồn tại để
          gợi người ta ghi, nhắc tiếp sau khi đã ghi thì nó thành lời trách.
        */}
        {denHan.map((nh) => (
          <div key={nh.id} className="bong bong--nhac">
            <p className="bong__chu">{nh.text ?? 'Hôm nay chưa ghi gì. Một câu thôi cũng được.'}</p>
            <p className="bong__chan">
              <span className="sm">Nhắc lúc {nh.at}</span>
              <button type="button" className="bong__go" onClick={() => void boQua(nh)}>
                Bỏ qua hôm nay
              </button>
            </p>
          </div>
        ))}

        {dong.length === 0 && buoc === null && (
          <div className="chat__moi">
            {(tomTat.data?.muoiToiHan ?? 0) > 0 && (
              <Link to="/hu" className="chat__toihan">
                Có {tomTat.data?.muoiToiHan} hạt muối tới hạn. Sau 42 ngày, nhìn lại nó thế nào ›
              </Link>
            )}
            {tomTat.data?.hatCu != null && (
              <Link to="/hu" className="cu chat__cu">
                <div className="cu__k">{oldGrainCaption(tomTat.data.hatCu.date, day)}</div>
                <p className="cu__t">“{tomTat.data.hatCu.text}”</p>
              </Link>
            )}
            <p>Gõ một câu như nói với người quen, hoặc chạm một câu mẫu rồi sửa số:</p>
            <div className="hoi__mau">
              {GOI_Y.map((m) => (
                <button key={m} type="button" className="hoi__chip" onClick={() => dien(m)}>
                  {m}
                </button>
              ))}
            </div>
            <p className="chat__nho">
              Mira ghi luôn, không hỏi lại. Đọc sai thì chạm vào thẻ để sửa hoặc xoá. Việc nào ngày
              nào cũng làm thì khai một nếp bên <Link to="/thoi-gian">Thời gian</Link>, khỏi gõ lại.
            </p>
          </div>
        )}

        {dong.map((d) => (
          <div key={d.id} className={d.ai === 'toi' ? 'bong bong--toi' : 'bong bong--mira'}>
            {d.chu !== undefined && <p className="bong__chu">{d.chu}</p>}
            {d.ketQua !== undefined && (
              <Answer
                ketQua={d.ketQua}
                dong={d}
                homNay={day}
                n={source}
                onHoanTac={() => {
                  if (d.veT !== undefined) void hoanTac(d.id, d.veT);
                }}
                onSua={(i) => setDangSua({ dongId: d.id, i })}
              />
            )}
          </div>
        ))}

        {reading && <div className="bong bong--mira bong__cho">Đang đọc…</div>}

        {/*
          Ẩn trong lúc đang đọc, đang ghi và đang tải lại. Không ẩn thì câu hỏi CŨ nằm
          lại nửa giây ngay dưới câu trả lời cho chính nó, rồi mới đổi sang câu kế.
        */}
        {buoc !== null && !reading && !tomTat.loading && !dong.some((d) => d.saving === true) && (
          <div className="bong bong--mira bong--hoi">
            <p className="hoi__buoc">
              Làm quen · {ONBOARD_STEPS.indexOf(buoc) + 1}/{ONBOARD_STEPS.length}
            </p>
            {dong.length === 0 && conLai.length === ONBOARD_STEPS.length && (
              <p className="bong__chu" style={{ marginBottom: 8 }}>
                Chào bạn. Mira hỏi vài câu để có những con số đầu tiên. Trả lời như nói với người
                quen, câu nào không muốn thì bỏ qua.
              </p>
            )}
            <p className="hoi__cau">{buoc.ask}</p>
            <p className="hoi__visao">{buoc.why}</p>
            <div className="hoi__mau">
              {buoc.samples.map((m) => (
                <button key={m} type="button" className="hoi__chip" onClick={() => dien(m)}>
                  {m}
                </button>
              ))}
            </div>
            <p className="bong__chan">
              <button type="button" className="bong__go" onClick={() => boQuaBuoc(buoc.id)}>
                {buoc.skipLabel}
              </button>
              <button type="button" className="bong__go" onClick={() => boQuaBuoc(SKIP_ALL)}>
                Để tôi tự ghi
              </button>
            </p>
          </div>
        )}
        <div ref={duoi} />
      </div>

      {/*
        Ghi nhanh: một chạm thay vì một câu.

        Phím rút từ CHÍNH nhật ký người dùng, không phải một danh sách gõ cứng. Mẫu tham
        khảo có tám ô cố định (Vận động, Ăn uống, Đọc sách…) — đẹp trong ảnh, nhưng đó là
        danh mục của người thiết kế. Người ngồi đây đi làm 8 tiếng, đi lại 2 tiếng, ăn tối
        30 phút; đó mới là phím đúng.

        Chưa đủ dữ liệu thì hàng này KHÔNG hiện. Một hàng phím rỗng là thêm một khoảng
        trống bấm được, không phải một lối tắt.
      */}
      {goi.length > 0 && (
        <div className="chat__nhanh">
          {goi.map((g) => (
            <button
              key={g.khoa}
              type="button"
              className="nhanh"
              disabled={reading}
              // 27/11/2026: chạm là ĐIỀN vào ô gõ, không ghi luôn. Founder muốn sửa số
              // trước khi gửi — hôm nay đi lại 1 tiếng chứ không phải 2 như mọi hôm.
              onClick={() => dien(cauNhanh(g.label, g.minutes))}
            >
              <b>{g.label}</b>
              <span>{fmtMinutes(g.minutes)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="chat__go">
        <input
          ref={oGo}
          value={cau}
          onChange={(e) => setCau(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void gui();
          }}
          placeholder="Hôm nay có gì?"
          aria-label="Gõ một câu"
        />
        <button type="button" onClick={() => void gui()} disabled={cau.trim() === '' || reading}>
          Gửi
        </button>
      </div>

      <EditWritten y={ySua} id={idSua} onClose={() => setDangSua(null)} onDone={suaXong} />
    </div>
  );
}

function Answer({
  ketQua,
  dong,
  onHoanTac,
  onSua,
  homNay,
  n,
}: {
  readonly ketQua: ParseResult;
  readonly dong: Dong;
  readonly onHoanTac: () => void;
  readonly onSua: (i: number) => void;
  readonly homNay: string;
  readonly n: AnswerSource;
}) {
  const [typing, setDangGo] = useState(false);

  if (ketQua.source === 'unparsed' || ketQua.yChi.length === 0) {
    return (
      <p className="bong__chu">
        Mira chưa hiểu câu này. Thử nói rõ hơn số giờ hoặc số tiền, hoặc ghi tay bên tab Thời gian.
      </p>
    );
  }

  // `khongGhi` và `chuaHieu` không ghi được, nên câu chỉ gồm hai loại đó thì không có gì
  // để gỡ và cũng không hiện dòng trạng thái nào.
  const writable = ketQua.yChi.filter(
    (y) => y.kind === 'time' || y.kind === 'grain' || y.kind === 'money' || y.kind === 'reminder',
  );

  // Xoá hết từng mục trong khay sửa thì thẻ thôi nói "đã ghi", thôi cảnh báo trùng và
  // thôi mời Hoàn tác — không còn gì để gỡ.
  const hetSach =
    dong.sua !== undefined &&
    writable.length > 0 &&
    ketQua.yChi.every(
      (y, i) => !(writable as readonly Intent[]).includes(y) || dong.sua?.[i] === null,
    );

  return (
    <>
      {writable.length > 0 && (
        <p className="bong__dau">{hetSach ? 'Đã xoá.' : headline(writable, dong)}</p>
      )}

      {ketQua.yChi.map((y, i) => {
        const sua = dong.sua?.[i];
        if (sua === null) {
          return (
            <p key={i} className="y y--khong">
              Đã xoá một mục.
            </p>
          );
        }
        // Chỉ mở được khi đã ghi xong, chưa gỡ, và có id để sửa. Ô mức (dư nợ, tài sản
        // ròng) không có id — nó là con số cả tháng, sửa bên tab Tài chính.
        const suaDuoc =
          dong.saved === true && dong.undone !== true && dong.veT?.byIndex[i] !== undefined;
        return (
          <IntentCard
            key={i}
            y={sua ?? y}
            homNay={homNay}
            n={n}
            onOpen={suaDuoc ? () => onSua(i) : undefined}
          />
        );
      })}

      {/* Trùng: hôm nay đã có đúng mục này rồi.
          Không chặn — có người tập hai buổi 20 phút thật. Nhưng phải nói, vì Mira ghi tự
          động: không có bước bấm nút nào để người ta kịp thấy mình vừa ghi hai lần. Nút
          Hoàn tác nằm ngay dưới đây. */}
      {dong.trung !== undefined && dong.trung.length > 0 && dong.undone !== true && !hetSach && (
        <p className="bong__trung">
          Hôm nay đã có {dong.trung.map((t) => `“${t}”`).join(', ')} đúng như vậy rồi. Ghi thật thì
          kệ, nhầm thì gỡ ở dưới.
        </p>
      )}

      {dong.saveError !== undefined && <p className="y y--khong">Ghi hỏng: {dong.saveError}</p>}

      {writable.length > 0 && dong.saved === true && dong.undone !== true && !hetSach && (
        <p className="bong__chan">
          <span className="bong__xong">Đã vào nhật ký</span>
          <button
            type="button"
            className="bong__go"
            disabled={typing || dong.veT === undefined}
            onClick={() => {
              setDangGo(true);
              onHoanTac();
            }}
          >
            {typing ? 'Đang gỡ…' : '↺ Hoàn tác'}
          </button>
        </p>
      )}
    </>
  );
}

/**
 * Dòng tiêu đề của thẻ kết quả.
 *
 * Nói **đã ghi mấy mục và loại gì**, vì một câu có thể ra hai mục giờ cộng một hạt, và
 * lúc đó danh sách thẻ bên dưới không tự nói ra con số ấy. Đếm sai ở đây là nói dối về
 * một việc vừa xảy ra trong nhật ký của người ta, nên nó đếm thật chứ không ghi cứng.
 */
function headline(writable: readonly Intent[], dong: Dong): string {
  if (dong.undone === true) return 'Đã gỡ lại.';
  if (dong.saving === true) return 'Đang ghi…';

  const dem = { time: 0, grain: 0, money: 0 };
  for (const y of writable) {
    if (y.kind === 'time') dem.time += 1;
    else if (y.kind === 'grain') dem.grain += 1;
    else if (y.kind === 'money') dem.money += 1;
  }
  const phan = [
    dem.time > 0 ? `${dem.time} mục giờ` : null,
    dem.grain > 0 ? `${dem.grain} hạt` : null,
    dem.money > 0 ? `${dem.money} ô tiền` : null,
  ].filter((x): x is string => x !== null);

  return `Đã ghi ${phan.join(' · ')}`;
}

/**
 * Một đề xuất.
 *
 * Ngày chỉ hiện khi **khác hôm nay**. Hiện "Hôm nay" trên mọi thẻ thì nó thành chữ trang
 * trí ai cũng bỏ qua, và đúng lúc nó ghi "Thứ 3" thì cũng không ai đọc nữa. Chỗ cần người
 * dùng nhìn là chỗ Mira đã suy ra một ngày khác với mặc định.
 */
/**
 * Bọc một thẻ thành nút mở khay sửa, kèm mũi tên › kiểu iOS ở mép phải.
 * Không có `onOpen` thì thẻ vẫn là chữ in như cũ.
 */
function Mo({
  onOpen,
  children,
}: {
  readonly onOpen: (() => void) | undefined;
  readonly children: ReactNode;
}) {
  if (onOpen === undefined) return <div className="y">{children}</div>;
  return (
    <button type="button" className="y y--mo" onClick={onOpen} aria-label="Sửa hoặc xoá mục này">
      {children}
      <i className="y__toi" aria-hidden>
        ›
      </i>
    </button>
  );
}

function IntentCard({
  y,
  homNay,
  n,
  onOpen,
}: {
  readonly y: Intent;
  readonly homNay: string;
  readonly n: AnswerSource;
  readonly onOpen?: (() => void) | undefined;
}) {
  if (y.kind === 'notRecorded') {
    return <p className="y y--khong">{y.why}</p>;
  }
  if (y.kind === 'unclear') {
    return (
      <p className="y y--khong">
        Chỗ này Mira chưa đọc được: «{y.excerpt}». Những mục trên vẫn ghi được; chỗ này thì ghi tay
        ở tab Thời gian.
      </p>
    );
  }
  if (y.kind === 'time') {
    return (
      <Mo onOpen={onOpen}>
        <b>{y.name}</b>
        <span>
          {fmtMinutes(y.minutes)}
          {y.date !== homNay ? ` · ${labelDay(y.date)}` : ''}
        </span>
        {/* Viên ô, không phải chữ nối bằng dấu chấm: ô là thứ quyết định con số này rơi
            vào đâu, nên nó phải đọc được bằng một cái liếc. Nhãn tiếng Việt — giao diện
            này không có chỗ cho chữ "Work". */}
        <i className={`vien vien--${y.bucket}`}>{BUCKET_LABEL_VI[y.bucket]}</i>
        {/* Đoán thì phải nói là đoán.
            Mira không nhận ra việc này nên tự xếp vào Cá nhân. Ghi vẫn hơn bỏ, nhưng im
            lặng thì người dùng tưởng Mira hiểu — rồi một tháng sau ô Cá nhân phình lên
            toàn thứ họ không hề xếp vào đó, và họ không biết tại sao. */}
        {y.bucketGuessed && <em className="y__doan">Mira đoán ô này · chạm để sửa</em>}
      </Mo>
    );
  }
  if (y.kind === 'grain') {
    return (
      <Mo onOpen={onOpen}>
        <b>
          <i className={y.grain === 'candy' ? 'y__keo' : 'y__muoi'} />{' '}
          {y.grain === 'candy' ? 'Viên kẹo' : 'Hạt muối'}
          {y.date !== homNay ? ` · ${labelDay(y.date)}` : ''}
        </b>
        <span>{y.text}</span>
      </Mo>
    );
  }
  if (y.kind === 'reminder') {
    return (
      <Mo onOpen={onOpen}>
        <b>🔔 Nhắc lúc {y.at}</b>
        <span>
          {shiftWeekday(y.days)}
          {y.text === null ? '' : ` · “${y.text}”`}
        </span>
        {/* Nói thẳng giới hạn ngay tại chỗ đặt. Chữ "nhắc" làm người ta chờ điện thoại
            rung lên; không rung mà cũng không ai báo trước thì họ mất tin vào mọi con số
            khác trong app, chứ không chỉ mất tính năng này. */}
        <em className="y__doan">Hiện trong khung này khi bạn mở Mira — không phải thông báo đẩy</em>
      </Mo>
    );
  }
  // Câu hỏi: không phải một mục đã ghi, nên không có thẻ, không có nút gỡ.
  if (y.kind === 'question') return <AnswerQuestion topic={y.topic} n={n} />;
  return (
    <Mo onOpen={onOpen}>
      <b>{MONEY_CELL_LABEL_VI[y.cell]}</b>
      <span>
        {y.adds ? `${y.cell === 'netIncome' ? '+' : '−'} ${vnd(y.vnd)}` : vnd(y.vnd)}
        {y.adds ? '' : ' · đặt lại'}
        {y.month !== monthOf(homNay) ? ` · tháng ${y.month.slice(5)}/${y.month.slice(0, 4)}` : ''}
      </span>
    </Mo>
  );
}
