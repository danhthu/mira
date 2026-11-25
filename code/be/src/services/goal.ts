import type { GoalBudget } from '@mira/contract';
import type { CreateGoalDto, EndGoalDto } from '../shared/dtos/GoalDto';
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
