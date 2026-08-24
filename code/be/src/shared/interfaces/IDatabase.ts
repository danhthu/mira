export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface IDatabase {
  query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  queryOne<T>(sql: string, params?: unknown[]): Promise<T | null>;
  execute(sql: string, params?: unknown[]): Promise<{ rowCount: number }>;
  transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
