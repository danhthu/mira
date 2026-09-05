import type { IDatabase, QueryResult } from '../../../shared/interfaces/IDatabase';
import { findSyncTable } from '../../sync/registry';
import { WRITE_FRAME_PARAM_COUNT } from '../../sync/sql';

interface StoredRow {
  table_name: string;
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  data: Record<string, unknown>;
}

const UPDATE_HEAD = /^UPDATE ([a-z_]+) SET (.+) WHERE /;
const EXISTS_HEAD = /^SELECT 1 AS present FROM ([a-z_]+) /;
const INSERT_HEAD = /^INSERT INTO ([a-z_]+) \(([^)]+)\)/;
const INSERT_FRAME_COLUMN_COUNT = 5;

interface WriteParams {
  id: string;
  userId: string;
  updatedAt: string;
  deletedAt: string | null;
}

function readWriteParams(params: unknown[]): WriteParams {
  return {
    id: String(params[0]),
    userId: String(params[1]),
    updatedAt: String(params[2]),
    deletedAt: params[3] === null ? null : String(params[3]),
  };
}

// Fake thay Postgres cho test tầng sync: mô phỏng đúng các hành vi SyncRepository dựa
// vào — UPDATE chặn theo last-write-wins, INSERT chỉ khi chưa có, pull sắp theo
// (updated_at, bảng, id). Không mô phỏng SQL tổng quát, chỉ nhận đúng bốn câu lệnh
// mà database/sync/sql.ts sinh ra.
export class FakeSyncDatabase implements IDatabase {
  readonly rows = new Map<string, StoredRow>();
  readonly statements: string[] = [];
  lastParams: unknown[] = [];

  async query<T>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    this.statements.push(sql);
    this.lastParams = params;

    const update = UPDATE_HEAD.exec(sql);
    if (update !== null) {
      return this.applyUpdate<T>(update, sql, params);
    }
    const exists = EXISTS_HEAD.exec(sql);
    if (exists !== null) {
      const found = this.rows.has(`${String(exists[1])}|${String(params[0])}`);
      const rows: unknown[] = found ? [{ present: 1 }] : [];
      return { rows: rows as T[], rowCount: rows.length };
    }
    const insert = INSERT_HEAD.exec(sql);
    if (insert !== null) {
      return this.applyInsert<T>(insert, params);
    }
    if (sql.includes('UNION ALL')) {
      return this.applyPull<T>(params);
    }
    return { rows: [], rowCount: 0 };
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

  private applyUpdate<T>(
    head: RegExpExecArray,
    sql: string,
    params: unknown[],
  ): QueryResult<T> {
    if (!sql.includes('updated_at <= $3')) {
      throw new Error('UPDATE lost its last-write-wins guard');
    }
    const tableName = String(head[1]);
    const columnNames = String(head[2])
      .split(', ')
      .slice(2)
      .map((assignment) => assignment.split(' = ')[0] ?? '');

    const frame = readWriteParams(params);
    const key = `${tableName}|${frame.id}`;
    const existing = this.rows.get(key);
    if (
      existing === undefined ||
      existing.user_id !== frame.userId ||
      existing.updated_at > frame.updatedAt
    ) {
      return { rows: [], rowCount: 0 };
    }

    this.rows.set(key, {
      ...existing,
      updated_at: frame.updatedAt,
      deleted_at: frame.deletedAt,
      data: { ...existing.data, ...this.readColumns(tableName, columnNames, params) },
    });
    return this.oneId<T>(frame.id);
  }

  private applyInsert<T>(head: RegExpExecArray, params: unknown[]): QueryResult<T> {
    const tableName = String(head[1]);
    const columnNames = String(head[2]).split(', ').slice(INSERT_FRAME_COLUMN_COUNT);
    const frame = readWriteParams(params);
    const key = `${tableName}|${frame.id}`;
    if (this.rows.has(key)) {
      return { rows: [], rowCount: 0 };
    }

    this.rows.set(key, {
      table_name: tableName,
      id: frame.id,
      user_id: frame.userId,
      created_at: frame.updatedAt,
      updated_at: frame.updatedAt,
      deleted_at: frame.deletedAt,
      data: this.readColumns(tableName, columnNames, params),
    });
    return this.oneId<T>(frame.id);
  }

  private readColumns(
    tableName: string,
    columnNames: readonly string[],
    params: unknown[],
  ): Record<string, unknown> {
    const table = findSyncTable(tableName);
    if (table === null) {
      throw new Error(`Fake received unknown table: ${tableName}`);
    }
    const data: Record<string, unknown> = {};
    columnNames.forEach((column, index) => {
      const meta = table.columns.find((c) => c.column === column);
      if (meta === undefined) {
        throw new Error(`Fake received unknown column ${tableName}.${column}`);
      }
      data[meta.apiField] = params[WRITE_FRAME_PARAM_COUNT + index];
    });
    return data;
  }

  private oneId<T>(id: string): QueryResult<T> {
    const rows: unknown[] = [{ id }];
    return { rows: rows as T[], rowCount: 1 };
  }

  private applyPull<T>(params: unknown[]): QueryResult<T> {
    const userId = String(params[0]);
    const since = params[1] === null ? null : String(params[1]);
    const exactTimestamp = params.length === 2;

    const matched = [...this.rows.values()]
      .filter((row) => row.user_id === userId)
      .filter((row) => {
        if (since === null) {
          return true;
        }
        return exactTimestamp ? row.updated_at === since : row.updated_at > since;
      })
      .sort(
        (a, b) =>
          a.updated_at.localeCompare(b.updated_at) ||
          a.table_name.localeCompare(b.table_name) ||
          a.id.localeCompare(b.id),
      );

    const page: unknown[] = exactTimestamp ? matched : matched.slice(0, Number(params[2]));
    return { rows: page as T[], rowCount: page.length };
  }
}
