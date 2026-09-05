/**
 * Bốn con số của `08-three-pillars.md` §"Bảng điều khiển: bốn con số duy nhất".
 * Tầng này chỉ chọn dữ liệu rồi gọi `Core/` — không có công thức nào ở đây.
 */

import { MIN_DAYS_FOR_WEEKLY_METRIC } from '../../Core/constants';
import {
  MetricState,
  emptyMetric,
  metricByCoverage,
} from '../../Core/dataState';
import {
  ConvertibleAmount,
  MonthlyMoneyInput,
  WealthStanding,
  amountToLifeHours,
  evaporation,
  expenseAmount,
  lifeRatePerHour,
  wealthStanding,
} from '../../Core/money';
import { BUCKET_GROUP, TimeEntryLike, daysCovered, sumMinutes } from '../../Core/time';
import { TimeGroup } from '../../Core/types';

export interface TimeMetric {
  /** Phút của nhóm trong tuần này. `empty` khi tuần này chưa có bản ghi nào của nhóm. */
  readonly minutes: MetricState<number>;
  /** Chênh so tuần trước, tính bằng phút. `null` khi tuần trước chưa có bản ghi nào của nhóm. */
  readonly deltaMinutes: number | null;
}

export interface TimeDashboard {
  readonly meaningful: TimeMetric;
  readonly waste: TimeMetric;
}

function hasGroup(entries: readonly TimeEntryLike[], group: TimeGroup): boolean {
  return entries.some((entry) => BUCKET_GROUP[entry.bucket] === group);
}

function groupMetric(
  current: readonly TimeEntryLike[],
  previous: readonly TimeEntryLike[],
  group: TimeGroup,
): TimeMetric {
  if (!hasGroup(current, group)) {
    // Tuần đầu không ô nào được hiện "0" — chưa ghi thì là chưa có, không phải bằng 0.
    return { minutes: emptyMetric<number>('no_data'), deltaMinutes: null };
  }

  const minutes = sumMinutes(current, group);
  const state = metricByCoverage(
    minutes,
    daysCovered(current),
    MIN_DAYS_FOR_WEEKLY_METRIC,
  );
  const delta = hasGroup(previous, group)
    ? minutes - sumMinutes(previous, group)
    : null;

  return { minutes: state, deltaMinutes: delta };
}

/**
 * Hai con số thời gian không đi qua `weeklyTime()`: hàm đó cần giờ ngủ để suy giờ
 * cần thiết, mà app chưa có bảng `health` để lấy giờ ngủ thật. Bịa một con số ngủ
 * mặc định sẽ khiến `weeklyTime` trả `inconsistent` và làm biến mất chính hai con
 * số quan trọng nhất. Ở đây chỉ dùng `sumMinutes` và `daysCovered` của Core —
 * hai con số này không phụ thuộc giờ tỉnh.
 */
export function timeDashboard(
  currentWeek: readonly TimeEntryLike[],
  previousWeek: readonly TimeEntryLike[],
): TimeDashboard {
  return {
    meaningful: groupMetric(currentWeek, previousWeek, 'meaningful'),
    waste: groupMetric(currentWeek, previousWeek, 'waste'),
  };
}

export interface MoneySnapshot extends MonthlyMoneyInput {
  /** `YYYY-MM`. */
  readonly month: string;
}

/** Bản ghi tài chính mới nhất không muộn hơn tháng đang xem. */
export function latestMoneyUpTo(
  records: readonly MoneySnapshot[],
  month: string,
): MoneySnapshot | null {
  const usable = records.filter((record) => record.month <= month);
  if (usable.length === 0) return null;
  return usable.reduce((latest, record) =>
    record.month > latest.month ? record : latest,
  );
}

export interface MoneyDashboard {
  readonly standing: MetricState<WealthStanding>;
  /** Dương là bốc hơi, âm là tiêu lẹm vào tài sản. Chỗ hiển thị đổi nhãn theo dấu. */
  readonly evaporation: MetricState<number>;
  /** Bốc hơi quy ra giờ đời. `empty` khi chưa biết giờ làm thật. */
  readonly evaporationLifeHours: MetricState<number>;
  /** Tháng của bản ghi đang dùng, `null` khi đúng là tháng đang xem. */
  readonly staleMonth: string | null;
}

/**
 * Ràng buộc cứng #2: chỉ khoản chi mới được quy ra giờ đời. `expenseAmount` là một
 * trong hai cửa duy nhất tạo `ConvertibleAmount`, nên giờ với người thân không có
 * đường nào lọt vào phép quy đổi.
 */
function lifeHoursOfEvaporation(
  amount: MetricState<number>,
  input: MonthlyMoneyInput,
  realWorkMinutesPerWeek: number,
): MetricState<number> {
  if (amount.status === 'empty') return emptyMetric<number>(amount.reason);
  if (amount.value <= 0) return emptyMetric<number>('not_applicable');

  const convertible: ConvertibleAmount = expenseAmount(amount.value);
  return amountToLifeHours(
    convertible,
    lifeRatePerHour(input.netIncome, realWorkMinutesPerWeek),
  );
}

export function moneyDashboard(
  record: MoneySnapshot | null,
  month: string,
  realWorkMinutesPerWeek: number,
): MoneyDashboard {
  if (record === null) {
    return {
      standing: emptyMetric<WealthStanding>('no_data'),
      evaporation: emptyMetric<number>('no_data'),
      evaporationLifeHours: emptyMetric<number>('no_data'),
      staleMonth: null,
    };
  }

  const evaporated = evaporation(record);
  return {
    standing: wealthStanding(record),
    evaporation: evaporated,
    evaporationLifeHours: lifeHoursOfEvaporation(
      evaporated,
      record,
      realWorkMinutesPerWeek,
    ),
    staleMonth: record.month === month ? null : record.month,
  };
}
