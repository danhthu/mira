import { eq, isNull, and } from 'drizzle-orm';
import { db } from '../client';
import { person } from '../schema';
import type { Person } from '../schema';
import type { CreatePersonDto } from '@/shared/types';
import { getCurrentISOString } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';
import { vi } from '@/i18n/vi';

export async function findAllPersons(): Promise<Person[]> {
  return db.select().from(person).where(isNull(person.deletedAt));
}

export async function findPersonById(id: string): Promise<Person | null> {
  const rows = await db
    .select()
    .from(person)
    .where(and(eq(person.id, id), isNull(person.deletedAt)));
  return rows[0] ?? null;
}

export async function countPersons(): Promise<number> {
  const rows = await db.select().from(person).where(isNull(person.deletedAt));
  return rows.length;
}

export async function findPersonsWithHourglass(): Promise<Person[]> {
  return db
    .select()
    .from(person)
    .where(and(eq(person.hourglassEnabled, true), isNull(person.deletedAt)));
}

export async function createPerson(dto: CreatePersonDto): Promise<Person> {
  const now = getCurrentISOString();
  const newPerson = {
    id: generateId(),
    name: dto.name,
    role: dto.role,
    birthYear: dto.birthYear ?? null,
    distanceKm: dto.distanceKm ?? null,
    dunbarRing: dto.dunbarRing ?? 50,
    desiredCadence: dto.desiredCadence ?? null,
    hourglassEnabled: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const rows = await db.insert(person).values(newPerson).returning();
  const row = rows[0];
  if (row === undefined) {
    throw new Error(vi.errors.insertFailed);
  }
  return row;
}

export async function updatePersonHourglass(
  id: string,
  enabled: boolean,
): Promise<void> {
  await db
    .update(person)
    .set({ hourglassEnabled: enabled, updatedAt: getCurrentISOString() })
    .where(eq(person.id, id));
}

export async function updatePersonBirthYear(
  id: string,
  birthYear: number,
): Promise<void> {
  await db
    .update(person)
    .set({ birthYear, updatedAt: getCurrentISOString() })
    .where(eq(person.id, id));
}

export async function softDeletePerson(id: string): Promise<void> {
  await db
    .update(person)
    .set({ deletedAt: getCurrentISOString(), updatedAt: getCurrentISOString() })
    .where(eq(person.id, id));
}
