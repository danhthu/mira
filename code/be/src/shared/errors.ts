import type { ErrorCode } from '@mira/contract';

/**
 * Lỗi nghiệp vụ có mã và mã HTTP đi kèm. Tầng HTTP bắt đúng lớp này và trả nguyên
 * `{ code, message }` của hợp đồng; mọi lỗi khác là lỗi lập trình và thành 500.
 */
export class DomainError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export const badRequest = (message: string) => new DomainError('bad_request', 400, message);
export const unauthorized = (message: string) => new DomainError('unauthorized', 401, message);
export const notFound = (message: string) => new DomainError('not_found', 404, message);
export const tierFull = (message: string) => new DomainError('tier_full', 409, message);
export const notEnoughSource = (message: string) =>
  new DomainError('not_enough_source', 409, message);
export const alreadyAnswered = (message: string) =>
  new DomainError('already_answered', 409, message);
