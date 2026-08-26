// TimeBucket và PersonRole có nguồn gốc ở core/constants.ts — core là tầng thấp
// nhất nên nó giữ định nghĩa, shared re-export lại để phần còn lại của app không
// phải biết đường dẫn vào core. Trước đây hai chỗ khai riêng và đã bắt đầu lệch nhau.
import type { TimeBucket, PersonRole } from '@/core/constants';

export type { TimeBucket, PersonRole };

export type TimeEntrySource = 'manual' | 'calendar' | 'widget';
export type MediaType = 'photo' | 'audio';
export type GoalTier = 'identity' | 'season' | 'rhythm';
export type GoalStatus = 'active' | 'renewed' | 'expired' | 'released';
export type ExpenseSourceType = 'manual' | 'sms' | 'notification';
export type DunbarRing = 5 | 15 | 50;

/**
 * Module nào sở hữu một hàng `moment`. Khác `TimeBucket`: `bucket` nói bản ghi
 * thuộc khoang thời gian nào, `kind` nói màn hình nào được phép hiện nó.
 */
export type MomentKind = 'moment' | 'learn' | 'legacy';

/** Loại thư trong bảng `letter`. `sunday` là chỗ chừa sẵn cho M12. */
export type LetterKind = 'yearLetter' | 'eulogy' | 'sunday';

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
  kind: MomentKind;
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

export interface CreateGoalDto {
  tier: GoalTier;
  title: string;
  startedAt: string;
  expiresAt?: string;
  costMinutesPerWeek?: number;
  costAmountPerMonth?: number;
}

export interface CreateMoodDto {
  occurredAt: string;
  level: number; // 1..5
  note?: string;
}

export interface CreateHealthDto {
  date: string;
  sleepMinutes?: number;
  steps?: number;
  energySelfRated?: number; // 1..5
}

export interface CreateWeightOnMindDto {
  text: string;
  writtenAt: string;
  reviewAt: string;
}

export interface CreateItemDto {
  name: string;
  price?: number;
  purchasedAt?: string;
}

export interface CreateSpaceDto {
  type: 'pair' | 'circle';
  name: string;
  memberIds?: string[];
  sharedModules?: string[];
}

export interface CreateLetterDto {
  weekStart: string;
  body: string;
  kind: LetterKind;
}

export type OnboardingStackParamList = {
  Welcome: undefined;
  AddPeople: { roles: PersonRole[] };
  Cadence: { persons: Array<{ name: string; role: PersonRole }> };
};

/**
 * Năm tab dưới cùng. Cố tình dừng ở năm: 12 module mà bày hết ra thanh tab thì
 * không ai tìm được gì. Bốn module "xương" hay dùng nhất nằm đây, phần còn lại
 * mở từ màn Tôi.
 */
export type MainTabParamList = {
  Today: undefined;
  Money: undefined;
  Goals: undefined;
  Moments: undefined;
  Me: undefined;
};

/** Màn hình mở chồng lên từ tab Tôi, không chiếm chỗ trên thanh tab. */
export type MeStackParamList = {
  MeHome: undefined;
  Hourglass: undefined;
  Mood: undefined;
  Health: undefined;
  Connect: undefined;
  Space: undefined;
  Legacy: undefined;
  Learning: undefined;
  Items: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};
