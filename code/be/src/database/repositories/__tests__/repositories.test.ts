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
  it('hạt muối được hẹn hỏi lại đúng 42 ngày sau', async () => {
    const db = new FakeDatabase([
      [
        {
          id: 'moment-1',
          date: '2026-08-25',
          kind: 'salt',
          text: 'Ngay nang',
          revisit_at: '2026-10-06',
          revisit_answer: null,
          created_at: '2026-08-25T10:00:00.000Z',
          updated_at: '2026-08-25T10:00:00.000Z',
          deleted_at: null,
        },
      ],
    ]);
    const repo = new MomentRepository(db);

    const moment = await repo.create('u-1', { date: '2026-08-25', kind: 'salt', text: 'Ngay nang' });

    // INSERT gio la (id, user_id, date, kind, text, revisit_at, ...) nen revisit_at o index 5.
    expect(db.calls[0]?.params[1]).toBe('u-1');
    expect(db.calls[0]?.params[5]).toBe('2026-10-06');
    expect(moment.revisitAt).toBe('2026-10-06');
  });

  it('vien keo khong co hen hoi lai', async () => {
    const db = new FakeDatabase([
      [
        {
          id: 'moment-2',
          date: '2026-08-25',
          kind: 'candy',
          text: null,
          revisit_at: null,
          revisit_answer: null,
          created_at: '2026-08-25T10:00:00.000Z',
          updated_at: '2026-08-25T10:00:00.000Z',
          deleted_at: null,
        },
      ],
    ]);
    const repo = new MomentRepository(db);

    const moment = await repo.create('u-1', { date: '2026-08-25', kind: 'candy' });

    expect(db.calls[0]?.params[5]).toBeNull();
    expect(moment.revisitAt).toBeNull();
    // Hat khong chu van la mot hat.
    expect(moment.text).toBeNull();
  });
});

describe('MomentRepository.update', () => {
  // Thứ tự tham số của câu UPDATE: [id, text, kind, revisit_at, updated_at, user_id].
  const I_KIND = 2;
  const I_HEN = 3;

  it('⚑ đổi kẹo → muối thì ĐẶT hẹn hỏi lại, tính từ ngày của hạt', async () => {
    // Không phải tính từ hôm nay. Hạt thuộc về ngày 25/8; 42 ngày sau là 6/10. Lấy mốc
    // từ hôm nay thì một hạt ghi cho tháng trước sẽ bị hỏi lại muộn đúng bằng số ngày
    // người dùng ghi chậm.
    const db = new FakeDatabase([
      [
      {
        id: 'moment-9',
        date: '2026-08-25',
        kind: 'candy',
        text: 'Ngay vui',
        revisit_at: null,
        revisit_answer: null,
        created_at: '2026-08-25T10:00:00.000Z',
        updated_at: '2026-08-25T10:00:00.000Z',
        deleted_at: null,
      },
      ],
      [
      {
        id: 'moment-9',
        date: '2026-08-25',
        kind: 'salt',
        text: 'Ngay vui',
        revisit_at: '2026-10-06',
        revisit_answer: null,
        created_at: '2026-08-25T10:00:00.000Z',
        updated_at: '2026-08-25T10:00:00.000Z',
        deleted_at: null,
      },
      ],
    ]);
    const repo = new MomentRepository(db);

    const ra = await repo.update('u-1', 'moment-9', { kind: 'salt' });

    expect(db.calls[1]?.params[I_KIND]).toBe('salt');
    expect(db.calls[1]?.params[I_HEN]).toBe('2026-10-06');
    expect(ra?.revisitAt).toBe('2026-10-06');
  });

  it('⚑ đổi muối → kẹo thì BỎ hẹn hỏi lại', async () => {
    // Giữ nguyên hẹn cũ sẽ để lại một cái hẹn mồ côi, và Mira sẽ hỏi lại một ngày vui
    // như thể nó là một ngày nặng.
    const db = new FakeDatabase([
      [
      {
        id: 'moment-9',
        date: '2026-08-25',
        kind: 'salt',
        text: 'Ngay nang',
        revisit_at: '2026-10-06',
        revisit_answer: null,
        created_at: '2026-08-25T10:00:00.000Z',
        updated_at: '2026-08-25T10:00:00.000Z',
        deleted_at: null,
      },
      ],
      [
      {
        id: 'moment-9',
        date: '2026-08-25',
        kind: 'candy',
        text: 'Ngay nang',
        revisit_at: null,
        revisit_answer: null,
        created_at: '2026-08-25T10:00:00.000Z',
        updated_at: '2026-08-25T10:00:00.000Z',
        deleted_at: null,
      },
      ],
    ]);
    const repo = new MomentRepository(db);

    const ra = await repo.update('u-1', 'moment-9', { kind: 'candy' });

    expect(db.calls[1]?.params[I_KIND]).toBe('candy');
    expect(db.calls[1]?.params[I_HEN]).toBeNull();
    expect(ra?.revisitAt).toBeNull();
  });

  it('sửa mỗi chữ thì giữ nguyên hẹn đã hứa', async () => {
    const db = new FakeDatabase([
      [
      {
        id: 'moment-9',
        date: '2026-08-25',
        kind: 'salt',
        text: 'Ngay nang',
        revisit_at: '2026-10-06',
        revisit_answer: null,
        created_at: '2026-08-25T10:00:00.000Z',
        updated_at: '2026-08-25T10:00:00.000Z',
        deleted_at: null,
      },
      ],
      [
      {
        id: 'moment-9',
        date: '2026-08-25',
        kind: 'salt',
        text: 'Ngay nang lam',
        revisit_at: '2026-10-06',
        revisit_answer: null,
        created_at: '2026-08-25T10:00:00.000Z',
        updated_at: '2026-08-25T10:00:00.000Z',
        deleted_at: null,
      },
      ],
    ]);
    const repo = new MomentRepository(db);

    await repo.update('u-1', 'moment-9', { text: 'Ngay nang lam' });

    expect(db.calls[1]?.params[1]).toBe('Ngay nang lam');
    expect(db.calls[1]?.params[I_HEN]).toBe('2026-10-06');
  });

  it('hạt không tồn tại thì trả null, không gọi UPDATE', async () => {
    const db = new FakeDatabase([[]]);
    const repo = new MomentRepository(db);

    expect(await repo.update('u-1', 'khong-co', { text: 'x' })).toBeNull();
    expect(db.calls).toHaveLength(1);
  });
});
