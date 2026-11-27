/**
 * Hợp đồng dùng chung giữa `be` và `web`. Đây là nguồn sự thật duy nhất cho kiểu dữ liệu
 * đi qua dây; `openapi.yaml` mô tả cùng những kiểu này cho người đọc ngoài và cho công cụ.
 *
 * Luật của Mira nằm ngay trong file này dưới dạng hằng số, không rải rác trong UI:
 * trần số mục tiêu, số ngày hết hạn, số ngày hỏi lại hạt muối, danh mục nhóm việc.
 */

// ─────────────────────────────────────────────────────────── tài khoản

/**
 * Từ 25/11/2026 Mira có tài khoản thật và dữ liệu nằm trên máy chủ.
 *
 * Mọi endpoint dữ liệu đòi `Authorization: Bearer <token>`. Token mang `sub` là id người
 * dùng, và máy chủ lọc mọi câu truy vấn theo id đó — không có endpoint nào trả về dữ liệu
 * của người khác, kể cả khi biết id của họ.
 */
export interface User {
  readonly id: string;
  readonly username: string;
  readonly displayName: string | null;
}

export interface Credentials {
  readonly username: string;
  readonly password: string;
}

/**
 * Đăng nhập bằng Google. `idToken` là chuỗi Google Identity Services trả về ở trình
 * duyệt; máy chủ tự kiểm chữ ký, audience và `email_verified` trước khi tin.
 *
 * Không có `RegisterRequest`: từ 25/11/2026 không còn đăng ký bằng mật khẩu. Người mới
 * vào bằng Google, và lần đầu đăng nhập chính là lần tài khoản được tạo.
 */
export interface GoogleCredentials {
  readonly idToken: string;
}

export interface AuthResponse {
  readonly user: User;
  readonly token: string;
  /** Giây kể từ bây giờ cho tới lúc token hết hạn. */
  readonly expiresIn: number;
}

/** Độ dài tối thiểu của mật khẩu. Chỉ còn ý nghĩa với công cụ dòng lệnh đặt lại mật khẩu. */
export const MIN_PASSWORD_LENGTH = 8;

// ─────────────────────────────────────────────────────────── nhóm việc (catalog)

/**
 * Catalog nhóm việc. V1 cố định bốn nhóm; `waste` là nhóm nguyên liệu cho mục tiêu.
 * Không có nhóm "cần thiết" suy ra, và không có chỉ số tổng hợp nào gộp bốn nhóm
 * thành một con số — người dùng đọc thẳng tỷ lệ từng nhóm.
 */
export const TIME_BUCKETS = ['work', 'family', 'personal', 'waste'] as const;
export type TimeBucket = (typeof TIME_BUCKETS)[number];

export const BUCKET_LABEL_VI: Record<TimeBucket, string> = {
  work: 'Công việc',
  family: 'Gia đình',
  personal: 'Cá nhân',
  waste: 'Lãng phí',
};

/** Giờ tỉnh mặc định mỗi tuần: 16 giờ/ngày × 7. Người dùng sửa được trong Tôi. */
export const DEFAULT_WAKING_MINUTES_PER_WEEK = 16 * 60 * 7;

/** `nep` là hàng do một nếp đã khai sinh ra, không phải thứ người dùng ngồi gõ. */
export type TimeEntrySource = 'manual' | 'widget' | 'nep';

/**
 * Nếp: một luật người dùng khai, thay cho việc gõ lại mỗi ngày.
 *
 * `days` là thứ trong tuần theo ISO, "1234567" là mỗi ngày, "12345" là thứ hai tới thứ
 * sáu. Mặc định của nếp là **đã làm**; người dùng chỉ động tay khi không làm.
 */
// ─────────────────────────────────────────────────────────── nhắc

/**
 * Một lời nhắc: hẹn giờ gợi người dùng quay lại ghi.
 *
 * `gio` theo **đồng hồ người dùng**, không phải máy chủ. Máy chủ chỉ giữ chuỗi; việc so
 * với bây giờ là việc của client, nơi duy nhất biết họ ở múi giờ nào.
 *
 * Mira KHÔNG gửi thông báo đẩy. Lời nhắc xuất hiện trong khung chat khi mở app — đẩy
 * thật đòi service worker, Push API và một máy chủ luôn bật, mà máy chủ đang nằm trên
 * laptop. Hứa nhắc rồi im lặng là cách nhanh nhất làm hỏng niềm tin vào mọi con số khác.
 */
export interface Reminder {
  readonly id: string;
  /** HH:MM, 24 giờ. */
  readonly at: string;
  /** Thứ trong tuần theo ISO, giống `Nep.days`: "12345" là thứ hai tới thứ sáu. */
  readonly days: string;
  readonly text: string | null;
  readonly enabled: boolean;
}

/** Trần lời nhắc. Hơn ba lần một ngày thì nó hết là lời nhắc và thành tiếng ồn. */
export const REMINDER_CAP = 3;

export interface Routine {
  readonly id: string;
  readonly title: string;
  readonly bucket: TimeBucket;
  readonly minutes: number;
  readonly golden: boolean;
  readonly days: string;
  readonly startedOn: string;
  readonly endedOn: string | null;
  /** Danh mục của nếp, nếu khai theo danh mục. Nhật ký dùng để ẩn phím Ghi nhanh trùng nếp. */
  readonly categoryId: string | null;
}

export interface RoutineCreate {
  /** Bỏ qua khi có `danhMucId`: tên lấy từ danh mục. */
  readonly title?: string;
  readonly bucket?: TimeBucket;
  readonly minutes: number;
  readonly golden?: boolean;
  readonly days: string;
  readonly categoryId?: string | null;
}

/** Một ngày của một nếp sau khi chạy. */
export interface RoutineDay {
  readonly routineId: string;
  readonly title: string;
  readonly bucket: TimeBucket;
  readonly minutes: number;
  readonly golden: boolean;
  readonly date: string;
  readonly state: 'da-ghi' | 'bo-qua';
}

/** Trần số nếp đang chạy. */
export const ROUTINE_CAP = 8;

/**
 * Danh mục: tên việc do người dùng đặt, nằm **bên trong** một trong bốn ô.
 *
 * Bốn ô không đổi vì chúng gánh ba lời hứa của sản phẩm: giờ vàng chỉ có trong `family`,
 * mục tiêu rút giờ từ `waste`, và màn Sáu tháng phán tuần vui hay nặng theo từng ô.
 * Danh mục chỉ thêm một tầng tên bên dưới, nên mọi công thức giữ nguyên.
 *
 * `golden` là mặc định của danh mục, chỉ có nghĩa khi `bucket` là `family`.
 */
/**
 * Hình và màu của một danh mục — **lưu bằng KHOÁ, không lưu hex hay tên file.**
 *
 * Money Lover cho mỗi danh mục một hình và một màu riêng, và đó là lý do danh sách của
 * họ quét được bằng mắt: "Ăn uống" lúc nào cũng là cái bát xanh, "Đi lại" lúc nào cũng
 * là cái xe vàng. Mira trước đây cho cả ô dùng chung một hình, nên hai mươi dòng chi
 * tiêu là hai mươi cái hoá đơn giống hệt nhau.
 *
 * ─── VÌ SAO KHOÁ CHỨ KHÔNG PHẢI HEX ───
 *
 * Lưu `#2a52b5` thì bảng màu đổi một cái là mọi danh mục cũ kẹt lại màu cũ, và không có
 * gì chặn một màu chữ trắng trên nền trắng. Lưu `'work'` thì máy chủ kiểm được, bảng màu
 * đổi là mọi danh mục đổi theo, và `check-colors` gác được độ tương phản.
 */
export const CATEGORY_COLORS = [
  'work',
  'family',
  'personal',
  'waste',
  'red',
  'navy',
  'candy',
  'salt',
] as const;
export type CategoryColor = (typeof CATEGORY_COLORS)[number];

/**
 * Hình được phép gắn cho danh mục.
 *
 * Danh sách đóng, không phải chuỗi tự do: bộ icon nằm trong gói web, nên một khoá lạ sẽ
 * ra một ô trống mà không báo gì. Thêm hình mới thì thêm cả ở đây và ở `ui/Icon.tsx` —
 * hai chỗ, và bài kiểm `icon.test.ts` bắt nếu lệch.
 */
export const CATEGORY_ICONS = [
  'bowl',
  'cart',
  'mug',
  'car',
  'fuel',
  'bolt',
  'droplet',
  'wifi',
  'phone',
  'school',
  'book',
  'pill',
  'shirt',
  'gift',
  'plane',
  'tool',
  'heart',
  'music',
  'gamepad',
  'laptop',
  'piggy',
  'home',
  'briefcase',
  'bank',
  'chart',
  'receipt',
  'bin',
  'coins',
] as const;
export type CategoryIcon = (typeof CATEGORY_ICONS)[number];

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly bucket: TimeBucket;
  readonly golden: boolean;
  readonly archivedAt: string | null;
  /** `null` với danh mục có từ trước khi có tính năng này — giao diện rơi về hình của ô. */
  readonly icon: CategoryIcon | null;
  readonly color: CategoryColor | null;
}

export interface CategoryCreate {
  readonly name: string;
  readonly bucket: TimeBucket;
  readonly golden?: boolean;
  readonly icon?: CategoryIcon | null;
  readonly color?: CategoryColor | null;
}

/** Trần danh mục **mỗi ô**, không phải tổng. */
export const CATEGORY_CAP = 6;

// ─────────────────────────────────────────────────────── danh mục tiền

/**
 * Danh mục tiền: tên khoản do người dùng đặt, nằm bên trong một ô tiền.
 *
 * Bản sao của `Category` bên thời gian, cố ý giống từng trường. Hai màn làm cùng một
 * việc — ghi một khoản lẻ, gắn một cái tên, rồi cộng lại — nên giống nhau thì người
 * dùng học một lần.
 *
 * **Cất đi, không xoá**: khoản cũ còn trỏ về nó.
 */
export interface MoneyCategory {
  readonly id: string;
  readonly name: string;
  readonly cell: MoneyFlowCell;
  readonly archivedAt: string | null;
  /** Cùng khoá với danh mục thời gian — xem `CATEGORY_ICONS` và `CATEGORY_COLORS`. */
  readonly icon: CategoryIcon | null;
  readonly color: CategoryColor | null;
}

export interface MoneyCategoryCreate {
  readonly name: string;
  readonly cell: MoneyFlowCell;
  readonly icon?: CategoryIcon | null;
  readonly color?: CategoryColor | null;
}

/** Trần danh mục **mỗi ô tiền**, giống bên thời gian và cùng một lý do. */
export const MONEY_CATEGORY_CAP = 6;

/**
 * Một khoản tiền lẻ. Nhịp ở đây là NGÀY, còn nhịp của màn Tài chính là THÁNG.
 *
 * `amount` luôn dương: dấu nằm ở chỗ ô, không nằm ở con số. Thu nhập là tiền vào, bốn
 * ô kia là tiền ra. Cho phép số âm là mở đường cho "một khoản chi âm" — không ai đọc nổi.
 */
export interface MoneyEntry {
  readonly id: string;
  /** YYYY-MM-DD. */
  readonly date: string;
  readonly amount: number;
  readonly cell: MoneyFlowCell;
  readonly categoryId: string | null;
  readonly note: string | null;
}

export interface MoneyEntryCreate {
  readonly date: string;
  readonly amount: number;
  readonly cell: MoneyFlowCell;
  readonly categoryId?: string | null;
  readonly note?: string | null;
}

export type MoneyEntryUpdate = Partial<Omit<MoneyEntry, 'id'>>;

// ─────────────────────────────────────────────────────── đọc câu

/**
 * Một việc Mira đọc được từ câu người dùng gõ.
 *
 * Đây là **đề xuất**, không phải thứ đã ghi. Người dùng duyệt rồi client mới gọi các
 * route ghi đã có.
 */
export type Intent =
  | {
      readonly kind: 'time';
      readonly bucket: TimeBucket;
      readonly minutes: number;
      readonly name: string;
      readonly golden: boolean;
      /**
       * YYYY-MM-DD. Suy từ câu ("hôm qua", "thứ 3"), mặc định là ngày client gửi lên.
       *
       * Client phải ghi vào **ngày này**, không phải hôm nay. Trước đây "hôm qua ngủ 7
       * tiếng" đọc ra 420 phút rồi ghi vào hôm nay: sai ngày mà không báo gì.
       */
      readonly date: string;
      /** Danh mục khớp được theo tên, nếu có. Client gửi kèm khi ghi. */
      readonly categoryId: string | null;
      /**
       * `true` khi ô ở trên là ĐOÁN, không đọc được từ câu.
       *
       * Câu "thể dục 30 phút" có đủ thời lượng và tên việc, nhưng không từ khoá nào
       * nhận ra "thể dục". Trước đây Mira từ chối ghi và đẩy câu sang LLM — mà không có
       * khoá thì nó chết hẳn. Thà ghi vào một ô đoán còn hơn làm mất hẳn 30 phút của
       * người ta: ô sai thì sửa một cú chạm, mục không ghi thì không ai nhớ ra nữa.
       *
       * Nhưng phải NÓI RA là đang đoán. Đoán im lặng thì người dùng tin con số, và một
       * tháng sau biểu đồ Cá nhân phình lên vì toàn thứ Mira tự xếp vào đó.
       */
      readonly bucketGuessed: boolean;
    }
  | { readonly kind: 'grain'; readonly grain: MomentKind; readonly text: string; readonly date: string }
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
  /** Mảnh câu có số mà không ai đọc được. Nói ra, vì bỏ lặng lẽ là làm mất một mục. */
  | { readonly kind: 'unclear'; readonly excerpt: string }
  /**
   * Người dùng đang HỎI, không phải đang ghi.
   *
   * Máy chủ chỉ phân loại câu hỏi thuộc chủ đề nào, **không soạn câu trả lời**. Trả lời
   * cần những con số mà client đã tải sẵn (tuần này, tháng này, hũ) cộng với đường dẫn
   * sang đúng màn — cả hai đều nằm ở client. Bắt máy chủ soạn thì phải tải lại hết một
   * lần nữa, rồi trả về một cục chữ không bấm được.
   */
  | { readonly kind: 'question'; readonly topic: QuestionTopic }
  /**
   * Đặt một lời nhắc.
   *
   * Phải là một loại riêng, không gộp vào `gio`. Founder gõ "tạo lịch nhắc 8h hàng ngày"
   * và Mira ghi một mục **8 TIẾNG** tên "Tạo lịch nhắc hàng ngày" — vì "8h" trong câu
   * ghi việc là thời lượng, còn trong câu đặt nhắc nó là **giờ trên đồng hồ**. Cùng hai
   * ký tự, hai nghĩa ngược nhau.
   */
  | {
      readonly kind: 'reminder';
      /** HH:MM, 24 giờ. */
      readonly at: string;
      /** Thứ theo ISO, giống `Nhac.days`. Không nói gì thì mỗi ngày. */
      readonly days: string;
      /** Lời nhắc rút từ phần còn lại của câu, nếu có gì đáng giữ. */
      readonly text: string | null;
    };

/**
 * Chủ đề câu hỏi mà Mira nhận ra.
 *
 * `khongRo` là khi biết chắc đây LÀ câu hỏi nhưng không rõ hỏi gì — vẫn tốt hơn "Mira
 * chưa hiểu", vì nó trả lời đúng cái người ta cần biết: Mira làm được gì.
 */
export type QuestionTopic = 'howToLog' | 'whereIsIt' | 'today' | 'thisWeek' | 'money' | 'jar' | 'unclear';

/**
 * Năm ô **dòng chảy**: tổng của nhiều lần trong tháng, nên tách được thành từng khoản.
 * Từ 26/11/2026 chúng KHÔNG gõ tay nữa — con số là tổng các `MoneyEntry` của tháng.
 */
export const MONEY_FLOW_CELLS = [
  'netIncome',
  'monthlyExpense',
  'investment',
  'wastedMoney',
  'debtPayment',
] as const;

export type MoneyFlowCell = (typeof MONEY_FLOW_CELLS)[number];

/**
 * Hai ô **mức**: ảnh chụp tại một thời điểm, không phải tổng.
 *
 * "Tôi đang nợ 240 triệu" không phải tổng của nhiều lần nợ. Tách chúng thành khoản lẻ
 * rồi cộng là nhân đôi tài sản của người ta mỗi lần họ khai lại. Nên hai ô này VẪN gõ
 * tay một con số, và đó là chỗ duy nhất màn Tài chính còn ô nhập trực tiếp.
 */
export const MONEY_LEVEL_CELLS = ['debtBalance', 'netWorth'] as const;

export type MoneyLevelCell = (typeof MONEY_LEVEL_CELLS)[number];

export type MoneyCell = MoneyFlowCell | MoneyLevelCell;

export interface ParseResult {
  readonly yChi: readonly Intent[];
  /** 'luat' đọc bằng luật (không tốn tiền), 'ai' phải nhờ LLM, 'chiu' không ai đọc được. */
  readonly source: 'rules' | 'ai' | 'unparsed';
}

export const MONEY_CELL_LABEL_VI: Record<MoneyCell, string> = {
  netIncome: 'Thu nhập ròng',
  monthlyExpense: 'Chi tiêu tháng',
  investment: 'Đầu tư',
  wastedMoney: 'Lãng phí',
  debtPayment: 'Trả nợ mỗi tháng',
  debtBalance: 'Dư nợ',
  netWorth: 'Tài sản ròng',
};

export interface TimeEntry {
  readonly id: string;
  /** YYYY-MM-DD theo giờ địa phương của người dùng. */
  readonly date: string;
  readonly minutes: number;
  readonly bucket: TimeBucket;
  /** Giờ vàng: lát cắt bên trong nhóm gia đình, giờ thật sự có mặt. */
  readonly golden: boolean;
  readonly note: string | null;
  readonly source: TimeEntrySource;
  /** Nếp đã sinh ra hàng này, hoặc null nếu người dùng tự ghi. */
  readonly routineId: string | null;
  /** Danh mục người dùng tự đặt, hoặc null nếu chỉ phân theo ô. */
  readonly categoryId: string | null;
}

export interface TimeEntryCreate {
  readonly date: string;
  readonly minutes: number;
  /** Bỏ qua khi có `danhMucId`: ô lấy từ danh mục, vì danh mục mới là thứ đã khai. */
  readonly bucket: TimeBucket;
  readonly golden?: boolean;
  readonly note?: string | null;
  readonly categoryId?: string | null;
}

export type TimeEntryUpdate = Partial<TimeEntryCreate>;

// ─────────────────────────────────────────────────────────── khoảnh khắc (hũ)

/** Viên kẹo là ngày vui, hạt muối là ngày nặng. Không có mức độ, không có thang điểm. */
export type MomentKind = 'candy' | 'salt';

/** Số ngày trước khi Mira hỏi lại một hạt muối. Hỏi đúng một lần, rồi thôi. */
export const SALT_REVISIT_DAYS = 42;

export type SaltAnswer = 'same' | 'lighter' | 'gone';

export interface Moment {
  readonly id: string;
  /** YYYY-MM-DD. Hũ đóng theo tháng, nên ngày là thứ duy nhất cần để xếp hạt. */
  readonly date: string;
  readonly kind: MomentKind;
  /** Có thể rỗng: bấm kẹo hay muối mà không viết gì vẫn là một hạt. */
  readonly text: string | null;
  /** Chỉ hạt muối mới có. YYYY-MM-DD, bằng date + SALT_REVISIT_DAYS. */
  readonly revisitAt: string | null;
  readonly revisitAnswer: SaltAnswer | null;
}

export interface MomentCreate {
  readonly date: string;
  readonly kind: MomentKind;
  readonly text?: string | null;
}

/**
 * Sửa một hạt: đổi chữ, hoặc đổi kẹo ↔ muối.
 *
 * Hạt muối **đã trả lời** câu hỏi lại thì khoá — máy chủ trả 404 kèm lý do. Đó là lịch
 * sử: người dùng đã nói một câu về quá khứ của chính mình, sửa lại là viết đè lên nó.
 *
 * Ngày thì không sửa được. Hạt thuộc về một ngày; muốn đổi ngày thì xoá và ghi lại.
 */
export interface MomentUpdate {
  readonly text?: string | null;
  readonly kind?: MomentKind;
}

// ─────────────────────────────────────────────────────────── tài chính

/**
 * Bảy ô nhập mỗi tháng. `netWorth` đã trừ nợ rồi; `debtBalance` chỉ để hiển thị và
 * để quy ra số tháng tự do bị giữ lại — không bao giờ trừ hai lần.
 * Mọi số là VND nguyên, không có số thập phân.
 *
 * ─────────────────────── ĐẦU TƯ VÀ LÃNG PHÍ LÀ KHOẢN RA RIÊNG ───────────────────────
 *
 * `investment` và `wastedMoney` **không nằm trong** `monthlyExpense`. Chúng là ba khoản
 * ra song song, cộng lại mới hết thu nhập. Nếu nhét lãng phí vào chi tiêu rồi lại vẽ nó
 * thành một lát riêng thì vòng dòng tiền đếm hai lần, và con số "còn lại" sai.
 *
 * Khác nhau ở chỗ: lãng phí là tiền MẤT, đầu tư là tiền CHUYỂN sang `netWorth`. Nên
 * `surplusPerMille` trừ lãng phí mà không trừ đầu tư — xem `derive` bên máy chủ.
 */
export interface MoneyMonth {
  /** YYYY-MM. */
  readonly month: string;
  readonly netIncome: number | null;
  readonly monthlyExpense: number | null;
  /** Tiền chuyển sang tài sản: tiết kiệm, vàng, chứng khoán. Không phải một khoản mất. */
  readonly investment: number | null;
  /** Tiền tiêu mà chính mình thấy không đáng. Tự khai, Mira không phán. */
  readonly wastedMoney: number | null;
  readonly debtPayment: number | null;
  readonly debtBalance: number | null;
  readonly netWorth: number | null;
  /**
   * Lần cuối tháng này được ghi, dạng ISO. null khi tháng chưa có bản ghi nào.
   *
   * Chỉ để hiện "đã nhập · 25/11" — người mở màn Tài chính giữa tháng cần biết mấy con
   * số đang nhìn là của hôm nào, nhất là khi nhịp nhập là tháng mà nhịp gõ chat là ngày.
   */
  readonly updatedAt: string | null;
}

/**
 * Ô người dùng ghi THẲNG được — chỉ còn hai ô mức.
 *
 * Năm ô dòng chảy là tổng các `MoneyEntry`, gửi lên đây thì máy chủ từ chối. Để chúng
 * ghi được cả hai đường là dựng lại đúng cái bẫy "một sự thật, hai chỗ ghi".
 */
export type MoneyMonthUpdate = Partial<Pick<MoneyMonth, MoneyLevelCell>>;

export interface MoneyDerived {
  /** Tài sản ròng ÷ chi tiêu tháng. null khi thiếu ô. */
  readonly freeCapitalMonths: number | null;
  /** (thu − chi − lãng phí − trả nợ) ÷ thu, theo phần nghìn. null khi thiếu ô. */
  readonly surplusPerMille: number | null;
  /** Số tháng tự do mà dư nợ đang giữ lại: debtBalance ÷ chi tiêu tháng. */
  readonly monthsHeldByDebt: number | null;
  /**
   * true khi tháng ĐANG DỞ và chi tiêu mới ghi được vài ngày: ba số trên là null vì chưa
   * đủ căn cứ, không phải vì thiếu ô. Giao diện nói "cần thêm vài ngày chi tiêu" thay cho
   * dấu hỏi trơ.
   */
  readonly thinExpense: boolean;
}

// ─────────────────────────────────────────────────────────── mục tiêu

export type GoalTier = 'long' | 'quarter' | 'rhythm';

/** Trần số mục tiêu đang chạy cho từng tầng. Vượt trần thì phải bỏ bớt, không mua thêm. */
export const GOAL_TIER_CAP: Record<GoalTier, number> = { long: 3, quarter: 2, rhythm: 5 };

/** Tầng quý tự hết hạn sau 90 ngày. Hết hạn là mặc định, không phải thất bại. */
export const QUARTER_GOAL_DAYS = 90;

export interface Goal {
  readonly id: string;
  readonly tier: GoalTier;
  /** Diễn đạt bằng thứ muốn thêm, không bằng thứ muốn bớt. */
  readonly title: string;
  readonly weeklyMinutes: number;
  /** Luật khai nguồn: giờ mới lấy từ nhóm nào. V1 luôn là 'waste'. */
  readonly sourceBucket: TimeBucket;
  readonly startedOn: string;
  /** YYYY-MM-DD, null với tầng dài hạn và nhịp. */
  readonly expiresOn: string | null;
  readonly endedOn: string | null;
  /** Bước hai khi bỏ bớt: giờ vừa giải phóng chuyển sang mục tiêu nào. */
  readonly handedOverTo: string | null;
}

export interface GoalCreate {
  readonly tier: GoalTier;
  readonly title: string;
  readonly weeklyMinutes: number;
  readonly sourceBucket?: TimeBucket;
}

/**
 * Sửa một mục tiêu đang chạy: tên và số giờ mỗi tuần.
 *
 * KHÔNG có `tier` và `sourceBucket`. Đổi tầng là đổi trần đang áp cho mục tiêu, và kéo
 * một mục tiêu sang tầng khác có thể làm tầng ấy vượt trần — mà chính cái trần mới chữa
 * được bệnh đặt quá nhiều. Muốn đổi tầng thì kết thúc cái cũ, tạo cái mới.
 */
export interface GoalUpdate {
  readonly title?: string;
  readonly weeklyMinutes?: number;
}

/**
 * Kết thúc một mục tiêu. `handOverTo` là bước hai bắt buộc khi bỏ giữa chừng.
 *
 * **Khác xoá.** Kết thúc nghĩa là "tôi đã theo đuổi nó, giờ thôi" — nó ở lại trong lịch
 * sử. Xoá nghĩa là "tôi gõ nhầm, nó chưa từng là mục tiêu của tôi". Gộp hai thứ làm một
 * thì một dòng gõ nhầm nằm vĩnh viễn trong lịch sử như một lần bỏ cuộc không có thật.
 */
export interface GoalEnd {
  readonly handOverTo?: string | null;
}

// ─────────────────────────────────────────────────────────── thói quen

/**
 * Mira hỗ trợ thói quen, nhưng đếm theo tuần chứ không theo chuỗi ngày.
 *
 * Hợp đồng này cố tình không có trường nào cho chuỗi hiện tại, chuỗi dài nhất, điểm hay
 * huy hiệu — bỏ một tuần thì tuần sau đếm lại từ đầu, và không có chỗ nào ghi lại việc
 * bạn đã bỏ.
 */
export interface Habit {
  readonly id: string;
  readonly title: string;
  /** Số lần mong muốn mỗi tuần, 1–7. */
  readonly targetPerWeek: number;
  readonly startedOn: string;
  readonly endedOn: string | null;
}

export interface HabitCreate {
  readonly title: string;
  readonly targetPerWeek: number;
}

/** Trần số thói quen đang chạy. Cùng dải "nhịp tuần 3–5" của tầng mục tiêu. */
export const HABIT_CAP = 5;

/** Tình hình một thói quen trong một tuần. `dates` là những ngày đã đánh dấu. */
export interface HabitWeek {
  readonly habit: Habit;
  readonly weekStart: string;
  readonly done: number;
  readonly dates: readonly string[];
}

// ─────────────────────────────────────────────────────────── tổng hợp tuần

export interface BucketSlice {
  readonly bucket: TimeBucket;
  readonly minutes: number;
  /** Phần nghìn của giờ tỉnh, để tránh số thập phân đi qua dây. */
  readonly perMille: number;
}

export interface WeekSummary {
  /** Thứ hai của tuần, YYYY-MM-DD. */
  readonly weekStart: string;
  readonly wakingMinutes: number;
  readonly loggedMinutes: number;
  readonly slices: readonly BucketSlice[];
  readonly goldenMinutes: number;
  /** Số ngày khác nhau có ghi trong tuần, 0–7. */
  readonly recordedDays: number;
  /**
   * Cùng số liệu của tuần trước, để so. null khi **không so được**: tuần trước trống,
   * hoặc tuần này ghi ít ngày hơn tuần trước. Trường hợp thứ hai quan trọng — so tổng
   * của 3 ngày với tổng của 7 ngày thì cái gì cũng "giảm".
   */
  readonly previous: {
    readonly loggedMinutes: number;
    readonly slices: readonly BucketSlice[];
    readonly goldenMinutes: number;
    readonly recordedDays: number;
  } | null;
}

/** Nguyên liệu cho mục tiêu: giờ lãng phí đã ghi so với giờ các mục tiêu đang cần. */
export interface GoalBudget {
  readonly neededMinutes: number;
  readonly availableMinutes: number;
  readonly shortfallMinutes: number;
}

// ─────────────────────────────────────────────────────────── lỗi

export type ErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'username_taken'
  | 'name_taken'
  | 'not_found'
  | 'tier_full'
  | 'not_enough_source'
  | 'already_answered';

export interface ApiError {
  readonly code: ErrorCode;
  readonly message: string;
}
