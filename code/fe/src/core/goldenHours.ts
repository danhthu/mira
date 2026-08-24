import { MIN_DAYS_FOR_GOLDEN_HOURS, MINUTES_IN_HOUR, type TimeBucket } from './constants';

export interface TimeEntryInput {
  date: string;     // YYYY-MM-DD
  minutes: number;  // integer
  bucket: TimeBucket;
}

export type GoldenHoursResult =
  | { status: 'ok'; hoursPerWeek: number }
  | { status: 'insufficient'; missingDays: number }
  | { status: 'empty' };

function dateMinusDays(dateStr: string, days: number): string {
  const ms = new Date(dateStr + 'T00:00:00Z').getTime() - days * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

export function calculateGoldenHours(
  entries: TimeEntryInput[],
  referenceDate: string,
): GoldenHoursResult {
  if (entries.length === 0) {
    return { status: 'empty' };
  }

  const startDate = dateMinusDays(referenceDate, MIN_DAYS_FOR_GOLDEN_HOURS - 1);
  const windowEntries = entries.filter(e => e.date >= startDate && e.date <= referenceDate);

  const distinctDates = new Set(windowEntries.map(e => e.date));
  const daysWithData = distinctDates.size;

  if (daysWithData < MIN_DAYS_FOR_GOLDEN_HOURS) {
    return { status: 'insufficient', missingDays: MIN_DAYS_FOR_GOLDEN_HOURS - daysWithData };
  }

  const goldenMinutes = windowEntries
    .filter(e => e.bucket === 'people' || e.bucket === 'self')
    .reduce((sum, e) => sum + e.minutes, 0);

  return {
    status: 'ok',
    hoursPerWeek: Math.round((goldenMinutes / MINUTES_IN_HOUR) * 10) / 10,
  };
}
