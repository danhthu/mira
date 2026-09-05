import { Hono } from 'hono';
import type { Context } from 'hono';
import type { IDatabase } from '../../shared/interfaces/IDatabase';
import {
  SYNC_PULL_DEFAULT_LIMIT,
  SYNC_PULL_MAX_LIMIT,
  SYNC_PUSH_MAX_BATCH,
} from '../../shared/constants';
import { SyncRepository } from '../../database/repositories/SyncRepository';
import type { AppEnv } from '../middleware/userId';
import { pullQuerySchema, pushBodySchema } from '../schemas';

const INVALID_JSON = Symbol('invalid_json');

async function readJsonBody(c: Context<AppEnv>): Promise<unknown> {
  try {
    return await c.req.json();
  } catch (err) {
    console.error('Sync push received malformed JSON:', err);
    return INVALID_JSON;
  }
}

export function createSyncRoutes(db: IDatabase): Hono<AppEnv> {
  const repository = new SyncRepository(db);
  const routes = new Hono<AppEnv>();

  routes.post('/push', async (c) => {
    const body = await readJsonBody(c);
    if (body === INVALID_JSON) {
      return c.json({ error: 'invalid_json' }, 400);
    }

    const parsed = pushBodySchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'invalid_body', issues: parsed.error.issues }, 400);
    }

    const { changes } = parsed.data;
    if (changes.length > SYNC_PUSH_MAX_BATCH) {
      return c.json(
        { error: 'batch_too_large', max: SYNC_PUSH_MAX_BATCH, received: changes.length },
        413,
      );
    }

    const result = await repository.push(c.get('userId'), changes);
    return c.json({ ...result, serverTime: new Date().toISOString() });
  });

  routes.get('/pull', async (c) => {
    const parsed = pullQuerySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return c.json({ error: 'invalid_query', issues: parsed.error.issues }, 400);
    }

    const limit = Math.min(parsed.data.limit ?? SYNC_PULL_DEFAULT_LIMIT, SYNC_PULL_MAX_LIMIT);
    const result = await repository.pull(c.get('userId'), parsed.data.since ?? null, limit);

    return c.json({
      changes: result.changes,
      serverTime: new Date().toISOString(),
      hasMore: result.hasMore,
    });
  });

  return routes;
}
