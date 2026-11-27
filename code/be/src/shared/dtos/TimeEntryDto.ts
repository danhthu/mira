import type { TimeBucket, TimeEntrySource } from '../types/enums';

export interface CreateTimeEntryDto {
  date: string;
  minutes: number;
  bucket: TimeBucket;
  golden?: boolean;
  note?: string | null;
  source?: TimeEntrySource;
  routineId?: string | null;
  categoryId?: string | null;
}

export interface UpdateTimeEntryDto {
  categoryId?: string | null;
  minutes?: number;
  bucket?: TimeBucket;
  golden?: boolean;
  note?: string | null;
}
