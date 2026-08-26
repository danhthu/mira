import { isNull, desc } from 'drizzle-orm';
import { db } from '../client';
import { space } from '../schema';
import type { Space } from '../schema';
import type { CreateSpaceDto } from '@/shared/types';
import { getCurrentISOString } from '@/shared/utils/date';
import { serializeStringArray } from '@/shared/utils/format';
import { generateId } from '@/shared/utils/id';
import { vi } from '@/i18n/vi';

export async function findAllSpaces(): Promise<Space[]> {
  return db
    .select()
    .from(space)
    .where(isNull(space.deletedAt))
    .orderBy(desc(space.createdAt));
}

export async function createSpace(dto: CreateSpaceDto): Promise<Space> {
  const now = getCurrentISOString();
  const row = {
    id: generateId(),
    type: dto.type,
    name: dto.name,
    memberIds: serializeStringArray(dto.memberIds ?? []),
    sharedModules: serializeStringArray(dto.sharedModules ?? []),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const rows = await db.insert(space).values(row).returning();
  const inserted = rows[0];
  if (inserted === undefined) {
    throw new Error(vi.errors.insertFailed);
  }
  return inserted;
}
