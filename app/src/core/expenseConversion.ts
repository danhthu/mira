import { DAYS_IN_MONTH } from './constants';

export interface ExpenseConversionInput {
  amount: number;          // integer VND
  lifeRate: number | null; // VND/hour, null if not calculated
  monthlyExpense: number;  // integer VND
}

export interface ExpenseConversionResult {
  hoursCost: number | null;
  freedomDaysCost: number | null;
}

export function convertExpense(input: ExpenseConversionInput): ExpenseConversionResult {
  if (input.amount === 0) {
    return { hoursCost: 0, freedomDaysCost: 0 };
  }

  const hoursCost =
    input.lifeRate === null || input.lifeRate === 0
      ? null
      : input.amount / input.lifeRate;

  const freedomDaysCost =
    input.monthlyExpense === 0
      ? null
      : (input.amount / input.monthlyExpense) * DAYS_IN_MONTH;

  return { hoursCost, freedomDaysCost };
}
