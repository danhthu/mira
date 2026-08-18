import { eq, isNull, and, gte, lte, or } from 'drizzle-orm';
import { db } from '../client';
import { timeEntry } from '../schema';
import type { TimeEntry } from '../schema';
import type { CreateTimeEntryDto } from '@/shared/types';
import { getCurrentISOString } from '@/shared/utils/date';
import { vi } from '@/i18n/vi';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export async function findTimeEntriesByDate(date: string): Promise<TimeEntry[]> {
  return db
    .select()
    .from(timeEntry)
    .where(and(eq(timeEntry.date, date), isNull(timeEntry.deletedAt)));
}

export async function findTimeEntriesByDateRange(
  startDate: string,
  endDate: string,
): Promise<TimeEntry[]> {
  return db
    .select()
    .from(timeEntry)
    .where(
      and(
        isNull(timeEntry.deletedAt),
        gte(timeEntry.date, startDate),
        lte(timeEntry.date, endDate),
      ),
    );
}

export async function findGoldenHoursEntries(
  startDate: string,
  endDate: string,
): Promise<TimeEntry[]> {
  return db
    .select()
    .from(timeEntry)
    .where(
      and(
        isNull(timeEntry.deletedAt),
        gte(timeEntry.date, startDate),
        lte(timeEntry.date, endDate),
        or(eq(timeEntry.bucket, 'people'), eq(timeEntry.bucket, 'self')),
      ),
    );
}

export async function findEntriesByPersonId(personId: string): Promise<TimeEntry[]> {
  return db
    .select()
    .from(timeEntry)
    .where(
      and(eq(timeEntry.personId, personId), isNull(timeEntry.deletedAt)),
    );
}

export async function createTimeEntry(
  dto: CreateTimeEntryDto,
): Promise<TimeEntry> {
  const now = getCurrentISOString();
  const entry = {
    id: generateId(),
    date: dto.date,
    minutes: dto.minutes,
    bucket: dto.bucket,
    personId: dto.personId ?? null,
    note: dto.note ?? null,
    source: dto.source ?? ('manual' as const),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const rows = await db.insert(timeEntry).values(entry).returning();
  const row = rows[0];
  if (row === undefined) {
    throw new Error(vi.errors.insertFailed);
  }
  return row;
}

export async function softDeleteTimeEntry(id: string): Promise<void> {
  await db
    .update(timeEntry)
    .set({
      deletedAt: getCurrentISOString(),
      updatedAt: getCurrentISOString(),
    })
    .where(eq(timeEntry.id, id));
}
