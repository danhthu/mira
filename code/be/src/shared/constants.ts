import type { DunbarRing, GoalTier, TimeBucket, TimeEntrySource } from './types/enums';

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
