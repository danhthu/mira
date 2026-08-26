import type { DunbarRing, TimeEntrySource } from './types/enums';

// Giá trị mặc định phải khớp DEFAULT trong 001_initial.sql: repository ghi giá trị
// tường minh cho mọi cột nên DEFAULT của DB không bao giờ được dùng tới.
export const DEFAULT_DUNBAR_RING: DunbarRing = 50;
export const DEFAULT_HOURGLASS_ENABLED = false;
export const DEFAULT_TIME_ENTRY_SOURCE: TimeEntrySource = 'manual';
