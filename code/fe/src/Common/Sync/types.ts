// Hình dạng dữ liệu đúng theo docs/09-sync-contract.md. Không đổi tên trường ở đây.

export interface SyncChange {
  table: string;
  id: string;
  /** ISO 8601, ví dụ 2026-09-05T09:00:00.000Z */
  updatedAt: string;
  /** ISO 8601, null nếu bản ghi chưa bị xoá */
  deletedAt: string | null;
  data: Record<string, unknown>;
}

export interface PulledChange extends SyncChange {
  createdAt?: string;
}

export interface OutboxEntry {
  /** Thứ tự vào hàng, để đẩy đúng trình tự người dùng đã thao tác. */
  seq: number;
  change: SyncChange;
}

export interface PushOutcome {
  id: string;
  reason: string;
}

export interface PushResponse {
  applied: string[];
  skipped: PushOutcome[];
  rejected: PushOutcome[];
  serverTime: string;
}

export interface PullResponse {
  changes: PulledChange[];
  serverTime: string;
  hasMore: boolean;
}

export interface HealthResponse {
  ok: boolean;
  db: boolean;
  time: string;
}

export interface SyncSettings {
  enabled: boolean;
  serverUrl: string;
  /** Gửi qua header X-User-Id. V1 dev chưa có xác thực thật. */
  userId: string;
}

export interface SyncStatus {
  enabled: boolean;
  running: boolean;
  /** Mili-giây epoch của vòng đồng bộ thành công gần nhất, null nếu chưa có. */
  lastSyncedAt: number | null;
  pending: number;
}

export interface SyncCycleResult {
  pushed: number;
  pulled: number;
  /** Còn lại trong hàng đợi sau vòng này. */
  pending: number;
  /** `true` khi vòng chạy trọn vẹn; `false` khi dừng giữa chừng vì mạng. */
  completed: boolean;
}

/**
 * Chỉ những gì tầng đồng bộ thật sự dùng từ `fetch`. Khai hẹp như vậy để test
 * dựng được bản giả mà không cần cả `Response` của DOM.
 */
export interface HttpResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export interface HttpRequest {
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

export type FetchLike = (url: string, init: HttpRequest) => Promise<HttpResponse>;
