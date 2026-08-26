import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  curfewHour: number;
  whiteDayOfWeek: number | null;
  lifeCountdownEnabled: boolean;
  /** ISO của lần thêm mục tiêu gần nhất, để `canAddGoalAt` biết đêm nào đã qua. */
  lastGoalAddedAt: string | null;
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
  setCurfewHour: (hour: number) => void;
  setWhiteDay: (day: number | null) => void;
  setLifeCountdownEnabled: (value: boolean) => void;
  setLastGoalAddedAt: (isoTimestamp: string) => void;
}

/** Chỉ bốn trường cấu hình được ghi xuống đĩa — xem `partialize` bên dưới. */
type PersistedSettings = Pick<
  SettingsState,
  'curfewHour' | 'whiteDayOfWeek' | 'lifeCountdownEnabled' | 'lastGoalAddedAt'
>;

export const SETTINGS_STORAGE_KEY = 'mira.settings';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      curfewHour: 21,
      whiteDayOfWeek: null,
      // Ràng buộc cứng #4: đếm ngược đời người chỉ chạy khi người dùng tự bật.
      lifeCountdownEnabled: false,
      lastGoalAddedAt: null,
      onboardingComplete: false,
      setOnboardingComplete: (value) => set({ onboardingComplete: value }),
      setCurfewHour: (hour) => set({ curfewHour: hour }),
      setWhiteDay: (day) => set({ whiteDayOfWeek: day }),
      setLifeCountdownEnabled: (value) => set({ lifeCountdownEnabled: value }),
      setLastGoalAddedAt: (isoTimestamp) => set({ lastGoalAddedAt: isoTimestamp }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // `onboardingComplete` cố tình không lưu: App.tsx tính lại từ số person
      // trong SQLite mỗi lần mở app. Lưu thêm ở đây thì hai nguồn sẽ lệch nhau,
      // và bản lưu còn về sau lần đọc DB nên có thể chớp màn onboarding sai.
      partialize: ({
        curfewHour,
        whiteDayOfWeek,
        lifeCountdownEnabled,
        lastGoalAddedAt,
      }): PersistedSettings => ({
        curfewHour,
        whiteDayOfWeek,
        lifeCountdownEnabled,
        lastGoalAddedAt,
      }),
    },
  ),
);
