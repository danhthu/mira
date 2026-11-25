/**
 * Chặn thử mật khẩu hàng loạt.
 *
 * Một endpoint đăng nhập mở ra internet mà không đếm số lần sai thì chỉ là chuyện thời
 * gian. bcrypt 12 vòng làm mỗi lần thử tốn ~100ms, đủ chậm để thử tay nhưng không đủ
 * chậm cho máy chạy suốt đêm.
 *
 * Đếm theo **IP cộng tên đăng nhập**: khoá theo IP không thì một văn phòng chung mạng sẽ
 * khoá lẫn nhau; khoá theo tên không thì kẻ tấn công đổi tên là thoát.
 *
 * Để trong bộ nhớ: máy chủ này chạy một tiến trình. Khi nào chạy nhiều tiến trình thì
 * phải đổi sang Redis hoặc bảng trong CSDL — nhớ sửa chỗ này, đừng để nó im lặng vô dụng.
 */
import { DomainError } from '../shared/errors';

const CUA_SO_MS = 15 * 60 * 1000;
const TOI_DA = 8;
/** Dọn định kỳ để map không phình mãi khi máy chủ chạy nhiều ngày. */
const DON_MOI_MS = 5 * 60 * 1000;

interface Dem {
  soLan: number;
  hetHan: number;
}

const bang = new Map<string, Dem>();
let lanDonCuoi = Date.now();

function don(bayGio: number): void {
  if (bayGio - lanDonCuoi < DON_MOI_MS) return;
  lanDonCuoi = bayGio;
  for (const [khoa, d] of bang) {
    if (d.hetHan <= bayGio) bang.delete(khoa);
  }
}

/**
 * Gọi trước khi kiểm mật khẩu. Ném 429 khi vượt ngưỡng.
 * `dat` lấy từ header của proxy nếu có, không thì rỗng — thiếu IP vẫn đếm được theo tên.
 */
export function kiemDoLuong(ip: string, username: string): void {
  const bayGio = Date.now();
  don(bayGio);

  const khoa = `${ip}|${username.trim().toLowerCase()}`;
  const d = bang.get(khoa);

  if (d === undefined || d.hetHan <= bayGio) {
    bang.set(khoa, { soLan: 1, hetHan: bayGio + CUA_SO_MS });
    return;
  }

  d.soLan += 1;
  if (d.soLan > TOI_DA) {
    const con = Math.ceil((d.hetHan - bayGio) / 60000);
    throw new DomainError(
      'unauthorized',
      429,
      `Sai quá nhiều lần. Thử lại sau ${con} phút.`,
    );
  }
}

/** Đăng nhập được thì xoá đếm, để người gõ nhầm vài lần rồi vào được không bị phạt tiếp. */
export function xoaDem(ip: string, username: string): void {
  bang.delete(`${ip}|${username.trim().toLowerCase()}`);
}
