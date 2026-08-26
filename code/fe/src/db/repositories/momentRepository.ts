import { eq, isNull, and, or, gte, lte, desc } from 'drizzle-orm';
import { db } from '../client';
import { moment } from '../schema';
import type { Moment } from '../schema';
import type { CreateMomentDto, MomentKind } from '@/shared/types';
import { getCurrentISOString } from '@/shared/utils/date';
import { serializeStringArray } from '@/shared/utils/format';
import { generateId } from '@/shared/utils/id';
import { vi } from '@/i18n/vi';

export async function findAllMoments(): Promise<Moment[]> {
  return db
    .select()
    .from(moment)
    .where(isNull(moment.deletedAt))
    .orderBy(desc(moment.occurredAt));
}

export async function findMomentsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Moment[]> {
  return db
    .select()
    .from(moment)
    .where(
      and(
        isNull(moment.deletedAt),
        gte(moment.occurredAt, startDate),
        lte(moment.occurredAt, endDate + 'T23:59:59Z'),
      ),
    )
    .orderBy(desc(moment.occurredAt));
}

/**
 * Lát cắt theo module sở hữu. Luật "NULL đọc như 'moment'" chỉ viết ở đây để
 * không màn hình nào phải tự nhớ, và để không ai lọc hộp di sản bằng `personIds`
 * nữa — gắn tên con vào một khoảnh khắc không có nghĩa là bỏ nó vào hộp.
 */
export async function findMomentsByKind(kind: MomentKind): Promise<Moment[]> {
  const matchesKind =
    kind === 'moment'
      ? or(isNull(moment.kind), eq(moment.kind, 'moment'))
      : eq(moment.kind, kind);

  return db
    .select()
    .from(moment)
    .where(and(isNull(moment.deletedAt), matchesKind))
    .orderBy(desc(moment.occurredAt));
}

export async function findMomentsByPerson(personId: string): Promise<Moment[]> {
  const all = await findAllMoments();
  return all.filter((m) => {
    try {
      const ids: unknown = JSON.parse(m.personIds);
      return Array.isArray(ids) && ids.includes(personId);
    } catch {
      return false;
    }
  });
}

export async function createMoment(dto: CreateMomentDto): Promise<Moment> {
  const now = getCurrentISOString();
  const entry = {
    id: generateId(),
    occurredAt: dto.occurredAt,
    text: dto.text ?? null,
    mediaUri: dto.mediaUri ?? null,
    mediaType: dto.mediaType ?? null,
    personIds: serializeStringArray(dto.personIds ?? []),
    bucket: dto.bucket ?? null,
    kind: dto.kind,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const rows = await db.insert(moment).values(entry).returning();
  const row = rows[0];
  if (row === undefined) {
    throw new Error(vi.errors.insertFailed);
  }
  return row;
}

export async function softDeleteMoment(id: string): Promise<void> {
  await db
    .update(moment)
    .set({
      deletedAt: getCurrentISOString(),
      updatedAt: getCurrentISOString(),
    })
    .where(eq(moment.id, id));
}
