import { describe, it, expect } from 'vitest';
import {
  daysBetween,
  findLastMetDate,
  groupByRing,
  pickMeetingSuggestion,
  toExpectedIntervalDays,
} from '../logic/relationship';
import type { RelationshipStatus } from '../logic/relationship';
import type { Person, TimeEntry } from '@/db/schema';

function makePerson(overrides: Partial<Person> = {}): Person {
  return {
    id: 'p1',
    name: 'Mai',
    role: 'friend',
    birthYear: null,
    distanceKm: null,
    dunbarRing: 50,
    desiredCadence: null,
    hourglassEnabled: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
    ...overrides,
  };
}

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 't1',
    date: '2026-08-01',
    minutes: 60,
    bucket: 'people',
    personId: 'p1',
    note: null,
    source: 'manual',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    deletedAt: null,
    ...overrides,
  };
}

function makeStatus(
  person: Person,
  daysSinceLastMet: number | null,
  expectedIntervalDays: number | null,
): RelationshipStatus {
  return { person, daysSinceLastMet, expectedIntervalDays };
}

describe('findLastMetDate', () => {
  it('trả về ngày mới nhất trong các mục bucket people', () => {
    const entries = [
      makeEntry({ id: 'a', date: '2026-08-01' }),
      makeEntry({ id: 'b', date: '2026-08-20' }),
      makeEntry({ id: 'c', date: '2026-08-10' }),
    ];
    expect(findLastMetDate(entries)).toBe('2026-08-20');
  });

  it('bỏ qua bucket khác people', () => {
    const entries = [
      makeEntry({ id: 'a', date: '2026-08-25', bucket: 'work' }),
      makeEntry({ id: 'b', date: '2026-08-02' }),
    ];
    expect(findLastMetDate(entries)).toBe('2026-08-02');
  });

  it('trả về null khi chưa có mục nào', () => {
    expect(findLastMetDate([])).toBeNull();
  });
});

describe('daysBetween', () => {
  it('đếm số ngày giữa hai mốc', () => {
    expect(daysBetween('2026-08-01', '2026-08-25')).toBe(24);
  });

  it('trả về 0 khi cùng ngày', () => {
    expect(daysBetween('2026-08-25', '2026-08-25')).toBe(0);
  });
});

describe('toExpectedIntervalDays', () => {
  it('đổi lần/tháng thành số ngày giữa hai lần gặp', () => {
    expect(toExpectedIntervalDays(2)).toBe(15);
    expect(toExpectedIntervalDays(30)).toBe(1);
  });

  it('trả về null khi chưa chọn nhịp', () => {
    expect(toExpectedIntervalDays(null)).toBeNull();
    expect(toExpectedIntervalDays(0)).toBeNull();
  });
});

describe('pickMeetingSuggestion', () => {
  it('chọn người vượt nhịp mong muốn nhiều nhất', () => {
    const near = makeStatus(makePerson({ id: 'a' }), 20, 15);
    const far = makeStatus(makePerson({ id: 'b' }), 60, 15);
    expect(pickMeetingSuggestion([near, far])?.person.id).toBe('b');
  });

  it('không gợi ý ai khi mọi người còn trong nhịp', () => {
    const inRhythm = makeStatus(makePerson({ id: 'a' }), 5, 15);
    expect(pickMeetingSuggestion([inRhythm])).toBeNull();
  });

  it('bỏ qua người chưa có lần gặp nào hoặc chưa chọn nhịp', () => {
    const neverMet = makeStatus(makePerson({ id: 'a' }), null, 15);
    const noCadence = makeStatus(makePerson({ id: 'b' }), 99, null);
    expect(pickMeetingSuggestion([neverMet, noCadence])).toBeNull();
  });
});

describe('groupByRing', () => {
  it('gom theo 5/15/50 và bỏ vòng rỗng', () => {
    const statuses = [
      makeStatus(makePerson({ id: 'a', dunbarRing: 5 }), null, null),
      makeStatus(makePerson({ id: 'b', dunbarRing: 50 }), null, null),
    ];
    const groups = groupByRing(statuses);
    expect(groups.map((g) => g.ring)).toEqual([5, 50]);
  });

  it('gom giá trị vòng lạ về vòng ngoài', () => {
    const statuses = [
      makeStatus(makePerson({ id: 'a', dunbarRing: 7 }), null, null),
    ];
    const groups = groupByRing(statuses);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.ring).toBe(50);
  });

  it('giữ nguyên thứ tự đầu vào, không sắp theo số ngày chưa gặp', () => {
    const statuses = [
      makeStatus(makePerson({ id: 'a', dunbarRing: 5 }), 2, 15),
      makeStatus(makePerson({ id: 'b', dunbarRing: 5 }), 300, 15),
      makeStatus(makePerson({ id: 'c', dunbarRing: 5 }), 40, 15),
    ];
    expect(groupByRing(statuses)[0]?.members.map((m) => m.person.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});
