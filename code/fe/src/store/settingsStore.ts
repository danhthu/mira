import { create } from 'zustand';

interface SettingsState {
  curfewHour: number;
  whiteDayOfWeek: number | null;
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
  setCurfewHour: (hour: number) => void;
  setWhiteDay: (day: number | null) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  curfewHour: 21,
  whiteDayOfWeek: null,
  onboardingComplete: false,
  setOnboardingComplete: (value) => set({ onboardingComplete: value }),
  setCurfewHour: (hour) => set({ curfewHour: hour }),
  setWhiteDay: (day) => set({ whiteDayOfWeek: day }),
}));
