/**
 * Kiểu request/response trung lập với framework, và bộ phụ thuộc mà bảng route nhận.
 * Nhờ lớp này mà `routes.ts` không biết gì về Fastify: cùng một bảng route chạy được
 * dưới một server khác nếu sau này cần.
 */
import type { ApiError } from '@mira/contract';
import type { IDatabase } from '../shared/interfaces/IDatabase';
import { TimeEntryRepository } from '../database/repositories/TimeEntryRepository';
import { MomentRepository } from '../database/repositories/MomentRepository';
import { GoalRepository } from '../database/repositories/GoalRepository';
import { MoneyRepository } from '../database/repositories/MoneyRepository';
import { HabitRepository } from '../database/repositories/HabitRepository';
import { NepRepository } from '../database/repositories/NepRepository';
import { NhacRepository } from '../database/repositories/NhacRepository';
import { DanhMucRepository } from '../database/repositories/DanhMucRepository';
import { UserRepository } from '../database/repositories/UserRepository';
import type { AuthDeps } from '../services/auth';
import { DomainError } from '../shared/errors';

/** Tên header luôn viết thường. */
export interface Req {
  params: Record<string, string>;
  query: Record<string, string | undefined>;
  headers: Record<string, string | undefined>;
  body: unknown;
}

export interface Res {
  status: number;
  body?: unknown;
}

/**
 * Handler của route cần đăng nhập nhận thêm `userId` — và đó là **tham số riêng**, không
 * nằm trong `req`. Lý do: id người dùng chỉ đến từ token đã xác minh, nên không có đường
 * nào để client tự gửi lên một id khác.
 */
export type Handler = (req: Req, deps: AppDeps, userId: string) => Promise<Res>;

/** Route không cần đăng nhập: /health, đăng ký, đăng nhập. */
export type PublicHandler = (req: Req, deps: AppDeps) => Promise<Res>;

export interface AppDeps {
  /** Adapter thô, chỉ dùng cho việc cần transaction như nhập cả bộ. */
  readonly db: IDatabase;
  readonly users: UserRepository;
  readonly timeEntries: TimeEntryRepository;
  readonly moments: MomentRepository;
  readonly goals: GoalRepository;
  readonly money: MoneyRepository;
  readonly habits: HabitRepository;
  readonly nep: NepRepository;
  readonly nhac: NhacRepository;
  readonly danhMuc: DanhMucRepository;
  readonly auth: AuthDeps;
  readonly wakingMinutesPerWeek?: number;
}

export function buildDeps(
  db: IDatabase,
  jwtSecret: string,
  ttlSeconds: number,
  wakingMinutesPerWeek: number | undefined,
  googleClientId: string,
): AppDeps {
  const users = new UserRepository(db);
  return {
    db,
    users,
    wakingMinutesPerWeek,
    timeEntries: new TimeEntryRepository(db),
    moments: new MomentRepository(db),
    goals: new GoalRepository(db),
    money: new MoneyRepository(db),
    habits: new HabitRepository(db),
    nep: new NepRepository(db),
    nhac: new NhacRepository(db),
    danhMuc: new DanhMucRepository(db),
    auth: { users, jwtSecret, ttlSeconds, googleClientId },
  };
}

/**
 * Bọc một handler: lỗi nghiệp vụ thành đúng mã HTTP của nó, lỗi khác thành 500 và
 * được ném tiếp để tầng server ghi log — không nuốt lỗi lập trình.
 */
export async function run(handler: PublicHandler, req: Req, deps: AppDeps): Promise<Res> {
  try {
    return await handler(req, deps);
  } catch (error) {
    if (error instanceof DomainError) {
      const body: ApiError = { code: error.code, message: error.message };
      return { status: error.status, body };
    }
    throw error;
  }
}

/** Đọc một tham số query bắt buộc. */
export function requireQuery(req: Req, name: string): string {
  const value = req.query[name];
  if (value === undefined || value === '') {
    throw new DomainError('bad_request', 400, `Thiếu tham số ${name}`);
  }
  return value;
}

/** Ép body về object để đọc trường. Body không phải object là lỗi 400. */
export function asObject(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new DomainError('bad_request', 400, 'Body phải là một object JSON');
  }
  return body as Record<string, unknown>;
}
