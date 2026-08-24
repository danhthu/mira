import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../..', '.env') });

async function runSeed(): Promise<void> {
  const pool = new Pool({
    host: process.env['DB_HOST'] ?? '127.0.0.1',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    user: process.env['DB_USER'] ?? 'postgres',
    password: process.env['DB_PASS'],
    database: process.env['DB_NAME'] ?? 'mira_dev',
  });

  const seedPath = path.join(__dirname, 'seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('[seed] done — 6 persons, 20 time entries, 5 moments');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
