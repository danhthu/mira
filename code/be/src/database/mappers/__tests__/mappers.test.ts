import { describe, it, expect } from 'vitest';
import type { PersonRow, TimeEntryRow, MomentRow } from '../../../shared/types/rows';
import { toPerson } from '../person';
import { toTimeEntry } from '../timeEntry';
import { toMoment } from '../moment';

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
  routine_id: null,
  category_id: null,
  id: '0192f0c0-0000-7000-8000-000000000002',
  date: '2026-08-25',
  minutes: 90,
  bucket: 'family',
  golden: true,
  note: 'Gọi điện về nhà',
  source: 'manual',
  created_at: '2026-08-25T02:00:00.000Z',
  updated_at: '2026-08-25T02:00:00.000Z',
  deleted_at: null,
};

const momentRow: MomentRow = {
  id: '0192f0c0-0000-7000-8000-000000000003',
  date: '2026-08-25',
  kind: 'salt',
  text: 'Họp hai tiếng không ra quyết định',
  revisit_at: '2026-10-06',
  revisit_answer: null,
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
  it('giữ nhóm việc của catalog và cờ giờ vàng', () => {
    const entry = toTimeEntry(timeEntryRow);
    expect(entry.bucket).toBe('family');
    expect(entry.golden).toBe(true);
    expect(entry.minutes).toBe(90);
    expect(entry.source).toBe('manual');
  });

  it('giờ không phải giờ vàng thì golden là false, không phải undefined', () => {
    expect(toTimeEntry({ ...timeEntryRow, golden: false, note: null }).golden).toBe(false);
  });

  it('nhóm lãng phí đọc ra đúng — đây là nguyên liệu của luật khai nguồn', () => {
    expect(toTimeEntry({ ...timeEntryRow, bucket: 'waste', golden: false }).bucket).toBe('waste');
  });
});

describe('toMoment', () => {
  it('đọc ra hạt muối kèm ngày hỏi lại, chưa trả lời', () => {
    const moment = toMoment(momentRow);
    expect(moment.kind).toBe('salt');
    expect(moment.revisitAt).toBe('2026-10-06');
    expect(moment.revisitAnswer).toBeNull();
  });

  it('viên kẹo không có hẹn hỏi lại', () => {
    const moment = toMoment({ ...momentRow, kind: 'candy', revisit_at: null });
    expect(moment.kind).toBe('candy');
    expect(moment.revisitAt).toBeNull();
  });

  it('hạt không chữ vẫn là một hạt', () => {
    expect(toMoment({ ...momentRow, text: null }).text).toBeNull();
  });

  it('câu trả lời đã ghi thì đọc ra đúng', () => {
    expect(toMoment({ ...momentRow, revisit_answer: 'lighter' }).revisitAnswer).toBe('lighter');
  });
});
