/**
 * Selector của trụ Tài chính: đọc các bản ghi tháng, gọi hàm trong `Core/money.ts`,
 * gom kết quả thành một cụm để màn hình chỉ việc hiển thị.
 *
 * Không có công thức nào ở đây. Mỗi chỉ số vẫn giữ nguyên `MetricState` của Core,
 * nên màn hình buộc phải xử lý đủ ba nhánh — đó là cách `00-vision.md` rủi ro #3
 * được cưỡng chế bằng kiểu chứ không bằng trí nhớ người viết UI.
 */

import { INCOME_AVERAGE_MONTHS } from '../../Core/constants';
import {
  MetricState,
  emptyMetric,
  learningMetric,
  readyMetric,
} from '../../Core/dataState';
import {
  MonthlyMoneyInput,
  WealthStanding,
  amountToFreedomDays,
  amountToLifeHours,
  averageNetIncome,
  evaporation,
  expenseAmount,
  freedomDaysGained,
  savingsRate,
  wealthStanding,
} from '../../Core/money';

/** Phần của entity `Money` mà selector cần. Không nhận cả entity để test được bằng object thường. */
export interface MoneyRecordLike extends MonthlyMoneyInput {
  /** `YYYY-MM`. */
  readonly month: string;
}

export interface MoneySummary {
  readonly month: string;
  /** Nấc giàu kèm quãng đường phía trước. Không bao giờ là một con số trần. */
  readonly standing: MetricState<WealthStanding>;
  readonly evaporation: MetricState<number>;
  /** Bốc hơi quy ra giờ đời. `expense` là nguồn hợp lệ duy nhất ở đây (ràng buộc cứng #2). */
  readonly evaporationLifeHours: MetricState<number>;
  readonly evaporationFreedomDays: MetricState<number>;
  readonly savingsRate: MetricState<number>;
  readonly freedomDaysGained: MetricState<number>;
  /** Thu nhập dùng để tính là trung bình trượt, không phải con số tháng này. */
  readonly averagedIncome: number;
}

/**
 * Hạ `ready` xuống `learning` khi số tháng dữ liệu chưa đủ. Một chỉ số tính từ thu
 * nhập trung bình trượt không thể "đủ tin" hơn chính cái trung bình đó.
 */
function notMoreCertainThan<TValue>(
  state: MetricState<TValue>,
  coverage: MetricState<number>,
): MetricState<TValue> {
  if (state.status !== 'ready' || coverage.status !== 'learning') return state;
  return learningMetric(state.value, coverage.samplesHave, coverage.samplesNeed);
}

/**
 * `records` xếp từ cũ tới mới. Trả `empty('no_data')` khi chưa có tháng nào —
 * màn hình mời nhập lần đầu chứ không hiện 0.
 */
export function summarizeMoney(
  records: readonly MoneyRecordLike[],
  lifeRate: MetricState<number>,
): MetricState<MoneySummary> {
  if (records.length === 0) return emptyMetric<MoneySummary>('no_data');

  const latest = records[records.length - 1];
  const income = averageNetIncome(records.map((record) => record.netIncome));
  if (income.status === 'empty') return emptyMetric<MoneySummary>(income.reason);

  // `03-formulas.md` §2 biên: thu nhập không đều thì mọi chỉ số dựa trên thu nhập
  // dùng trung bình trượt 3 tháng, không dùng con số của riêng tháng vừa nhập.
  const input: MonthlyMoneyInput = {
    netIncome: income.value,
    monthlyExpense: latest.monthlyExpense,
    debt: latest.debt,
    savings: latest.savings,
    netWorth: latest.netWorth,
  };

  const evaporated = evaporation(input);
  // Tháng tiêu lẹm vào tài sản: con số đó là tiền đã rút ra, không phải tiền không
  // giải thích được, nên không quy ra giờ đời — quy đổi sẽ nói sai chuyện.
  const evaporatedOutflow: MetricState<number> =
    evaporated.status === 'ready' && evaporated.value > 0
      ? readyMetric(evaporated.value)
      : emptyMetric<number>('not_applicable');

  const summary: MoneySummary = {
    month: latest.month,
    standing: wealthStanding(input),
    evaporation: evaporated,
    evaporationLifeHours:
      evaporatedOutflow.status === 'ready'
        ? amountToLifeHours(expenseAmount(evaporatedOutflow.value), lifeRate)
        : emptyMetric<number>('not_applicable'),
    evaporationFreedomDays:
      evaporatedOutflow.status === 'ready'
        ? amountToFreedomDays(expenseAmount(evaporatedOutflow.value), input)
        : emptyMetric<number>('not_applicable'),
    savingsRate: savingsRate(input),
    freedomDaysGained: freedomDaysGained(input),
    averagedIncome: income.value,
  };

  const covered: MoneySummary = {
    ...summary,
    standing: notMoreCertainThan(summary.standing, income),
    evaporation: notMoreCertainThan(summary.evaporation, income),
    evaporationLifeHours: notMoreCertainThan(summary.evaporationLifeHours, income),
    evaporationFreedomDays: notMoreCertainThan(summary.evaporationFreedomDays, income),
    savingsRate: notMoreCertainThan(summary.savingsRate, income),
    freedomDaysGained: notMoreCertainThan(summary.freedomDaysGained, income),
  };

  if (income.status === 'learning') {
    return learningMetric(covered, income.samplesHave, INCOME_AVERAGE_MONTHS);
  }
  return readyMetric(covered);
}
