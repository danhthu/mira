import type { TimeBucket, TimeEntrySource } from '../types/enums';

export interface CreateTimeEntryDto {
  date: string;
  minutes: number;
  bucket: TimeBucket;
  golden?: boolean;
  note?: string | null;
  source?: TimeEntrySource;
  nepId?: string | null;
}

export interface UpdateTimeEntryDto {
  minutes?: number;
  bucket?: TimeBucket;
  golden?: boolean;
  note?: string | null;
}
