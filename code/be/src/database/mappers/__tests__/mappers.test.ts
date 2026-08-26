import { describe, it, expect } from 'vitest';
import type { PersonRow, TimeEntryRow, MomentRow } from '../../../shared/types/rows';
import { toPerson } from '../person';
import { toTimeEntry } from '../timeEntry';
import { toMoment, parsePersonIds, serializePersonIds } from '../moment';

const personRow: PersonRow = {
  id: '0192f0c0-0000-7000-8000-000000000001',
  name: 'Bố',
  role: 'parent',
  birth_year: 1958,
  distance_km: 120,
  dunbar_ring: 5,
  desired_cadence: 7,
  hourglass_enabled: true,
  created_at: '2026-08-25T01:00:00.000Z',
  updated_at: '2026-08-25T01:00:00.000Z',
  deleted_at: null,
};

const timeEntryRow: TimeEntryRow = {
  id: '0192f0c0-0000-7000-8000-000000000002',
  date: '2026-08-25',
  minutes: 90,
  bucket: 'people',
  person_id: personRow.id,
  note: 'Gọi điện về nhà',
  source: 'manual',
  created_at: '2026-08-25T02:00:00.000Z',
  updated_at: '2026-08-25T02:00:00.000Z',
  deleted_at: null,
};

const momentRow: MomentRow = {
  id: '0192f0c0-0000-7000-8000-000000000003',
  occurred_at: '2026-08-25T12:30:00.000Z',
  text: 'Con tập đi xe đạp',
  media_uri: 'file:///photo.jpg',
  media_type: 'photo',
  person_ids: '["p1","p2"]',
  bucket: 'people',
  created_at: '2026-08-25T12:31:00.000Z',
  updated_at: '2026-08-25T12:31:00.000Z',
  deleted_at: null,
};

describe('toPerson', () => {
  it('đổi snake_case sang camelCase và giữ nguyên giá trị', () => {
    expect(toPerson(personRow)).toEqual({
      id: personRow.id,
      name: 'Bố',
      role: 'parent',
      birthYear: 1958,
      distanceKm: 120,
      dunbarRing: 5,
      desiredCadence: 7,
      hourglassEnabled: true,
      createdAt: '2026-08-25T01:00:00.000Z',
      updatedAt: '2026-08-25T01:00:00.000Z',
      deletedAt: null,
    });
  });

  it('giữ null của các cột optional thay vì đổi thành undefined', () => {
    const person = toPerson({
      ...personRow,
      birth_year: null,
      distance_km: null,
      desired_cadence: null,
      deleted_at: '2026-08-26T00:00:00.000Z',
    });
    expect(person.birthYear).toBeNull();
    expect(person.distanceKm).toBeNull();
    expect(person.desiredCadence).toBeNull();
    expect(person.deletedAt).toBe('2026-08-26T00:00:00.000Z');
  });
});

describe('toTimeEntry', () => {
  it('đổi person_id sang personId và giữ phút là số nguyên', () => {
    const entry = toTimeEntry(timeEntryRow);
    expect(entry.personId).toBe(personRow.id);
    expect(entry.minutes).toBe(90);
    expect(entry.bucket).toBe('people');
    expect(entry.source).toBe('manual');
  });

  it('entry không gắn người thì personId là null', () => {
    expect(toTimeEntry({ ...timeEntryRow, person_id: null, note: null }).personId).toBeNull();
  });
});

describe('toMoment', () => {
  it('parse person_ids từ chuỗi JSON thành mảng', () => {
    expect(toMoment(momentRow).personIds).toEqual(['p1', 'p2']);
  });

  it('mảng rỗng khi moment không gắn ai', () => {
    expect(toMoment({ ...momentRow, person_ids: '[]' }).personIds).toEqual([]);
  });

  it('media và bucket rỗng thì trả null', () => {
    const moment = toMoment({ ...momentRow, media_uri: null, media_type: null, bucket: null, text: null });
    expect(moment.mediaUri).toBeNull();
    expect(moment.mediaType).toBeNull();
    expect(moment.bucket).toBeNull();
    expect(moment.text).toBeNull();
  });
});

describe('person_ids', () => {
  it('serialize rồi parse lại ra đúng mảng ban đầu', () => {
    const ids = ['a', 'b', 'c'];
    expect(parsePersonIds(serializePersonIds(ids))).toEqual(ids);
  });
});
