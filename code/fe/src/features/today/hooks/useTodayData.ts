import { useEffect } from 'react';
import { useTodayStore } from '../store/todayStore';
import { findAllPersons } from '@/db/repositories/personRepository';
import {
  findTimeEntriesByDate,
  findGoldenHoursEntries,
} from '@/db/repositories/timeEntryRepository';
import { todayYMD } from '@/shared/utils/date';

export function useTodayData(): void {
  const { setPersonsWithTime, setLoading, setGoldenMinutes } = useTodayStore();

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      try {
        const today = todayYMD();
        const [persons, todayEntries, goldenEntries] = await Promise.all([
          findAllPersons(),
          findTimeEntriesByDate(today),
          findGoldenHoursEntries(today, today),
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

        const totalGoldenMinutes = goldenEntries.reduce(
          (sum, e) => sum + e.minutes,
          0,
        );

        setPersonsWithTime(personsWithTime);
        setGoldenMinutes(totalGoldenMinutes);
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
  }, [setPersonsWithTime, setLoading, setGoldenMinutes]);
}
