/**
 * Đặt lại mật khẩu một tài khoản từ dòng lệnh.
 *
 *   npm run doi-mk -w mira-be -- danhthu "mat-khau-moi"
 *
 * TẠI SAO CÓ FILE NÀY
 * Chưa có màn "quên mật khẩu" và chưa có màn "đổi mật khẩu". Khi nào có thì chúng đi qua
 * API và xác minh người dùng; file này thì không xác minh ai cả — nó chỉ chạy được bởi
 * người đã đọc được `.env`, tức là đã có toàn quyền với CSDL rồi.
 *
 * NÓ CỐ TÌNH KHÔNG KIỂM ĐỘ DÀI
 * `dangKy` bắt mật khẩu ít nhất 8 ký tự, và luật đó phải giữ nguyên cho người dùng thật.
 * Đường này bỏ qua luật đó để đặt được mật khẩu ngắn cho tài khoản demo mà **không** phải
 * hạ ngưỡng của cả hệ thống. `dangNhap` không kiểm độ dài, nên mật khẩu ngắn vẫn vào được.
 *
 * Đổi lại: tài khoản nào đặt mật khẩu qua đường này thì coi như công khai. Đừng để dữ
 * liệu thật trong đó.
 */
import { hash } from 'bcryptjs';
import { env } from '../env';
import { PostgresAdapter } from '../database/PostgresAdapter';

const BCRYPT_ROUNDS = 12;

async function main(): Promise<void> {
  const [username, matKhau] = process.argv.slice(2);

  if (username === undefined || matKhau === undefined || matKhau === '') {
    console.error('Cách dùng: npm run doi-mk -w mira-be -- <tên đăng nhập> <mật khẩu mới>');
    process.exit(2);
  }
  if (!env.hasDatabase) throw new Error('Thiếu cấu hình CSDL trong .env.');

  const db = new PostgresAdapter();
  try {
    const kq = await db.execute(
      `UPDATE app_user
          SET password_hash = $1, updated_at = $2
        WHERE lower(username) = lower($3) AND deleted_at IS NULL`,
      [await hash(matKhau, BCRYPT_ROUNDS), new Date().toISOString(), username],
    );

    if (kq.rowCount === 0) {
      console.error(`Không có tài khoản nào tên "${username}".`);
      process.exit(1);
    }

    // Không in mật khẩu ra. Người chạy lệnh vừa gõ nó, không cần đọc lại.
    console.log(`Đã đặt lại mật khẩu cho "${username}" (${matKhau.length} ký tự).`);
    if (matKhau.length < 8) {
      console.log('⚠ Ngắn hơn ngưỡng 8 ký tự của đăng ký. Tài khoản này coi như công khai.');
    }
  } finally {
    await db.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
