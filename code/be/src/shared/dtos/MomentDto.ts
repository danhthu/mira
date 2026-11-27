import type { MomentKind, SaltAnswer } from '../types/enums';

export interface CreateMomentDto {
  date: string;
  kind: MomentKind;
  /** Được phép bỏ trống: hạt không chữ vẫn là một hạt. */
  text?: string | null;
}

export interface UpdateMomentDto {
  text?: string | null;
  /**
   * Đổi kẹo ↔ muối.
   *
   * Cần, vì từ 25/11/2026 hạt do **chat tự ghi**: một câu đọc nhầm cảm xúc bỏ hạt vào
   * sai hũ, và hai con số trên trang chủ là đếm theo hũ. Không có đường sửa thì con số
   * ấy sai vĩnh viễn.
   *
   * Đổi loại thì `revisit_at` phải theo: hạt muối có hẹn hỏi lại sau 42 ngày, hạt kẹo
   * không có hẹn nào.
   */
  kind?: MomentKind;
}

/** Trả lời câu hỏi lại sau 42 ngày. Mira chỉ hỏi một lần nên chỉ ghi được một lần. */
export interface AnswerRevisitDto {
  answer: SaltAnswer;
}
