import type { TimeBucket, TimeEntrySource } from '../shared/types/enums';

export type { TimeBucket, TimeEntrySource };

export interface TimeEntry {
  readonly id: string;
  readonly date: string;
  readonly minutes: number;
  readonly bucket: TimeBucket;
  /** Giờ vàng: lát cắt bên trong nhóm gia đình, giờ thật sự có mặt. */
  readonly golden: boolean;
  readonly note: string | null;
  readonly source: TimeEntrySource;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
