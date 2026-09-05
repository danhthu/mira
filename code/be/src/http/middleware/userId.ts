import type { MiddlewareHandler } from 'hono';
import { DEFAULT_USER_ID, USER_ID_HEADER } from '../../shared/constants';

export interface AppEnv {
  Variables: {
    userId: string;
  };
}

// V1 dev: chưa có xác thực thật, chỉ phân vùng dữ liệu theo header. Nợ kỹ thuật đã
// ghi trong hợp đồng — phải thay bằng auth thật trước khi mở ra ngoài máy.
export const withUserId: MiddlewareHandler<AppEnv> = async (c, next) => {
  const header = c.req.header(USER_ID_HEADER);
  c.set('userId', header === undefined || header.trim() === '' ? DEFAULT_USER_ID : header);
  await next();
};
