/**
 * Kho dữ liệu. Từ 25/11/2026 **chỉ còn máy chủ** — ràng buộc local-first đã bỏ.
 *
 * Mọi lời gọi đi kèm token của phiên hiện tại. Máy chủ lấy id người dùng từ token và lọc
 * mọi câu truy vấn theo đó, nên client không bao giờ phải (và không bao giờ được) gửi lên
 * mình là ai.
 */
import { createClient, MiraApiError } from '@mira/api-client';
import { layToken } from './phien';

/** Mặc định trỏ về máy chủ phát triển; bản phát hành đặt VITE_API_BASE_URL khi build. */
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8787';

export const store = createClient({ baseUrl, token: layToken });

export { MiraApiError };

/** Lỗi 401 nghĩa là phiên hết hạn — màn nào bắt được thì đá người dùng về đăng nhập. */
export const laHetPhien = (error: unknown): boolean =>
  error instanceof MiraApiError && error.status === 401;
