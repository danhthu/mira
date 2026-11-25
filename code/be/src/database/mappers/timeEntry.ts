import type { TimeEntryRow } from '../../shared/types/rows';
import type { TimeBucket, TimeEntrySource } from '../../shared/types/enums';
import type { TimeEntry } from '../../entities/TimeEntry';

export function toTimeEntry(row: TimeEntryRow): TimeEntry {
  return {
    id: row.id,
    date: row.date,
    minutes: row.minutes,
    // CHECK constraint ở migration 002 giới hạn bucket và source đúng các giá trị
    // của union; chỉ repository trong thư mục này mới ghi vào hai cột đó.
    bucket: row.bucket as TimeBucket,
    golden: row.golden,
    note: row.note,
    source: row.source as TimeEntrySource,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}
