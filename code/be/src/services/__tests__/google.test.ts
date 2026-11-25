/**
 * Kiểm `kiemTokenGoogle` từ chối đúng thứ cần từ chối.
 *
 * Token thật do Google ký nên không giả được trong test. Thay vì cố dựng một cặp khoá
 * giả, test ở đây chặn các đường vào **không cần chữ ký đúng** mới lọt — và đó mới là
 * chỗ hay thủng:
 *
 *   - Chưa cấu hình client ID mà vẫn nhận token (nhận bừa).
 *   - Chuỗi rỗng, không phải chuỗi, hay chuỗi không phải JWT.
 *
 * Phần `aud`, `iss` và `email_verified` do `jose` và mã trong `google.ts` lo; không có
 * test đơn vị nào thay được một lần thử thật với client ID thật.
 */
import { describe, it, expect } from 'vitest';
import { kiemTokenGoogle } from '../google';
import { DomainError } from '../../shared/errors';

const CLIENT = '123456789-abc.apps.googleusercontent.com';

async function batLoi(fn: () => Promise<unknown>): Promise<DomainError> {
  try {
    await fn();
  } catch (e) {
    if (e instanceof DomainError) return e;
    throw e;
  }
  throw new Error('Lẽ ra phải ném lỗi mà lại không.');
}

describe('kiemTokenGoogle', () => {
  it('chưa cấu hình client ID thì trả 503, không phải nhận bừa', async () => {
    const e = await batLoi(() => kiemTokenGoogle('', 'bat-ky-chuoi-nao'));
    expect(e.status).toBe(503);
  });

  it('client ID rỗng thì ngay cả chuỗi rỗng cũng là 503, không phải 400', async () => {
    // Thứ tự kiểm có ý nghĩa: chưa bật tính năng thì nói chưa bật, đừng nói thiếu tham số.
    const e = await batLoi(() => kiemTokenGoogle('', ''));
    expect(e.status).toBe(503);
  });

  it('thiếu idToken thì 400', async () => {
    expect((await batLoi(() => kiemTokenGoogle(CLIENT, ''))).status).toBe(400);
    expect((await batLoi(() => kiemTokenGoogle(CLIENT, undefined))).status).toBe(400);
    expect((await batLoi(() => kiemTokenGoogle(CLIENT, 12345))).status).toBe(400);
    expect((await batLoi(() => kiemTokenGoogle(CLIENT, { idToken: 'x' }))).status).toBe(400);
  });

  it('chuỗi không phải JWT thì 401 và không nói rõ sai ở đâu', async () => {
    const e = await batLoi(() => kiemTokenGoogle(CLIENT, 'khong-phai-jwt'));
    expect(e.status).toBe(401);
    expect(e.message).toBe('Token Google không hợp lệ.');
  });

  it('JWT đúng hình dạng nhưng chữ ký bậy vẫn 401', async () => {
    const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const gia = [
      b64({ alg: 'RS256', kid: 'khong-co-that' }),
      b64({
        iss: 'https://accounts.google.com',
        aud: CLIENT,
        sub: '1',
        email: 'ai-do@gmail.com',
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
      'chu-ky-bay',
    ].join('.');

    const e = await batLoi(() => kiemTokenGoogle(CLIENT, gia));
    expect(e.status).toBe(401);
  });
});
