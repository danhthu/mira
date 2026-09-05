/**
 * Tỷ giá đời cần giờ làm THẬT mỗi tuần. Chưa có bảng `work_load` (xem
 * `src/Core/HANDOFF.md` §"Câu hỏi còn mở"), nên suy tạm từ bản ghi thời gian nhóm
 * CẦN THIẾT trong bốn tuần gần nhất. Không có bản ghi nào thì `lifeRatePerHour`
 * trả `not_applicable` và màn hình bỏ hẳn dòng giờ đời — không hiện 0đ/giờ.
 */

import { DAYS_PER_WEEK } from '../../Core/constants';
import { MetricState } from '../../Core/dataState';
import { lifeRatePerHour } from '../../Core/money';
import { TimeEntryLike, sumMinutes } from '../../Core/time';
import { WORK_LOOKBACK_WEEKS } from '../constants';
import { dateKeyDaysAgo } from './month';

export function realWorkMinutesPerWeek(
  entries: readonly TimeEntryLike[],
  now: Date = new Date(),
): number {
  const cutoff = dateKeyDaysAgo(WORK_LOOKBACK_WEEKS * DAYS_PER_WEEK, now);
  const recent = entries.filter((entry) => entry.date >= cutoff);
  return sumMinutes(recent, 'necessary') / WORK_LOOKBACK_WEEKS;
}

export function lifeRateFromEntries(
  netIncome: number,
  entries: readonly TimeEntryLike[],
  now: Date = new Date(),
): MetricState<number> {
  return lifeRatePerHour(netIncome, realWorkMinutesPerWeek(entries, now));
}
