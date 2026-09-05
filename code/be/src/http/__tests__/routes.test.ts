import { describe, it, expect } from 'vitest';
import { SYNC_PUSH_MAX_BATCH } from '../../shared/constants';
import { FakeSyncDatabase } from '../../database/repositories/__tests__/FakeSyncDatabase';
import { createApp } from '../app';

function person(id: string, updatedAt: string): unknown {
  return {
    table: 'person',
    id,
    updatedAt,
    deletedAt: null,
    data: { name: 'Mẹ', role: 'parent', dunbarRing: 5 },
  };
}

function pushRequest(body: unknown, userId = 'local-dev'): Request {
  return new Request('http://127.0.0.1/sync/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Id': userId },
    body: JSON.stringify(body),
  });
}

describe('GET /health', () => {
  it('báo db: true khi truy vấn được', async () => {
    const app = createApp(new FakeSyncDatabase());

    const res = await app.request('http://127.0.0.1/health');
    const body: unknown = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ ok: true, db: true });
    expect(body).toHaveProperty('time');
  });
});

describe('POST /sync/push', () => {
  it('trả applied và serverTime', async () => {
    const app = createApp(new FakeSyncDatabase());

    const res = await app.request(
      pushRequest({ changes: [person('p1', '2026-09-05T09:00:00.000Z')] }),
    );
    const body: unknown = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ applied: ['p1'], skipped: [], rejected: [] });
    expect(body).toHaveProperty('serverTime');
  });

  it('vượt 500 bản ghi trả 413', async () => {
    const app = createApp(new FakeSyncDatabase());
    const changes = Array.from({ length: SYNC_PUSH_MAX_BATCH + 1 }, (_v, i) =>
      person(`p${i}`, '2026-09-05T09:00:00.000Z'),
    );

    const res = await app.request(pushRequest({ changes }));

    expect(res.status).toBe(413);
    expect(await res.json()).toMatchObject({ error: 'batch_too_large', max: SYNC_PUSH_MAX_BATCH });
  });

  it('đúng 500 bản ghi vẫn nhận', async () => {
    const app = createApp(new FakeSyncDatabase());
    const changes = Array.from({ length: SYNC_PUSH_MAX_BATCH }, (_v, i) =>
      person(`p${i}`, '2026-09-05T09:00:00.000Z'),
    );

    const res = await app.request(pushRequest({ changes }));

    expect(res.status).toBe(200);
  });

  it('bảng lạ trả 200 kèm rejected, không phải lỗi HTTP', async () => {
    const app = createApp(new FakeSyncDatabase());

    const res = await app.request(
      pushRequest({
        changes: [{ ...(person('x1', '2026-09-05T09:00:00.000Z') as object), table: 'secrets' }],
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      applied: [],
      rejected: [{ id: 'x1', reason: 'unknown_table' }],
    });
  });

  it('updatedAt không phải ISO trả 400', async () => {
    const app = createApp(new FakeSyncDatabase());

    const res = await app.request(pushRequest({ changes: [person('p1', 'hôm qua')] }));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'invalid_body' });
  });

  it('JSON hỏng trả 400', async () => {
    const app = createApp(new FakeSyncDatabase());

    const res = await app.request(
      new Request('http://127.0.0.1/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ khong phai json',
      }),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'invalid_json' });
  });
});

describe('GET /sync/pull', () => {
  it('lấy lại đúng bản vừa push', async () => {
    const app = createApp(new FakeSyncDatabase());
    await app.request(pushRequest({ changes: [person('p1', '2026-09-05T09:00:00.000Z')] }));

    const res = await app.request('http://127.0.0.1/sync/pull');
    const body = (await res.json()) as { changes: { id: string }[]; hasMore: boolean };

    expect(res.status).toBe(200);
    expect(body.changes.map((c) => c.id)).toEqual(['p1']);
    expect(body.hasMore).toBe(false);
  });

  it('phân vùng theo X-User-Id', async () => {
    const app = createApp(new FakeSyncDatabase());
    await app.request(pushRequest({ changes: [person('p1', '2026-09-05T09:00:00.000Z')] }, 'user-a'));

    const res = await app.request(
      new Request('http://127.0.0.1/sync/pull', { headers: { 'X-User-Id': 'user-b' } }),
    );
    const body = (await res.json()) as { changes: unknown[] };

    expect(body.changes).toEqual([]);
  });

  it('since không phải ISO trả 400', async () => {
    const app = createApp(new FakeSyncDatabase());

    const res = await app.request('http://127.0.0.1/sync/pull?since=không-phải-ngày');

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'invalid_query' });
  });

  it('limit vượt 1000 bị kẹp xuống 1000', async () => {
    const db = new FakeSyncDatabase();
    const app = createApp(db);

    await app.request('http://127.0.0.1/sync/pull?limit=99999');

    // Repository lấy dư một hàng để dò hasMore, nên tham số xuống DB là 1000 + 1.
    const pullCall = db.statements.find((s) => s.includes('UNION ALL'));
    expect(pullCall).toBeDefined();
    expect(db.lastParams[2]).toBe(1001);
  });
});
