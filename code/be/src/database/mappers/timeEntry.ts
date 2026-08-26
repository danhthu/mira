import type { TimeEntryRow } from '../../shared/types/rows';
import type { TimeBucket, TimeEntrySource } from '../../shared/types/enums';
import type { TimeEntry } from '../../entities/TimeEntry';

export function toTimeEntry(row: TimeEntryRow): TimeEntry {
  return {
    id: row.id,
    date: row.date,
    minutes: row.minutes,
    // CHECK constraint của bucket và source đã giới hạn đúng tập giá trị này.
    bucket: row.bucket as TimeBucket,
    personId: row.person_id,
    note: row.note,
    source: row.source as TimeEntrySource,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}
