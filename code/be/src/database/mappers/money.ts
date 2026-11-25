import type { MoneyRow } from '../../shared/types/rows';
import type { Money } from '../../entities/Money';

export function toMoney(row: MoneyRow): Money {
  return {
    id: row.id,
    month: row.month,
    netIncome: row.net_income,
    monthlyExpense: row.monthly_expense,
    debtPayment: row.debt_payment,
    debtBalance: row.debt_balance,
    netWorth: row.net_worth,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}
