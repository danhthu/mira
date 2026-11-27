/**
 * Ngày đầu: Mira hỏi từng câu ngay trong khung chat, thay vì để người mới nhìn ba ô "?".
 *
 * ──────────────────────────── VÌ SAO HỎI, KHÔNG BÀY FORM ────────────────────────────
 *
 * Audit 26/11/2026 dùng một tài khoản rỗng: màn chủ hiện ba dấu hỏi và năm câu ví dụ chỉ
 * để đọc. Người mới phải tự đoán nên gõ gì trước, và cái họ gõ trước thường KHÔNG phải
 * cái làm con số đầu tiên hiện ra — "Vốn tự do" cần tài sản ròng lẫn một khoản chi, mà
 * không chỗ nào nói vậy.
 *
 * Nên Mira hỏi đúng thứ tự làm số hiện ra: thu nhập, nợ, tài sản ròng, một khoản chi, rồi
 * giờ đi làm, giờ điện thoại, giờ gia đình, và một dòng về hôm nay.
 *
 * ──────────────────────────── KHÔNG CÓ TRẠNG THÁI RIÊNG ────────────────────────────
 *
 * Một bước "xong" khi **dữ liệu của nó đã có**, không phải khi người ta bấm Tiếp. Nhờ thế:
 *
 *   • trả lời bằng tay bên tab Tài chính cũng tính là xong,
 *   • đổi máy thì không bị hỏi lại những gì đã khai,
 *   • Hoàn tác một câu trả lời thì câu hỏi tự quay lại.
 *
 * Thứ duy nhất phải nhớ riêng là bước người ta **chọn bỏ qua** ("không nợ"), vì "không
 * có" và "chưa khai" trông giống hệt nhau trong dữ liệu. Cái đó nằm ở `localStorage`: mất
 * thì cùng lắm bị hỏi lại một câu.
 */
import type { TimeBucket } from '@mira/contract';

export type StepId =
  'income' | 'debt' | 'netWorth' | 'expense' | 'work' | 'waste' | 'family' | 'grain';

export interface OnboardStep {
  readonly id: StepId;
  /** Câu Mira hỏi. */
  readonly ask: string;
  /** Một dòng nói con số này dùng để làm gì. Người ta khai dễ hơn khi biết vì sao bị hỏi. */
  readonly why: string;
  /** Câu mẫu bấm được. Bấm là điền vào ô gõ để SỬA SỐ rồi gửi, không gửi thẳng số mẫu. */
  readonly samples: readonly string[];
  /**
   * Chữ ghép vào trước khi câu trả lời cụt quá để đọc.
   *
   * Được hỏi "tháng này mang về bao nhiêu" thì người ta đáp "18 triệu", không đáp "lương
   * tháng này 18 triệu". Câu cụt ấy đứng một mình thì bộ đọc không biết vào ô nào; nhưng
   * Mira vừa hỏi, nên Mira biết.
   */
  readonly prefix: string | null;
  /** Chữ trên nút bỏ qua. "Không nợ" nói đúng hơn "Bỏ qua" ở bước nợ. */
  readonly skipLabel: string;
}

export const ONBOARD_STEPS: readonly OnboardStep[] = [
  {
    id: 'income',
    ask: 'Bắt đầu từ thu nhập. Tháng này bạn mang về khoảng bao nhiêu?',
    why: 'Có số này Mira mới tính được tháng này dư hay thiếu.',
    samples: ['8 triệu', '12 triệu', '18 triệu', '25 triệu', '40 triệu', 'lương 15tr, thưởng 3tr'],
    prefix: 'lương tháng này',
    skipLabel: 'Bỏ qua',
  },
  {
    id: 'debt',
    ask: 'Bạn có đang nợ khoản nào không? Tổng còn nợ khoảng bao nhiêu?',
    why: 'Nợ là thứ giữ chân tiền của bạn lâu nhất, nên Mira tách nó ra một dòng riêng.',
    samples: [
      'còn nợ ngân hàng 240 triệu',
      'còn nợ mua nhà 1 tỷ',
      'nợ thẻ tín dụng 15 triệu',
      'trả góp nhà 7tr',
      'trả góp xe 3tr',
      'trả góp điện thoại 2tr',
    ],
    prefix: 'còn nợ',
    skipLabel: 'Không nợ',
  },
  {
    id: 'netWorth',
    ask: 'Nếu bán hết và trả hết nợ thì bạn còn khoảng bao nhiêu? Ước lượng cũng được.',
    why: 'Chia số này cho chi tiêu tháng là ra bạn sống được mấy tháng nếu dừng lại hôm nay.',
    samples: ['50 triệu', '100 triệu', '300 triệu', '500 triệu', '1 tỷ', '3 tỷ'],
    prefix: 'tài sản ròng',
    skipLabel: 'Bỏ qua',
  },
  {
    id: 'expense',
    ask: 'Hôm nay bạn tiêu gì rồi? Một khoản thôi.',
    why: 'Từ nay mỗi khoản gõ một câu như vậy, Mira tự cộng.',
    samples: [
      'ăn sáng 30k',
      'cà phê 35k',
      'ăn trưa 60k',
      'grab 45k',
      'đổ xăng 80 nghìn',
      'đi chợ 200k',
    ],
    prefix: 'chi tiêu',
    skipLabel: 'Chưa tiêu gì',
  },
  {
    id: 'work',
    ask: 'Sang thời gian. Hôm nay bạn đi làm mấy tiếng?',
    why: 'Giờ làm là miếng to nhất của ngày, có nó thì vòng tuần mới ra hình.',
    samples: [
      '8 tiếng',
      '9 tiếng',
      '10 tiếng',
      'làm việc 8h, họp 2 tiếng',
      'đi lại đi làm 1 tiếng',
    ],
    prefix: 'làm việc',
    skipLabel: 'Hôm nay nghỉ',
  },
  {
    id: 'waste',
    ask: 'Điện thoại, mạng xã hội, xem linh tinh hôm nay hết bao lâu? Đoán cũng được.',
    why: 'Mira không chê. Con số này là nguyên liệu để đổi sang việc bạn muốn hơn.',
    samples: [
      '30 phút',
      '1 tiếng',
      '2 tiếng',
      'lướt tiktok 1 tiếng',
      'xem phim 2 tiếng',
      'chơi game 1 tiếng',
    ],
    prefix: 'lướt điện thoại',
    skipLabel: 'Bỏ qua',
  },
  {
    id: 'family',
    ask: 'Còn thời gian cho gia đình hôm nay?',
    why: 'Đây là con số Mira để ngay trên đầu màn này mỗi tuần.',
    samples: [
      '30 phút',
      '1 tiếng',
      'chơi với con 1 tiếng',
      'nấu cơm 1h',
      'ăn tối cả nhà 1 tiếng',
      'gọi cho mẹ 20 phút',
    ],
    prefix: 'gia đình',
    skipLabel: 'Bỏ qua',
  },
  {
    id: 'grain',
    ask: 'Câu cuối. Một dòng về hôm nay, vui hay nặng đều được.',
    why: 'Mỗi dòng là một hạt trong hũ. Vài tháng sau Mira đưa lại cho bạn đọc.',
    samples: [
      'hôm nay vui, con tự xúc hết bát cơm',
      'được sếp khen',
      'trời đẹp, đi bộ về nhà',
      'mệt quá',
      'cãi nhau với vợ',
      'kẹt xe cả tiếng',
    ],
    prefix: null,
    skipLabel: 'Để sau',
  },
];

/** Những gì màn Nhật ký đã tải sẵn. Không bước nào cần thêm một lời gọi mạng. */
export interface OnboardFacts {
  readonly netIncome: number | null;
  readonly monthlyExpense: number | null;
  readonly debtPayment: number | null;
  readonly debtBalance: number | null;
  readonly netWorth: number | null;
  /** Các nhóm đã có ít nhất một mục giờ trong hai tuần gần đây. */
  readonly buckets: ReadonlySet<TimeBucket>;
  /** Số mục giờ trong hai tuần gần đây. */
  readonly timeCount: number;
  /** Số hạt trong 90 ngày. */
  readonly grains: number;
}

/**
 * Từ ngưỡng này trở lên thì coi là người đã quen ghi giờ, thôi hỏi ba bước giờ.
 *
 * Không có ngưỡng thì một người dùng lâu năm, hai tuần chưa ghi giờ gia đình, mở app ra
 * lại bị "onboard" bằng câu "còn thời gian cho gia đình hôm nay?" — nghe như lời trách.
 */
export const SETTLED_TIME_ENTRIES = 8;

const co = (n: number | null): boolean => n !== null && n > 0;

function done(id: StepId, f: OnboardFacts): boolean {
  const quenGhiGio = f.timeCount >= SETTLED_TIME_ENTRIES;
  switch (id) {
    case 'income':
      return co(f.netIncome);
    case 'debt':
      // Khai tổng nợ HOẶC khoản trả tháng đều là đã trả lời câu "có nợ không".
      return f.debtBalance !== null || co(f.debtPayment);
    case 'netWorth':
      return f.netWorth !== null;
    case 'expense':
      return co(f.monthlyExpense);
    case 'work':
      return quenGhiGio || f.buckets.has('work');
    case 'waste':
      return quenGhiGio || f.buckets.has('waste');
    case 'family':
      return quenGhiGio || f.buckets.has('family');
    case 'grain':
      return f.grains > 0;
  }
}

/** Các bước còn lại, đúng thứ tự hỏi. Rỗng nghĩa là xong. */
export function pendingSteps(
  facts: OnboardFacts,
  skipped: ReadonlySet<string>,
): readonly OnboardStep[] {
  return ONBOARD_STEPS.filter((b) => !skipped.has(b.id) && !done(b.id, facts));
}

/**
 * Câu trả lời là một lời từ chối: "không", "ko có", "chưa", "bỏ qua".
 *
 * Được hỏi "có nợ không" mà đáp "không" là một câu trả lời đầy đủ. Đem nó đi đọc như một
 * mục ghi thì ra hạt muối "không" nằm trong hũ.
 *
 * Chỉ nhận câu NGẮN. "không ngủ được cả đêm" cũng bắt đầu bằng "không" nhưng là một dòng
 * nhật ký thật.
 */
export function isNo(text: string): boolean {
  const s = text
    .trim()
    .toLowerCase()
    .replace(/[.!…]+$/u, '');
  return /^(kh[oô]ng|ko|k|hok|ch[uư]a|kh[oô]ng c[oó]|ko c[oó]|ch[uư]a c[oó]|kh[oô]ng n[oợ]|ko n[oợ]|b[oỏ] qua|th[oô]i)$/u.test(
    s,
  );
}

// ── nhớ những bước đã chọn bỏ qua

const KEY = 'mira.onboard.skipped';
/** Giá trị đặc biệt: người dùng bấm "để tôi tự ghi", thôi hỏi hẳn. */
export const SKIP_ALL = '*';

export function loadSkipped(): ReadonlySet<string> {
  try {
    const raw = localStorage.getItem(KEY);
    const ds: unknown = raw === null ? [] : JSON.parse(raw);
    return new Set(Array.isArray(ds) ? ds.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    // Chế độ riêng tư, hoặc dữ liệu hỏng: coi như chưa bỏ qua gì.
    return new Set();
  }
}

export function saveSkipped(ds: ReadonlySet<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...ds]));
  } catch {
    // Không lưu được thì lần sau hỏi lại. Không phải lỗi đáng chặn người dùng.
  }
}
