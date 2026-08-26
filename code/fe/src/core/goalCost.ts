import { DAYS_IN_MONTH, MINUTES_IN_HOUR, MINUTES_IN_WEEK } from './constants';
import type { GoalTier } from '@/shared/types';

const MS_IN_DAY = 86_400_000;

/**
 * Số mục tiêu tối đa còn sống mỗi tầng (01-modules.md, M3). `null` là không giới
 * hạn — tầng Nhịp cố tình để mở vì nó là việc của một tuần, không phải lời hứa dài.
 */
export const GOAL_TIER_LIMITS: Record<GoalTier, number | null> = {
  identity: 3,
  season: 2,
  rhythm: null,
};

/** Mục tiêu tự hết hạn sau 90 ngày nếu không gia hạn. */
export const GOAL_EXPIRY_DAYS = 90;

export interface GoalCostEntry {
  id: string;
  tier: GoalTier;
  costMinutesPerWeek: number | null;
  costAmountPerMonth: number | null;
}

export type GoalCostResult =
  | {
      status: 'ok';
      hoursPerWeek: number;
      amountPerMonth: number;
      /** `null` khi chưa có chi tiêu tháng để so — không phải khi độ trễ bằng 0. */
      freedomDelayDays: number | null;
    }
  | { status: 'no_cost' };

export type GoalConflictResult =
  | {
      status: 'within_budget';
      totalMinutesPerWeek: number;
      remainingMinutesPerWeek: number;
    }
  | {
      status: 'conflict';
      totalMinutesPerWeek: number;
      budgetMinutesPerWeek: number;
      overflowMinutesPerWeek: number;
      goalIds: string[];
    };

export type GoalAdmissionResult =
  | { status: 'allowed' }
  | { status: 'tier_full'; tier: GoalTier; limit: number }
  | { status: 'week_full'; totalMinutesPerWeek: number };

export type GoalExpiryResult =
  | { status: 'no_expiry' }
  | { status: 'running'; daysLeft: number }
  | { status: 'expired'; daysAgo: number };

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_IN_DAY,
  );
}

function totalMinutes(goals: GoalCostEntry[]): number {
  return goals.reduce((sum, g) => sum + (g.costMinutesPerWeek ?? 0), 0);
}

export function goalExpiryDate(startedAt: string): string {
  const ms = Date.parse(`${startedAt}T00:00:00Z`) + GOAL_EXPIRY_DAYS * MS_IN_DAY;
  return new Date(ms).toISOString().slice(0, 10);
}

export function calculateGoalCost(
  goal: Pick<GoalCostEntry, 'costMinutesPerWeek' | 'costAmountPerMonth'>,
  monthlyExpense: number,
): GoalCostResult {
  const minutes = goal.costMinutesPerWeek ?? 0;
  const amount = goal.costAmountPerMonth ?? 0;

  if (minutes === 0 && amount === 0) {
    return { status: 'no_cost' };
  }

  // monthlyExpense = 0 nghĩa là chưa nhập chi tiêu tháng, không phải chi tiêu bằng 0.
  // Chia cho nó ra Infinity, nên trả null để màn hình bỏ hẳn dòng độ trễ tự do.
  const freedomDelayDays =
    monthlyExpense === 0
      ? null
      : roundToOneDecimal((amount / monthlyExpense) * DAYS_IN_MONTH);

  return {
    status: 'ok',
    hoursPerWeek: roundToOneDecimal(minutes / MINUTES_IN_HOUR),
    amountPerMonth: amount,
    freedomDelayDays,
  };
}

export function detectGoalConflict(
  goals: GoalCostEntry[],
  budgetMinutesPerWeek: number = MINUTES_IN_WEEK,
): GoalConflictResult {
  const total = totalMinutes(goals);

  if (total <= budgetMinutesPerWeek) {
    return {
      status: 'within_budget',
      totalMinutesPerWeek: total,
      remainingMinutesPerWeek: budgetMinutesPerWeek - total,
    };
  }

  return {
    status: 'conflict',
    totalMinutesPerWeek: total,
    budgetMinutesPerWeek,
    overflowMinutesPerWeek: total - budgetMinutesPerWeek,
    goalIds: goals
      .filter(g => (g.costMinutesPerWeek ?? 0) > 0)
      .map(g => g.id),
  };
}

export function canAddGoal(
  existing: GoalCostEntry[],
  candidate: { tier: GoalTier; costMinutesPerWeek: number | null },
): GoalAdmissionResult {
  const limit = GOAL_TIER_LIMITS[candidate.tier];
  if (limit !== null) {
    const sameTier = existing.filter(g => g.tier === candidate.tier).length;
    if (sameTier >= limit) {
      return { status: 'tier_full', tier: candidate.tier, limit };
    }
  }

  const total = totalMinutes(existing) + (candidate.costMinutesPerWeek ?? 0);
  if (total > MINUTES_IN_WEEK) {
    return { status: 'week_full', totalMinutesPerWeek: total };
  }

  return { status: 'allowed' };
}

export function goalExpiry(
  expiresAt: string | null,
  referenceDate: string,
): GoalExpiryResult {
  if (expiresAt === null) {
    return { status: 'no_expiry' };
  }

  const days = daysBetween(referenceDate, expiresAt);
  if (days < 0) {
    return { status: 'expired', daysAgo: -days };
  }
  return { status: 'running', daysLeft: days };
}
