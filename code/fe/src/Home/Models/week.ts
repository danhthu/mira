/**
 * Cắt tuần cho màn hình chính. Tuần bắt đầu thứ hai, cùng quy ước với
 * `Common/Utils/common.ts#getStartOfWeek`, nhưng ở đây trả chuỗi `YYYY-MM-DD`
 * vì `time_entry.date` lưu dạng chuỗi.
 */

import { DAYS_PER_WEEK } from '../../Core/constants';
import { TimeEntryLike } from '../../Core/time';

const MILLISECONDS_PER_DAY = 86400000;

function pad2(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export interface WeekRange {
  /** `YYYY-MM-DD` của thứ hai. */
  readonly start: string;
  /** `YYYY-MM-DD` của chủ nhật. */
  readonly end: string;
}

function startOfWeekDate(date: Date): Date {
  const day = date.getDay();
  // Chủ nhật (0) thuộc về tuần đã bắt đầu từ thứ hai sáu ngày trước.
  const offset = day === 0 ? -6 : 1 - day;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
  return start;
}

export function weekRangeOf(date: Date): WeekRange {
  const start = startOfWeekDate(date);
  const end = new Date(start.getTime() + (DAYS_PER_WEEK - 1) * MILLISECONDS_PER_DAY);
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

export function previousWeekRangeOf(date: Date): WeekRange {
  const start = startOfWeekDate(date);
  return weekRangeOf(new Date(start.getTime() - MILLISECONDS_PER_DAY));
}

/** So sánh chuỗi `YYYY-MM-DD` là so sánh theo thứ tự thời gian, không cần parse. */
export function entriesInRange<TEntry extends TimeEntryLike>(
  entries: readonly TEntry[],
  range: WeekRange,
): TEntry[] {
  return entries.filter((entry) => entry.date >= range.start && entry.date <= range.end);
}
