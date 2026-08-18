export type PersonRole = 'child' | 'parent' | 'partner' | 'friend' | 'self' | 'other';
export type DunbarRing = 5 | 15 | 50;

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
