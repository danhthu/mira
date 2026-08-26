import { useEffect } from 'react';
import { useTodayStore } from '../store/todayStore';
import { findAllPersons } from '@/db/repositories/personRepository';
import {
  findTimeEntriesByDate,
  findTimeEntriesByDateRange,
} from '@/db/repositories/timeEntryRepository';
import { todayYMD, dateMinusDays } from '@/shared/utils/date';
import { calculateGoldenHours } from '@/core/goldenHours';
import { MIN_DAYS_FOR_GOLDEN_HOURS } from '@/core/constants';

export function useTodayData(): void {
  const { setPersonsWithTime, setAllPersons, setLoading, setGoldenHours } =
    useTodayStore();

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      try {
        const today = todayYMD();
        // R-026: cửa sổ 7 ngày, không phải chỉ hôm nay — lấy đủ dữ liệu cho
        // calculateGoldenHours tự quyết định empty/insufficient/ok theo đúng biên.
        const windowStart = dateMinusDays(today, MIN_DAYS_FOR_GOLDEN_HOURS - 1);

        const [persons, todayEntries, windowEntries] = await Promise.all([
          findAllPersons(),
          findTimeEntriesByDate(today),
          findTimeEntriesByDateRange(windowStart, today),
        ]);

        if (cancelled) return;

        const minutesByPersonId = new Map<string, number>();
        for (const entry of todayEntries) {
          if (entry.personId != null) {
            const current = minutesByPersonId.get(entry.personId) ?? 0;
            minutesByPersonId.set(entry.personId, current + entry.minutes);
          }
        }

        const personsWithTime = persons
          .filter((p) => minutesByPersonId.has(p.id))
          .map((p) => ({
            person: p,
            minutesToday: minutesByPersonId.get(p.id) ?? 0,
          }));

        const goldenHours = calculateGoldenHours(
          windowEntries.map((e) => ({
            date: e.date,
            minutes: e.minutes,
            bucket: e.bucket,
          })),
          today,
        );

        setPersonsWithTime(personsWithTime);
        setAllPersons(persons);
        setGoldenHours(goldenHours);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [setPersonsWithTime, setAllPersons, setLoading, setGoldenHours]);
}
