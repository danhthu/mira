import { Pool, PoolClient } from 'pg';
import type { IDatabase, QueryResult } from '../shared/interfaces/IDatabase';

// pg require T extends QueryResultRow; cast attraverso Record per mantenere IDatabase generico
type PgRow = Record<string, unknown>;

class PostgresClientAdapter implements IDatabase {
  constructor(private readonly client: PoolClient) {}

  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const result = await this.client.query<PgRow>(sql, params);
    return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
  }

  async queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return result.rows[0] ?? null;
  }

  async execute(sql: string, params?: unknown[]): Promise<{ rowCount: number }> {
    const result = await this.client.query<PgRow>(sql, params);
    return { rowCount: result.rowCount ?? 0 };
  }

  async transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T> {
    // Transações aninhadas não são suportadas nesta camada; delegate para o mesmo cliente
    return fn(this);
  }

  async close(): Promise<void> {
    // Clientes individuais não fecham o pool; apenas liberam a conexão
  }
}

export class PostgresAdapter implements IDatabase {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env['DB_HOST'] ?? '127.0.0.1',
      port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
      user: process.env['DB_USER'] ?? 'postgres',
      password: process.env['DB_PASS'],
      database: process.env['DB_NAME'] ?? 'mira_dev',
    });
  }

  async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const result = await this.pool.query<PgRow>(sql, params);
    return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
  }

  async queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return result.rows[0] ?? null;
  }

  async execute(sql: string, params?: unknown[]): Promise<{ rowCount: number }> {
    const result = await this.pool.query<PgRow>(sql, params);
    return { rowCount: result.rowCount ?? 0 };
  }

  async transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const clientAdapter = new PostgresClientAdapter(client);
      const result = await fn(clientAdapter);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
