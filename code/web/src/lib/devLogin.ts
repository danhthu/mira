/**
 * Đăng nhập nhanh khi đang làm — **chỉ ở bản dev, không bao giờ lên bản thật.**
 *
 * ─────────────────────── VÌ SAO KHÔNG DÁN MẬT KHẨU VÀO MÃ ───────────────────────
 *
 * `mira.joybit.one` là trang công khai, và gói JavaScript của nó là **văn bản ai cũng tải
 * được**. Viết `danhthu / <mật khẩu>` vào mã nguồn là đăng mật khẩu lên mạng: bất kỳ ai
 * mở trang, bấm nút, là vào thẳng tài khoản thật có dữ liệu thật. Không phải "ẩn nút đi là
 * xong" — nút ẩn thì mật khẩu vẫn nằm trong gói, chỉ là không ai bấm hộ.
 *
 * ─────────────────────── HAI LỚP CHẶN, CẢ HAI ĐỀU CẦN ───────────────────────
 *
 * 1. **Tên file env.** Thông tin nằm ở `code/web/.env.development.local`. Vite chỉ nạp
 *    `.env.<mode>.local` đúng mode đó. `npm run build` chạy mode `production`, nên file
 *    này **không được đọc** và hai biến dưới đây thành `undefined`.
 *    Dùng `.env.local` thì Vite nạp ở MỌI mode — kể cả bản thật. Đó là lý do tên file có
 *    chữ `development` ở giữa, không phải cho đẹp.
 *
 * 2. **`import.meta.env.DEV`.** Vite thay hằng này bằng `false` khi build, nên cả nhánh
 *    dùng nó bị cắt khỏi gói. Lớp này một mình đã đủ về lý thuyết — nhưng nó dựa vào
 *    người đóng gói cắt đúng nhánh, còn lớp 1 thì không có gì để mà cắt.
 *
 * Sau mỗi lần đổi chỗ này, soi lại gói thật:
 *
 *     npm run build -w web && grep -r "VITE_DEV_PASS\|<mật khẩu>" code/web/dist
 *
 * Không ra dòng nào mới là xong.
 */
import { store } from './store';
import { openSession } from './session';

/** Có bật được nút đăng nhập nhanh không. Bản thật luôn là `false`. */
export const devLoginReady: boolean =
  import.meta.env.DEV &&
  typeof import.meta.env.VITE_DEV_USER === 'string' &&
  import.meta.env.VITE_DEV_USER !== '' &&
  typeof import.meta.env.VITE_DEV_PASS === 'string' &&
  import.meta.env.VITE_DEV_PASS !== '';

/** Tên tài khoản để hiện lên nút. Bản thật trả chuỗi rỗng. */
export const devLoginUser = (): string =>
  devLoginReady ? String(import.meta.env.VITE_DEV_USER) : '';

/**
 * Đăng nhập thẳng bằng thông tin trong `.env.development.local`.
 *
 * Gọi ở bản thật thì ném lỗi chứ không im lặng không làm gì: một nút bấm không phản ứng
 * là thứ người ta bấm lại năm lần rồi đi báo hỏng.
 */
export async function devLogin(): Promise<import('@mira/contract').User> {
  if (!devLoginReady) throw new Error('Đăng nhập nhanh chỉ có ở bản đang làm.');
  const kq = await store.login({
    username: String(import.meta.env.VITE_DEV_USER),
    password: String(import.meta.env.VITE_DEV_PASS),
  });
  openSession(kq.token);
  return kq.user;
}
