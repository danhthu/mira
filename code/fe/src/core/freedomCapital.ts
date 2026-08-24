import { DAYS_IN_MONTH } from './constants';

export interface FreedomCapitalInput {
  netWorth: number;         // integer VND, can be negative
  monthlyExpense: number;   // integer VND, must be > 0
  monthlySaving?: number;   // integer VND, can be 0 or negative
}

export type FreedomMonthsDisplay =
  | { unit: 'days'; value: number }
  | { unit: 'months'; value: number }
  | { unit: 'years'; value: number };

export type FreedomCapitalResult =
  | {
      status: 'ok';
      freedomMonths: number;
      display: FreedomMonthsDisplay;
      freedomDaysGained: number | null;
    }
  | {
      status: 'in_debt';
      distanceMonths: number | null;
    }
  | { status: 'no_expense_data' };

export function formatFreedomMonths(months: number): FreedomMonthsDisplay {
  if (months < 1) {
    return { unit: 'days', value: Math.floor(months * DAYS_IN_MONTH) };
  }
  if (months <= 24) {
    return { unit: 'months', value: Math.round(months) };
  }
  return { unit: 'years', value: Math.round((months / 12) * 10) / 10 };
}

export function calculateFreedomCapital(input: FreedomCapitalInput): FreedomCapitalResult {
  if (input.monthlyExpense === 0) {
    return { status: 'no_expense_data' };
  }

  if (input.netWorth < 0) {
    const { monthlySaving } = input;
    const distanceMonths =
      monthlySaving !== undefined && monthlySaving > 0
        ? Math.abs(input.netWorth) / monthlySaving
        : null;
    return { status: 'in_debt', distanceMonths };
  }

  const freedomMonths = input.netWorth / input.monthlyExpense;
  const { monthlySaving } = input;
  const freedomDaysGained =
    monthlySaving !== undefined && monthlySaving > 0
      ? (monthlySaving / input.monthlyExpense) * DAYS_IN_MONTH
      : null;

  return {
    status: 'ok',
    freedomMonths,
    display: formatFreedomMonths(freedomMonths),
    freedomDaysGained,
  };
}
