/**
 * Cắt tuần thứ hai → chủ nhật, trả chuỗi `YYYY-MM-DD` vì `time_entry.date` lưu dạng
 * chuỗi. Bản sao của `Home/Models/week.ts`: luật import 2 cấm feature gọi feature,
 * và chỗ đúng của mấy hàm này là `Common/` — đợt này không được sửa `Common/`.
 * Xem HANDOFF.md §"Câu hỏi còn mở".
 */

import { DAYS_PER_WEEK } from '../../Core/constants';
import { MILLISECONDS_PER_DAY } from './constants';

function pad2(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export interface WeekRange {
  readonly start: string;
  readonly end: string;
}

function startOfWeekDate(date: Date): Date {
  const day = date.getDay();
  // Chủ nhật (0) thuộc về tuần đã bắt đầu từ thứ hai sáu ngày trước.
  const offset = day === 0 ? -6 : 1 - day;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
}

export function weekRangeOf(date: Date): WeekRange {
  const start = startOfWeekDate(date);
  const end = new Date(start.getTime() + (DAYS_PER_WEEK - 1) * MILLISECONDS_PER_DAY);
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

/** So sánh chuỗi `YYYY-MM-DD` là so sánh theo thứ tự thời gian, không cần parse. */
export function inRange(date: string, range: WeekRange): boolean {
  return date >= range.start && date <= range.end;
}
