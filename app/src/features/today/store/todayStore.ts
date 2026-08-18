import { create } from 'zustand';
import type { Person } from '@/db/schema';

export interface PersonWithTime {
  person: Person;
  minutesToday: number;
}

interface ActiveSession {
  personId: string;
  startedAt: Date;
}

interface TodayState {
  personsWithTime: PersonWithTime[];
  activeSession: ActiveSession | null;
  isLoading: boolean;
  goldenMinutesToday: number;
  startSession: (personId: string) => void;
  stopSession: () => void;
  setPersonsWithTime: (data: PersonWithTime[]) => void;
  setLoading: (value: boolean) => void;
  setGoldenMinutes: (minutes: number) => void;
}

export const useTodayStore = create<TodayState>()((set) => ({
  personsWithTime: [],
  activeSession: null,
  isLoading: false,
  goldenMinutesToday: 0,
  startSession: (personId) =>
    set({ activeSession: { personId, startedAt: new Date() } }),
  stopSession: () => set({ activeSession: null }),
  setPersonsWithTime: (data) => set({ personsWithTime: data }),
  setLoading: (value) => set({ isLoading: value }),
  setGoldenMinutes: (minutes) => set({ goldenMinutesToday: minutes }),
}));
