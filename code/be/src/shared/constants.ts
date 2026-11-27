import type { DunbarRing, GoalTier, TimeBucket, TimeEntrySource , MoneyFlowCell } from './types/enums';

// Giá trị mặc định phải khớp DEFAULT trong migrations: repository ghi giá trị tường
// minh cho mọi cột nên DEFAULT của DB không bao giờ được dùng tới.
export const DEFAULT_DUNBAR_RING: DunbarRing = 50;
export const DEFAULT_HOURGLASS_ENABLED = false;
export const DEFAULT_TIME_ENTRY_SOURCE: TimeEntrySource = 'manual';

/** Catalog nhóm việc. Thứ tự ở đây là thứ tự lát trên donut. */
export const TIME_BUCKETS: readonly TimeBucket[] = ['work', 'family', 'personal', 'waste'];

/** Giờ mới của mục tiêu mặc định lấy từ nhóm lãng phí — đó là luật khai nguồn. */
export const DEFAULT_GOAL_SOURCE_BUCKET: TimeBucket = 'waste';

/** Số ngày trước khi Mira hỏi lại một hạt muối. Hỏi đúng một lần, rồi thôi. */
export const SALT_REVISIT_DAYS = 42;

/** Tầng quý tự hết hạn sau 90 ngày. Hết hạn là mặc định, không phải thất bại. */
export const QUARTER_GOAL_DAYS = 90;

/**
 * Trần số mục tiêu đang chạy mỗi tầng. Vượt trần thì phải bỏ bớt — Mira không bán
 * việc gỡ trần, vì chính cái trần mới là thứ chữa bệnh đặt quá nhiều.
 */
export const GOAL_TIER_CAP: Record<GoalTier, number> = { long: 3, quarter: 2, rhythm: 5 };

/**
 * Trần số thói quen đang chạy. Mira có hỗ trợ thói quen, nhưng đếm theo tuần chứ không
 * theo chuỗi ngày: không có hằng số nào cho chuỗi, điểm hay huy hiệu trong file này.
 */
export const HABIT_CAP = 5;

/** Giờ tỉnh mặc định mỗi tuần: 16 giờ/ngày × 7. Người dùng sửa được. */
export const DEFAULT_WAKING_MINUTES_PER_WEEK = 16 * 60 * 7;

/** Năm ô tiền tách được thành khoản lẻ. Hai ô mức không có mặt ở đây, có chủ ý. */
/**
 * Màu và hình của danh mục. **Bản sao của `CATEGORY_COLORS` / `CATEGORY_ICONS` trong
 * contract**, và phải khớp từng phần tử.
 *
 * Vì sao lại chép: máy chủ KHÔNG phụ thuộc `@mira/contract` lúc chạy — chỉ `import type`.
 * Đây là chỗ thứ ba trong kho mã sống với luật đó (cùng `Intent` và `MONEY_FLOW_CELLS`),
 * nên nó có một bài kiểm riêng đối chiếu hai danh sách: xem `__tests__/contractSync.test.ts`.
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

export const MONEY_FLOW_CELLS: readonly MoneyFlowCell[] = [
  'netIncome',
  'monthlyExpense',
  'investment',
  'wastedMoney',
  'debtPayment',
];
