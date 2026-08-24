export interface WorkLoad {
  readonly id: string;
  readonly weekStart: string;
  readonly workMinutes: number;
  readonly commuteMinutes: number;
  readonly prepMinutes: number;
  readonly recoveryMinutes: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
