import type { TimeBucket, MediaType } from '../shared/types/enums';

export type { MediaType };

export interface Moment {
  readonly id: string;
  readonly occurredAt: string;
  readonly text: string | null;
  readonly mediaUri: string | null;
  readonly mediaType: MediaType | null;
  readonly personIds: string[];
  readonly bucket: TimeBucket | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
