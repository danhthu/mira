import type { GoalBudget } from '@mira/contract';
import type { CreateGoalDto, EndGoalDto, UpdateGoalDto } from '../shared/dtos/GoalDto';
import type { Goal } from '../entities/Goal';
import type { GoalRepository } from '../database/repositories/GoalRepository';
import type { TimeEntryRepository } from '../database/repositories/TimeEntryRepository';
import { DEFAULT_GOAL_SOURCE_BUCKET, GOAL_TIER_CAP } from '../shared/constants';
import { badRequest, notFound, tierFull } from '../shared/errors';
import { assertDate } from './time';

export interface GoalDeps {
  readonly goals: GoalRepository;
  readonly timeEntries: TimeEntryRepository;
}

const TIER_LABEL_VI = { long: 'dài hạn', quarter: 'quý', rhythm: 'nhịp tuần' } as const;

/**
 * Tạo mục tiêu. Tầng đầy trần thì từ chối thẳng — Mira không bán việc gỡ trần, vì
 * chính cái trần mới chữa được bệnh đặt quá nhiều (xem N-204, N-206).
 */
export async function createGoal(deps: GoalDeps, userId: string, dto: CreateGoalDto): Promise<Goal> {
  if (dto.title.trim() === '') {
    throw badRequest('Mục tiêu phải có tên');
  }
  if (!Number.isInteger(dto.weeklyMinutes) || dto.weeklyMinutes <= 0) {
    throw badRequest('weeklyMinutes phải là số phút nguyên dương');
  }

  const cap = GOAL_TIER_CAP[dto.tier];
  const running = await deps.goals.countActiveByTier(userId, dto.tier);
  if (running >= cap) {
    throw tierFull(
      `Tầng ${TIER_LABEL_VI[dto.tier]} đang có ${running} mục tiêu, tối đa ${cap}. Bỏ bớt một cái trước.`,
    );
  }

  return deps.goals.create(userId, { ...dto, title: dto.title.trim() });
}

/**
 * Sửa tên và số giờ mỗi tuần.
 *
 * Không đụng tới `tier` và `sourceBucket`. Đổi tầng là đổi trần đang áp cho mục tiêu —
 * kéo một mục tiêu từ tầng quý sang tầng dài hạn có thể làm tầng dài hạn vượt trần, và
 * cái trần là thứ chữa bệnh đặt quá nhiều (N-204, N-206). Muốn đổi tầng thì kết thúc
 * cái cũ và tạo cái mới: đi qua đúng cửa kiểm trần.
 *
 * Chỉ sửa được mục tiêu ĐANG CHẠY — câu UPDATE trong repository có `ended_on IS NULL`.
 * Sửa một mục tiêu đã kết thúc là sửa lại lịch sử.
 */
export async function updateGoal(
  deps: GoalDeps,
  userId: string,
  id: string,
  dto: UpdateGoalDto,
): Promise<Goal> {
  if (dto.title !== undefined && dto.title.trim() === '') {
    throw badRequest('Mục tiêu phải có tên');
  }
  if (
    dto.weeklyMinutes !== undefined &&
    (!Number.isInteger(dto.weeklyMinutes) || dto.weeklyMinutes <= 0)
  ) {
    throw badRequest('weeklyMinutes phải là số phút nguyên dương');
  }

  const updated = await deps.goals.update(userId, id, {
    ...dto,
    title: dto.title?.trim(),
  });
  if (updated === null) {
    throw notFound('Không có mục tiêu đang chạy với id này');
  }
  return updated;
}

/**
 * Xoá hẳn một mục tiêu. **Khác "kết thúc"**, và hai thứ này phải cùng tồn tại:
 *
 *   Kết thúc = tôi đã theo đuổi nó, giờ thôi. Nó ở lại trong lịch sử, và có bước hai
 *              hỏi số giờ vừa giải phóng chuyển sang đâu.
 *   Xoá      = tôi gõ nhầm, nó chưa từng là mục tiêu của tôi.
 *
 * Gộp hai thứ này làm một thì một mục tiêu gõ nhầm sẽ nằm vĩnh viễn trong lịch sử như
 * một thứ "đã bỏ cuộc" — app tự dựng cho người dùng một thất bại không có thật.
 */
export async function deleteGoal(deps: GoalDeps, userId: string, id: string): Promise<void> {
  const xoa = await deps.goals.softDelete(userId, id);
  if (xoa === null) {
    throw notFound('Không có mục tiêu với id này');
  }
}

/**
 * Kết thúc mục tiêu. Khi có `handOverTo`, mục tiêu nhận phải đang chạy — buông mà có
 * chỗ chuyển sang mới là thứ gắn với cảm xúc dương (N-205); trỏ vào một mục tiêu đã
 * kết thúc thì bước hai chỉ còn là hình thức.
 */
export async function endGoal(deps: GoalDeps, userId: string, id: string, dto: EndGoalDto): Promise<Goal> {
  if (dto.handOverTo != null) {
    if (dto.handOverTo === id) {
      throw badRequest('Không thể chuyển giờ cho chính mục tiêu đang bỏ');
    }
    const target = await deps.goals.findById(userId, dto.handOverTo);
    if (target === null || target.endedOn !== null) {
      throw badRequest('Mục tiêu nhận lại số giờ này không còn chạy');
    }
  }

  const ended = await deps.goals.end(userId, id, dto);
  if (ended === null) {
    throw notFound('Không có mục tiêu đang chạy với id này');
  }
  return ended;
}

/**
 * Luật khai nguồn. Vế "đang cần" là tổng giờ mỗi tuần các mục tiêu đòi từ nhóm nguồn;
 * vế "đang có" là giờ thuộc nhóm đó đã thật sự ghi trong tuần. Thiếu thì nói thẳng số
 * thiếu — không chặn, không trách, chỉ đặt câu hỏi bỏ bớt cái nào.
 */
export async function goalBudget(deps: GoalDeps, userId: string, weekStart: string): Promise<GoalBudget> {
  assertDate(weekStart, 'weekStart');
  const end = new Date(`${weekStart}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 6);

  const needed = await deps.goals.sumWeeklyMinutesFrom(userId, DEFAULT_GOAL_SOURCE_BUCKET);
  const sums = await deps.timeEntries.sumByBucket(userId, weekStart, end.toISOString().slice(0, 10));
  const available = sums.find((s) => s.bucket === DEFAULT_GOAL_SOURCE_BUCKET)?.minutes ?? 0;

  return {
    neededMinutes: needed,
    availableMinutes: available,
    shortfallMinutes: Math.max(0, needed - available),
  };
}
