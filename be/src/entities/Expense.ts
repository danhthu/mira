import type { TimeBucket } from './shared';

export type ExpenseSourceType = 'manual' | 'sms' | 'notification';

export interface Expense {
  readonly id: string;
  readonly occurredAt: string;
  readonly amount: number;
  readonly description: string;
  readonly bucket: TimeBucket | null;
  readonly sourceType: ExpenseSourceType;
  readonly confirmed: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
