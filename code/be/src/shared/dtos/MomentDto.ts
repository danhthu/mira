import type { MomentKind, SaltAnswer } from '../types/enums';

export interface CreateMomentDto {
  date: string;
  kind: MomentKind;
  /** Được phép bỏ trống: hạt không chữ vẫn là một hạt. */
  text?: string | null;
}

export interface UpdateMomentDto {
  text?: string | null;
}

/** Trả lời câu hỏi lại sau 42 ngày. Mira chỉ hỏi một lần nên chỉ ghi được một lần. */
export interface AnswerRevisitDto {
  answer: SaltAnswer;
}
