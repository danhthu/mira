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

const WINDOW_MS = 15 * 60 * 1000;

/**
 * Mỗi đường có ngưỡng và lời nhắn riêng.
 *
 * Dùng chung ngưỡng đăng nhập cho mọi thứ là sai hai lần: 8 lần mỗi mười lăm phút quá
 * chặt cho một ô chat (gõ tám câu là hết), và câu "Sai quá nhiều lần" vô nghĩa khi người
 * dùng chẳng sai gì cả — họ chỉ đang gõ.
 */
export interface Nguong {
  readonly toiDa: number;
  /** `{con}` được thay bằng số phút còn lại. */
  readonly thongDiep: string;
}

export const LOGIN_THRESHOLD: Nguong = {
  toiDa: 8,
  thongDiep: 'Sai quá nhiều lần. Thử lại sau {con} phút.',
};

/**
 * Đọc câu: rộng tay hơn nhiều vì đây là thao tác bình thường, nhưng vẫn có trần vì mỗi
 * câu tầng luật không đọc được là một lần gọi LLM, tức là tiền thật.
 */
export const PARSE_THRESHOLD: Nguong = {
  toiDa: 60,
  thongDiep: 'Gõ hơi nhanh rồi. Nghỉ {con} phút nữa nhé.',
};
/** Dọn định kỳ để map không phình mãi khi máy chủ chạy nhiều ngày. */
const SWEEP_MS = 5 * 60 * 1000;

interface Dem {
  times: number;
  hetHan: number;
}

const bang = new Map<string, Dem>();
let lastSweep = Date.now();

function don(bayGio: number): void {
  if (bayGio - lastSweep < SWEEP_MS) return;
  lastSweep = bayGio;
  for (const [khoa, d] of bang) {
    if (d.hetHan <= bayGio) bang.delete(khoa);
  }
}

/**
 * Gọi trước việc cần chặn. Ném 429 khi vượt ngưỡng.
 * `dat` lấy từ header của proxy nếu có, không thì rỗng — thiếu IP vẫn đếm được theo tên.
 */
export function checkRateLimit(ip: string, username: string, threshold: Nguong = LOGIN_THRESHOLD): void {
  const bayGio = Date.now();
  don(bayGio);

  const khoa = `${ip}|${username.trim().toLowerCase()}`;
  const d = bang.get(khoa);

  if (d === undefined || d.hetHan <= bayGio) {
    bang.set(khoa, { times: 1, hetHan: bayGio + WINDOW_MS });
    return;
  }

  d.times += 1;
  if (d.times > threshold.toiDa) {
    const con = Math.ceil((d.hetHan - bayGio) / 60000);
    throw new DomainError('unauthorized', 429, threshold.thongDiep.replace('{con}', String(con)));
  }
}

/** Đăng nhập được thì xoá đếm, để người gõ nhầm vài lần rồi vào được không bị phạt tiếp. */
export function resetCounter(ip: string, username: string): void {
  bang.delete(`${ip}|${username.trim().toLowerCase()}`);
}
