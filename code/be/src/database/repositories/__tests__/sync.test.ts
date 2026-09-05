import { describe, it, expect } from 'vitest';
import type { SyncChange } from '../../../shared/types/sync';
import { SyncRepository } from '../SyncRepository';
import { FakeSyncDatabase } from './FakeSyncDatabase';
import { SYNC_TABLES, findSyncTable } from '../../sync/registry';

const USER = 'local-dev';

function change(overrides: Partial<SyncChange> & Pick<SyncChange, 'id' | 'updatedAt'>): SyncChange {
  return {
    table: 'person',
    deletedAt: null,
    data: { name: 'Mẹ', role: 'parent', dunbarRing: 5 },
    ...overrides,
  };
}

describe('SyncRepository.push — upsert theo updatedAt', () => {
  it('ghi bản ghi mới', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);

    const result = await repo.push(USER, [change({ id: 'p1', updatedAt: '2026-09-05T09:00:00.000Z' })]);

    expect(result.applied).toEqual(['p1']);
    expect(result.skipped).toEqual([]);
    expect(db.rows.get('person|p1')?.data['name']).toBe('Mẹ');
  });

  it('bản gửi lên mới hơn thì ghi đè', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);
    await repo.push(USER, [change({ id: 'p1', updatedAt: '2026-09-05T09:00:00.000Z' })]);

    const result = await repo.push(USER, [
      change({ id: 'p1', updatedAt: '2026-09-05T10:00:00.000Z', data: { name: 'Mẹ yêu' } }),
    ]);

    expect(result.applied).toEqual(['p1']);
    expect(db.rows.get('person|p1')?.data['name']).toBe('Mẹ yêu');
    // Gửi một phần thì cột không gửi phải giữ nguyên, không bị ghi NULL đè lên.
    expect(db.rows.get('person|p1')?.data['role']).toBe('parent');
  });

  it('bản gửi lên cũ hơn thì bỏ qua với lý do server_newer', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);
    await repo.push(USER, [change({ id: 'p1', updatedAt: '2026-09-05T10:00:00.000Z' })]);

    const result = await repo.push(USER, [
      change({ id: 'p1', updatedAt: '2026-09-05T09:00:00.000Z', data: { name: 'Bản cũ' } }),
    ]);

    expect(result.applied).toEqual([]);
    expect(result.skipped).toEqual([{ id: 'p1', reason: 'server_newer' }]);
    expect(db.rows.get('person|p1')?.data['name']).toBe('Mẹ');
  });

  it('bằng updatedAt thì vẫn ghi — hợp đồng nói "mới hơn hoặc bằng"', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);
    const at = '2026-09-05T09:00:00.000Z';
    await repo.push(USER, [change({ id: 'p1', updatedAt: at })]);

    const result = await repo.push(USER, [change({ id: 'p1', updatedAt: at, data: { name: 'Ghi đè' } })]);

    expect(result.applied).toEqual(['p1']);
    expect(db.rows.get('person|p1')?.data['name']).toBe('Ghi đè');
  });

  it('gửi lại y hệt hai lần cho cùng kết quả (idempotent)', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);
    const batch = [
      change({ id: 'p1', updatedAt: '2026-09-05T09:00:00.000Z' }),
      change({ id: 'p2', updatedAt: '2026-09-05T09:30:00.000Z', data: { name: 'Bố', role: 'parent' } }),
    ];

    const first = await repo.push(USER, batch);
    const second = await repo.push(USER, batch);

    expect(first).toEqual(second);
    expect(db.rows.size).toBe(2);
  });

  it('chuẩn hoá updatedAt về UTC để so sánh chuỗi không sai thứ tự', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);

    // 16:00+07:00 = 09:00Z, sớm hơn bản 10:00Z đang có trên server.
    await repo.push(USER, [change({ id: 'p1', updatedAt: '2026-09-05T10:00:00.000Z' })]);
    const result = await repo.push(USER, [change({ id: 'p1', updatedAt: '2026-09-05T16:00:00+07:00' })]);

    expect(result.skipped).toEqual([{ id: 'p1', reason: 'server_newer' }]);
  });
});

describe('SyncRepository.push — dữ liệu sai', () => {
  it('bảng lạ bị reject, không chạm tới DB', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);

    const result = await repo.push(USER, [
      change({ id: 'x1', updatedAt: '2026-09-05T09:00:00.000Z', table: 'pg_catalog.pg_user' }),
      change({ id: 'x2', updatedAt: '2026-09-05T09:00:00.000Z', table: 'person; DROP TABLE person' }),
    ]);

    expect(result.rejected).toEqual([
      { id: 'x1', reason: 'unknown_table' },
      { id: 'x2', reason: 'unknown_table' },
    ]);
    expect(db.statements).toEqual([]);
  });

  it('cột lạ bị bỏ qua, phần còn lại của bản ghi vẫn ghi được', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);

    const result = await repo.push(USER, [
      change({
        id: 'p1',
        updatedAt: '2026-09-05T09:00:00.000Z',
        data: { name: 'Mẹ', role: 'parent', khongCoCotNay: 'bỏ đi' },
      }),
    ]);

    expect(result.applied).toEqual(['p1']);
    expect(db.rows.get('person|p1')?.data).not.toHaveProperty('khongCoCotNay');
    expect(db.rows.get('person|p1')?.data['name']).toBe('Mẹ');
  });

  it('bảng lạ nằm giữa batch không chặn các bản ghi hợp lệ', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);

    const result = await repo.push(USER, [
      change({ id: 'p1', updatedAt: '2026-09-05T09:00:00.000Z' }),
      change({ id: 'bad', updatedAt: '2026-09-05T09:00:00.000Z', table: 'nope' }),
      change({ id: 'p2', updatedAt: '2026-09-05T09:00:00.000Z', data: { name: 'Bố', role: 'parent' } }),
    ]);

    expect(result.applied).toEqual(['p1', 'p2']);
    expect(result.rejected).toEqual([{ id: 'bad', reason: 'unknown_table' }]);
  });
});

describe('SyncRepository.push — phân vùng theo user', () => {
  it('không ghi đè bản ghi của người dùng khác', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);
    await repo.push('user-a', [change({ id: 'p1', updatedAt: '2026-09-05T09:00:00.000Z' })]);

    const result = await repo.push('user-b', [
      change({ id: 'p1', updatedAt: '2026-09-05T23:00:00.000Z', data: { name: 'Kẻ lạ' } }),
    ]);

    expect(result.applied).toEqual([]);
    expect(db.rows.get('person|p1')?.data['name']).toBe('Mẹ');
  });
});

describe('SyncRepository.pull', () => {
  async function seedPeople(repo: SyncRepository, minutes: readonly number[]): Promise<void> {
    await repo.push(
      USER,
      minutes.map((m) =>
        change({
          id: `p${m}`,
          updatedAt: `2026-09-05T09:${String(m).padStart(2, '0')}:00.000Z`,
          data: { name: `Người ${m}`, role: 'friend' },
        }),
      ),
    );
  }

  it('since rỗng lấy từ đầu, sắp theo updated_at tăng dần', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);
    await seedPeople(repo, [3, 1, 2]);

    const result = await repo.pull(USER, null, 500);

    expect(result.changes.map((c) => c.id)).toEqual(['p1', 'p2', 'p3']);
    expect(result.hasMore).toBe(false);
  });

  it('phân trang bằng watermark không bỏ sót và không lặp', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);
    await seedPeople(repo, [1, 2, 3, 4, 5]);

    const seen: string[] = [];
    let watermark: string | null = null;
    let guard = 0;
    for (;;) {
      const page: Awaited<ReturnType<SyncRepository['pull']>> = await repo.pull(USER, watermark, 2);
      seen.push(...page.changes.map((c) => c.id));
      const last = page.changes[page.changes.length - 1];
      if (!page.hasMore || last === undefined) {
        break;
      }
      watermark = last.updatedAt;
      guard += 1;
      expect(guard).toBeLessThan(10);
    }

    expect(seen).toEqual(['p1', 'p2', 'p3', 'p4', 'p5']);
    expect(new Set(seen).size).toBe(seen.length);
  });

  it('trả cả bản đã xoá mềm kèm deletedAt', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);
    await repo.push(USER, [change({ id: 'p1', updatedAt: '2026-09-05T09:00:00.000Z' })]);
    await repo.push(USER, [
      change({ id: 'p1', updatedAt: '2026-09-05T10:00:00.000Z', deletedAt: '2026-09-05T10:00:00.000Z' }),
    ]);

    const result = await repo.pull(USER, null, 500);

    expect(result.changes).toHaveLength(1);
    expect(result.changes[0]?.deletedAt).toBe('2026-09-05T10:00:00.000Z');
  });

  it('không cắt ngang nhóm cùng updated_at — trả trọn nhóm dù vượt limit', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);
    const at = '2026-09-05T09:00:00.000Z';
    await repo.push(USER, [
      change({ id: 'p1', updatedAt: at }),
      change({ id: 'p2', updatedAt: at }),
      change({ id: 'p3', updatedAt: at }),
    ]);

    const result = await repo.pull(USER, null, 2);

    expect(result.changes.map((c) => c.id)).toEqual(['p1', 'p2', 'p3']);
  });

  it('cắt trang ở ranh giới nhóm khi nhóm cuối chưa trọn', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);
    await repo.push(USER, [
      change({ id: 'p1', updatedAt: '2026-09-05T09:00:00.000Z' }),
      change({ id: 'p2', updatedAt: '2026-09-05T10:00:00.000Z' }),
      change({ id: 'p3', updatedAt: '2026-09-05T10:00:00.000Z' }),
    ]);

    const result = await repo.pull(USER, null, 2);

    expect(result.changes.map((c) => c.id)).toEqual(['p1']);
    expect(result.hasMore).toBe(true);
  });

  it('mảng JSON đi và về giữ nguyên hình dạng', async () => {
    const db = new FakeSyncDatabase();
    const repo = new SyncRepository(db);
    await repo.push(USER, [
      {
        table: 'moment',
        id: 'm1',
        updatedAt: '2026-09-05T09:00:00.000Z',
        deletedAt: null,
        data: { occurredAt: '2026-09-05T08:00:00.000Z', personIds: ['p1', 'p2'] },
      },
    ]);

    const result = await repo.pull(USER, null, 500);

    expect(result.changes[0]?.data['personIds']).toEqual(['p1', 'p2']);
  });
});

describe('registry đồng bộ', () => {
  it('khai đủ 13 bảng của hợp đồng', () => {
    expect(SYNC_TABLES.map((t) => t.table).sort()).toEqual(
      [
        'expense',
        'goal',
        'health',
        'item',
        'letter',
        'moment',
        'money',
        'mood',
        'person',
        'space',
        'time_entry',
        'weight_on_mind',
        'work_load',
      ].sort(),
    );
  });

  it('không khai lại bốn cột khung, và tên cột đều an toàn cho SQL', () => {
    for (const table of SYNC_TABLES) {
      for (const column of table.columns) {
        expect(column.column).toMatch(/^[a-z][a-z0-9_]*$/);
        expect(['id', 'user_id', 'created_at', 'updated_at', 'deleted_at']).not.toContain(
          column.column,
        );
      }
    }
  });

  it('tra bảng lạ trả null', () => {
    expect(findSyncTable('person')).not.toBeNull();
    expect(findSyncTable('migrations')).toBeNull();
  });
});
