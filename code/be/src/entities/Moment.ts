import type { MomentKind, SaltAnswer } from '../shared/types/enums';

export type { MomentKind, SaltAnswer };

/**
 * Một hạt trong hũ. Chỉ có chữ, ngày, và kẹo hay muối — không gắn người, không gắn
 * nhãn, không phân loại. Chữ được phép rỗng: bấm kẹo hay muối mà không viết gì
 * vẫn là một hạt.
 */
export interface Moment {
  readonly id: string;
  readonly date: string;
  readonly kind: MomentKind;
  readonly text: string | null;
  /** Chỉ hạt muối mới có: ngày Mira hỏi lại, đúng một lần. */
  readonly revisitAt: string | null;
  readonly revisitAnswer: SaltAnswer | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
