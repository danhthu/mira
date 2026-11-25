/**
 * Nạp `.env.local` trước rồi `.env` nếu có. Biến đã có sẵn trong process không bị ghi đè.
 * Không in secret ra đâu cả — kết nối CSDL do `PostgresAdapter` tự đọc từ DB_* .
 */
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..');
for (const name of ['.env.local', '.env']) {
  const path = resolve(root, name);
  if (existsSync(path)) {
    config({ path, override: false });
  }
}

const list = (raw: string | undefined): string[] =>
  raw === undefined
    ? []
    : raw
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');

export const env = {
  port: Number(process.env['PORT'] ?? 8787),
  host: process.env['HOST'] ?? '127.0.0.1',
  /** Mặc định chỉ cho web dev gọi. Thêm gốc khác bằng CORS_ORIGINS, ngăn cách bằng dấu phẩy. */
  corsOrigins: list(process.env['CORS_ORIGINS'] ?? 'http://localhost:5173'),
  logger: process.env['NODE_ENV'] !== 'test',
  /** Khoá ký token đăng nhập. Không có thì máy chủ từ chối khởi động. */
  jwtSecret: process.env['JWT_SECRET'] ?? '',
  /** Token sống bao lâu, tính bằng giây. Mặc định 30 ngày. */
  jwtTtlSec: Number(process.env['JWT_TTL_SEC'] ?? 30 * 24 * 3600),
  /**
   * Giờ tỉnh mỗi ngày — mẫu số của mọi tỉ lệ trên màn Thời gian.
   *
   * Đóng cứng 16h là sai với người ngủ 7h: tỉ lệ cộng lại ra 106% thay vì 100%, và
   * không ai nhận ra vì donut vẫn vẽ ra hình tròn.
   *
   * Đặt qua env vì hiện mỗi máy chủ chỉ phục vụ một người. Khi có nhiều người thì nó
   * phải thành một cột trên `app_user` và một ô nhập ở màn Tôi — chú thích trong
   * `constants.ts` đã hứa như vậy từ lâu mà chưa làm.
   */
  wakingHoursPerDay: Number(process.env['WAKING_HOURS_PER_DAY'] ?? 16),
  /** Có cấu hình CSDL chưa — thiếu thì máy chủ không khởi động được. */
  hasDatabase: (process.env['DB_NAME'] ?? '') !== '' || (process.env['DB_HOST'] ?? '') !== '',
};
