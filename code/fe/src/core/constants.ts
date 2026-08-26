export const WEEKS_IN_YEAR = 52;
export const MONTHS_IN_YEAR = 12;
export const HOURS_IN_WEEK = 168;
export const MINUTES_IN_HOUR = 60;
export const MINUTES_IN_WEEK = HOURS_IN_WEEK * MINUTES_IN_HOUR;
export const DAYS_IN_MONTH = 30;

export const DEFAULT_LIFE_EXPECTANCY = 78;
export const CHILD_INDEPENDENCE_AGE = 18;

export const MIN_DAYS_FOR_GOLDEN_HOURS = 7;
export const MIN_MONTHS_FOR_LIFE_RATE = 1; // show with warning if < 3
export const PREFERRED_MONTHS_FOR_LIFE_RATE = 3;

export const GOLDEN_BUCKETS = ['people', 'self'] as const;
export type TimeBucket = 'work' | 'health' | 'people' | 'learn' | 'rest' | 'self';
export type PersonRole = 'child' | 'parent' | 'partner' | 'friend' | 'self' | 'other';

// Nhịp gặp mặc định (lần/tháng) gợi ý theo vai trò, dùng khi người dùng chưa tự
// chọn. Phải nằm ở đây chứ không nằm trong một feature: cả onboarding lẫn màn
// Cài đặt đều tạo person, hai bên dùng khác nhau thì Đồng hồ cát tính ra 0 lần gặp.
export const DEFAULT_CADENCE: Record<PersonRole, number> = {
  child: 30,
  parent: 2,
  partner: 30,
  friend: 2,
  self: 30,
  other: 4,
};
