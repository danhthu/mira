import type { AnswerRevisitDto, CreateMomentDto } from '../shared/dtos/MomentDto';
import type { Moment } from '../entities/Moment';
import type { MomentRepository } from '../database/repositories/MomentRepository';
import { alreadyAnswered, badRequest, notFound } from '../shared/errors';
import { assertDate } from './time';

export interface MomentDeps {
  readonly moments: MomentRepository;
}

const KINDS = ['candy', 'salt'] as const;
const ANSWERS = ['same', 'lighter', 'gone'] as const;

export async function createMoment(deps: MomentDeps, userId: string, dto: CreateMomentDto): Promise<Moment> {
  assertDate(dto.date, 'date');
  if (!KINDS.includes(dto.kind)) {
    throw badRequest('kind phải là candy hoặc salt');
  }
  // Chữ được phép rỗng: bấm kẹo hay muối mà không viết gì vẫn là một hạt.
  const text = dto.text == null || dto.text.trim() === '' ? null : dto.text.trim();
  return deps.moments.create(userId, { date: dto.date, kind: dto.kind, text });
}

/**
 * Ghi câu trả lời cho một hạt muối. Repository chỉ ghi được khi hạt còn chưa trả lời,
 * nên `null` trở về có hai nghĩa: không tìm thấy, hoặc đã trả lời rồi. Đọc lại hạt để
 * phân biệt — Mira hứa hỏi một lần thì không được hỏi lần hai.
 */
export async function answerRevisit(
  deps: MomentDeps,
  userId: string,
  id: string,
  dto: AnswerRevisitDto,
): Promise<Moment> {
  if (!ANSWERS.includes(dto.answer)) {
    throw badRequest('answer phải là same, lighter hoặc gone');
  }

  const answered = await deps.moments.answerRevisit(userId, id, dto);
  if (answered !== null) {
    return answered;
  }

  const existing = await deps.moments.findById(userId, id);
  if (existing === null || existing.kind !== 'salt') {
    throw notFound('Không có hạt muối với id này');
  }
  throw alreadyAnswered('Hạt muối này đã được hỏi rồi. Mira không hỏi lần hai.');
}

/** Hạt muối tới hạn hỏi lại. Bỏ qua cũng được, và Mira không đếm số lần bỏ qua. */
export async function dueForRevisit(deps: MomentDeps, userId: string, on: string): Promise<Moment[]> {
  assertDate(on, 'on');
  return deps.moments.findDueForRevisit(userId, on);
}
