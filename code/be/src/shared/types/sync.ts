// Hình dạng dữ liệu của hợp đồng đồng bộ (docs/09-sync-contract.md).
// Tầng shared chỉ khai kiểu; implementation nằm ở database/ và http/.

export type SyncValue = string | number | boolean | null | readonly string[];

export interface SyncChange {
  table: string;
  id: string;
  updatedAt: string;
  deletedAt: string | null;
  data: Readonly<Record<string, SyncValue>>;
}

export interface PulledChange extends SyncChange {
  createdAt: string;
}

export type PushSkipReason = 'server_newer';
export type PushRejectReason = 'unknown_table' | 'write_failed';

export interface PushSkipped {
  id: string;
  reason: PushSkipReason;
}

export interface PushRejected {
  id: string;
  reason: PushRejectReason;
}

export interface PushResult {
  applied: string[];
  skipped: PushSkipped[];
  rejected: PushRejected[];
}

export interface PullResult {
  changes: PulledChange[];
  hasMore: boolean;
}
