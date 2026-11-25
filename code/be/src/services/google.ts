/**
 * Kiểm ID token của Google.
 *
 * Trình duyệt gửi lên một chuỗi và bảo "đây là token Google của tôi". Chuỗi đó do người
 * dùng kiểm soát, nên **không được tin một chữ nào** cho tới khi kiểm xong chữ ký.
 *
 * BỐN THỨ PHẢI ĐÚNG, THIẾU MỘT LÀ TỪ CHỐI:
 *
 *   Chữ ký   Ký bằng khoá riêng của Google. `createRemoteJWKSet` tự tải khoá công khai
 *            từ googleapis.com và tự nhớ, không phải tải lại mỗi lần.
 *
 *   aud      Phải đúng client ID của Mira. Thiếu chỗ này thì một token Google hợp lệ
 *            **của ứng dụng khác** cũng vào được Mira — đây là lỗ hổng kinh điển, và nó
 *            trông hoàn toàn bình thường khi thử vì token thật vẫn chạy.
 *
 *   iss      accounts.google.com, không phải nhà cung cấp nào khác.
 *
 *   email_verified  Google có tài khoản email chưa xác minh. Nhận email chưa xác minh
 *            nghĩa là ai đăng ký một địa chỉ bất kỳ cũng chiếm được tài khoản mang địa
 *            chỉ đó.
 *
 * KHÔNG CÓ CHẾ ĐỘ DEV BỎ QUA KIỂM. Vessel360 có `mock:<email>`; Mira thì không, vì máy
 * chủ dev và máy chủ thật ở đây là **cùng một máy** — một cờ bật nhầm là mở toang.
 */
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { DomainError } from '../shared/errors';

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export interface DanhTinhGoogle {
  readonly email: string;
  readonly ten: string | null;
  /** `sub` của Google: id không đổi kể cả khi người dùng đổi email. */
  readonly sub: string;
}

const tuChoi = (thongDiep: string): never => {
  throw new DomainError('unauthorized', 401, thongDiep);
};

export async function kiemTokenGoogle(clientId: string, idToken: unknown): Promise<DanhTinhGoogle> {
  if (clientId === '') {
    throw new DomainError(
      'unauthorized',
      503,
      'Máy chủ chưa cấu hình GOOGLE_CLIENT_ID nên chưa nhận đăng nhập Google.',
    );
  }
  if (typeof idToken !== 'string' || idToken === '') {
    throw new DomainError('bad_request', 400, 'Thiếu idToken.');
  }

  // Cho phép nhiều client ID ngăn cách bằng dấu phẩy — web và app có thể khác nhau.
  const audience = clientId
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');

  let payload;
  try {
    ({ payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      audience,
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
    }));
  } catch {
    // Không nói rõ sai ở đâu: chữ ký hỏng, hết hạn hay sai audience đều là "không hợp lệ".
    return tuChoi('Token Google không hợp lệ.');
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const daXacMinh = payload.email_verified === true || payload.email_verified === 'true';
  if (email === '' || !daXacMinh) return tuChoi('Tài khoản Google chưa xác minh email.');

  const sub = typeof payload.sub === 'string' ? payload.sub : '';
  if (sub === '') return tuChoi('Token Google thiếu định danh người dùng.');

  return { email, ten: typeof payload.name === 'string' ? payload.name : null, sub };
}
