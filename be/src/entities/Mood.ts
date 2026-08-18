export interface Mood {
  readonly id: string;
  readonly occurredAt: string;
  readonly level: 1 | 2 | 3 | 4 | 5;
  readonly note: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
