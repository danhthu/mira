import { describe, it, expect } from 'vitest';
import type { IDatabase, QueryResult } from '../../../shared/interfaces/IDatabase';
import type { PersonRow } from '../../../shared/types/rows';
import { PersonRepository } from '../PersonRepository';
import { MomentRepository } from '../MomentRepository';

interface Call {
  sql: string;
  params: unknown[];
}

// Fake thay cho Postgres: trả lần lượt các hàng đã nạp sẵn và ghi lại mọi câu gọi
// để kiểm tham số repository truyền xuống.
class FakeDatabase implements IDatabase {
  readonly calls: Call[] = [];
  private readonly queue: unknown[][];

  constructor(responses: unknown[][]) {
    this.queue = [...responses];
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    this.calls.push({ sql, params });
    const rows = this.queue.shift() ?? [];
    // Fake không biết kiểu hàng thật; test tự nạp hàng đúng hình dạng.
    return { rows: rows as T[], rowCount: rows.length };
  }

  async queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return result.rows[0] ?? null;
  }

  async execute(sql: string, params: unknown[] = []): Promise<{ rowCount: number }> {
    const result = await this.query<unknown>(sql, params);
    return { rowCount: result.rowCount };
  }

  async transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T> {
    return fn(this);
  }

  async close(): Promise<void> {}
}

const existingRow: PersonRow = {
  id: 'person-1',
  name: 'Mẹ',
  role: 'parent',
  birth_year: 1962,
  distance_km: 8,
  dunbar_ring: 5,
  desired_cadence: 3,
  hourglass_enabled: false,
  created_at: '2026-08-01T00:00:00.000Z',
  updated_at: '2026-08-01T00:00:00.000Z',
  deleted_at: null,
};

describe('PersonRepository.create', () => {
  it('sinh id UUID v7 và điền mặc định cho dunbar_ring, hourglass_enabled', async () => {
    const db = new FakeDatabase([[existingRow]]);
    const repo = new PersonRepository(db);

    await repo.create({ name: 'Mẹ', role: 'parent' });

    const params = db.calls[0]?.params ?? [];
    expect(params[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(params[3]).toBeNull();
    expect(params[5]).toBe(50);
    expect(params[7]).toBe(false);
    expect(params[8]).toBe(params[9]);
  });
});

describe('PersonRepository.update', () => {
  it('giữ nguyên field không gửi lên, ghi đè field có trong DTO', async () => {
    const db = new FakeDatabase([[existingRow], [{ ...existingRow, desired_cadence: 7 }]]);
    const repo = new PersonRepository(db);

    const updated = await repo.update('person-1', { desiredCadence: 7 });

    const params = db.calls[1]?.params ?? [];
    expect(params[1]).toBe('Mẹ');
    expect(params[3]).toBe(1962);
    expect(params[6]).toBe(7);
    expect(updated?.desiredCadence).toBe(7);
  });

  it('null tường minh trong DTO xoá được giá trị cũ', async () => {
    const db = new FakeDatabase([[existingRow], [{ ...existingRow, birth_year: null }]]);
    const repo = new PersonRepository(db);

    await repo.update('person-1', { birthYear: null });

    expect(db.calls[1]?.params[3]).toBeNull();
  });

  it('trả null khi không có bản ghi', async () => {
    const db = new FakeDatabase([[]]);
    const repo = new PersonRepository(db);

    expect(await repo.update('missing', { name: 'X' })).toBeNull();
    expect(db.calls).toHaveLength(1);
  });
});

describe('MomentRepository.create', () => {
  it('ghi person_ids xuống DB dưới dạng chuỗi JSON', async () => {
    const db = new FakeDatabase([
      [
        {
          id: 'moment-1',
          occurred_at: '2026-08-25T10:00:00.000Z',
          text: null,
          media_uri: null,
          media_type: null,
          person_ids: '["person-1"]',
          bucket: null,
          created_at: '2026-08-25T10:00:00.000Z',
          updated_at: '2026-08-25T10:00:00.000Z',
          deleted_at: null,
        },
      ],
    ]);
    const repo = new MomentRepository(db);

    const moment = await repo.create({ occurredAt: '2026-08-25T10:00:00.000Z', personIds: ['person-1'] });

    expect(db.calls[0]?.params[5]).toBe('["person-1"]');
    expect(moment.personIds).toEqual(['person-1']);
  });
});
