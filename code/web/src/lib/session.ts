/**
 * Phiên đăng nhập.
 *
 * File này giữ **đúng một thứ**: token. Không dữ liệu, không bản sao thông tin người dùng.
 *
 * TRƯỚC ĐÂY nó còn cache cả object `User` vào `localStorage` để màn đầu vẽ ngay mà không
 * phải chờ mạng. Bỏ rồi: đó là nguồn sự thật thứ hai. Đổi tên hiển thị trên máy khác thì
 * máy này vẫn hiện tên cũ mãi, và không ai nghĩ ra tại sao. Giờ tên người dùng lấy từ
 * `GET /auth/me`, cùng một nguồn với mọi dữ liệu khác.
 *
 * TOKEN THÌ KHÔNG THỂ CHUYỂN VÀO CSDL — nó chính là thứ chứng minh ta được phép gọi CSDL.
 * Nó phải nằm ở phía trình duyệt, không có chỗ nào khác. `localStorage` chấp nhận được vì
 * app không nhúng mã của bên thứ ba nào (CSP ở `public/_headers` chặn mọi script ngoài),
 * nên không có đường cho script lạ đọc trộm. Đổi lại, phiên sống qua lần đóng trình
 * duyệt — điều người dùng mong đợi.
 */

const TOKEN_KEY = 'mira.token';

function doc(khoa: string): string | null {
  try {
    return localStorage.getItem(khoa);
  } catch {
    return null;
  }
}

function ghi(khoa: string, giaTri: string | null): void {
  try {
    if (giaTri === null) localStorage.removeItem(khoa);
    else localStorage.setItem(khoa, giaTri);
  } catch {
    // Trình duyệt chặn lưu: phiên chỉ sống tới khi đóng tab. Không làm app chết.
  }
}

export const getToken = (): string | null => doc(TOKEN_KEY);

/** Có token nghĩa là CÓ THỂ còn phiên. Hợp lệ hay không thì chỉ máy chủ biết. */
export const hasToken = (): boolean => doc(TOKEN_KEY) !== null;

export function openSession(token: string): void {
  ghi(TOKEN_KEY, token);
}

export function closeSession(): void {
  ghi(TOKEN_KEY, null);
  // Dọn hai thứ của bản cũ: kho dữ liệu local thời chưa có tài khoản, và bản sao
  // thông tin người dùng. Người đã dùng bản trước vẫn còn chúng trong máy.
  ghi('mira.v1', null);
  ghi('mira.user', null);
}
