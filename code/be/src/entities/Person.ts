export type { PersonRole, DunbarRing } from '../shared/types/enums';
import type { PersonRole, DunbarRing } from '../shared/types/enums';

export interface Person {
  readonly id: string;
  readonly name: string;
  readonly role: PersonRole;
  readonly birthYear: number | null;
  readonly distanceKm: number | null;
  readonly dunbarRing: DunbarRing;
  readonly desiredCadence: number | null;
  readonly hourglassEnabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
