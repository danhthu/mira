import {
  FetchLike,
  HttpResponse,
  PulledChange,
  SyncChange,
} from '../../src/Common/Sync/types';

function jsonResponse(body: unknown): HttpResponse {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  };
}

/**
 * Server giả cho test: giữ bản ghi trong bộ nhớ, xử lý push/pull đúng như
 * docs/09-sync-contract.md mô tả. `online = false` mô phỏng mất mạng — `fetch`
 * ném lỗi y như khi không với tới được máy chủ.
 */
export class FakeSyncServer {
  online = true;
  pushCalls = 0;
  pullCalls = 0;
  readonly rows = new Map<string, PulledChange>();

  private key(table: string, id: string): string {
    return table + ':' + id;
  }

  /** Đặt sẵn một bản ghi trên server, như thể máy khác đã đẩy lên. */
  seed(change: PulledChange): void {
    this.rows.set(this.key(change.table, change.id), change);
  }

  get(table: string, id: string): PulledChange | undefined {
    return this.rows.get(this.key(table, id));
  }

  readonly fetch: FetchLike = (url, init) => {
    if (!this.online) {
      return Promise.reject(new Error('Network request failed'));
    }

    if (url.indexOf('/sync/push') >= 0) {
      this.pushCalls += 1;
      const body = JSON.parse(init.body || '{}') as { changes?: SyncChange[] };
      const changes = body.changes || [];
      const applied: string[] = [];
      const skipped: Array<{ id: string; reason: string }> = [];

      changes.forEach((change) => {
        const existing = this.get(change.table, change.id);
        if (existing && Date.parse(existing.updatedAt) > Date.parse(change.updatedAt)) {
          skipped.push({ id: change.id, reason: 'server_newer' });
          return;
        }
        this.rows.set(this.key(change.table, change.id), { ...change });
        applied.push(change.id);
      });

      return Promise.resolve(
        jsonResponse({
          applied,
          skipped,
          rejected: [],
          serverTime: new Date().toISOString(),
        }),
      );
    }

    if (url.indexOf('/sync/pull') >= 0) {
      this.pullCalls += 1;
      const since = /since=([^&]*)/.exec(url);
      const sinceMs = since ? Date.parse(decodeURIComponent(since[1])) : 0;
      const changes = Array.from(this.rows.values())
        .filter((row) => Date.parse(row.updatedAt) > sinceMs)
        .sort((a, b) => Date.parse(a.updatedAt) - Date.parse(b.updatedAt));

      return Promise.resolve(
        jsonResponse({
          changes,
          serverTime: new Date().toISOString(),
          hasMore: false,
        }),
      );
    }

    return Promise.resolve(
      jsonResponse({ ok: true, db: true, time: new Date().toISOString() }),
    );
  };
}
