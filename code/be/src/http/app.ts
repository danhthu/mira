/**
 * Gắn bảng route vào Fastify. Mọi logic nằm ở `routes.ts`; file này chỉ dịch giữa
 * request của Fastify và `Req`/`Res` trung lập.
 */
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import type { AppDeps, PublicHandler } from './engine';
import { run } from './engine';
import { readToken } from '../services/auth';
import { routes } from './routes';

export interface AppOptions {
  readonly deps: AppDeps;
  /** Gốc được phép gọi API. Trình duyệt chỉ cho web ở các gốc này gọi sang. */
  readonly corsOrigins: readonly string[];
  readonly logger: boolean;
}

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger });

  app.register(cors, {
    origin: options.corsOrigins.length === 0 ? false : [...options.corsOrigins],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  });

  for (const route of routes) {
    app.route({
      method: route.method,
      url: route.path,
      handler: async (request, reply) => {
        const req = {
          params: request.params as Record<string, string>,
          query: request.query as Record<string, string | undefined>,
          headers: request.headers as Record<string, string | undefined>,
          body: request.body,
        };
        // Mặc định là đóng: route nào không khai `cong_khai` đều phải có token hợp lệ,
        // và id người dùng lấy từ token chứ không từ bất cứ thứ gì client gửi lên.
        const guarded: PublicHandler =
          route.cong_khai === true
            ? (route.handler as PublicHandler)
            : async (r, deps) => {
                const userId = await readToken(deps.auth, r.headers.authorization);
                return (route.handler as (req: typeof r, d: typeof deps, u: string) => Promise<typeof res>)(
                  r,
                  deps,
                  userId,
                );
              };
        const res = await run(guarded, req, options.deps);
        reply.status(res.status);
        return res.body === undefined ? reply.send() : reply.send(res.body);
      },
    });
  }

  /**
   * Lỗi không phải DomainError là lỗi lập trình: ghi log đầy đủ, trả ra ngoài một câu
   * chung, không rò chi tiết nội bộ cho client.
   *
   * NHƯNG LỖI 4xX CỦA CHÍNH FASTIFY THÌ GIỮ NGUYÊN MÃ. Gửi sai `content-type` là lỗi
   * 415 của người gọi; gộp nó thành 500 "Lỗi máy chủ" là nói với người gọi rằng máy chủ
   * sập, và họ đi tìm ở đúng chỗ không có gì. Tôi vừa mất mấy phút vào đúng cái đó.
   *
   * Thân lỗi cũng phải khớp: trả `code: 'bad_request'` kèm `status: 500` là hai câu nói
   * ngược nhau trong cùng một phản hồi.
   */
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'unhandled error');
    const e = error as { statusCode?: number; message?: string };
    const status = e.statusCode ?? 500;
    if (status >= 400 && status < 500) {
      reply.status(status).send({ code: 'bad_request', message: e.message ?? 'Yêu cầu không hợp lệ' });
      return;
    }
    reply.status(500).send({ code: 'internal', message: 'Lỗi máy chủ' });
  });

  return app;
}
