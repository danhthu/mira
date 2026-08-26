import { describe, it, expect } from 'vitest';
import {
  calculateGoalCost,
  canAddGoal,
  detectGoalConflict,
  goalExpiry,
  goalExpiryDate,
  GOAL_EXPIRY_DAYS,
  GOAL_TIER_LIMITS,
  type GoalCostEntry,
} from '../goalCost';
import { MINUTES_IN_WEEK } from '../constants';
import type { GoalTier } from '@/shared/types';

function makeGoal(
  id: string,
  tier: GoalTier,
  costMinutesPerWeek: number | null,
  costAmountPerMonth: number | null = null,
): GoalCostEntry {
  return { id, tier, costMinutesPerWeek, costAmountPerMonth };
}

describe('calculateGoalCost', () => {
  it('returns no_cost when the goal costs neither time nor money', () => {
    expect(calculateGoalCost({ costMinutesPerWeek: null, costAmountPerMonth: null }, 10_000_000))
      .toEqual({ status: 'no_cost' });
  });

  it('treats zero on both costs the same as unset', () => {
    expect(calculateGoalCost({ costMinutesPerWeek: 0, costAmountPerMonth: 0 }, 10_000_000))
      .toEqual({ status: 'no_cost' });
  });

  it('converts minutes per week into hours per week', () => {
    const result = calculateGoalCost(
      { costMinutesPerWeek: 180, costAmountPerMonth: null },
      10_000_000,
    );
    expect(result).toEqual({
      status: 'ok',
      hoursPerWeek: 3,
      amountPerMonth: 0,
      freedomDelayDays: 0,
    });
  });

  it('rounds hours per week to one decimal', () => {
    // 100 phút = 1,666… giờ
    const result = calculateGoalCost(
      { costMinutesPerWeek: 100, costAmountPerMonth: null },
      10_000_000,
    );
    expect(result).toEqual({
      status: 'ok',
      hoursPerWeek: 1.7,
      amountPerMonth: 0,
      freedomDelayDays: 0,
    });
  });

  it('computes freedom delay as amount over monthly expense times 30 days', () => {
    // 1 triệu / 10 triệu × 30 = 3 ngày
    const result = calculateGoalCost(
      { costMinutesPerWeek: null, costAmountPerMonth: 1_000_000 },
      10_000_000,
    );
    expect(result).toEqual({
      status: 'ok',
      hoursPerWeek: 0,
      amountPerMonth: 1_000_000,
      freedomDelayDays: 3,
    });
  });

  it('rounds freedom delay to one decimal', () => {
    // 1 triệu / 7 triệu × 30 = 4,2857… ngày
    const result = calculateGoalCost(
      { costMinutesPerWeek: null, costAmountPerMonth: 1_000_000 },
      7_000_000,
    );
    expect(result).toMatchObject({ status: 'ok', freedomDelayDays: 4.3 });
  });

  it('returns null freedom delay when monthly expense is unknown', () => {
    const result = calculateGoalCost(
      { costMinutesPerWeek: 60, costAmountPerMonth: 500_000 },
      0,
    );
    expect(result).toEqual({
      status: 'ok',
      hoursPerWeek: 1,
      amountPerMonth: 500_000,
      freedomDelayDays: null,
    });
  });

  it('keeps both costs when a goal has time and money', () => {
    const result = calculateGoalCost(
      { costMinutesPerWeek: 300, costAmountPerMonth: 2_000_000 },
      10_000_000,
    );
    expect(result).toEqual({
      status: 'ok',
      hoursPerWeek: 5,
      amountPerMonth: 2_000_000,
      freedomDelayDays: 6,
    });
  });

  it('reports a cost when only money is set and time is zero', () => {
    const result = calculateGoalCost(
      { costMinutesPerWeek: 0, costAmountPerMonth: 300_000 },
      10_000_000,
    );
    expect(result).toMatchObject({ status: 'ok', hoursPerWeek: 0 });
  });
});

describe('detectGoalConflict', () => {
  it('reports within_budget for an empty list', () => {
    expect(detectGoalConflict([])).toEqual({
      status: 'within_budget',
      totalMinutesPerWeek: 0,
      remainingMinutesPerWeek: MINUTES_IN_WEEK,
    });
  });

  it('sums minutes across every goal', () => {
    const goals = [
      makeGoal('a', 'rhythm', 120),
      makeGoal('b', 'rhythm', 180),
      makeGoal('c', 'season', null),
    ];
    expect(detectGoalConflict(goals)).toEqual({
      status: 'within_budget',
      totalMinutesPerWeek: 300,
      remainingMinutesPerWeek: MINUTES_IN_WEEK - 300,
    });
  });

  it('treats a total exactly at the budget as within budget', () => {
    const goals = [makeGoal('a', 'rhythm', 600)];
    expect(detectGoalConflict(goals, 600)).toEqual({
      status: 'within_budget',
      totalMinutesPerWeek: 600,
      remainingMinutesPerWeek: 0,
    });
  });

  it('reports a conflict with the goals that spend time when the budget is passed', () => {
    const goals = [
      makeGoal('a', 'rhythm', 400),
      makeGoal('b', 'rhythm', 300),
      makeGoal('c', 'identity', 0),
    ];
    expect(detectGoalConflict(goals, 600)).toEqual({
      status: 'conflict',
      totalMinutesPerWeek: 700,
      budgetMinutesPerWeek: 600,
      overflowMinutesPerWeek: 100,
      goalIds: ['a', 'b'],
    });
  });

  it('uses the whole week as the default budget', () => {
    const goals = [makeGoal('a', 'rhythm', MINUTES_IN_WEEK + 1)];
    expect(detectGoalConflict(goals)).toMatchObject({
      status: 'conflict',
      budgetMinutesPerWeek: MINUTES_IN_WEEK,
      overflowMinutesPerWeek: 1,
    });
  });

  it('conflicts on any spent minute when the budget is zero', () => {
    expect(detectGoalConflict([makeGoal('a', 'rhythm', 30)], 0)).toMatchObject({
      status: 'conflict',
      overflowMinutesPerWeek: 30,
    });
  });
});

describe('canAddGoal', () => {
  it('allows the first goal of any tier', () => {
    expect(canAddGoal([], { tier: 'identity', costMinutesPerWeek: 60 })).toEqual({
      status: 'allowed',
    });
  });

  it('blocks a fourth identity goal', () => {
    const existing = [
      makeGoal('a', 'identity', 60),
      makeGoal('b', 'identity', 60),
      makeGoal('c', 'identity', 60),
    ];
    expect(canAddGoal(existing, { tier: 'identity', costMinutesPerWeek: 60 })).toEqual({
      status: 'tier_full',
      tier: 'identity',
      limit: 3,
    });
  });

  it('blocks a third season goal', () => {
    const existing = [makeGoal('a', 'season', 60), makeGoal('b', 'season', 60)];
    expect(canAddGoal(existing, { tier: 'season', costMinutesPerWeek: 60 })).toEqual({
      status: 'tier_full',
      tier: 'season',
      limit: 2,
    });
  });

  it('never blocks a rhythm goal on count', () => {
    const existing = Array.from({ length: 20 }, (_, i) =>
      makeGoal(`g${i}`, 'rhythm', 10),
    );
    expect(canAddGoal(existing, { tier: 'rhythm', costMinutesPerWeek: 10 })).toEqual({
      status: 'allowed',
    });
  });

  it('counts only goals of the candidate tier', () => {
    const existing = [
      makeGoal('a', 'identity', 60),
      makeGoal('b', 'identity', 60),
      makeGoal('c', 'identity', 60),
    ];
    expect(canAddGoal(existing, { tier: 'season', costMinutesPerWeek: 60 })).toEqual({
      status: 'allowed',
    });
  });

  it('blocks when the goals would spend more than a whole week', () => {
    const existing = [makeGoal('a', 'rhythm', MINUTES_IN_WEEK)];
    expect(canAddGoal(existing, { tier: 'rhythm', costMinutesPerWeek: 1 })).toEqual({
      status: 'week_full',
      totalMinutesPerWeek: MINUTES_IN_WEEK + 1,
    });
  });

  it('allows a total that lands exactly on the week budget', () => {
    const existing = [makeGoal('a', 'rhythm', MINUTES_IN_WEEK - 30)];
    expect(canAddGoal(existing, { tier: 'rhythm', costMinutesPerWeek: 30 })).toEqual({
      status: 'allowed',
    });
  });

  it('treats an unset candidate cost as zero minutes', () => {
    const existing = [makeGoal('a', 'rhythm', MINUTES_IN_WEEK)];
    expect(canAddGoal(existing, { tier: 'rhythm', costMinutesPerWeek: null })).toEqual({
      status: 'allowed',
    });
  });

  it('reports the tier limit before the week budget', () => {
    const existing = [
      makeGoal('a', 'season', MINUTES_IN_WEEK),
      makeGoal('b', 'season', 60),
    ];
    expect(canAddGoal(existing, { tier: 'season', costMinutesPerWeek: 60 })).toMatchObject({
      status: 'tier_full',
    });
  });
});

describe('goalExpiry', () => {
  it('reports no_expiry when the goal has no deadline', () => {
    expect(goalExpiry(null, '2024-03-01')).toEqual({ status: 'no_expiry' });
  });

  it('counts the days left before the deadline', () => {
    expect(goalExpiry('2024-03-31', '2024-03-01')).toEqual({
      status: 'running',
      daysLeft: 30,
    });
  });

  it('treats the deadline day itself as still running', () => {
    expect(goalExpiry('2024-03-01', '2024-03-01')).toEqual({
      status: 'running',
      daysLeft: 0,
    });
  });

  it('reports how long ago a passed deadline was', () => {
    expect(goalExpiry('2024-03-01', '2024-03-08')).toEqual({
      status: 'expired',
      daysAgo: 7,
    });
  });

  it('crosses a month boundary correctly', () => {
    expect(goalExpiry('2024-03-01', '2024-02-28')).toEqual({
      status: 'running',
      daysLeft: 2,
    });
  });
});

describe('goalExpiryDate', () => {
  it('lands 90 days after the start date', () => {
    expect(goalExpiryDate('2024-01-01')).toBe('2024-03-31');
  });

  it('is consistent with goalExpiry on the start date', () => {
    const startedAt = '2024-06-15';
    expect(goalExpiry(goalExpiryDate(startedAt), startedAt)).toEqual({
      status: 'running',
      daysLeft: GOAL_EXPIRY_DAYS,
    });
  });
});

describe('GOAL_TIER_LIMITS', () => {
  it('leaves the rhythm tier unlimited', () => {
    expect(GOAL_TIER_LIMITS.rhythm).toBeNull();
  });
});
