import type { GoalTier, TimeBucket } from '../shared/types/enums';

export type { GoalTier };

/**
 * Một mục tiêu đang chạy hoặc đã kết thúc — không có trạng thái thứ ba.
 * `endedOn` là null nghĩa là đang chạy; `handedOverTo` là bước hai khi bỏ bớt:
 * số giờ vừa giải phóng chuyển sang mục tiêu nào.
 */
export interface Goal {
  readonly id: string;
  readonly tier: GoalTier;
  /** Diễn đạt bằng thứ muốn thêm, không bằng thứ muốn bớt. */
  readonly title: string;
  readonly weeklyMinutes: number;
  /** Luật khai nguồn: giờ mới lấy từ nhóm nào. */
  readonly sourceBucket: TimeBucket;
  readonly startedOn: string;
  readonly expiresOn: string | null;
  readonly endedOn: string | null;
  readonly handedOverTo: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
