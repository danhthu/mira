import type { TimeBucket } from './shared';

export type { TimeBucket };
export type TimeEntrySource = 'manual' | 'calendar' | 'widget';

export interface TimeEntry {
  readonly id: string;
  readonly date: string;
  readonly minutes: number;
  readonly bucket: TimeBucket;
  readonly personId: string | null;
  readonly note: string | null;
  readonly source: TimeEntrySource;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
