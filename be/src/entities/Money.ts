export interface Money {
  readonly id: string;
  readonly month: string;
  readonly netIncome: number;
  readonly monthlyExpense: number;
  readonly netWorth: number;
  readonly debt: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
