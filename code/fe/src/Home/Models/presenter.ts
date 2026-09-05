/**
 * Đổi `MetricState` thành chữ. Tách khỏi JSX để mọi nhánh thiếu dữ liệu đều test
 * được, và để không chuỗi nào nằm trong màn hình (`code/CLAUDE.md` §Ngôn ngữ).
 *
 * Luật xuyên suốt: chưa đủ dữ liệu thì `value` là `null` — màn hình hiện dấu gạch,
 * không bao giờ hiện "0" hay số âm (`00-vision.md` rủi ro #3).
 */

import { MINUTES_PER_HOUR } from '../../Core/constants';
import { MetricState } from '../../Core/dataState';
import { WealthStanding, WealthTier } from '../../Core/money';
import { HomeText } from '../Text';
import { MoneyDashboard, TimeMetric } from './dashboard';
import {
  formatHourDelta,
  formatHours,
  formatMinutes,
  formatMoneyShort,
  formatMonthLabel,
  formatMonths,
  formatWhole,
} from './format';

export interface MetricView {
  readonly label: string;
  /** `null` khi chưa đủ dữ liệu. */
  readonly value: string | null;
  readonly unit: string | null;
  readonly delta: string | null;
  /** Dòng phụ: quãng đường phía trước, lý do thiếu dữ liệu, hoặc quy đổi giờ đời. */
  readonly notes: readonly string[];
}

function learningNote(state: MetricState<unknown>, text: HomeText): string | null {
  if (state.status !== 'learning') return null;
  return `${text.learningPrefix} ${state.samplesHave}${text.learningSeparator}${state.samplesNeed} ${text.learningSuffix}`;
}

export function timeMetricView(
  label: string,
  emptyNote: string,
  metric: TimeMetric,
  text: HomeText,
): MetricView {
  if (metric.minutes.status === 'empty') {
    const note =
      metric.minutes.reason === 'inconsistent' ? text.timeInconsistent : emptyNote;
    return { label, value: null, unit: null, delta: null, notes: [note] };
  }

  const learning = learningNote(metric.minutes, text);
  // Dưới một giờ thì đổi sang phút: "0,0 h" cho 15 phút vừa ghi trông như chưa ghi gì.
  const underAnHour = metric.minutes.value < MINUTES_PER_HOUR;
  return {
    label,
    value: underAnHour
      ? formatMinutes(metric.minutes.value)
      : formatHours(metric.minutes.value),
    unit: underAnHour ? text.minuteUnit : text.hourUnit,
    delta: metric.deltaMinutes === null ? null : formatHourDelta(metric.deltaMinutes),
    notes: learning === null ? [] : [learning],
  };
}

export function tierName(tier: WealthTier, text: HomeText): string {
  if (tier === 'free') return text.tierFree;
  if (tier === 'flexible') return text.tierFlexible;
  if (tier === 'safe') return text.tierSafe;
  return text.tierSurvival;
}

function onLadderNotes(
  standing: Extract<WealthStanding, { kind: 'on_ladder' }>,
  text: HomeText,
): string[] {
  const here = `${text.wealthStandingPrefix} ${tierName(standing.tier, text)}`;
  if (standing.nextTier === null) {
    return [`${here} · ${text.wealthTopTier}`];
  }

  const notes = [
    `${here} · ${text.wealthGapPrefix} ${formatMonths(standing.monthsGapToNextTier)} ${text.monthUnit} ${text.wealthGapSuffix} ${tierName(standing.nextTier, text)}`,
  ];
  if (standing.monthsOfSavingToNextTier !== null) {
    notes.push(
      `${text.wealthSavingPacePrefix} ${formatMonths(standing.monthsOfSavingToNextTier)} ${text.wealthSavingPaceSuffix}`,
    );
  }
  return notes;
}

function inDebtView(
  standing: Extract<WealthStanding, { kind: 'in_debt' }>,
  text: HomeText,
): MetricView {
  const notes = [
    `${text.wealthShortfallPrefix} ${formatMoneyShort(standing.shortfall)} ${text.wealthShortfallSuffix}`,
  ];
  if (standing.monthsOfSavingToBreakEven !== null) {
    notes.push(
      `${text.wealthBreakEvenPrefix} ${formatMonths(standing.monthsOfSavingToBreakEven)} ${text.wealthBreakEvenSuffix}`,
    );
  }
  // Không hiện số tháng vốn tự do: người đang nợ chưa đứng trên thang nào.
  return {
    label: text.wealthLabel,
    value: text.wealthBelowZero,
    unit: null,
    delta: null,
    notes,
  };
}

export function wealthMetricView(
  standing: MetricState<WealthStanding>,
  text: HomeText,
): MetricView {
  if (standing.status === 'empty') {
    return {
      label: text.wealthLabel,
      value: null,
      unit: null,
      delta: null,
      notes: [text.wealthEmpty, text.wealthHint],
    };
  }
  if (standing.value.kind === 'in_debt') return inDebtView(standing.value, text);

  return {
    label: text.wealthLabel,
    value: formatMonths(standing.value.freedomMonths),
    unit: text.monthUnit,
    delta: null,
    notes: onLadderNotes(standing.value, text),
  };
}

export function evaporationMetricView(
  money: MoneyDashboard,
  text: HomeText,
): MetricView {
  const stale =
    money.staleMonth === null
      ? []
      : [`${text.moneyMonthNotePrefix} ${formatMonthLabel(money.staleMonth)}`];

  if (money.evaporation.status === 'empty') {
    return {
      label: text.evaporationLabel,
      value: null,
      unit: null,
      delta: null,
      notes: [text.evaporationEmpty],
    };
  }

  const amount = money.evaporation.value;
  // Âm nghĩa là tháng này tiêu lẹm vào tài sản. Đổi nhãn rồi hiện trị tuyệt đối —
  // vẫn là sự thật, nhưng không có số âm trên màn hình chính.
  const label = amount < 0 ? text.overspendLabel : text.evaporationLabel;
  const notes =
    money.evaporationLifeHours.status === 'empty'
      ? stale
      : [
          `${text.lifeHoursPrefix} ${formatWhole(money.evaporationLifeHours.value)} ${text.lifeHoursUnit}`,
          ...stale,
        ];

  return {
    label,
    value: formatMoneyShort(Math.abs(amount)),
    unit: null,
    delta: null,
    notes,
  };
}
