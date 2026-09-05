import { toCamelCase } from './naming';

// 13 bảng đồng bộ theo docs/09-sync-contract.md. Danh sách cột nghiệp vụ chép
// đúng theo migrations/001_initial.sql — KHÔNG kể id/created_at/updated_at/deleted_at
// vì bốn cột đó thuộc khung đồng bộ, mọi bảng đều có.
const BUSINESS_COLUMNS: Readonly<Record<string, readonly string[]>> = {
  person: [
    'name',
    'role',
    'birth_year',
    'distance_km',
    'dunbar_ring',
    'desired_cadence',
    'hourglass_enabled',
  ],
  time_entry: ['date', 'minutes', 'bucket', 'person_id', 'note', 'source'],
  work_load: [
    'week_start',
    'work_minutes',
    'commute_minutes',
    'prep_minutes',
    'recovery_minutes',
  ],
  money: ['month', 'net_income', 'monthly_expense', 'net_worth', 'debt', 'savings'],
  expense: ['occurred_at', 'amount', 'description', 'bucket', 'source_type', 'confirmed'],
  goal: [
    'tier',
    'title',
    'started_at',
    'expires_at',
    'cost_minutes_per_week',
    'cost_amount_per_month',
    'status',
    'release_reason',
  ],
  moment: ['occurred_at', 'text', 'media_uri', 'media_type', 'person_ids', 'bucket'],
  health: ['date', 'sleep_minutes', 'steps', 'energy_self_rated'],
  mood: ['occurred_at', 'level', 'note'],
  weight_on_mind: ['text', 'written_at', 'review_at', 'reviewed', 'still_heavy'],
  item: ['name', 'price', 'purchased_at', 'use_count', 'released_at'],
  space: ['type', 'name', 'member_ids', 'shared_modules'],
  letter: ['week_start', 'body', 'user_reaction'],
};

// Cột khai kiểu TEXT nhưng chứa mảng JSON. Đẩy lên thì stringify, kéo về thì parse,
// để client thấy cùng một mảng ở cả hai chiều.
const JSON_COLUMNS: ReadonlySet<string> = new Set([
  'person_ids',
  'member_ids',
  'shared_modules',
]);

export const SYNC_FRAME_COLUMNS = {
  id: 'id',
  userId: 'user_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
} as const;

export interface SyncColumn {
  readonly column: string;
  readonly apiField: string;
  readonly isJson: boolean;
}

export interface SyncTable {
  readonly table: string;
  readonly columns: readonly SyncColumn[];
  readonly columnByApiField: ReadonlyMap<string, SyncColumn>;
}

// Rào chắn SQL injection cuối cùng: mọi định danh ghép vào câu SQL đều phải qua
// registry và phải khớp mẫu này. Sai thì nổ ngay lúc nạp module, không đợi runtime.
const SAFE_IDENTIFIER = /^[a-z][a-z0-9_]*$/;

function assertSafeIdentifier(identifier: string): string {
  if (!SAFE_IDENTIFIER.test(identifier)) {
    throw new Error(`Unsafe SQL identifier in sync registry: ${identifier}`);
  }
  return identifier;
}

function buildTable(table: string, columns: readonly string[]): SyncTable {
  const built = columns.map<SyncColumn>((column) => ({
    column: assertSafeIdentifier(column),
    apiField: toCamelCase(column),
    isJson: JSON_COLUMNS.has(column),
  }));
  return {
    table: assertSafeIdentifier(table),
    columns: built,
    columnByApiField: new Map(built.map((c) => [c.apiField, c])),
  };
}

export const SYNC_TABLES: readonly SyncTable[] = Object.entries(BUSINESS_COLUMNS).map(
  ([table, columns]) => buildTable(table, columns),
);

const TABLE_BY_NAME: ReadonlyMap<string, SyncTable> = new Map(
  SYNC_TABLES.map((t) => [t.table, t]),
);

export function findSyncTable(name: string): SyncTable | null {
  return TABLE_BY_NAME.get(name) ?? null;
}

Object.values(SYNC_FRAME_COLUMNS).forEach(assertSafeIdentifier);
