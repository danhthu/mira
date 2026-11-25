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
export interface Nhac {
  readonly id: string;
  /** HH:MM, 24 giờ. */
  readonly gio: string;
  /** Thứ trong tuần theo ISO, giống `Nep.days`: "12345" là thứ hai tới thứ sáu. */
  readonly days: string;
  readonly loi: string | null;
  readonly bat: boolean;
}

/** Trần lời nhắc. Hơn ba lần một ngày thì nó hết là lời nhắc và thành tiếng ồn. */
export const NHAC_CAP = 3;

export interface Nep {
  readonly id: string;
  readonly title: string;
  readonly bucket: TimeBucket;
  readonly minutes: number;
  readonly golden: boolean;
  readonly days: string;
  readonly startedOn: string;
  readonly endedOn: string | null;
}

export interface NepCreate {
  /** Bỏ qua khi có `danhMucId`: tên lấy từ danh mục. */
  readonly title?: string;
  readonly bucket?: TimeBucket;
  readonly minutes: number;
  readonly golden?: boolean;
  readonly days: string;
  readonly danhMucId?: string | null;
}

/** Một ngày của một nếp sau khi chạy. */
export interface NgayCuaNep {
  readonly nepId: string;
  readonly title: string;
  readonly bucket: TimeBucket;
  readonly minutes: number;
  readonly golden: boolean;
  readonly date: string;
  readonly trangThai: 'da-ghi' | 'bo-qua';
}

/** Trần số nếp đang chạy. */
export const NEP_CAP = 8;

/**
 * Danh mục: tên việc do người dùng đặt, nằm **bên trong** một trong bốn ô.
 *
 * Bốn ô không đổi vì chúng gánh ba lời hứa của sản phẩm: giờ vàng chỉ có trong `family`,
 * mục tiêu rút giờ từ `waste`, và màn Sáu tháng phán tuần vui hay nặng theo từng ô.
 * Danh mục chỉ thêm một tầng tên bên dưới, nên mọi công thức giữ nguyên.
 *
 * `golden` là mặc định của danh mục, chỉ có nghĩa khi `bucket` là `family`.
 */
export interface DanhMuc {
  readonly id: string;
  readonly name: string;
  readonly bucket: TimeBucket;
  readonly golden: boolean;
  readonly archivedAt: string | null;
}

export interface DanhMucCreate {
  readonly name: string;
  readonly bucket: TimeBucket;
  readonly golden?: boolean;
}

/** Trần danh mục **mỗi ô**, không phải tổng. */
export const DANH_MUC_CAP = 6;

// ─────────────────────────────────────────────────────── đọc câu

/**
 * Một việc Mira đọc được từ câu người dùng gõ.
 *
 * Đây là **đề xuất**, không phải thứ đã ghi. Người dùng duyệt rồi client mới gọi các
 * route ghi đã có.
 */
export type YChi =
  | {
      readonly loai: 'gio';
      readonly bucket: TimeBucket;
      readonly minutes: number;
      readonly ten: string;
      readonly golden: boolean;
      /**
       * YYYY-MM-DD. Suy từ câu ("hôm qua", "thứ 3"), mặc định là ngày client gửi lên.
       *
       * Client phải ghi vào **ngày này**, không phải hôm nay. Trước đây "hôm qua ngủ 7
       * tiếng" đọc ra 420 phút rồi ghi vào hôm nay: sai ngày mà không báo gì.
       */
      readonly ngay: string;
      /** Danh mục khớp được theo tên, nếu có. Client gửi kèm khi ghi. */
      readonly danhMucId: string | null;
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
      readonly doanO: boolean;
    }
  | { readonly loai: 'hat'; readonly kind: MomentKind; readonly text: string; readonly ngay: string }
  | {
      readonly loai: 'tien';
      readonly o: OTien;
      readonly vnd: number;
      readonly thang: string;
      /**
       * `true` cộng vào ô đang có, `false` đặt lại ô bằng con số này.
       *
       * Ba ô dòng chảy (thu nhập, chi tiêu, trả nợ) cộng; hai ô mức (dư nợ, tài sản
       * ròng) đặt lại. Không có cờ này thì "tiêu 350k" đè chi tiêu cả tháng xuống còn
       * 350 nghìn và xoá mất con số cũ.
       */
      readonly cong: boolean;
    }
  | { readonly loai: 'khongGhi'; readonly viSao: string }
  /** Mảnh câu có số mà không ai đọc được. Nói ra, vì bỏ lặng lẽ là làm mất một mục. */
  | { readonly loai: 'chuaHieu'; readonly doan: string };

export type OTien = 'netIncome' | 'monthlyExpense' | 'debtPayment' | 'debtBalance' | 'netWorth';

export interface KetQuaDoc {
  readonly yChi: readonly YChi[];
  /** 'luat' đọc bằng luật (không tốn tiền), 'ai' phải nhờ LLM, 'chiu' không ai đọc được. */
  readonly nguon: 'luat' | 'ai' | 'chiu';
}

export const O_TIEN_LABEL_VI: Record<OTien, string> = {
  netIncome: 'Thu nhập ròng',
  monthlyExpense: 'Chi tiêu tháng',
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
  readonly nepId: string | null;
  /** Danh mục người dùng tự đặt, hoặc null nếu chỉ phân theo ô. */
  readonly danhMucId: string | null;
}

export interface TimeEntryCreate {
  readonly date: string;
  readonly minutes: number;
  /** Bỏ qua khi có `danhMucId`: ô lấy từ danh mục, vì danh mục mới là thứ đã khai. */
  readonly bucket: TimeBucket;
  readonly golden?: boolean;
  readonly note?: string | null;
  readonly danhMucId?: string | null;
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

// ─────────────────────────────────────────────────────────── tài chính

/**
 * Năm ô nhập mỗi tháng. `netWorth` đã trừ nợ rồi; `debtBalance` chỉ để hiển thị và
 * để quy ra số tháng tự do bị giữ lại — không bao giờ trừ hai lần.
 * Mọi số là VND nguyên, không có số thập phân.
 */
export interface MoneyMonth {
  /** YYYY-MM. */
  readonly month: string;
  readonly netIncome: number | null;
  readonly monthlyExpense: number | null;
  readonly debtPayment: number | null;
  readonly debtBalance: number | null;
  readonly netWorth: number | null;
}

export type MoneyMonthUpdate = Partial<Omit<MoneyMonth, 'month'>>;

export interface MoneyDerived {
  /** Tài sản ròng ÷ chi tiêu tháng. null khi thiếu ô. */
  readonly freeCapitalMonths: number | null;
  /** (thu − chi − trả nợ) ÷ thu, theo phần nghìn để giữ số nguyên. null khi thiếu ô. */
  readonly surplusPerMille: number | null;
  /** Số tháng tự do mà dư nợ đang giữ lại: debtBalance ÷ chi tiêu tháng. */
  readonly monthsHeldByDebt: number | null;
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

/** Kết thúc một mục tiêu. `handOverTo` là bước hai bắt buộc khi bỏ giữa chừng. */
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
