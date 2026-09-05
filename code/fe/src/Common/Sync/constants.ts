/** 13 bảng được đồng bộ theo docs/09-sync-contract.md, mục "Bảng được đồng bộ". */
export const SYNCED_TABLES: readonly string[] = [
  'person',
  'time_entry',
  'work_load',
  'money',
  'expense',
  'goal',
  'moment',
  'health',
  'mood',
  'weight_on_mind',
  'item',
  'space',
  'letter',
];

export function isSyncedTable(table: string): boolean {
  return SYNCED_TABLES.indexOf(table) >= 0;
}

export const STORAGE_KEY_OUTBOX = 'sync_outbox';
export const STORAGE_KEY_WATERMARK = 'sync_watermark';
export const STORAGE_KEY_SETTINGS = 'sync_settings';

export const DEFAULT_SERVER_URL = 'http://127.0.0.1:3000';
export const DEFAULT_USER_ID = 'local-dev';

/** Hợp đồng: một batch tối đa 500 bản ghi, vượt thì server trả 413. */
export const PUSH_BATCH_SIZE = 500;
/** Hợp đồng: limit mặc định 500, tối đa 1000. */
export const PULL_PAGE_SIZE = 500;

/**
 * Trần hàng đợi. Người dùng tắt sync nhiều tháng vẫn ghi cục bộ bình thường, nhưng
 * hàng đợi không được phình vô hạn trong AsyncStorage. Chạm trần thì bỏ mục cũ nhất.
 */
export const MAX_OUTBOX_ENTRIES = 5000;

export const REQUEST_TIMEOUT_MS = 10000;

/** Sau mỗi lần ghi, chờ chừng này rồi mới chạy một vòng — gộp nhiều lần gõ liên tiếp. */
export const WRITE_DEBOUNCE_MS = 4000;

/** Lùi dần khi thất bại: 5 giây, 15 giây, 1 phút, 5 phút, 15 phút. Không có timer chạy nền. */
export const BACKOFF_STEPS_MS: readonly number[] = [5000, 15000, 60000, 300000, 900000];
