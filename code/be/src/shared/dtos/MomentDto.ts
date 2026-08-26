import type { MediaType, TimeBucket } from '../types/enums';

export interface CreateMomentDto {
  occurredAt: string;
  text?: string;
  mediaUri?: string;
  mediaType?: MediaType;
  personIds?: string[];
  bucket?: TimeBucket;
}

export interface UpdateMomentDto {
  text?: string | null;
  mediaUri?: string | null;
  mediaType?: MediaType | null;
  personIds?: string[];
  bucket?: TimeBucket | null;
}
