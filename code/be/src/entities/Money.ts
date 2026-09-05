export interface Money {
  readonly id: string;
  readonly month: string;
  readonly netIncome: number;
  readonly monthlyExpense: number;
  readonly netWorth: number;
  readonly debt: number;
  /** Tiết kiệm + đầu tư mỗi tháng — ô thứ tư trong 5 ô của `08-three-pillars.md`.
   *  Là số trừ cuối cùng của công thức bốc hơi, thiếu nó thì không tính được. */
  readonly savings: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
