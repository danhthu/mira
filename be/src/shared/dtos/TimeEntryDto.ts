import type { TimeBucket, TimeEntrySource } from '../../entities/TimeEntry';

export interface CreateTimeEntryDto {
  date: string;
  minutes: number;
  bucket: TimeBucket;
  personId?: string;
  note?: string;
  source?: TimeEntrySource;
}

export interface UpdateTimeEntryDto {
  minutes?: number;
  bucket?: TimeBucket;
  personId?: string | null;
  note?: string | null;
}
