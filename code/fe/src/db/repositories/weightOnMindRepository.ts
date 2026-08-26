import { eq, and, isNull, lte, gt, asc, desc } from 'drizzle-orm';
import { db } from '../client';
import { weightOnMind } from '../schema';
import type { WeightOnMind } from '../schema';
import type { CreateWeightOnMindDto } from '@/shared/types';
import { getCurrentISOString } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';
import { vi } from '@/i18n/vi';

/** Đã tới hạn hỏi lại và chưa được trả lời. */
export async function findWeightsDueForReview(
  now: string,
): Promise<WeightOnMind[]> {
  return db
    .select()
    .from(weightOnMind)
    .where(
      and(
        isNull(weightOnMind.deletedAt),
        eq(weightOnMind.reviewed, false),
        lte(weightOnMind.reviewAt, now),
      ),
    )
    .orderBy(asc(weightOnMind.reviewAt));
}

/** Đã viết ra, Mira đang cất, chưa tới ngày hỏi lại. */
export async function findWeightsInKeeping(
  now: string,
): Promise<WeightOnMind[]> {
  return db
    .select()
    .from(weightOnMind)
    .where(
      and(
        isNull(weightOnMind.deletedAt),
        eq(weightOnMind.reviewed, false),
        gt(weightOnMind.reviewAt, now),
      ),
    )
    .orderBy(desc(weightOnMind.writtenAt));
}

export async function createWeightOnMind(
  dto: CreateWeightOnMindDto,
): Promise<WeightOnMind> {
  const now = getCurrentISOString();
  const entry = {
    id: generateId(),
    text: dto.text,
    writtenAt: dto.writtenAt,
    reviewAt: dto.reviewAt,
    reviewed: false,
    stillHeavy: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const rows = await db.insert(weightOnMind).values(entry).returning();
  const row = rows[0];
  if (row === undefined) {
    throw new Error(vi.errors.insertFailed);
  }
  return row;
}

export async function markWeightReviewed(
  id: string,
  stillHeavy: boolean,
): Promise<void> {
  await db
    .update(weightOnMind)
    .set({ reviewed: true, stillHeavy, updatedAt: getCurrentISOString() })
    .where(eq(weightOnMind.id, id));
}
