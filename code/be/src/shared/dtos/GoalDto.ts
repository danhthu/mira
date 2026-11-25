import type { GoalTier, TimeBucket } from '../types/enums';

export interface CreateGoalDto {
  tier: GoalTier;
  title: string;
  weeklyMinutes: number;
  /** Luật khai nguồn. Bỏ trống thì mặc định lấy từ nhóm lãng phí. */
  sourceBucket?: TimeBucket;
}

export interface UpdateGoalDto {
  title?: string;
  weeklyMinutes?: number;
}

/**
 * Kết thúc một mục tiêu. `handOverTo` là bước hai khi bỏ giữa chừng: buông mà không có
 * chỗ chuyển sang thì chỉ bớt khó chịu chứ không tạo ra gì (xem N-205).
 */
export interface EndGoalDto {
  handOverTo?: string | null;
}
