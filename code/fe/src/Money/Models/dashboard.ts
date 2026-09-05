/**
 * Ghép hai nguồn dữ liệu thành đúng một cụm cho màn Tài chính. Tách khỏi hook để
 * test được mà không cần dựng React hay kho lưu trữ.
 */

import { MetricState, emptyMetric } from '../../Core/dataState';
import { averageNetIncome } from '../../Core/money';
import { TimeEntryLike } from '../../Core/time';
import { lifeRateFromEntries } from './lifeRate';
import { MoneyRecordLike, MoneySummary, summarizeMoney } from './summary';

export function moneyDashboard(
  records: readonly MoneyRecordLike[],
  entries: readonly TimeEntryLike[],
  now: Date = new Date(),
): MetricState<MoneySummary> {
  const income = averageNetIncome(records.map((record) => record.netIncome));
  const lifeRate =
    income.status === 'empty'
      ? emptyMetric<number>(income.reason)
      : lifeRateFromEntries(income.value, entries, now);
  return summarizeMoney(records, lifeRate);
}
