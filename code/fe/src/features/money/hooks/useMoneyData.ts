import { useCallback, useEffect, useState } from 'react';
import {
  findAllMoneyRecords,
  findAllWorkLoads,
} from '@/db/repositories/moneyRepository';
import { findExpensesByMonth } from '@/db/repositories/expenseRepository';
import { calculateLifeRate } from '@/core/lifeRate';
import { calculateFreedomCapital } from '@/core/freedomCapital';
import { convertExpense } from '@/core/expenseConversion';
import type { LifeRateResult } from '@/core/lifeRate';
import type { FreedomCapitalResult } from '@/core/freedomCapital';
import type { Expense, Money } from '@/db/schema';
import {
  buildWorkPeriods,
  currentMonth,
  liquidNetWorth,
  monthlySaving,
} from '../lib/deriveMoney';

export interface ExpenseWithCost {
  expense: Expense;
  hoursCost: number | null;
  freedomDaysCost: number | null;
}

export interface MoneyData {
  month: string;
  latest: Money | null;
  lifeRate: LifeRateResult;
  freedom: FreedomCapitalResult | null;
  expenses: ExpenseWithCost[];
}

interface MoneyDataState {
  isLoading: boolean;
  data: MoneyData;
  reload: () => Promise<void>;
}

const NO_DATA: LifeRateResult = { status: 'no_data' };

export function useMoneyData(): MoneyDataState {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<MoneyData>({
    month: currentMonth(new Date()),
    latest: null,
    lifeRate: NO_DATA,
    freedom: null,
    expenses: [],
  });

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const month = currentMonth(new Date());
      const [records, loads, monthExpenses] = await Promise.all([
        findAllMoneyRecords(),
        findAllWorkLoads(),
        findExpensesByMonth(month),
      ]);

      const lifeRate = calculateLifeRate(buildWorkPeriods(records, loads));
      const latest = records[0] ?? null;

      const freedom =
        latest === null
          ? null
          : calculateFreedomCapital({
              netWorth: liquidNetWorth(latest),
              monthlyExpense: latest.monthlyExpense,
              monthlySaving: monthlySaving(latest),
            });

      const ratePerHour = lifeRate.status === 'ok' ? lifeRate.ratePerHour : null;
      const expenses = monthExpenses.map((item) => {
        const cost = convertExpense({
          amount: item.amount,
          lifeRate: ratePerHour,
          monthlyExpense: latest?.monthlyExpense ?? 0,
        });
        return { expense: item, ...cost };
      });

      setData({ month, latest, lifeRate, freedom, expenses });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { isLoading, data, reload: load };
}
