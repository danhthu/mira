import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type {
  PullResult,
  PulledChange,
  PushRejected,
  PushResult,
  PushSkipped,
  SyncChange,
  SyncValue,
} from '../../shared/types/sync';
import { findSyncTable } from '../sync/registry';
import type { SyncColumn, SyncTable } from '../sync/registry';
import {
  PULL_AT_TIMESTAMP_SQL,
  PULL_SQL,
  buildExistsSql,
  buildInsertSql,
  buildUpdateSql,
} from '../sync/sql';

interface SyncRow {
  table_name: string;
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  data: Record<string, unknown>;
}

// updated_at lưu dạng TEXT nên Postgres so sánh theo thứ tự chuỗi. Chỉ đúng bằng
// thứ tự thời gian khi mọi mốc cùng một dạng chuẩn hoá — ép về UTC ISO ở đây.
function toCanonicalIso(value: string): string {
  const parsed = new Date(value);
  const time = parsed.getTime();
  if (Number.isNaN(time)) {
    throw new Error(`Invalid ISO timestamp: ${value}`);
  }
  return parsed.toISOString();
}

function encodeValue(column: SyncColumn, value: SyncValue): string | number | boolean | null {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  if (!column.isJson) {
    throw new Error(`Column ${column.column} does not accept an array value`);
  }
  return JSON.stringify(value);
}

function decodeValue(column: SyncColumn, raw: unknown): SyncValue {
  if (raw === null || raw === undefined) {
    return null;
  }
  if (column.isJson) {
    if (typeof raw !== 'string') {
      throw new Error(`Column ${column.column} should hold JSON text`);
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error(`Column ${column.column} is not a JSON array`);
    }
    const items: unknown[] = parsed;
    const strings = items.filter((item): item is string => typeof item === 'string');
    if (strings.length !== items.length) {
      throw new Error(`Column ${column.column} holds a non-string array element`);
    }
    return strings;
  }
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return raw;
  }
  throw new Error(`Unsupported value type in column ${column.column}`);
}

function decodeRow(row: SyncRow): PulledChange {
  const table = findSyncTable(row.table_name);
  if (table === null) {
    throw new Error(`Pull returned unknown table: ${row.table_name}`);
  }
  const data: Record<string, SyncValue> = {};
  for (const column of table.columns) {
    data[column.apiField] = decodeValue(column, row.data[column.apiField]);
  }
  return {
    table: table.table,
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    data,
  };
}

// Một repository cho cả 13 bảng: đồng bộ không quan tâm ngữ nghĩa từng bảng, nó chỉ
// đẩy/kéo hàng theo id/updated_at/deleted_at. Tên bảng và cột luôn tra qua registry.
export class SyncRepository {
  constructor(private readonly db: IDatabase) {}

  async push(userId: string, changes: readonly SyncChange[]): Promise<PushResult> {
    const applied: string[] = [];
    const skipped: PushSkipped[] = [];
    const rejected: PushRejected[] = [];

    await this.db.transaction(async (tx) => {
      for (const change of changes) {
        const table = findSyncTable(change.table);
        if (table === null) {
          rejected.push({ id: change.id, reason: 'unknown_table' });
          continue;
        }
        // SAVEPOINT để một bản ghi sai dữ liệu chỉ tự nó bị loại. Cả batch vẫn nằm
        // trong một transaction nên lỗi hạ tầng vẫn rollback sạch, gửi lại an toàn.
        await tx.execute('SAVEPOINT sync_record');
        try {
          const written = await this.upsertOne(tx, userId, table, change);
          await tx.execute('RELEASE SAVEPOINT sync_record');
          if (written) {
            applied.push(change.id);
          } else {
            skipped.push({ id: change.id, reason: 'server_newer' });
          }
        } catch (err) {
          await tx.execute('ROLLBACK TO SAVEPOINT sync_record');
          await tx.execute('RELEASE SAVEPOINT sync_record');
          console.error(`Sync push rejected ${change.table}/${change.id}:`, err);
          rejected.push({ id: change.id, reason: 'write_failed' });
        }
      }
    });

    return { applied, skipped, rejected };
  }

  async pull(userId: string, since: string | null, limit: number): Promise<PullResult> {
    const watermark = since === null ? null : toCanonicalIso(since);
    // Lấy dư một hàng để biết còn dữ liệu phía sau mà không cần đếm cả bảng.
    const result = await this.db.query<SyncRow>(PULL_SQL, [userId, watermark, limit + 1]);
    const fetched = result.rows;

    if (fetched.length <= limit) {
      return { changes: fetched.map(decodeRow), hasMore: false };
    }

    // Mốc `since` là mốc hở, nên trang trả về không được cắt ngang một nhóm cùng
    // updated_at — phần đuôi của nhóm sẽ không bao giờ được kéo lại.
    const page = fetched.slice(0, limit);
    const boundaryUpdatedAt = fetched[limit - 1]?.updated_at ?? null;
    if (fetched[limit]?.updated_at !== boundaryUpdatedAt) {
      return { changes: page.map(decodeRow), hasMore: true };
    }

    const wholeGroups = page.filter((r) => r.updated_at !== boundaryUpdatedAt);
    if (wholeGroups.length > 0) {
      return { changes: wholeGroups.map(decodeRow), hasMore: true };
    }

    // Cả trang dính đúng một mốc: trả trọn nhóm, chấp nhận vượt limit còn hơn mất dữ liệu.
    const group = await this.db.query<SyncRow>(PULL_AT_TIMESTAMP_SQL, [
      userId,
      boundaryUpdatedAt,
    ]);
    return { changes: group.rows.map(decodeRow), hasMore: true };
  }

  private async upsertOne(
    tx: IDatabase,
    userId: string,
    table: SyncTable,
    change: SyncChange,
  ): Promise<boolean> {
    const columns: SyncColumn[] = [];
    const values: unknown[] = [];
    for (const [field, value] of Object.entries(change.data)) {
      const column = table.columnByApiField.get(field);
      // Hợp đồng: cột không có trong bảng thì bỏ qua cột đó, không hỏng cả bản ghi.
      if (column === undefined) {
        continue;
      }
      columns.push(column);
      values.push(encodeValue(column, value));
    }

    const updatedAt = toCanonicalIso(change.updatedAt);
    const deletedAt = change.deletedAt === null ? null : toCanonicalIso(change.deletedAt);
    const params = [change.id, userId, updatedAt, deletedAt, ...values];

    const updated = await tx.query<{ id: string }>(buildUpdateSql(table, columns), params);
    if (updated.rowCount > 0) {
      return true;
    }

    // UPDATE không ăn có hai lý do: chưa có bản ghi, hoặc server đang giữ bản mới hơn.
    const existing = await tx.query<{ present: number }>(buildExistsSql(table), [change.id]);
    if (existing.rowCount > 0) {
      return false;
    }

    const inserted = await tx.query<{ id: string }>(buildInsertSql(table, columns), params);
    return inserted.rowCount > 0;
  }
}
