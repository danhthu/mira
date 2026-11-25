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

export type TimeEntrySource = 'manual' | 'widget';

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
}

export interface TimeEntryCreate {
  readonly date: string;
  readonly minutes: number;
  readonly bucket: TimeBucket;
  readonly golden?: boolean;
  readonly note?: string | null;
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
  | 'not_found'
  | 'tier_full'
  | 'not_enough_source'
  | 'already_answered';

export interface ApiError {
  readonly code: ErrorCode;
  readonly message: string;
}
