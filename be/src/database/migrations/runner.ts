import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env['DB_HOST'] ?? '127.0.0.1',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  user: process.env['DB_USER'] ?? 'postgres',
  password: process.env['DB_PASS'],
  database: process.env['DB_NAME'] ?? 'mira_dev',
});

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id     SERIAL PRIMARY KEY,
      name   TEXT NOT NULL UNIQUE,
      run_at TEXT NOT NULL
    )
  `);
}

async function loadApplied(): Promise<Set<string>> {
  const result = await pool.query<{ name: string }>('SELECT name FROM migrations');
  return new Set(result.rows.map((r) => r.name));
}

async function runMigrations(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await loadApplied();

  const migrationsDir = path.resolve(__dirname);
  const sqlFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of sqlFiles) {
    if (applied.has(file)) {
      console.log(`[skip]  ${file}`);
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        `INSERT INTO migrations (name, run_at) VALUES ($1, $2)`,
        [file, new Date().toISOString()],
      );
      await client.query('COMMIT');
      console.log(`[done]  ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`[error] ${file}:`, err);
      throw err;
    } finally {
      client.release();
    }
  }

  await pool.end();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
