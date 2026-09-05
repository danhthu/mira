import { Hono } from 'hono';
import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { AppEnv } from '../middleware/userId';

async function isDatabaseReachable(db: IDatabase): Promise<boolean> {
  try {
    await db.query<{ ok: number }>('SELECT 1 AS ok');
    return true;
  } catch (err) {
    console.error('Health check could not reach Postgres:', err);
    return false;
  }
}

export function createHealthRoutes(db: IDatabase): Hono<AppEnv> {
  const routes = new Hono<AppEnv>();

  // Luôn 200: client dùng cờ `db` để quyết định có thử sync không, mất Postgres
  // không phải lý do để nó coi cả server là chết.
  routes.get('/', async (c) =>
    c.json({
      ok: true,
      db: await isDatabaseReachable(db),
      time: new Date().toISOString(),
    }),
  );

  return routes;
}
