export interface Health {
  readonly id: string;
  readonly date: string;
  readonly sleepMinutes: number | null;
  readonly steps: number | null;
  readonly energySelfRated: 1 | 2 | 3 | 4 | 5 | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
