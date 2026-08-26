import { create } from 'zustand';
import type { Person } from '@/db/schema';
import type { GoldenHoursResult } from '@/core/goldenHours';

export interface PersonWithTime {
  person: Person;
  minutesToday: number;
}

export interface ActiveSession {
  personId: string;
  personName: string;
  startedAt: string; // ISO — chuỗi, không phải Date, để sống sót qua reload/HMR
}

interface TodayState {
  personsWithTime: PersonWithTime[];
  allPersons: Person[];
  activeSession: ActiveSession | null;
  isLoading: boolean;
  goldenHours: GoldenHoursResult;
  startSession: (personId: string, personName: string) => void;
  stopSession: () => void;
  setPersonsWithTime: (data: PersonWithTime[]) => void;
  setAllPersons: (data: Person[]) => void;
  setLoading: (value: boolean) => void;
  setGoldenHours: (result: GoldenHoursResult) => void;
}

export const useTodayStore = create<TodayState>()((set) => ({
  personsWithTime: [],
  allPersons: [],
  activeSession: null,
  isLoading: false,
  goldenHours: { status: 'empty' },
  startSession: (personId, personName) =>
    set({
      activeSession: { personId, personName, startedAt: new Date().toISOString() },
    }),
  stopSession: () => set({ activeSession: null }),
  setPersonsWithTime: (data) => set({ personsWithTime: data }),
  setAllPersons: (data) => set({ allPersons: data }),
  setLoading: (value) => set({ isLoading: value }),
  setGoldenHours: (result) => set({ goldenHours: result }),
}));
