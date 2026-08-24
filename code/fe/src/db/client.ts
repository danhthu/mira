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
    user_reaction TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );
`;

export async function initializeDatabase(): Promise<void> {
  await sqliteDb.execAsync(INIT_SQL);
}
