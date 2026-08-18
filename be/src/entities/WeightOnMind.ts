export interface WeightOnMind {
  readonly id: string;
  readonly text: string;
  readonly writtenAt: string;
  readonly reviewAt: string;
  readonly reviewed: boolean;
  readonly stillHeavy: boolean | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
