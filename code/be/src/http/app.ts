import { Hono } from 'hono';
import type { IDatabase } from '../shared/interfaces/IDatabase';
import { withUserId } from './middleware/userId';
import type { AppEnv } from './middleware/userId';
import { createHealthRoutes } from './routes/health';
import { createSyncRoutes } from './routes/sync';

export function createApp(db: IDatabase): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.use('*', withUserId);
  app.route('/health', createHealthRoutes(db));
  app.route('/sync', createSyncRoutes(db));

  app.onError((err, c) => {
    console.error(`Unhandled error on ${c.req.method} ${c.req.path}:`, err);
    return c.json({ error: 'internal_error' }, 500);
  });

  app.notFound((c) => c.json({ error: 'not_found' }, 404));

  return app;
}
