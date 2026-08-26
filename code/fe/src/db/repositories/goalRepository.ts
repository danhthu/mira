import { and, desc, eq, isNull, lt } from 'drizzle-orm';
import { db } from '../client';
import { goal } from '../schema';
import type { Goal } from '../schema';
import type { CreateGoalDto } from '@/shared/types';
import { getCurrentISOString } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';
import { vi } from '@/i18n/vi';

export async function findAllGoals(): Promise<Goal[]> {
  return db
    .select()
    .from(goal)
    .where(isNull(goal.deletedAt))
    .orderBy(desc(goal.startedAt));
}

export async function findGoalById(id: string): Promise<Goal | null> {
  const rows = await db
    .select()
    .from(goal)
    .where(and(eq(goal.id, id), isNull(goal.deletedAt)));
  return rows[0] ?? null;
}

export async function createGoal(dto: CreateGoalDto): Promise<Goal> {
  const now = getCurrentISOString();
  const newGoal = {
    id: generateId(),
    tier: dto.tier,
    title: dto.title,
    startedAt: dto.startedAt,
    expiresAt: dto.expiresAt ?? null,
    costMinutesPerWeek: dto.costMinutesPerWeek ?? null,
    costAmountPerMonth: dto.costAmountPerMonth ?? null,
    status: 'active' as const,
    releaseReason: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const rows = await db.insert(goal).values(newGoal).returning();
  const row = rows[0];
  if (row === undefined) {
    throw new Error(vi.errors.insertFailed);
  }
  return row;
}

export async function releaseGoal(id: string, reason: string): Promise<void> {
  await db
    .update(goal)
    .set({
      status: 'released',
      releaseReason: reason,
      updatedAt: getCurrentISOString(),
    })
    .where(eq(goal.id, id));
}

/**
 * Hạn 90 ngày tự hết nếu không gia hạn (01-modules.md, M3). Chạy lúc mở màn hình
 * thay vì có job nền: app local-first, không có tiến trình nào chạy khi app đóng.
 */
export async function expireOverdueGoals(referenceDate: string): Promise<void> {
  await db
    .update(goal)
    .set({ status: 'expired', updatedAt: getCurrentISOString() })
    .where(
      and(
        eq(goal.status, 'active'),
        lt(goal.expiresAt, referenceDate),
        isNull(goal.deletedAt),
      ),
    );
}
