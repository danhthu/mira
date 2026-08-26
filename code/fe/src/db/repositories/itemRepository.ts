import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '../client';
import { item } from '../schema';
import type { Item } from '../schema';
import type { CreateItemDto } from '@/shared/types';
import { getCurrentISOString } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';
import { vi } from '@/i18n/vi';

/** Món đang sở hữu: chưa buông và chưa xoá. */
export async function findOwnedItems(): Promise<Item[]> {
  return db
    .select()
    .from(item)
    .where(and(isNull(item.deletedAt), isNull(item.releasedAt)))
    .orderBy(desc(item.createdAt));
}

export async function createItem(dto: CreateItemDto): Promise<Item> {
  const now = getCurrentISOString();
  const rows = await db
    .insert(item)
    .values({
      id: generateId(),
      name: dto.name,
      price: dto.price ?? null,
      purchasedAt: dto.purchasedAt ?? null,
      useCount: 0,
      releasedAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })
    .returning();

  const row = rows[0];
  if (row === undefined) {
    throw new Error(vi.errors.insertFailed);
  }
  return row;
}

/**
 * Cộng dồn ngay trong SQL chứ không đọc-rồi-ghi: hai lần chạm nhanh liên tiếp
 * đọc cùng một giá trị cũ thì lần sau sẽ ghi đè lần trước, mất một lượt dùng.
 */
export async function markItemUsed(id: string): Promise<void> {
  await db
    .update(item)
    .set({
      useCount: sql`${item.useCount} + 1`,
      updatedAt: getCurrentISOString(),
    })
    .where(eq(item.id, id));
}

export async function releaseItem(id: string): Promise<void> {
  const now = getCurrentISOString();
  await db
    .update(item)
    .set({ releasedAt: now, updatedAt: now })
    .where(eq(item.id, id));
}
