import { eq, isNull, desc } from 'drizzle-orm';
import { db } from '../client';
import { mood } from '../schema';
import type { Mood } from '../schema';
import type { CreateMoodDto } from '@/shared/types';
import { getCurrentISOString } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';
import { vi } from '@/i18n/vi';

export async function findRecentMoods(limit: number): Promise<Mood[]> {
  const rows = await db
    .select()
    .from(mood)
    .where(isNull(mood.deletedAt))
    .orderBy(desc(mood.occurredAt));
  return rows.slice(0, limit);
}

export async function createMood(dto: CreateMoodDto): Promise<Mood> {
  const now = getCurrentISOString();
  const entry = {
    id: generateId(),
    occurredAt: dto.occurredAt,
    level: dto.level,
    note: dto.note ?? null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const rows = await db.insert(mood).values(entry).returning();
  const row = rows[0];
  if (row === undefined) {
    throw new Error(vi.errors.insertFailed);
  }
  return row;
}

/**
 * Ghi chú tách khỏi lúc tạo vì check-in phải xong trong một chạm: bản ghi được
 * lưu ngay khi chọn mức, chữ nghĩa thêm sau nếu người dùng muốn.
 */
export async function updateMoodNote(id: string, note: string): Promise<void> {
  await db
    .update(mood)
    .set({ note: note === '' ? null : note, updatedAt: getCurrentISOString() })
    .where(eq(mood.id, id));
}
