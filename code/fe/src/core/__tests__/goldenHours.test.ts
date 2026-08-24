import { describe, it, expect } from 'vitest';
import { calculateGoldenHours, type TimeEntryInput } from '../goldenHours';
import { type TimeBucket } from '../constants';

const REF = '2024-01-07';

function makeEntry(date: string, minutes: number, bucket: TimeBucket): TimeEntryInput {
  return { date, minutes, bucket };
}

function sevenDays(minutes: number, bucket: TimeBucket): TimeEntryInput[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    return makeEntry(`2024-01-${day}`, minutes, bucket);
  });
}

describe('calculateGoldenHours', () => {
  it('returns empty when no entries at all', () => {
    expect(calculateGoldenHours([], REF)).toEqual({ status: 'empty' });
  });

  it('returns ok with correct sum for 7 days of people entries', () => {
    const entries = sevenDays(60, 'people'); // 7 × 60 min = 420 min = 7.0 h
    const result = calculateGoldenHours(entries, REF);
    expect(result).toEqual({ status: 'ok', hoursPerWeek: 7.0 });
  });

  it('sums both people and self buckets', () => {
    const entries: TimeEntryInput[] = [
      ...Array.from({ length: 4 }, (_, i) =>
        makeEntry(`2024-01-0${i + 1}`, 60, 'people'),
      ),
      ...Array.from({ length: 3 }, (_, i) =>
        makeEntry(`2024-01-0${i + 5}`, 60, 'self'),
      ),
    ];
    // 7 days, 7 × 60 = 420 min = 7.0 h
    const result = calculateGoldenHours(entries, REF);
    expect(result).toEqual({ status: 'ok', hoursPerWeek: 7.0 });
  });

  it('ignores non-golden buckets (work, health, learn, rest)', () => {
    const entries = sevenDays(120, 'work');
    const result = calculateGoldenHours(entries, REF);
    // 7 days of data, but no golden minutes → hoursPerWeek: 0
    expect(result).toEqual({ status: 'ok', hoursPerWeek: 0 });
  });

  it('returns insufficient when fewer than 7 days have entries', () => {
    const entries = Array.from({ length: 5 }, (_, i) =>
      makeEntry(`2024-01-0${i + 1}`, 60, 'people'),
    );
    const result = calculateGoldenHours(entries, REF);
    expect(result).toEqual({ status: 'insufficient', missingDays: 2 });
  });

  it('returns insufficient with missingDays 7 when all entries are outside the window', () => {
    // entries exist but all before the 7-day window
    const entries = Array.from({ length: 5 }, (_, i) =>
      makeEntry(`2023-12-${String(i + 1).padStart(2, '0')}`, 60, 'people'),
    );
    const result = calculateGoldenHours(entries, REF);
    expect(result).toEqual({ status: 'insufficient', missingDays: 7 });
  });

  it('uses referenceDate as the inclusive end of the 7-day window', () => {
    // referenceDate = 2024-01-06 → window = 2023-12-31 to 2024-01-06
    // entry on 2024-01-07 is outside the window
    const entries = sevenDays(60, 'people'); // 2024-01-01 to 2024-01-07
    const result = calculateGoldenHours(entries, '2024-01-06');
    // Only days 2024-01-01 to 2024-01-06 are in window = 6 days
    expect(result).toEqual({ status: 'insufficient', missingDays: 1 });
  });

  it('excludes entries before the 7-day window from the hour sum', () => {
    const inWindow = sevenDays(60, 'people'); // 2024-01-01 to 2024-01-07
    const outsideWindow = makeEntry('2023-12-31', 9999, 'people');
    const result = calculateGoldenHours([...inWindow, outsideWindow], REF);
    // Only the 7 in-window entries count: 7 × 60 / 60 = 7.0
    expect(result).toEqual({ status: 'ok', hoursPerWeek: 7.0 });
  });

  it('rounds to 1 decimal place', () => {
    // 7 × 65 min = 455 min → 455/60 = 7.5833… → rounds to 7.6
    const entries = sevenDays(65, 'people');
    const result = calculateGoldenHours(entries, REF);
    expect(result).toEqual({ status: 'ok', hoursPerWeek: 7.6 });
  });

  it('counts distinct dates not number of entries for the 7-day check', () => {
    // 3 entries on same day counts as 1 day
    const entries: TimeEntryInput[] = [
      makeEntry('2024-01-01', 30, 'people'),
      makeEntry('2024-01-01', 30, 'self'),
      makeEntry('2024-01-01', 30, 'people'),
      makeEntry('2024-01-02', 60, 'people'),
      makeEntry('2024-01-03', 60, 'people'),
    ];
    // Only 3 distinct dates → insufficient, missingDays = 4
    const result = calculateGoldenHours(entries, REF);
    expect(result).toEqual({ status: 'insufficient', missingDays: 4 });
  });

  it('handles multiple entries per day in the golden-hours sum', () => {
    const entries: TimeEntryInput[] = sevenDays(60, 'people');
    // Add a second 'self' entry on day 1
    entries.push(makeEntry('2024-01-01', 30, 'self'));
    // Total golden: 7×60 + 30 = 420+30 = 450 min = 7.5 h
    const result = calculateGoldenHours(entries, REF);
    expect(result).toEqual({ status: 'ok', hoursPerWeek: 7.5 });
  });

  it('returns insufficient with missingDays 1 for exactly 6 days of data', () => {
    const entries = Array.from({ length: 6 }, (_, i) =>
      makeEntry(`2024-01-0${i + 1}`, 60, 'people'),
    );
    const result = calculateGoldenHours(entries, REF);
    expect(result).toEqual({ status: 'insufficient', missingDays: 1 });
  });
});
