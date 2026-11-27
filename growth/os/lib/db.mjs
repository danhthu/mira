// Lớp truy cập SQLite cho Growth OS. Không dependency ngoài — dùng node:sqlite (Node >= 22.5).
// DB mặc định: growth/os/db/growth.sqlite (gitignore). Đặt GROWTH_OS_DB để trỏ sang DB test.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const OS_ROOT = join(here, '..');
export const REPO_ROOT = join(OS_ROOT, '..', '..');
export const DB_PATH = process.env.GROWTH_OS_DB || join(OS_ROOT, 'db', 'growth.sqlite');

let db;
export function openDb() {
  if (db) return db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec(readFileSync(join(OS_ROOT, 'db', 'schema.sql'), 'utf8'));
  return db;
}

export function closeDb() {
  if (db) { db.close(); db = undefined; }
}

export const now = () => new Date().toISOString();
export const today = (d = new Date()) => d.toISOString().slice(0, 10);

// Sinh mã tuần tự dạng PREFIX-0001 cho bảng có cột id TEXT.
export function nextId(table, prefix) {
  const row = openDb()
    .prepare(`SELECT id FROM ${table} WHERE id LIKE ? ORDER BY id DESC LIMIT 1`)
    .get(`${prefix}-%`);
  const n = row ? parseInt(row.id.split('-')[1], 10) + 1 : 1;
  return `${prefix}-${String(n).padStart(4, '0')}`;
}

export function audit(actor, action, ref_id = null, detail = '') {
  openDb()
    .prepare('INSERT INTO audit_log (at, actor, action, ref_id, detail) VALUES (?,?,?,?,?)')
    .run(now(), actor, action, ref_id, detail);
}

export function loadConfig(name) {
  return JSON.parse(readFileSync(join(OS_ROOT, 'config', `${name}.json`), 'utf8'));
}
