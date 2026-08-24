// Web stub — expo-sqlite yêu cầu SharedArrayBuffer (COOP/COEP headers)
// không có trong Metro dev server. DB không khả dụng trên web.
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import type * as schema from './schema';

export const db = null as unknown as ExpoSQLiteDatabase<typeof schema>;
export type Db = ExpoSQLiteDatabase<typeof schema>;

export async function initializeDatabase(): Promise<void> {
  // no-op on web
}
