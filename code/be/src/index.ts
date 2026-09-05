import 'dotenv/config';
import { serve } from '@hono/node-server';
import { PostgresAdapter } from './database/PostgresAdapter';
import { DEFAULT_HTTP_PORT } from './shared/constants';
import { createApp } from './http/app';

const db = new PostgresAdapter();
const port = Number.parseInt(process.env['PORT'] ?? String(DEFAULT_HTTP_PORT), 10);

// Chỉ nghe loopback: V1 chưa có xác thực thật, không được để lộ ra mạng LAN.
const server = serve({ fetch: createApp(db).fetch, port, hostname: '127.0.0.1' }, (info) => {
  console.log(`Mira BE listening on http://127.0.0.1:${info.port}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, closing server and pool`);
  server.close();
  await db.close();
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void shutdown(signal).then(() => process.exit(0));
  });
}
