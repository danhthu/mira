/**
 * Nạp một bộ dữ liệu JSON vào tài khoản của một người, chạy từ dòng lệnh.
 *
 *   npm run nap -w mira-be -- danhthu ../../docs/du-lieu-mau/screentime.json
 *
 * TẠI SAO CÓ FILE NÀY
 * Màn Tôi trong app đã có nút nhập, nhưng nhập qua app thì phải đăng nhập được trước.
 * Khi cần đưa dữ liệu vào tài khoản mà không có mật khẩu — lúc dựng, lúc thử — thì
 * dùng đường này.
 *
 * NÓ KHÔNG PHẢI CỬA SAU
 * Chỉ chạy được bởi người đã có quyền trên máy chủ và đọc được `.env`, tức là người đã
 * có toàn quyền với CSDL rồi. Nó **không** sinh token, **không** đọc hay đổi mật khẩu,
 * **không** mở thêm route nào. Dùng đúng `nhapBo` mà app dùng, nên luật "id trong file
 * không quyết định dữ liệu thuộc về ai" vẫn giữ nguyên.
 *
 * NÓ GHI ĐÈ
 * `nhapBo` xoá sạch dữ liệu cũ của người đó rồi mới chèn, trong một transaction. Chạy
 * lệnh này là mất cái đang có. Có hỏi lại trước khi xoá, trừ khi truyền `--dong-y`.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { env } from '../env';
import { PostgresAdapter } from '../database/PostgresAdapter';
import { nhapBo } from '../services/nhapBo';

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((a) => a !== '--dong-y');
  const khongHoi = process.argv.includes('--dong-y');
  const [username, duongDan] = args;

  if (username === undefined || duongDan === undefined) {
    console.error('Cách dùng: npm run nap -w mira-be -- <tên đăng nhập> <file.json> [--dong-y]');
    process.exit(2);
  }
  if (!env.hasDatabase) throw new Error('Thiếu cấu hình CSDL trong .env.');

  const bo: unknown = JSON.parse(readFileSync(resolve(process.cwd(), duongDan), 'utf8'));

  const db = new PostgresAdapter();
  try {
    // Tra theo lower(username) cho khớp unique index của migration 004.
    const nguoi = await db.queryOne<{ id: string; username: string }>(
      'SELECT id, username FROM app_user WHERE lower(username) = lower($1) AND deleted_at IS NULL',
      [username],
    );
    if (nguoi === null) {
      console.error(`Không có tài khoản nào tên "${username}".`);
      process.exit(1);
    }

    const dangCo = await db.queryOne<{ n: string }>(
      'SELECT count(*)::text AS n FROM time_entry WHERE user_id = $1',
      [nguoi.id],
    );
    const soCu = Number(dangCo?.n ?? 0);

    if (soCu > 0 && !khongHoi) {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const tra = await rl.question(
        `Tài khoản "${nguoi.username}" đang có ${soCu} mục giờ. Nạp mới sẽ XOÁ SẠCH. Gõ "xoa" để tiếp: `,
      );
      rl.close();
      if (tra.trim() !== 'xoa') {
        console.log('Bỏ qua, không đổi gì.');
        return;
      }
    }

    const kq = await nhapBo(db, nguoi.id, bo);
    console.log(`Đã nạp vào "${nguoi.username}":`);
    console.log(`  ${kq.gio} mục giờ, ${kq.hat} hạt, ${kq.thang} tháng tiền,`);
    console.log(`  ${kq.mucTieu} mục tiêu, ${kq.thoiQuen} thói quen, ${kq.lanDanhDau} lần đánh dấu.`);
  } finally {
    await db.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
