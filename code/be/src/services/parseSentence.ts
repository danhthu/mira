/**
 * Đọc một câu tiếng Việt thành ý định có cấu trúc — bằng luật, không gọi mạng.
 *
 * VÌ SAO CÓ TẦNG LUẬT TRƯỚC KHI GỌI LLM
 *
 * Vốn từ của Mira rất hẹp: bốn ô, năm ô tiền, kẹo hoặc muối, và danh mục do chính người
 * dùng đặt. Phần lớn câu người ta gõ là một con số cộng một đơn vị cộng một từ khoá. Gọi
 * LLM cho những câu đó là trả tiền và trả độ trễ cho một việc `RegExp` làm xong trong
 * một mili giây.
 *
 * Quan trọng hơn: tầng luật **chạy được khi chưa có khoá API**. Nếu cả tính năng chỉ sống
 * nhờ LLM thì nó chết ngay lúc chưa cấu hình, và Mira đã có một tính năng như vậy rồi
 * (đăng nhập Google). Hai cái thì quá nhiều.
 *
 * LUẬT CỨNG: HÀM NÀY KHÔNG BAO GIỜ GHI GÌ CẢ.
 * Nó chỉ đọc câu và trả về **đề xuất**. Người dùng duyệt rồi mới ghi. Bài học từ nếp còn
 * nguyên: đây là chỗ máy viết vào nhật ký của người, và một dòng bịa làm hỏng niềm tin
 * vào cả trăm dòng thật.
 *
 * BA THỨ TẦNG NÀY PHẢI TỰ ĐỌC, KHÔNG ĐƯỢC ĐẨY SANG LLM
 *
 * 1. **Ngày.** "hôm qua ngủ 7 tiếng" trước đây đọc ra 420 phút rồi client ghi vào *hôm
 *    nay*. Sai ngày mà không ai báo: tệ hơn hẳn việc nói thẳng là không hiểu. Giờ mỗi ý
 *    chí mang theo `ngay` của chính nó, và client ghi đúng cái đó.
 * 2. **Danh mục của người dùng.** Người dùng đặt tên việc rồi thì tên đó là từ khoá tốt
 *    nhất đang có, tốt hơn mọi danh sách tôi gõ cứng ở dưới. Khớp tên thì lấy luôn ô và
 *    cờ giờ vàng của danh mục, nên câu chat ghi ra mục *đã phân loại* — nếu không thì
 *    màn Thời gian đầy dòng trắng và cái danh mục vừa làm thành vô dụng.
 * 3. **Câu nhiều việc.** "sáng họp 3 tiếng, chiều đón con 30 phút" là cách người ta kể
 *    một ngày. Trước đây nó rơi xuống LLM, tức là chưa có khoá thì chết.
 *
 * VÀ KHI ĐỌC ĐƯỢC MỘT PHẦN THÌ PHẢI NÓI RA PHẦN CÒN LẠI. Mảnh nào có số mà không ai đọc
 * được thì trả về `chuaHieu` kèm nguyên văn mảnh đó. Im lặng bỏ bớt một mảnh có số là
 * làm mất một mục người dùng tưởng đã ghi.
 */
import type { TimeBucket } from '../shared/types/enums';
import luat from './parse-rules.json';

export type Intent =
  | {
      readonly kind: 'time';
      readonly bucket: TimeBucket;
      readonly minutes: number;
      readonly name: string;
      readonly golden: boolean;
      /** YYYY-MM-DD. Suy từ câu ("hôm qua", "thứ 3"), mặc định là ngày client gửi lên. */
      readonly date: string;
      /** Danh mục khớp được theo tên, nếu có. */
      readonly categoryId: string | null;
      /**
       * `true` khi ô ở trên là ĐOÁN — câu có thời lượng và tên việc nhưng không từ khoá
       * nào nhận ra. Xem `O_MAC_DINH`.
       *
       * ⚠ Kiểu này là BẢN SAO của `YChi` trong `@mira/contract`, cố ý tách ra để tầng
       * nghiệp vụ không phụ thuộc gói contract. Hai bản phải khớp nhau bằng tay — không
       * có trình biên dịch nào canh giúp. Thêm trường ở đây thì phải thêm cả ở kia.
       */
      readonly bucketGuessed: boolean;
    }
  | { readonly kind: 'grain'; readonly grain: 'candy' | 'salt'; readonly text: string; readonly date: string }
  | {
      readonly kind: 'money';
      readonly cell: MoneyCell;
      readonly vnd: number;
      readonly month: string;
      /**
       * `true` thì đây là một KHOẢN mới của ngày `date`; `false` thì đặt lại ô mức.
       *
       * Năm ô **dòng chảy** — thu nhập, chi tiêu, đầu tư, lãng phí, trả nợ — là tổng của
       * nhiều lần trong tháng, nên mỗi câu là một khoản riêng có ngày và có danh mục.
       * Hai ô **mức** — dư nợ, tài sản ròng — là ảnh chụp tại một thời điểm, nên câu sau
       * thay câu trước và không có khoản nào được sinh ra.
       *
       * Không có cờ này thì "nợ 240 triệu" thành một khoản cộng dồn, và khai lại lần thứ
       * hai là Mira tưởng người ta nợ 480 triệu.
       */
      readonly adds: boolean;
      /** Ngày của khoản, YYYY-MM-DD. Chỉ có nghĩa khi `adds`. */
      readonly date: string;
      /** Danh mục tiền khớp được theo tên, nếu có. Chỉ có nghĩa khi `adds`. */
      readonly categoryId: string | null;
    }
  | { readonly kind: 'notRecorded'; readonly why: string }
  | { readonly kind: 'unclear'; readonly excerpt: string }
  | { readonly kind: 'question'; readonly topic: QuestionTopic }
  | {
      readonly kind: 'reminder';
      readonly at: string;
      readonly days: string;
      readonly text: string | null;
    };

/** Chủ đề câu hỏi. ⚠ Phải khớp `HoiMa` trong `@mira/contract` — hai bản, sửa cả hai. */
export type QuestionTopic = 'howToLog' | 'whereIsIt' | 'today' | 'thisWeek' | 'money' | 'jar' | 'unclear';

export type MoneyCell =
  | 'netIncome'
  | 'monthlyExpense'
  | 'investment'
  | 'wastedMoney'
  | 'debtPayment'
  | 'debtBalance'
  | 'netWorth';

export interface ParseResult {
  readonly yChi: readonly Intent[];
  /** 'luat' đọc được bằng luật, 'ai' phải nhờ LLM, 'chiu' không ai đọc được. */
  readonly source: 'rules' | 'ai' | 'unparsed';
}

/** Danh mục rút gọn, đủ để khớp tên. */
export interface CategoryBrief {
  readonly id: string;
  readonly name: string;
  readonly bucket: TimeBucket;
  readonly golden: boolean;
}

/**
 * Bối cảnh của một lần đọc.
 *
 * `today` do **client** gửi lên, không lấy từ đồng hồ máy chủ: máy chủ ở múi giờ nào là
 * chuyện của máy chủ, còn "hôm qua" là hôm qua của người đang gõ.
 */
export interface ParseContext {
  readonly today: string;
  readonly categories: readonly CategoryBrief[];
  /**
   * Danh mục TIỀN. Bỏ trống cũng chạy — lúc đó chỉ còn từ khoá dựng sẵn.
   *
   * Để tuỳ chọn vì mọi bài kiểm cũ dựng bối cảnh bằng tay, và bắt chúng khai thêm một
   * mảng rỗng chỉ để biên dịch được là ma sát không đổi lấy gì.
   */
  readonly moneyCategories?: readonly MoneyCategoryBrief[];
}

/** Đủ để khớp tên và biết nó thuộc ô nào. Không cần cả bản ghi. */
export interface MoneyCategoryBrief {
  readonly id: string;
  readonly name: string;
  readonly cell: MoneyCell;
}

/**
 * Bỏ dấu để so khớp, vì người ta gõ "ngu" lẫn "ngủ".
 *
 * **HẠ CHỮ THƯỜNG TRƯỚC, BỎ DẤU SAU.** "Đ" hoa là U+0110, một ký tự riêng không tách
 * được bằng NFD, nên nó không rơi vào lớp dấu thanh ở dưới. Hạ chữ sau cùng thì `đ` →
 * `d` đã chạy xong từ trước và "Đ" còn nguyên: câu "Đi làm 8 tiếng" ra "đi lam 8 tieng",
 * từ khoá `di lam` không khớp, và cả câu rơi xuống LLM.
 *
 * Mà người ta viết hoa chữ đầu câu — "Đi làm", "Đón con", "Đọc sách" — nên lỗi này ăn
 * đúng vào những câu hay gõ nhất.
 */
const stripDiacritics = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TỪ VỰNG KHÔNG NẰM Ở ĐÂY NỮA. Nó nằm ở `parse-rules.json` bên cạnh.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Trước đây mọi bảng từ khoá viết thẳng vào file này, và mỗi lần Founder gõ một câu
 * Mira không hiểu thì lại phải sửa mã nguồn, chạy lại test, khởi động lại máy chủ. Mà
 * phần phải sửa luôn luôn chỉ là một chuỗi — thuật toán không đổi bao giờ.
 *
 * Giờ tách đôi: **thuật toán ở đây, từ vựng ở file JSON**. File JSON là thứ con người
 * lẫn agent đọc được và sửa được, có `docs/12-mo-hinh-mira.md` giải thích mô hình, và có
 * `__tests__/parseRules.test.test.ts` canh những lỗi ngu nhất (viết từ khoá có dấu, trùng từ,
 * sai tên ô).
 *
 * Thứ tự trong mảng JSON LÀ thứ tự ưu tiên — khớp được dòng nào thì dừng ở đó.
 */
/** Chữ đặc biệt của biểu thức chính quy, phòng khi ai đó gõ nhầm vào file luật. */
const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Dựng biểu thức khớp theo RANH GIỚI TỪ từ một danh sách từ khoá.
 *
 * Từ dài xếp trước từ ngắn, để "tap the duc" không bị "the duc" nuốt mất phần đầu khi
 * cả hai cùng nằm trong một nhóm.
 */
const buildRegex = (wordList: readonly string[]): RegExp =>
  new RegExp(`\\b(${[...wordList].sort((a, b) => b.length - a.length).map(escapeRe).join('|')})\\b`);

/**
 * Giờ vàng đang TẮT theo quyết định ngày 25/11/2026 (`gioVang` trong file luật).
 *
 * Tắt ở tầng đọc câu nghĩa là câu chat không bao giờ gắn cờ vàng nữa. Cột `golden` dưới
 * CSDL vẫn nguyên, mục cũ vẫn giữ cờ cũ — nên bật lại chỉ là đổi một chữ trong JSON,
 * không phải viết lại gì.
 */
const GOLDEN_HOURS_ON: boolean = luat.goldenHours;

const BUCKET_KEYWORDS: ReadonlyArray<readonly [RegExp, TimeBucket, boolean]> = luat.bucketKeywords.map(
  (n) => [buildRegex(n.words), n.bucket as TimeBucket, GOLDEN_HOURS_ON && n.golden] as const,
);

const DEFAULT_BUCKET = luat.defaultBucket as TimeBucket;

const VUI = buildRegex(luat.mood.happy);
const BUON = buildRegex(luat.mood.sad);

const MONEY_CELLS: ReadonlyArray<readonly [RegExp, MoneyCell, boolean, boolean]> = luat.moneyKeywords.map(
  (n) => [buildRegex(n.words), n.cell as MoneyCell, n.adds, n.moneyOnly] as const,
);

const CASH_WITHDRAWAL = buildRegex(luat.cashWithdrawal.words);
const CASH_WITHDRAWAL_CELL = luat.cashWithdrawal.cell as MoneyCell;
const CASH_WITHDRAWAL_ADDS: boolean = luat.cashWithdrawal.adds;

const NOT_RECORDED: ReadonlyArray<readonly [RegExp, string]> = luat.notRecorded.map(
  (n) => [buildRegex(n.words), n.why] as const,
);

/**
 * Việc khung chat CHƯA làm được.
 *
 * Phải chặn TRƯỚC mọi nhánh ghi, vì không chặn thì chúng không im lặng bỏ qua — chúng
 * GHI SAI, và sai theo kiểu người dùng không nhìn ra:
 *
 *   "sửa mục họp thành 3 tiếng"  → ghi THÊM một mục 3 tiếng; ngày đó giờ có cả 2 lẫn 3
 *   "tắt lời nhắc 21h"           → ĐẶT một lời nhắc 21h, đúng ngược điều người ta xin
 *   "khai nếp đi làm 8 tiếng"    → ghi một mục 8 tiếng hôm nay, không có nếp nào
 *
 * Nói thẳng "chỗ này chưa làm được, vào tab kia" thì thật thà hơn, và dẫn người ta tới
 * đúng chỗ làm được.
 */
const NOT_SUPPORTED: ReadonlyArray<readonly [RegExp, string]> = luat.notSupported.items.map(
  (n) => [buildRegex(n.words), n.why] as const,
);

const QUESTION_MARKS = buildRegex(luat.question.questionMarks);
const QUESTION_TOPICS: ReadonlyArray<readonly [RegExp, QuestionTopic]> = luat.question.topics.map(
  (n) => [buildRegex(n.words), n.code as QuestionTopic] as const,
);

/**
 * Câu này có phải câu hỏi không, và hỏi về cái gì.
 *
 * Đòi **ít nhất một dấu hiệu hỏi** — dấu '?' hoặc một từ để hỏi. Không có thì trả null,
 * và câu rơi tiếp xuống tầng cảm xúc. Nếu không đòi thì "mệt quá" có chữ "quá"... không,
 * tệ hơn: mọi câu không đọc được đều thành câu hỏi, và Mira trả lời linh tinh thay vì
 * nói thật là nó chưa hiểu.
 *
 * Biết chắc là câu hỏi mà không rõ hỏi gì thì trả `khongRo`. Đó vẫn là câu trả lời tốt
 * hơn "Mira chưa hiểu": nó nói đúng cái người ta đang cần biết — Mira làm được gì.
 */
function parseQuestion(caCau: string, cauGoc: string): QuestionTopic | null {
  if (!cauGoc.includes('?') && !QUESTION_MARKS.test(caCau)) return null;
  for (const [re, ma] of QUESTION_TOPICS) if (re.test(caCau)) return ma;
  return 'unclear';
}

/**
 * ───────────────────────────── ĐẶT LỜI NHẮC ─────────────────────────────
 *
 * "tạo lịch nhắc 8h hàng ngày" từng ghi ra một mục **8 TIẾNG** tên "Tạo lịch nhắc hàng
 * ngày". Vì trong câu ghi việc thì "8h" là thời lượng, còn trong câu đặt nhắc nó là giờ
 * trên đồng hồ. Cùng hai ký tự, hai nghĩa ngược nhau — nên nhánh này phải chạy TRƯỚC
 * nhánh giờ.
 *
 * Phân biệt bằng hai điều kiện cùng lúc: có từ khoá nhắc, VÀ có giờ đồng hồ. "Giờ đồng
 * hồ" chỉ nhận `8h`, `8:30`, `8 giờ` — KHÔNG nhận `2 tiếng` hay `30 phút`. Nhờ thế câu
 * "nhắc lại chuyện cũ 2 tiếng" vẫn là một mục giờ chứ không thành lời nhắc lúc 2 giờ
 * sáng.
 */
const REMINDER_WORDS = buildRegex(luat.reminder.words);
const REMINDER_EVERY_DAY = buildRegex(luat.reminder.everyDay);
const REMINDER_WEEKDAYS = buildRegex(luat.reminder.weekdays);
const REMINDER_WEEKENDS = buildRegex(luat.reminder.weekends);

/**
 * Giờ đồng hồ trong câu đặt nhắc.
 *
 * Buổi phải đứng NGAY SAU con số. Bỏ dấu xong "tối" thành "toi", trùng với đại từ "tôi"
 * — nhận chữ trần ở bất kỳ đâu thì "nhắc tôi 8h" thành 8 giờ TỐI.
 */
function clockTime(clause: string): string | null {
  const m = /\b(\d{1,2})\s*(?::|h|gio)\s*(\d{2})?\s*(sang|trua|chieu|toi|dem)?/.exec(clause);
  if (m === null) return null;
  let gio = Number(m[1]);
  const phut = Number(m[2] ?? '0');
  const buoi = m[3];
  if (!Number.isInteger(gio) || gio > 23 || phut > 59) return null;
  // 12 giờ → 24 giờ. "12h trưa" là 12, "12h đêm" là 0.
  if (buoi === 'chieu' || buoi === 'toi' || buoi === 'dem') {
    if (gio < 12) gio += 12;
    if (buoi === 'dem' && gio === 24) gio = 0;
  }
  if (buoi === 'sang' && gio === 12) gio = 0;
  if (gio > 23) return null;
  return `${String(gio).padStart(2, '0')}:${String(phut).padStart(2, '0')}`;
}

/** Những thứ trong tuần nói tới trong câu. Không nói gì thì mỗi ngày. */
function weekdayInSentence(clause: string): string {
  if (REMINDER_EVERY_DAY.test(clause)) return '1234567';
  if (REMINDER_WEEKDAYS.test(clause)) return '12345';
  if (REMINDER_WEEKENDS.test(clause)) return '67';
  const ds = new Set<string>();
  for (const m of clause.matchAll(/\bthu ([2-7])\b/g)) ds.add(String(Number(m[1]) - 1));
  if (/\bchu nhat\b/.test(clause)) ds.add('7');
  return ds.size === 0 ? '1234567' : [...ds].sort().join('');
}

/**
 * Lời nhắc: phần câu còn lại sau khi cắt hết từ khoá, giờ và thứ.
 *
 * "nhắc tôi uống thuốc 21h hàng ngày" → "Uống thuốc". Không còn gì đáng giữ thì trả
 * null, và giao diện chỉ hiện giờ — tốt hơn một lời nhắc tên "Tạo lịch".
 */
function reminderText(original: string): string | null {
  const sach = original
    .replace(/\b(t[ạa]o|đ[ặa]t|l[ậa]p|h[ẹe]n)\b/giu, ' ')
    .replace(/\b(l[ịi]ch\s*)?nh[ắa]c\b/giu, ' ')
    .replace(/\bb[áa]o th[ứu]c\b/giu, ' ')
    .replace(/\b(t[ôo]i|m[ìi]nh|tao|t[ớo])\b/giu, ' ')
    .replace(/\d{1,2}\s*(?::\s*\d{2}|h|gi[ờo])\s*\d{0,2}/giu, ' ')
    .replace(/\b(s[áa]ng|tr[ưu]a|chi[ềe]u|t[ốo]i|đ[êe]m)\b/giu, ' ')
    .replace(
      /\b(h[àa]ng ng[àa]y|m[ỗo]i ng[àa]y|ng[àa]y n[àa]o c[ũu]ng|ng[àa]y th[ưu][ờo]ng|cu[ốo]i tu[ầa]n)\b/giu,
      ' ',
    )
    .replace(/\bth[ứu] [2-7]\b/giu, ' ')
    .replace(/\bch[ủu] nh[ậa]t\b/giu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (sach.length < 2) return null;
  return sach.charAt(0).toUpperCase() + sach.slice(1);
}

/**
 * "2 triệu" → 2000000, "350k" → 350000, "1,5tr" → 1500000, "1,5 tỷ" → 1500000000.
 *
 * ĐƠN VỊ TỶ PHẢI CÓ. Mô phỏng một tháng bắt được: "tài sản ròng 1,5 tỷ" rơi xuống "chịu"
 * vì danh sách đơn vị dừng ở "triệu". Mà tài sản ròng và dư nợ — hai ô đắt nhất trong
 * năm ô tiền — là chỗ người ta gõ "tỷ" nhiều nhất.
 */
function parseMoney(cau: string, nhanM = false): number | null {
  const re = nhanM
    ? /(\d+(?:[.,]\d+)?)\s*(ty|ti|trieu|tr|m|nghin|ngan|k|dong|d)\b/
    : /(\d+(?:[.,]\d+)?)\s*(ty|ti|trieu|tr|nghin|ngan|k|dong|d)\b/;
  const m = re.exec(cau);
  if (m === null) return null;
  const so = Number((m[1] ?? '0').replace(',', '.'));
  const donVi = m[2] ?? '';
  if (!Number.isFinite(so)) return null;
  const label =
    donVi === 'ty' || donVi === 'ti'
      ? 1_000_000_000
      : donVi === 'trieu' || donVi === 'tr' || donVi === 'm'
        ? 1_000_000
        : donVi === 'dong' || donVi === 'd'
          ? 1
          : 1_000;
  return Math.round(so * label);
}

/**
 * "3 tiếng" → 180, "30 phút" → 30, "1h30" → 90, "1,5h" → 90, "30m" → 30.
 *
 * NHẬN CẢ CHỮ "m". Mira hiện thời lượng bằng chữ đó — thẻ ghi "20m · Cá nhân", phím Ghi
 * nhanh ghi "Nhà cửa 30m". App dạy người dùng viết "m", rồi không hiểu khi họ viết "m"
 * là lỗi của app chứ không phải của họ.
 *
 * Không đụng tới nhánh tiền: nhánh tiền chạy TRƯỚC và chỉ nhận "m" ở những từ khoá không
 * bao giờ đo bằng phút ("trả nợ 4m"). Câu không có từ khoá tiền nào thì rơi xuống đây.
 */
function parseMinutes(cau: string): number | null {
  const gioPhut = /(\d+)\s*(?:tieng|gio|h)\s*(\d{1,2})\b/.exec(cau);
  if (gioPhut !== null) {
    return Number(gioPhut[1]) * 60 + Number(gioPhut[2]);
  }

  // "tiếng" và "phút" ĐI TRƯỚC chữ "h" trần, vì chúng không bao giờ là giờ đồng hồ.
  //
  // Mô phỏng một tháng bắt được: "chạy deadline tới 10h đêm 3 tiếng" đọc ra 600 phút —
  // nó vớ lấy "10h" trước, mà "10h đêm" là thời điểm còn "3 tiếng" mới là thời lượng.
  // Trong một câu có cả hai, cụm nói rõ đơn vị thời lượng luôn là cụm đúng.
  const tieng = /(\d+(?:[.,]\d+)?)\s*tieng\b/.exec(cau);
  if (tieng !== null) {
    const so = Number((tieng[1] ?? '0').replace(',', '.'));
    if (Number.isFinite(so)) return Math.round(so * 60);
  }
  const phutRo = /(\d+)\s*phut\b/.exec(cau);
  if (phutRo !== null) return Number(phutRo[1]);

  const gio = /(\d+(?:[.,]\d+)?)\s*(?:tieng|gio|h)\b/.exec(cau);
  if (gio !== null) {
    const so = Number((gio[1] ?? '0').replace(',', '.'));
    return Number.isFinite(so) ? Math.round(so * 60) : null;
  }
  const phut = /(\d+)\s*(?:phut|p|m)\b/.exec(cau);
  if (phut !== null) return Number(phut[1]);
  return null;
}

// ── ngày: bốn hàm chuỗi, không kéo thư viện ngày tháng vào

const addDaysTo = (date: string, so: number): string => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + so);
  return d.toISOString().slice(0, 10);
};

/** Thứ theo ISO: thứ hai là 1, chủ nhật là 7. */
const isoWeekday = (date: string): number => {
  const d = new Date(`${date}T00:00:00Z`);
  return ((d.getUTCDay() + 6) % 7) + 1;
};

/** Xa nhất cho phép lùi. Quá một năm thì gần như chắc là gõ sai, không phải ý thật. */
const MAX_BACK = 365;

/**
 * Tách cụm chỉ ngày ra khỏi mảnh câu, trả về số ngày lùi và mảnh đã sạch.
 *
 * Phải **cắt cụm đó khỏi câu** rồi mới đọc số giờ và số tiền: "3 ngày trước họp 2 tiếng"
 * có hai con số, và nếu để nguyên thì có lúc "3" bị đọc thành thời lượng.
 */
function splitDate(clause: string): { readonly lui: number | null; readonly left: string } {
  const cat = (re: RegExp, lui: number) => ({ lui, left: clause.replace(re, ' ') });

  if (/\bhom nay\b/.test(clause)) return cat(/\bhom nay\b/g, 0);
  if (/\bhom qua\b/.test(clause)) return cat(/\bhom qua\b/g, 1);
  if (/\btoi qua\b/.test(clause)) return cat(/\btoi qua\b/g, 1);
  if (/\bhom kia\b/.test(clause)) return cat(/\bhom kia\b/g, 2);

  const dayCount = /\b(\d+)\s*ngay truoc\b/.exec(clause);
  if (dayCount !== null) {
    const n = Number(dayCount[1]);
    if (Number.isFinite(n) && n >= 0 && n <= MAX_BACK) return cat(/\b\d+\s*ngay truoc\b/g, n);
  }

  return { lui: null, left: clause };
}

/**
 * Ngày viết thẳng: "3/11", "ngày 3/11", "20/11/2026".
 *
 * Mô phỏng bắt được: "ngày 3/11 họp 2 tiếng" ghi vào HÔM NAY. Sai ngày mà không báo gì —
 * đúng cái lỗi "hôm qua ngủ 7 tiếng" đã sửa hồi đầu, chỉ khác cách gõ.
 *
 * **Không bao giờ nhận ngày ở tương lai.** Gõ "20/12" vào tháng 11 thì ý là 20/12 NĂM
 * NGOÁI, không phải tháng sau: đây là nhật ký, người ta kể việc đã làm. Một mục giờ nằm
 * ở ngày chưa tới làm lệch mọi tổng tuần mà không ai nhìn ra.
 */
function splitDayMonthDate(
  clause: string,
  today: string,
): { readonly date: string | null; readonly left: string } {
  const m = /\b(?:ngay\s*)?(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/.exec(clause);
  if (m === null) return { date: null, left: clause };

  const d = Number(m[1]);
  const thang = Number(m[2]);
  if (d < 1 || d > 31 || thang < 1 || thang > 12) return { date: null, left: clause };

  const namNay = Number(today.slice(0, 4));
  const nam = m[3] !== undefined ? Number(m[3]) : namNay;
  const lam = (y: number): string => `${y}-${String(thang).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  let date = lam(nam);
  // Năm không ghi mà ngày rơi vào tương lai → hiểu là năm ngoái.
  if (m[3] === undefined && date > today) date = lam(nam - 1);
  if (date > today) return { date: null, left: clause };

  // Ngày không có thật (31/2) thì `Date` tự trượt sang tháng sau — bỏ, đừng đoán.
  const kiem = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(kiem.getTime()) || kiem.toISOString().slice(0, 10) !== date) {
    return { date: null, left: clause };
  }

  return { date, left: clause.replace(/\b(?:ngay\s*)?\d{1,2}\/\d{1,2}(?:\/\d{4})?\b/g, ' ') };
}

/**
 * "thứ 3" là thứ 3 **gần nhất đã qua**, kể cả hôm nay.
 *
 * Người ta kể lại việc đã làm, không hẹn việc sắp làm — màn này là nhật ký. Hiểu ngược
 * chiều là ghi vào tương lai, và một mục giờ ở ngày chưa tới thì mọi tổng tuần đều lệch.
 */
function splitWeekday(clause: string, today: string): { readonly date: string | null; readonly left: string } {
  const m = /\bthu ([2-7])\b/.exec(clause);
  const dich = m !== null ? Number(m[1]) - 1 : /\bchu nhat\b/.test(clause) ? 7 : null;
  if (dich === null) return { date: null, left: clause };

  const lui = (isoWeekday(today) - dich + 7) % 7;
  return {
    date: addDaysTo(today, -lui),
    left: clause.replace(/\bthu [2-7]\b/g, ' ').replace(/\bchu nhat\b/g, ' '),
  };
}

/** "tháng trước" → tháng liền trước của `thang` (YYYY-MM). */
function previousMonth(thang: string): string {
  const nam = Number(thang.slice(0, 4));
  const thg = Number(thang.slice(5, 7));
  return thg === 1 ? `${nam - 1}-12` : `${nam}-${String(thg - 1).padStart(2, '0')}`;
}

/**
 * Cắt phần số, đơn vị và cụm chỉ thời điểm ra khỏi câu để lấy tên việc.
 *
 * Mỗi lớp ký tự phải chứa cả dạng **không dấu**. Người ta gõ "2 tieng" nhiều ngang gõ
 * "2 tiếng", và thiếu chữ `e` trần trong `ti[ếêe]ng` thì tên việc ra "Hop 2 tieng" —
 * thẻ hiện "Hop 2 tieng · 2h · Công việc", lặp lại chính nó.
 */
function taskName(original: string): string {
  const sach = original
    // Dạng "1h30" phải cắt NGUYÊN CỤM trước.
    //
    // Luật cắt thời lượng bên dưới chỉ ăn "1h" rồi để "30" nằm lại, nên tên việc ra
    // "Họp 30" — số phút đúng mà cái thẻ thì vô nghĩa.
    .replace(/\d+\s*(?:gi[ờa]|h)\s*\d{1,2}(?![\p{L}\d])/giu, ' ')
    // `(?![\p{L}])` thay cho `\b`: chữ `h` trần mà chốt bằng `\b` thì trong "thứ 6 họp"
    // nó ăn luôn "6 h" của "họp" — vì "ọ" không phải `\w`, nên `\b` sau "h" lại đúng.
    // Tên việc ra "Thứ ọp", và cụm "thứ 6" ở dưới không còn gì để cắt.
    .replace(/\d+(?:[.,]\d+)?\s*(?:ti[ếêe]ng|gi[ờo]|h|ph[úu]t|p|m)(?![\p{L}])/giu, ' ')
    .replace(/\b\d+\s*ng[àa]y tr[uư][ớo]c\b/gi, ' ')
    // Ngày viết thẳng: "ngày 3/11", "20/10/2026". Không cắt thì thẻ hiện "Ngày 3/11 họp".
    .replace(/\b(?:ng[àa]y\s*)?\d{1,2}\/\d{1,2}(?:\/\d{4})?\b/gi, ' ')
    .replace(/\bth[ứu] [2-7]\b/gi, ' ')
    .replace(/\bch[ủu] nh[ậa]t\b/gi, ' ')
    // Cụm hai chữ thì cắt ở bất kỳ đâu: "sáng nay", "tối qua" không bao giờ là tên việc.
    .replace(
      /\b(h[ôo]m nay|h[ôo]m qua|h[ôo]m kia|t[ốo]i qua|s[áa]ng nay|chi[ềe]u nay|t[ốo]i nay)\b/gi,
      ' ',
    )
    // Nhưng "sáng" / "chiều" / "tối" TRẦN chỉ cắt khi nó đứng ĐẦU câu.
    //
    // "ăn tối 30 phút" — chữ "tối" ở đây là bữa ăn, không phải thời điểm. Cắt ở giữa câu
    // thì tên việc ra "Ăn", và thẻ hiện "Ăn · 30m · Gia đình": mất đúng cái từ phân biệt
    // bữa tối với bữa sáng. "sáng họp 3 tiếng" thì "sáng" đứng đầu và đúng là thời điểm.
    .replace(/^\s*(s[áa]ng|chi[ềe]u|t[ốo]i|nay)\b/i, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (sach === '') return 'Ghi tay';
  return sach.charAt(0).toUpperCase() + sach.slice(1);
}

/**
 * Khớp danh mục theo tên.
 *
 * Tên dài khớp trước tên ngắn: có cả "Họp" và "Họp khách hàng" thì câu "họp khách hàng 1
 * tiếng" phải vào cái cụ thể hơn.
 *
 * Tên dưới ba ký tự thì bỏ qua. Một danh mục tên "A" sẽ khớp gần như mọi câu, và một cú
 * khớp sai đưa giờ vào sai ô — đắt hơn hẳn việc bỏ sót.
 */
const MIN_NAME_LENGTH = 3;

function matchCategory(clause: string, ds: readonly CategoryBrief[]): CategoryBrief | null {
  let thang: CategoryBrief | null = null;
  let dai = 0;
  for (const dm of ds) {
    const ten = stripDiacritics(dm.name.trim());
    if (ten.length < MIN_NAME_LENGTH || ten.length <= dai) continue;
    if (clause.includes(ten)) {
      thang = dm;
      dai = ten.length;
    }
  }
  return thang;
}

/**
 * Khớp tên danh mục tiền trong mảnh câu. Tên DÀI NHẤT thắng, giống bên thời gian:
 * "ăn trưa công ty" phải thắng "ăn trưa" khi người dùng đã khai cả hai.
 */
function matchMoneyCategory(
  clause: string,
  ds: readonly MoneyCategoryBrief[],
): MoneyCategoryBrief | null {
  let thang: MoneyCategoryBrief | null = null;
  let dai = 0;
  for (const dm of ds) {
    const ten = stripDiacritics(dm.name.trim());
    if (ten.length < MIN_NAME_LENGTH || ten.length <= dai) continue;
    if (clause.includes(ten)) {
      thang = dm;
      dai = ten.length;
    }
  }
  return thang;
}

/** Số lượng mảnh tối đa trong một câu. Dài hơn thế thì là đoạn văn, để LLM đọc. */
const MAX_CLAUSES = 6;

/**
 * Tách câu thành mảnh.
 *
 * Chỉ tách ở dấu phẩy, chấm phẩy và chữ "rồi". **Không tách ở "và"**: "chơi với con và
 * vợ 1 tiếng" mà tách ra thì mảnh đầu không có số giờ, mảnh sau còn "vợ 1 tiếng" không
 * khớp từ khoá nào — tách sai làm mất nguyên một mục.
 *
 * DẤU PHẨY GIỮA HAI CHỮ SỐ LÀ DẤU THẬP PHÂN, KHÔNG PHẢI DẤU NGẮT. Người Việt viết "1,5h".
 * Tách ở đó thì "họp 1,5h" thành "họp 1" và "5h", và cả câu chết.
 */
const splitClauses = (cau: string): readonly string[] =>
  cau
    .split(/;|\br[ồo]i\b|(?<!\d),|,(?!\d)/i)
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .slice(0, MAX_CLAUSES);

interface ClauseResult {
  readonly y: Intent | null;
  /** Có chữ số nhưng không đọc được: phải nói ra, không được im lặng bỏ. */
  readonly hasNumbers: boolean;
}

/**
 * Đổi cách nói thường ngày về dạng mà các luật bên dưới đã đọc được.
 *
 * Audit 26/11/2026 bắt được hai câu GHI SAI MÀ KHÔNG BÁO:
 *
 *   "tiền học con 2 triệu rưỡi"  → 2.000.000   (mất 500 nghìn)
 *   "đá bóng 1 tiếng rưỡi"       → 60 phút, tên việc "Đá bóng rưỡi"
 *
 * Tệ hơn một câu không đọc được: thẻ vẫn hiện "Đã ghi", và người ta tin con số. Cùng đợt
 * đó "đọc sách nửa tiếng" và "đóng tiền điện 1tr2" rơi xuống "chưa hiểu".
 *
 * Sửa bằng cách VIẾT LẠI CÂU trước khi đọc, không phải dạy từng luật thêm một ngoại lệ:
 * "2 triệu rưỡi" thành "2,5 triệu", rồi mọi luật số và luật cắt tên việc chạy như cũ.
 *
 * "1tr2" chỉ nhận khi VIẾT LIỀN. "trả 7tr 2 tháng" có dấu cách, và ở đó "2" là số tháng.
 */
export function normalizeColloquial(cau: string): string {
  return cau
    .replace(
      /(\d+)\s*(tri[ệe]u|tr|t[ỷy]|t[ỉi]|ngh[ìi]n|ng[àa]n|k|ti[ếêe]ng|gi[ờo]|h)\s+r[ưu][ỡơo]i(?![\p{L}\d])/giu,
      '$1,5 $2',
    )
    .replace(/(?<![\p{L}\d])n[ửưu]a\s+(?:ti[ếêe]ng|gi[ờo])(?![\p{L}\d])/giu, '30 phút')
    .replace(/(\d+)tr(\d{1,2})(?![\p{L}\d])/giu, '$1,$2 tr');
}

function parseClause(originalRaw: string, bc: ParseContext): ClauseResult {
  const original = normalizeColloquial(originalRaw);
  const hasNumbers = /\d/.test(original);
  const thoNgay = stripDiacritics(original);

  // Lời nhắc xét TRƯỚC MỌI THỨ, kể cả trước khi cắt cụm chỉ ngày.
  //
  // Hai lý do, cả hai đều từng cắn:
  //   1. "8h" trong câu đặt nhắc là giờ đồng hồ, trong câu ghi việc là thời lượng. Để
  //      nhánh giờ chạy trước thì "tạo lịch nhắc 8h hàng ngày" thành một mục 8 TIẾNG.
  //   2. "thứ 3 thứ 5" trong câu đặt nhắc là LỊCH LẶP, không phải một ngày trong quá
  //      khứ. `tachThu` ở dưới sẽ nuốt chúng và biến thành một ngày cụ thể, nên lời nhắc
  //      mất sạch phần thứ và rơi về "mỗi ngày".
  if (REMINDER_WORDS.test(thoNgay)) {
    const gioNhac = clockTime(thoNgay);
    if (gioNhac !== null) {
      return {
        y: { kind: 'reminder', at: gioNhac, days: weekdayInSentence(thoNgay), text: reminderText(original) },
        hasNumbers,
      };
    }
  }

  // Cắt cụm chỉ ngày TRƯỚC khi đọc số, để con số của ngày không bị đọc thành thời lượng.
  const { date: ngayVt, left: sauVt } = splitDayMonthDate(thoNgay, bc.today);
  const { lui, left: sauLui } = splitDate(sauVt);
  const { date: ngayThu, left: clause } = splitWeekday(sauLui, bc.today);
  // Ngày viết thẳng ("3/11") thắng, vì nó rõ ràng nhất trong ba cách.
  const date = ngayVt ?? ngayThu ?? (lui === null ? bc.today : addDaysTo(bc.today, -lui));

  // Tiền: cần cả từ khoá ô lẫn số tiền. Thiếu một trong hai thì không đoán.
  // Đọc hai lần: một lần với đơn vị rõ ràng, một lần cho phép "m" là triệu.
  //
  // "m" nước đôi: Mira hiện thời lượng bằng chữ "m" ("20m · Cá nhân"), nên app tự dạy
  // người dùng rằng m = phút. Chỉ những từ khoá KHÔNG BAO GIỜ đo bằng phút — trả nợ, dư
  // nợ, tài sản, lương — mới được hiểu "4m" là bốn triệu. Còn "ăn tối 30m" là ba mươi
  // phút, vì bữa tối đo được cả hai cách.
  const tienRo = parseMoney(clause);
  const tienM = parseMoney(clause, true);
  const tien = tienRo ?? tienM;
  if (tien !== null) {
    const thang = /\bthang truoc\b/.test(clause) ? previousMonth(bc.today.slice(0, 7)) : bc.today.slice(0, 7);

    // DANH MỤC NGƯỜI DÙNG ĐẶT THẮNG TRƯỚC. "Ăn trưa" là chữ chính họ chọn cho khoản ấy,
    // còn từ khoá dựng sẵn chỉ là phỏng đoán của Mira. Và vì danh mục đã khai thuộc ô
    // nào, câu này không còn phải đoán ô.
    const dmTien = matchMoneyCategory(clause, bc.moneyCategories ?? []);
    if (dmTien !== null) {
      // Danh mục tiền chỉ nằm ở năm ô dòng chảy, nên "m" ở đây luôn là triệu được? KHÔNG.
      // "Ăn trưa 30m" vẫn có thể là ba mươi phút. Đòi đơn vị tiền rõ ràng.
      if (tienRo !== null) {
        return {
          y: {
            kind: 'money',
            cell: dmTien.cell,
            vnd: tienRo,
            month: thang,
            adds: true,
            date,
            categoryId: dmTien.id,
          },
          hasNumbers,
        };
      }
    }

    // Rút tiền khớp trước, vì "rút 2 triệu để tiêu" có cả chữ "tiêu".
    if (CASH_WITHDRAWAL.test(clause)) {
      // Rút tiền không bao giờ đo bằng phút, nên "rút 4m" là bốn triệu.
      const vnd = tienM ?? tienRo;
      if (vnd !== null) {
        return {
          y: {
            kind: 'money',
            cell: CASH_WITHDRAWAL_CELL,
            vnd,
            month: thang,
            adds: CASH_WITHDRAWAL_ADDS,
            date,
            categoryId: null,
          },
          hasNumbers,
        };
      }
    }
    for (const [re, o, cong, chiTien] of MONEY_CELLS) {
      if (!re.test(clause)) continue;
      const vnd = chiTien ? (tienM ?? tienRo) : tienRo;
      if (vnd === null) break; // nhóm nước đôi mà không có đơn vị rõ → để nhánh giờ đọc
      return {
        y: { kind: 'money', cell: o, vnd, month: thang, adds: cong, date, categoryId: null },
        hasNumbers,
      };
    }
  }

  // Giờ: cần thời lượng, cộng với một danh mục khớp tên HOẶC một từ khoá.
  const phut = parseMinutes(clause);
  if (phut !== null && phut > 0 && phut <= 1440) {
    const dm = matchCategory(clause, bc.categories);
    if (dm !== null) {
      return {
        y: {
          kind: 'time',
          bucket: dm.bucket,
          minutes: phut,
          name: dm.name,
          golden: dm.golden,
          date,
          categoryId: dm.id,
          bucketGuessed: false,
        },
        hasNumbers,
      };
    }
    for (const [re, bucket, vang] of BUCKET_KEYWORDS) {
      if (re.test(clause)) {
        return {
          y: {
            kind: 'time',
            bucket,
            minutes: phut,
            name: taskName(original),
            golden: vang,
            date,
            categoryId: null,
            bucketGuessed: false,
          },
          hasNumbers,
        };
      }
    }

    // Lưới hứng: có thời lượng, có tên việc, nhưng không từ khoá nào nhận ra.
    //
    // Đây là chỗ "thể dục 30 phút" từng chết. Luật cũ đòi phải khớp từ khoá mới ghi, nên
    // bất kỳ việc nào ngoài danh sách đều rơi xuống LLM — và không có khoá API thì rơi
    // xuống đất. Vá thêm từ khoá chỉ dời cái hố đi chỗ khác: đời sống của một người có
    // hàng trăm việc, không bao giờ liệt kê hết được.
    //
    // Nên đổi luật: thời lượng cộng tên việc là ĐỦ để ghi. Ô thì đoán, và nói rõ là đoán.
    //
    // `tenViec` trả "Ghi tay" khi cắt xong không còn chữ nào — tức câu chỉ có mỗi con số
    // như "30 phút". Không có tên việc thì không ghi, vì một dòng "Ghi tay · 30m · Cá
    // nhân" trong sổ tuần sau đọc lại cũng không ai biết nó là gì.
    const ten = taskName(original);
    if (ten !== 'Ghi tay') {
      return {
        y: { kind: 'time', bucket: DEFAULT_BUCKET, minutes: phut, name: ten, golden: false, date, categoryId: null, bucketGuessed: true },
        hasNumbers,
      };
    }
  }

  return { y: null, hasNumbers };
}

/**
 * Đọc một câu. Trả `nguon: 'chiu'` khi luật không chắc — lúc đó tầng trên gọi LLM.
 */
export function parseByRules(cauGoc: string, bc: ParseContext): ParseResult {
  const cauSach = cauGoc.trim();
  if (cauSach === '') return { yChi: [], source: 'unparsed' };

  const caCau = stripDiacritics(cauSach);

  // Việc không ghi được phải chặn TRƯỚC mọi thứ khác: "rút atm 2 triệu" có số tiền, và
  // nếu không chặn thì luật tiền bên dưới sẽ nhét nó vào một ô nào đó.
  //
  // NHƯNG CHỈ KHI CÂU CÓ SỐ TIỀN THẬT. Bỏ dấu xong thì "chuyện tiền" và "chuyển tiền"
  // giống hệt nhau, nên câu "lo lắng chuyện tiền" — một hạt muối rõ ràng — bị trả lời
  // bằng bài giảng kế toán "chuyển tiền giữa các tài khoản của bạn không làm đổi tổng
  // tài sản". Vô nghĩa, và đúng vào lúc người ta đang buồn.
  //
  // Chặn này chỉ có việc khi người dùng ĐANG ĐỊNH GHI một khoản. Không có con số thì
  // không có gì để chặn.
  if (parseMoney(caCau) !== null) {
    for (const [re, viSao] of NOT_RECORDED) {
      if (re.test(caCau)) return { yChi: [{ kind: 'notRecorded', why: viSao }], source: 'rules' };
    }
  }

  // Chặn việc chưa làm được TRƯỚC khi tách mảnh: để nhánh ghi chạy là ghi sai.
  for (const [re, viSao] of NOT_SUPPORTED) {
    if (re.test(caCau)) return { yChi: [{ kind: 'notRecorded', why: viSao }], source: 'rules' };
  }

  const clause = splitClauses(cauSach);
  const yChi: Intent[] = [];
  const boSot: string[] = [];

  for (const m of clause) {
    const r = parseClause(m, bc);
    if (r.y !== null) yChi.push(r.y);
    else if (r.hasNumbers) boSot.push(m);
  }

  // Hạt: chỉ nhận khi KHÔNG đọc được giờ hay tiền, và xét trên CẢ CÂU chứ không từng
  // mảnh. "mệt quá, cả ngày căng thẳng" là một hạt muối, không phải hai — mà hũ muối có
  // nhịp hỏi lại 42 ngày, nên nhân đôi một hạt là làm nhiễu đúng chỗ đang đếm.
  if (yChi.length === 0) {
    // Câu hỏi xét TRƯỚC cảm xúc: "hôm nay có vui không" là một câu hỏi, không phải một
    // viên kẹo. Nhưng xét SAU giờ và tiền: "hôm nay họp 2 tiếng" là một mục.
    const question = parseQuestion(caCau, cauSach);
    if (question !== null) return { yChi: [{ kind: 'question', topic: question }], source: 'rules' };

    const { lui, left } = splitDate(caCau);
    const date = lui === null ? bc.today : addDaysTo(bc.today, -lui);
    if (VUI.test(left)) return { yChi: [{ kind: 'grain', grain: 'candy', text: cauSach, date }], source: 'rules' };
    if (BUON.test(left)) return { yChi: [{ kind: 'grain', grain: 'salt', text: cauSach, date }], source: 'rules' };

    // Có số tiền rõ ràng mà không khớp ô nào → nói thẳng năm ô là gì.
    //
    // "vốn tự có 3tr" từng trả về "Mira chưa hiểu câu này", mà Mira hiểu rõ đây là tiền
    // — nó chỉ không biết bỏ vào ô nào. Nói ra điều mình biết thì dẫn được người ta tới
    // câu đúng; nói "chưa hiểu" thì bỏ họ đứng đó.
    //
    // CỐ TÌNH KHÔNG ĐOÁN Ô. Tài sản ròng chia chi tiêu tháng ra "vốn tự do" — con số đầu
    // màn Tài chính. Nhét bừa 3tr vào đó là báo "0,2 tháng tự do": vừa sai vừa đáng sợ.
    if (parseMoney(caCau) !== null) {
      return { yChi: [{ kind: 'notRecorded', why: luat.moneyWithoutCell.why }], source: 'rules' };
    }

    return { yChi: [], source: 'unparsed' };
  }

  // Đọc được một phần thì nói ra phần còn lại. Mảnh có số mà bỏ đi lặng lẽ là làm mất
  // một mục người dùng tưởng đã ghi.
  for (const b of boSot) yChi.push({ kind: 'unclear', excerpt: b });

  return { yChi, source: 'rules' };
}
