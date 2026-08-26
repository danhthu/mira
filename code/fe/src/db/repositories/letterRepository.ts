import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../client';
import { letter } from '../schema';
import type { Letter } from '../schema';
import type { CreateLetterDto, LetterKind } from '@/shared/types';
import { getCurrentISOString } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';
import { vi } from '@/i18n/vi';

export async function findAllLetters(): Promise<Letter[]> {
  return db
    .select()
    .from(letter)
    .where(isNull(letter.deletedAt))
    .orderBy(desc(letter.weekStart));
}

/** Thư cũ đã được migration điền 'yearLetter', nên không cần bắt NULL ở đây. */
export async function findLettersByKind(kind: LetterKind): Promise<Letter[]> {
  return db
    .select()
    .from(letter)
    .where(and(isNull(letter.deletedAt), eq(letter.kind, kind)))
    .orderBy(desc(letter.weekStart));
}

export async function createLetter(dto: CreateLetterDto): Promise<Letter> {
  const now = getCurrentISOString();
  const rows = await db
    .insert(letter)
    .values({
      id: generateId(),
      weekStart: dto.weekStart,
      body: dto.body,
      kind: dto.kind,
      userReaction: null,
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

export async function softDeleteLetter(id: string): Promise<void> {
  const now = getCurrentISOString();
  await db
    .update(letter)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(letter.id, id));
}
