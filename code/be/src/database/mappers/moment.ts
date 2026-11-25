import type { MomentRow } from '../../shared/types/rows';
import type { MomentKind, SaltAnswer } from '../../shared/types/enums';
import type { Moment } from '../../entities/Moment';

export function toMoment(row: MomentRow): Moment {
  return {
    id: row.id,
    date: row.date,
    // CHECK constraint ở migration 002 giới hạn đúng hai giá trị này, và chỉ
    // repository trong thư mục này mới ghi vào cột.
    kind: row.kind as MomentKind,
    text: row.text,
    revisitAt: row.revisit_at,
    revisitAnswer: row.revisit_answer as SaltAnswer | null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}
