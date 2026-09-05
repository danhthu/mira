import type { DunbarRing, TimeEntrySource } from './types/enums';

// Giá trị mặc định phải khớp DEFAULT trong 001_initial.sql: repository ghi giá trị
// tường minh cho mọi cột nên DEFAULT của DB không bao giờ được dùng tới.
export const DEFAULT_DUNBAR_RING: DunbarRing = 50;
export const DEFAULT_HOURGLASS_ENABLED = false;
export const DEFAULT_TIME_ENTRY_SOURCE: TimeEntrySource = 'manual';

// Giới hạn đồng bộ, chốt trong docs/09-sync-contract.md.
export const SYNC_PUSH_MAX_BATCH = 500;
export const SYNC_PULL_DEFAULT_LIMIT = 500;
export const SYNC_PULL_MAX_LIMIT = 1000;

// V1 dev chưa có xác thực thật: server phân vùng dữ liệu theo header X-User-Id.
export const USER_ID_HEADER = 'X-User-Id';
export const DEFAULT_USER_ID = 'local-dev';

export const DEFAULT_HTTP_PORT = 3000;
