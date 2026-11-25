/**
 * Đăng nhập và đọc token.
 *
 * Từ 25/11/2026 **không còn đăng ký bằng mật khẩu**. Đường vào duy nhất cho người mới là
 * Google; lần đầu đăng nhập thì tài khoản tự sinh. Đăng nhập bằng mật khẩu vẫn giữ cho
 * các tài khoản đã có (`danhthu`) và cho lúc Google chưa cấu hình xong.
 *
 * Ba luật không được nới:
 *   1. Mật khẩu chỉ tồn tại dạng bcrypt. Không log, không trả về, không lưu bản gốc.
 *   2. Sai tên và sai mật khẩu trả về **cùng một lỗi**. Phân biệt hai thứ đó là nói cho
 *      người lạ biết tài khoản nào có thật.
 *   3. Token mang `sub` là id người dùng. Tầng route lấy id từ token, không bao giờ lấy
 *      từ tham số do client gửi lên.
 */
import { compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { AuthResponse, User } from '@mira/contract';
import type { UserRepository, UserRec } from '../database/repositories/UserRepository';
import { DomainError } from '../shared/errors';
import { kiemTokenGoogle } from './google';

export interface AuthDeps {
  readonly users: UserRepository;
  readonly jwtSecret: string;
  readonly ttlSeconds: number;
  /** Rỗng nghĩa là chưa bật đăng nhập Google; route trả 503 chứ không chạy nửa vời. */
  readonly googleClientId: string;
}

const unauthorized = (message: string) => new DomainError('unauthorized', 401, message);

const toPublic = (u: UserRec): User => ({
  id: u.id,
  username: u.username,
  displayName: u.displayName,
});

function key(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

async function phatToken(deps: AuthDeps, user: UserRec): Promise<AuthResponse> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${deps.ttlSeconds}s`)
    .sign(key(deps.jwtSecret));
  return { user: toPublic(user), token, expiresIn: deps.ttlSeconds };
}

export async function dangNhap(
  deps: AuthDeps,
  username: string,
  password: string,
): Promise<AuthResponse> {
  const user = await deps.users.findByUsername(username.trim());

  // Không có tài khoản thì vẫn chạy một lần bcrypt rồi mới trả lỗi: nếu trả ngay thì thời
  // gian phản hồi khác nhau sẽ tiết lộ tài khoản nào có thật. Người vào bằng Google cũng
  // không có mật khẩu, và cũng phải mất đúng ngần ấy thời gian để từ chối.
  const hashDeCompare =
    user?.passwordHash ?? '$2a$12$0000000000000000000000000000000000000000000000000000';
  const dung = await compare(password, hashDeCompare).catch(() => false);

  if (user === null || user.passwordHash === null || !dung) {
    throw unauthorized('Sai tên đăng nhập hoặc mật khẩu.');
  }
  return phatToken(deps, user);
}

/**
 * Đăng nhập bằng Google. Chưa có tài khoản thì tạo luôn — đó chính là chỗ "đăng ký" đã
 * biến mất: không có màn riêng, lần đầu vào là lần tạo.
 *
 * Nối người quay lại bằng **email đã xác minh**, không bằng tên. Tên đăng nhập suy từ
 * phần trước @ chỉ để hiển thị cho dễ đọc, và có thể bị thêm hậu tố nếu trùng.
 */
export async function dangNhapGoogle(deps: AuthDeps, idToken: unknown): Promise<AuthResponse> {
  const dt = await kiemTokenGoogle(deps.googleClientId, idToken);

  const daCo = await deps.users.findByEmail(dt.email);
  if (daCo !== null) return phatToken(deps, daCo);

  const user = await deps.users.createFromGoogle(tenTuEmail(dt.email), dt.ten, dt.email, dt.sub);
  return phatToken(deps, user);
}

/** "Danh.Thu+mira@gmail.com" → "danh.thu". Rỗng hoặc quá ngắn thì lấy tên chung. */
function tenTuEmail(email: string): string {
  const goc = email.split('@')[0] ?? '';
  const sach = goc
    .toLowerCase()
    .replace(/\+.*$/, '')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 28);
  return sach.length >= 3 ? sach : 'nguoi-dung';
}

/** Đọc id người dùng từ header. Ném 401 nếu thiếu, sai chữ ký, hoặc hết hạn. */
export async function docToken(deps: AuthDeps, authorization: string | undefined): Promise<string> {
  const prefix = 'Bearer ';
  if (authorization === undefined || !authorization.startsWith(prefix)) {
    throw unauthorized('Cần đăng nhập.');
  }
  try {
    const { payload } = await jwtVerify(authorization.slice(prefix.length), key(deps.jwtSecret));
    if (typeof payload.sub !== 'string' || payload.sub === '') {
      throw unauthorized('Token không hợp lệ.');
    }
    return payload.sub;
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw unauthorized('Phiên đã hết hạn, đăng nhập lại.');
  }
}
