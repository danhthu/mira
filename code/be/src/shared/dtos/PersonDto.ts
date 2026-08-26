import type { PersonRole, DunbarRing } from '../types/enums';

export interface CreatePersonDto {
  name: string;
  role: PersonRole;
  birthYear?: number;
  distanceKm?: number;
  dunbarRing?: DunbarRing;
  desiredCadence?: number;
  hourglassEnabled?: boolean;
}

export interface UpdatePersonDto {
  name?: string;
  role?: PersonRole;
  birthYear?: number | null;
  distanceKm?: number | null;
  dunbarRing?: DunbarRing;
  desiredCadence?: number | null;
  hourglassEnabled?: boolean;
}
