import type { TimeBucket } from './shared';

export type MediaType = 'photo' | 'audio';

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
