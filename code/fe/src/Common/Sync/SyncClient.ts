import { PULL_PAGE_SIZE, REQUEST_TIMEOUT_MS } from './constants';
import {
  FetchLike,
  HealthResponse,
  HttpResponse,
  PullResponse,
  PulledChange,
  PushResponse,
  SyncChange,
} from './types';

/**
 * Server không với tới được, hoặc trả về thứ không đọc nổi. Vòng đồng bộ bắt lỗi
 * này để lùi dần và giữ nguyên hàng đợi — không phải lỗi người dùng, không báo ra UI.
 */
export class SyncUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyncUnavailableError';
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new SyncUnavailableError('Sync response is not an object');
  }
  return value as Record<string, unknown>;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function asOutcomes(value: unknown): Array<{ id: string; reason: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : null))
    .filter((item): item is Record<string, unknown> => item !== null)
    .filter((item) => typeof item.id === 'string')
    .map((item) => ({
      id: item.id as string,
      reason: typeof item.reason === 'string' ? item.reason : 'unknown',
    }));
}

function asPulledChange(value: unknown): PulledChange | null {
  if (typeof value !== 'object' || value === null) return null;
  const row = value as Record<string, unknown>;
  if (typeof row.table !== 'string' || typeof row.id !== 'string') return null;
  if (typeof row.updatedAt !== 'string') return null;
  return {
    table: row.table,
    id: row.id,
    updatedAt: row.updatedAt,
    deletedAt: typeof row.deletedAt === 'string' ? row.deletedAt : null,
    createdAt: typeof row.createdAt === 'string' ? row.createdAt : undefined,
    data:
      typeof row.data === 'object' && row.data !== null
        ? (row.data as Record<string, unknown>)
        : {},
  };
}

function defaultFetch(url: string, init: Parameters<FetchLike>[1]): Promise<HttpResponse> {
  const globalFetch = (globalThis as { fetch?: typeof fetch }).fetch;
  if (!globalFetch) {
    return Promise.reject(new SyncUnavailableError('fetch is not available on this platform'));
  }
  return globalFetch(url, init as RequestInit);
}

export class SyncClient {
  constructor(
    private readonly baseUrl: string,
    private readonly userId: string,
    private readonly fetchImpl: FetchLike = defaultFetch,
  ) {}

  private async request(path: string, method: string, body?: unknown): Promise<unknown> {
    const url = this.baseUrl.replace(/\/+$/, '') + path;
    const controller =
      typeof AbortController === 'function' ? new AbortController() : undefined;
    const timer = controller
      ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      : undefined;

    let response: HttpResponse;
    try {
      response = await this.fetchImpl(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': this.userId,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller ? controller.signal : undefined,
      });
    } catch (cause) {
      // Mất mạng, DNS hỏng, server chưa bật, quá hạn chờ — cùng một cách xử lý:
      // đổi thành SyncUnavailableError để vòng đồng bộ giữ hàng đợi và lùi dần.
      throw new SyncUnavailableError(
        'Sync request failed: ' + (cause instanceof Error ? cause.message : String(cause)),
      );
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }

    if (!response.ok) {
      throw new SyncUnavailableError('Sync request returned HTTP ' + response.status);
    }

    try {
      return await response.json();
    } catch (cause) {
      throw new SyncUnavailableError(
        'Sync response is not valid JSON: ' +
          (cause instanceof Error ? cause.message : String(cause)),
      );
    }
  }

  async health(): Promise<HealthResponse> {
    const body = asRecord(await this.request('/health', 'GET'));
    return {
      ok: body.ok === true,
      db: body.db === true,
      time: typeof body.time === 'string' ? body.time : new Date().toISOString(),
    };
  }

  async push(changes: SyncChange[]): Promise<PushResponse> {
    const body = asRecord(await this.request('/sync/push', 'POST', { changes }));
    return {
      applied: asStringArray(body.applied),
      skipped: asOutcomes(body.skipped),
      rejected: asOutcomes(body.rejected),
      serverTime:
        typeof body.serverTime === 'string' ? body.serverTime : new Date().toISOString(),
    };
  }

  async pull(since: string | null, limit: number = PULL_PAGE_SIZE): Promise<PullResponse> {
    const params = since
      ? '?since=' + encodeURIComponent(since) + '&limit=' + limit
      : '?limit=' + limit;
    const body = asRecord(await this.request('/sync/pull' + params, 'GET'));
    const raw = Array.isArray(body.changes) ? body.changes : [];
    return {
      changes: raw
        .map(asPulledChange)
        .filter((c): c is PulledChange => c !== null),
      serverTime:
        typeof body.serverTime === 'string' ? body.serverTime : new Date().toISOString(),
      hasMore: body.hasMore === true,
    };
  }
}
