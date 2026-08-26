import { eq, and, isNull, desc } from 'drizzle-orm';
import { db } from '../client';
import { health } from '../schema';
import type { Health } from '../schema';
import type { CreateHealthDto } from '@/shared/types';
import { getCurrentISOString } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';
import { vi } from '@/i18n/vi';

export async function findHealthByDate(date: string): Promise<Health | null> {
  const rows = await db
    .select()
    .from(health)
    .where(and(eq(health.date, date), isNull(health.deletedAt)))
    .orderBy(desc(health.updatedAt));
  return rows[0] ?? null;
}

export async function findRecentHealth(limit: number): Promise<Health[]> {
  const rows = await db
    .select()
    .from(health)
    .where(isNull(health.deletedAt))
    .orderBy(desc(health.date));
  return rows.slice(0, limit);
}

/**
 * Một ngày một bản ghi. Người dùng nhập rải rác trong ngày (ngủ lúc sáng, bước
 * lúc tối) nên ghi đè theo ngày, không tạo bản ghi mới mỗi lần lưu.
 */
export async function upsertHealth(dto: CreateHealthDto): Promise<Health> {
  const now = getCurrentISOString();
  const values = {
    sleepMinutes: dto.sleepMinutes ?? null,
    steps: dto.steps ?? null,
    energySelfRated: dto.energySelfRated ?? null,
  };

  const existing = await findHealthByDate(dto.date);
  if (existing !== null) {
    await db
      .update(health)
      .set({ ...values, updatedAt: now })
      .where(eq(health.id, existing.id));
    return { ...existing, ...values, updatedAt: now };
  }

  const entry = {
    id: generateId(),
    date: dto.date,
    ...values,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const rows = await db.insert(health).values(entry).returning();
  const row = rows[0];
  if (row === undefined) {
    throw new Error(vi.errors.insertFailed);
  }
  return row;
}
