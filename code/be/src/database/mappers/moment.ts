import type { MomentRow } from '../../shared/types/rows';
import type { TimeBucket, MediaType } from '../../shared/types/enums';
import type { Moment } from '../../entities/Moment';

export function toMoment(row: MomentRow): Moment {
  return {
    id: row.id,
    occurredAt: row.occurred_at,
    text: row.text,
    mediaUri: row.media_uri,
    // CHECK constraint của media_type giới hạn 'photo' | 'audio'; bucket không có
    // CHECK ở DB nhưng chỉ repository này ghi vào, luôn qua TimeBucket.
    mediaType: row.media_type as MediaType | null,
    personIds: parsePersonIds(row.person_ids),
    bucket: row.bucket as TimeBucket | null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

// Cột person_ids lưu mảng id dạng chuỗi JSON (giữ giống SQLite bên fe, không dùng
// kiểu mảng riêng của Postgres) nên phải parse khi đọc và stringify khi ghi.
export function parsePersonIds(raw: string): string[] {
  return JSON.parse(raw) as string[];
}

export function serializePersonIds(ids: string[]): string {
  return JSON.stringify(ids);
}
