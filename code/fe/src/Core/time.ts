/**
 * Trụ 1 — Thời gian (`08-three-pillars.md` §Trụ 1, `03-formulas.md` §1).
 * Hàm thuần: nhận số, trả số. Không import React, không import Repositories.
 */

import {
  DAYS_PER_WEEK,
  MINUTES_PER_HOUR,
  MINUTES_PER_WEEK,
  MIN_DAYS_FOR_WEEKLY_METRIC,
} from './constants';
import {
  MetricState,
  emptyMetric,
  mapMetric,
  metricByCoverage,
  readyMetric,
} from './dataState';
import { TimeBucket, TimeGroup } from './types';

/** Phần của `TimeEntry` mà công thức cần. Core không biết gì về entity hay lưu trữ. */
export interface TimeEntryLike {
  /** `YYYY-MM-DD`. */
  readonly date: string;
  /** Phút nguyên. */
  readonly minutes: number;
  readonly bucket: TimeBucket;
}

export const BUCKET_GROUP: Readonly<Record<TimeBucket, TimeGroup>> = {
  people: 'meaningful',
  health: 'meaningful',
  learn: 'meaningful',
  rest: 'meaningful',
  self: 'meaningful',
  work: 'necessary',
  waste: 'waste',
};

export interface WeeklyTime {
  /** 168 giờ trừ giờ ngủ, tính bằng phút. */
  readonly awakeMinutes: number;
  readonly wasteMinutes: number;
  readonly meaningfulMinutes: number;
  /** Phần dư — người dùng không bao giờ nhập nhóm này. */
  readonly necessaryMinutes: number;
  /** Giờ ý nghĩa / giờ tỉnh, trong khoảng 0..1. */
  readonly miraIndex: number;
}

export interface WeeklyTimeInput {
  /** Tổng phút ngủ trong tuần. */
  readonly sleepMinutes: number;
  /** Bản ghi thời gian trong tuần đó. Bản ghi nhóm `necessary` bị bỏ qua khi suy phần dư. */
  readonly entries: readonly TimeEntryLike[];
}

/** Đổi phút sang giờ, một chữ số thập phân — chỉ dùng lúc hiển thị, không lưu. */
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / MINUTES_PER_HOUR) * 10) / 10;
}

export function sumMinutes(
  entries: readonly TimeEntryLike[],
  group: TimeGroup,
): number {
  return entries.reduce(
    (total, entry) => (BUCKET_GROUP[entry.bucket] === group ? total + entry.minutes : total),
    0,
  );
}

/** Số ngày khác nhau đã có bản ghi — dùng để biết tuần đã đủ dữ liệu chưa. */
export function daysCovered(entries: readonly TimeEntryLike[]): number {
  const seen: string[] = [];
  entries.forEach((entry) => {
    if (seen.indexOf(entry.date) < 0) seen.push(entry.date);
  });
  return seen.length;
}

/** Giờ tỉnh = 168 − giờ ngủ, tính bằng phút. */
export function awakeMinutes(sleepMinutes: number): MetricState<number> {
  if (sleepMinutes <= 0) return emptyMetric<number>('no_data');
  if (sleepMinutes >= MINUTES_PER_WEEK) return emptyMetric<number>('inconsistent');
  return readyMetric(MINUTES_PER_WEEK - sleepMinutes);
}

/**
 * Toàn bộ trụ Thời gian của một tuần.
 *
 * `necessaryMinutes` là phần dư, không phải tổng bản ghi khoang `work`: đó là
 * quyết định thiết kế lớn nhất của app (`08` §Trụ 1) — cắt hẳn gánh nhập liệu
 * cho nhóm CẦN THIẾT.
 */
export function weeklyTime(input: WeeklyTimeInput): MetricState<WeeklyTime> {
  const awake = awakeMinutes(input.sleepMinutes);
  if (awake.status === 'empty') return emptyMetric<WeeklyTime>(awake.reason);

  const waste = sumMinutes(input.entries, 'waste');
  const meaningful = sumMinutes(input.entries, 'meaningful');
  if (waste === 0 && meaningful === 0) return emptyMetric<WeeklyTime>('no_data');

  const necessary = awake.value - waste - meaningful;
  // Ghi vượt quỹ giờ tỉnh: hoặc giờ ngủ khai sai, hoặc bản ghi chồng nhau. Không
  // hiện số âm, cũng không kẹp về 0 — số 0 sẽ trông như "không có việc cần thiết nào".
  if (necessary < 0) return emptyMetric<WeeklyTime>('inconsistent');

  const value: WeeklyTime = {
    awakeMinutes: awake.value,
    wasteMinutes: waste,
    meaningfulMinutes: meaningful,
    necessaryMinutes: necessary,
    miraIndex: meaningful / awake.value,
  };

  return metricByCoverage(value, daysCovered(input.entries), MIN_DAYS_FOR_WEEKLY_METRIC);
}

/** Chỉ số Mira = giờ ý nghĩa / giờ tỉnh. */
export function miraIndex(input: WeeklyTimeInput): MetricState<number> {
  return mapMetric(weeklyTime(input), (week) => week.miraIndex);
}

/**
 * Mục tiêu chuyển dịch (`08` §"Mục tiêu của trụ Thời gian"): không so với một
 * đích tuyệt đối, chỉ so với chính tuần trước.
 */
export interface TimeShift {
  readonly meaningfulDeltaMinutes: number;
  readonly wasteDeltaMinutes: number;
  /** Số phút thật sự chuyển được từ LÃNG PHÍ sang Ý NGHĨA, tối đa là phần lãng phí đã giảm. */
  readonly shiftedMinutes: number;
}

export function weeklyShift(
  current: WeeklyTimeInput,
  previous: WeeklyTimeInput,
): MetricState<TimeShift> {
  const now = weeklyTime(current);
  const before = weeklyTime(previous);
  if (now.status === 'empty') return emptyMetric<TimeShift>(now.reason);
  if (before.status === 'empty') return emptyMetric<TimeShift>(before.reason);

  const meaningfulDelta = now.value.meaningfulMinutes - before.value.meaningfulMinutes;
  const wasteDelta = now.value.wasteMinutes - before.value.wasteMinutes;
  // Chỉ tính là "chuyển" khi giờ ý nghĩa tăng VÀ giờ lãng phí giảm. Tăng giờ ý
  // nghĩa bằng cách cắt giấc ngủ không phải chuyển dịch, không được khen.
  const shifted = Math.max(0, Math.min(meaningfulDelta, -wasteDelta));

  const value: TimeShift = {
    meaningfulDeltaMinutes: meaningfulDelta,
    wasteDeltaMinutes: wasteDelta,
    shiftedMinutes: shifted,
  };

  const covered = Math.min(daysCovered(current.entries), daysCovered(previous.entries));
  return metricByCoverage(value, covered, DAYS_PER_WEEK);
}
