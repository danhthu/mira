import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const sqliteDb = SQLite.openDatabaseSync('mira.db');
export const db = drizzle(sqliteDb, { schema });
export type Db = typeof db;

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS person (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    birth_year INTEGER,
    distance_km INTEGER,
    dunbar_ring INTEGER NOT NULL DEFAULT 50,
    desired_cadence INTEGER,
    hourglass_enabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS time_entry (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    minutes INTEGER NOT NULL,
    bucket TEXT NOT NULL,
    person_id TEXT,
    note TEXT,
    source TEXT NOT NULL DEFAULT 'manual',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS work_load (
    id TEXT PRIMARY KEY,
    week_start TEXT NOT NULL,
    work_minutes INTEGER NOT NULL DEFAULT 0,
    commute_minutes INTEGER NOT NULL DEFAULT 0,
    prep_minutes INTEGER NOT NULL DEFAULT 0,
    recovery_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS money (
    id TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    net_income INTEGER NOT NULL DEFAULT 0,
    monthly_expense INTEGER NOT NULL DEFAULT 0,
    net_worth INTEGER NOT NULL DEFAULT 0,
    debt INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS expense (
    id TEXT PRIMARY KEY,
    occurred_at TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    bucket TEXT,
    source_type TEXT NOT NULL DEFAULT 'manual',
    confirmed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS goal (
    id TEXT PRIMARY KEY,
    tier TEXT NOT NULL,
    title TEXT NOT NULL,
    started_at TEXT NOT NULL,
    expires_at TEXT,
    cost_minutes_per_week INTEGER,
    cost_amount_per_month INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    release_reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS moment (
    id TEXT PRIMARY KEY,
    occurred_at TEXT NOT NULL,
    text TEXT,
    media_uri TEXT,
    media_type TEXT,
    person_ids TEXT NOT NULL DEFAULT '[]',
    bucket TEXT,
    kind TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS health (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    sleep_minutes INTEGER,
    steps INTEGER,
    energy_self_rated INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS mood (
    id TEXT PRIMARY KEY,
    occurred_at TEXT NOT NULL,
    level INTEGER NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS weight_on_mind (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    written_at TEXT NOT NULL,
    review_at TEXT NOT NULL,
    reviewed INTEGER NOT NULL DEFAULT 0,
    still_heavy INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS item (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER,
    purchased_at TEXT,
    use_count INTEGER NOT NULL DEFAULT 0,
    released_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS space (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    member_ids TEXT NOT NULL DEFAULT '[]',
    shared_modules TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS letter (
    id TEXT PRIMARY KEY,
    week_start TEXT NOT NULL,
    body TEXT NOT NULL,
    kind TEXT,
    user_reaction TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );
`;

/**
 * Thêm cột vào bảng đã tồn tại. `INIT_SQL` dùng `CREATE TABLE IF NOT EXISTS`, nên
 * máy đã cài bản cũ sẽ giữ nguyên bảng cũ và không bao giờ thấy cột mới.
 * SQLite không có `ADD COLUMN IF NOT EXISTS`, nên phải tự hỏi `PRAGMA table_info`
 * trước. Trả về true khi vừa thêm — chỗ gọi dùng nó để chỉ nạp lại dữ liệu cũ
 * đúng một lần, thay vì chạy `UPDATE` mỗi lần mở app.
 *
 * `table` và `column` là hằng chuỗi viết trong file này, không đến từ người dùng.
 */
async function addColumnIfMissing(
  table: string,
  column: string,
  definition: string,
): Promise<boolean> {
  const info = await sqliteDb.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table})`,
  );
  if (info.some((c) => c.name === column)) return false;
  await sqliteDb.execAsync(
    `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
  );
  return true;
}

/**
 * Chỉ thêm cột và điền giá trị cho hàng cũ — không xoá, không đổi kiểu, không
 * tạo lại bảng. Dữ liệu người dùng đang có nằm nguyên tại chỗ.
 */
async function migrateKindColumns(): Promise<void> {
  if (await addColumnIfMissing('moment', 'kind', 'TEXT')) {
    // Trước khi có cột này, module Học hỏi là nơi duy nhất ghi moment với
    // bucket 'learn', nên đây là dấu hiệu chắc chắn để giữ lại ghi chú cũ.
    await sqliteDb.runAsync(
      `UPDATE moment SET kind = 'learn' WHERE kind IS NULL AND bucket = 'learn'`,
    );
    // Hàng còn lại để NULL, đọc như khoảnh khắc thường. Cố tình KHÔNG đoán hàng
    // nào là 'legacy': dấu hiệu cũ (có gắn tên con) chính là cái lỗi đang sửa,
    // dùng nó để nạp lại thì lại đẩy khoảnh khắc thường vào hộp di sản một lần nữa.
  }

  if (await addColumnIfMissing('letter', 'kind', 'TEXT')) {
    // M9 là module duy nhất từng ghi vào bảng letter, nên thư cũ đều là thư gửi mình.
    await sqliteDb.runAsync(
      `UPDATE letter SET kind = 'yearLetter' WHERE kind IS NULL`,
    );
  }
}

export async function initializeDatabase(): Promise<void> {
  await sqliteDb.execAsync(INIT_SQL);
  await migrateKindColumns();
}
