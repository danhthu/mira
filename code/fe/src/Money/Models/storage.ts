/**
 * Cầu nối giữa kho cục bộ và selector. Ghi vào máy trước, không chờ mạng —
 * tầng đồng bộ tự nhận bảng `money` qua allowlist (`Common/Sync/constants.ts`).
 */

import { TimeEntryLike } from '../../Core/time';
import { Money } from '../../Common/Entities/money';
import {
  moneyRepository,
  timeEntryRepository,
} from '../../Common/Repositories';
import { MoneyRecordLike } from './summary';

/** Năm ô nhập của một tháng. Mọi số là VND nguyên. */
export type MonthlyMoneyDraft = MoneyRecordLike;

function toRecord(row: Money): MoneyRecordLike {
  return {
    month: row.month,
    netIncome: row.netIncome,
    monthlyExpense: row.monthlyExpense,
    debt: row.debt,
    savings: row.savings,
    netWorth: row.netWorth,
  };
}

/** Xếp từ tháng cũ tới tháng mới — đúng thứ tự `averageNetIncome` mong đợi. */
export async function loadMoneyRecords(): Promise<MoneyRecordLike[]> {
  const rows = await moneyRepository.list();
  return rows
    .map(toRecord)
    .sort((left, right) => (left.month < right.month ? -1 : 1));
}

export async function saveMonthlyMoney(draft: MonthlyMoneyDraft): Promise<void> {
  const existing = await moneyRepository.findOne((row) => row.month === draft.month);
  if (existing) {
    await moneyRepository.update(
      (row) => row.month === draft.month,
      (row) => {
        row.netIncome = draft.netIncome;
        row.monthlyExpense = draft.monthlyExpense;
        row.debt = draft.debt;
        row.savings = draft.savings;
        row.netWorth = draft.netWorth;
      },
    );
    return;
  }

  const row = new Money();
  row.month = draft.month;
  row.netIncome = draft.netIncome;
  row.monthlyExpense = draft.monthlyExpense;
  row.debt = draft.debt;
  row.savings = draft.savings;
  row.netWorth = draft.netWorth;
  await moneyRepository.add(row);
  await moneyRepository.save();
}

export async function loadTimeEntries(): Promise<TimeEntryLike[]> {
  const rows = await timeEntryRepository.list();
  return rows.map((row) => ({
    date: row.date,
    minutes: row.minutes,
    bucket: row.bucket,
  }));
}
