/**
 * Điểm vào máy chủ.
 *
 * Từ 25/11/2026 Mira **không còn local-first**: `web` không ghi vào máy người dùng nữa,
 * mọi thứ đi qua API này. Máy chủ tắt là app trắng — không có chế độ chạy offline.
 */
import { env } from './env';
import { PostgresAdapter } from './database/PostgresAdapter';
import { buildApp } from './http/app';
import { buildDeps } from './http/engine';

async function main(): Promise<void> {
  if (!env.hasDatabase) {
    throw new Error('Thiếu cấu hình CSDL. Chép .env.example thành .env rồi điền DB_*.');
  }

  // Không có khoá ký thì mọi token đều giả được. Thà không khởi động còn hơn chạy mà
  // ai cũng tự phát token cho mình.
  if (env.jwtSecret.length < 32) {
    throw new Error(
      'Thiếu JWT_SECRET hoặc quá ngắn (cần ít nhất 32 ký tự). Sinh một chuỗi ngẫu nhiên ' +
        'rồi đặt vào .env trước khi khởi động.',
    );
  }

  const db = new PostgresAdapter();
  const app = buildApp({
    deps: buildDeps(db, env.jwtSecret, env.jwtTtlSec, env.wakingHoursPerDay * 60 * 7, env.googleClientId),
    corsOrigins: env.corsOrigins,
    logger: env.logger,
  });

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'dang tat');
    await app.close();
    await db.close();
    process.exit(0);
  };
  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  await app.listen({ port: env.port, host: env.host });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
