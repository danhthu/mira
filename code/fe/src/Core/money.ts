/**
 * Trụ 2 — Tài chính (`08-three-pillars.md` §Trụ 2, `03-formulas.md` §2–4).
 * Hàm thuần: nhận số nguyên VND, trả số. Không import React, không import Repositories.
 */

import {
  DAYS_PER_MONTH,
  INCOME_AVERAGE_MONTHS,
  MINUTES_PER_HOUR,
  MONTHS_PER_YEAR,
  WEALTH_TIER_FLEXIBLE_MONTHS,
  WEALTH_TIER_FREE_MONTHS,
  WEALTH_TIER_SAFE_MONTHS,
  WEEKS_PER_YEAR,
} from './constants';
import {
  MetricState,
  emptyMetric,
  metricByCoverage,
  readyMetric,
} from './dataState';

/**
 * Năm ô nhập của `08` §"Chỉ 5 ô nhập". Tên trường bám theo bảng `money` trong
 * `02-data-model.md`: `monthlyExpense` là ô2 (chi cố định), `debt` là ô3 (trả nợ
 * mỗi tháng, không phải dư nợ — dư nợ đã trừ sẵn trong `netWorth`).
 */
export interface MonthlyMoneyInput {
  readonly netIncome: number;
  readonly monthlyExpense: number;
  readonly debt: number;
  readonly savings: number;
  readonly netWorth: number;
}

/** Chi phí sống thật = chi cố định + trả nợ. */
export function trueLivingCost(input: MonthlyMoneyInput): MetricState<number> {
  const cost = input.monthlyExpense + input.debt;
  if (cost <= 0) return emptyMetric<number>('no_data');
  return readyMetric(cost);
}

/**
 * Bốc hơi = thu nhập − chi cố định − trả nợ − tiết kiệm.
 * Âm nghĩa là tháng này tiêu lẹm vào tài sản — vẫn trả về, vì đó là sự thật người
 * dùng cần biết, khác hẳn với việc hiện số âm cho "bạn giàu mấy tháng".
 */
export function evaporation(input: MonthlyMoneyInput): MetricState<number> {
  if (input.netIncome <= 0) return emptyMetric<number>('no_data');
  return readyMetric(
    input.netIncome - input.monthlyExpense - input.debt - input.savings,
  );
}

/** Tỷ lệ tiết kiệm = tiết kiệm / thu nhập, trong khoảng 0..1. */
export function savingsRate(input: MonthlyMoneyInput): MetricState<number> {
  if (input.netIncome <= 0) return emptyMetric<number>('divide_by_zero');
  return readyMetric(input.savings / input.netIncome);
}

/**
 * Vốn tự do (tháng) = max(0, tài sản ròng) / chi phí sống thật.
 * `max(0, …)` theo `03-formulas.md` §3: tài sản ròng âm không bao giờ ra số âm.
 */
export function freedomMonths(input: MonthlyMoneyInput): MetricState<number> {
  const cost = trueLivingCost(input);
  if (cost.status === 'empty') return emptyMetric<number>('divide_by_zero');
  return readyMetric(Math.max(0, input.netWorth) / cost.value);
}

/** Ngày tự do mua thêm trong tháng = tiết kiệm / chi phí sống thật × 30. */
export function freedomDaysGained(input: MonthlyMoneyInput): MetricState<number> {
  const cost = trueLivingCost(input);
  if (cost.status === 'empty') return emptyMetric<number>('divide_by_zero');
  if (input.savings <= 0) return emptyMetric<number>('not_applicable');
  return readyMetric((input.savings / cost.value) * DAYS_PER_MONTH);
}

export type WealthTier = 'survival' | 'safe' | 'flexible' | 'free';

export function wealthTierOf(months: number): WealthTier {
  if (months >= WEALTH_TIER_FREE_MONTHS) return 'free';
  if (months >= WEALTH_TIER_FLEXIBLE_MONTHS) return 'flexible';
  if (months >= WEALTH_TIER_SAFE_MONTHS) return 'safe';
  return 'survival';
}

export function nextWealthTier(tier: WealthTier): WealthTier | null {
  if (tier === 'survival') return 'safe';
  if (tier === 'safe') return 'flexible';
  if (tier === 'flexible') return 'free';
  return null;
}

/** Số tháng vốn tự do cần đạt để bước vào nấc đó. */
export function wealthTierFloorMonths(tier: WealthTier): number {
  if (tier === 'free') return WEALTH_TIER_FREE_MONTHS;
  if (tier === 'flexible') return WEALTH_TIER_FLEXIBLE_MONTHS;
  if (tier === 'safe') return WEALTH_TIER_SAFE_MONTHS;
  return 0;
}

/**
 * Vị trí trên thang giàu. Union chứ không phải số trần: `00-vision.md` rủi ro #3
 * cấm hiện con số một mình, luôn phải kèm quãng đường phía trước.
 */
export type WealthStanding =
  | {
      readonly kind: 'in_debt';
      /** Số tiền còn thiếu để tài sản ròng về 0. Luôn dương. */
      readonly shortfall: number;
      /** Bao nhiêu tháng tiết kiệm nữa thì về vạch 0. `null` khi không tiết kiệm được. */
      readonly monthsOfSavingToBreakEven: number | null;
    }
  | {
      readonly kind: 'on_ladder';
      readonly tier: WealthTier;
      readonly freedomMonths: number;
      /** `null` khi đã ở nấc Tự do. */
      readonly nextTier: WealthTier | null;
      /** Còn thiếu bao nhiêu tháng vốn tự do nữa. 0 khi đã ở nấc cao nhất. */
      readonly monthsGapToNextTier: number;
      /** Quy quãng đường đó ra số tháng phải tiết kiệm. `null` khi tiết kiệm ≤ 0. */
      readonly monthsOfSavingToNextTier: number | null;
    };

export function wealthStanding(input: MonthlyMoneyInput): MetricState<WealthStanding> {
  const cost = trueLivingCost(input);
  if (cost.status === 'empty') return emptyMetric<WealthStanding>('divide_by_zero');

  if (input.netWorth < 0) {
    const shortfall = -input.netWorth;
    return readyMetric<WealthStanding>({
      kind: 'in_debt',
      shortfall,
      monthsOfSavingToBreakEven: input.savings > 0 ? shortfall / input.savings : null,
    });
  }

  const months = input.netWorth / cost.value;
  const tier = wealthTierOf(months);
  const next = nextWealthTier(tier);
  const gap = next === null ? 0 : wealthTierFloorMonths(next) - months;
  const moneyGap = gap * cost.value;

  return readyMetric<WealthStanding>({
    kind: 'on_ladder',
    tier,
    freedomMonths: months,
    nextTier: next,
    monthsGapToNextTier: gap,
    monthsOfSavingToNextTier:
      next !== null && input.savings > 0 ? moneyGap / input.savings : null,
  });
}

/**
 * Trung bình trượt thu nhập (`03-formulas.md` §2 biên: thu nhập không đều).
 * `months` xếp từ cũ tới mới; chỉ lấy tối đa 3 tháng gần nhất. Chưa đủ 3 tháng thì
 * vẫn tính nhưng trả `learning` để UI nói rõ con số còn đang hình thành.
 */
export function averageNetIncome(months: readonly number[]): MetricState<number> {
  const recent = months.slice(-INCOME_AVERAGE_MONTHS);
  if (recent.length === 0) return emptyMetric<number>('no_data');

  const total = recent.reduce((sum, value) => sum + value, 0);
  return metricByCoverage(
    Math.round(total / recent.length),
    recent.length,
    INCOME_AVERAGE_MONTHS,
  );
}

/**
 * Tỷ giá đời = thu nhập ròng / giờ THẬT đổ vào việc, đơn vị VND/giờ.
 * Giờ thật gồm cả kẹt xe, chuẩn bị và phục hồi — đó là điểm khác biệt với "lương/giờ".
 */
export function lifeRatePerHour(
  netIncome: number,
  realWorkMinutesPerWeek: number,
): MetricState<number> {
  // Người không đi làm (nội trợ, sinh viên): ẩn hẳn chỉ số, không hiện 0đ/giờ.
  if (realWorkMinutesPerWeek <= 0) return emptyMetric<number>('not_applicable');
  if (netIncome <= 0) return emptyMetric<number>('no_data');

  const monthlyRealWorkHours =
    (realWorkMinutesPerWeek / MINUTES_PER_HOUR) * (WEEKS_PER_YEAR / MONTHS_PER_YEAR);
  return readyMetric(Math.round(netIncome / monthlyRealWorkHours));
}

/**
 * Ràng buộc cứng #2 — "Giờ vàng không có giá". Quy đổi tiền sang giờ đời chỉ nhận
 * kiểu này, và chỉ hai hàm dưới tạo ra được nó. Thời gian với con/bố mẹ/bạn đời
 * không có đường nào đi vào phép quy đổi, vì trình biên dịch chặn ngay ở tham số.
 */
export type ConvertibleSource = 'expense' | 'work_load';

export interface ConvertibleAmount {
  readonly source: ConvertibleSource;
  readonly amount: number;
}

export function expenseAmount(amount: number): ConvertibleAmount {
  return { source: 'expense', amount };
}

export function workLoadAmount(amount: number): ConvertibleAmount {
  return { source: 'work_load', amount };
}

/** Khoản tiền này bằng bao nhiêu giờ đời (`03-formulas.md` §4). */
export function amountToLifeHours(
  amount: ConvertibleAmount,
  lifeRate: MetricState<number>,
): MetricState<number> {
  if (lifeRate.status === 'empty') return emptyMetric<number>(lifeRate.reason);
  if (lifeRate.value <= 0) return emptyMetric<number>('divide_by_zero');
  return readyMetric(amount.amount / lifeRate.value);
}

/** Khoản tiền này đẩy lùi bao nhiêu ngày tự do (`03-formulas.md` §4). */
export function amountToFreedomDays(
  amount: ConvertibleAmount,
  input: MonthlyMoneyInput,
): MetricState<number> {
  const cost = trueLivingCost(input);
  if (cost.status === 'empty') return emptyMetric<number>('divide_by_zero');
  return readyMetric((amount.amount / cost.value) * DAYS_PER_MONTH);
}
