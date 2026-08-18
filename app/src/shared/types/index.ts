export type PersonRole = 'child' | 'parent' | 'partner' | 'friend' | 'self' | 'other';
export type TimeBucket = 'work' | 'health' | 'people' | 'learn' | 'rest' | 'self';
export type TimeEntrySource = 'manual' | 'calendar' | 'widget';
export type MediaType = 'photo' | 'audio';
export type GoalTier = 'identity' | 'season' | 'rhythm';
export type GoalStatus = 'active' | 'renewed' | 'expired' | 'released';
export type ExpenseSourceType = 'manual' | 'sms' | 'notification';
export type DunbarRing = 5 | 15 | 50;

export interface CreatePersonDto {
  name: string;
  role: PersonRole;
  birthYear?: number;
  distanceKm?: number;
  dunbarRing?: DunbarRing;
  desiredCadence?: number;
}

export interface CreateTimeEntryDto {
  date: string;
  minutes: number;
  bucket: TimeBucket;
  personId?: string;
  note?: string;
  source?: TimeEntrySource;
}

export interface CreateMomentDto {
  occurredAt: string;
  text?: string;
  mediaUri?: string;
  mediaType?: MediaType;
  personIds?: string[];
  bucket?: TimeBucket;
}

export interface CreateWorkLoadDto {
  weekStart: string;
  workMinutes: number;
  commuteMinutes: number;
  prepMinutes: number;
  recoveryMinutes: number;
}

export interface CreateMoneyDto {
  month: string;
  netIncome: number;
  monthlyExpense: number;
  netWorth: number;
  debt: number;
}

export interface CreateExpenseDto {
  occurredAt: string;
  amount: number;
  description: string;
  bucket?: string;
  sourceType?: ExpenseSourceType;
}

export type OnboardingStackParamList = {
  Welcome: undefined;
  AddPeople: { roles: PersonRole[] };
  Cadence: { persons: Array<{ name: string; role: PersonRole }> };
};

export type MainTabParamList = {
  Today: undefined;
  Hourglass: undefined;
  Moments: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};
