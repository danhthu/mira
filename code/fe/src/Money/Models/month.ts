/**
 * Khoá tháng `YYYY-MM` và khoá ngày `YYYY-MM-DD` theo giờ máy người dùng.
 * Không dùng `toISOString()`: nó quy về UTC nên tối ngày cuối tháng ở Việt Nam sẽ
 * rơi sang tháng sau, tức là bản ghi tháng này bị ghi vào tháng chưa tới.
 */

const MONTH_KEY_LENGTH = 7;

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export function dateKeyOf(date: Date): string {
  return `${monthKeyOf(date)}-${pad2(date.getDate())}`;
}

export function currentMonthKey(now: Date = new Date()): string {
  return monthKeyOf(now);
}

/** Khoá ngày của `days` ngày trước — dùng làm mốc cắt cho cửa sổ đọc dữ liệu. */
export function dateKeyDaysAgo(days: number, now: Date = new Date()): string {
  const past = new Date(now.getTime());
  past.setDate(past.getDate() - days);
  return dateKeyOf(past);
}

/** `2026-09` → `tháng 9 năm 2026`. */
export function readableMonth(monthKey: string): string {
  if (monthKey.length !== MONTH_KEY_LENGTH) return monthKey;
  const year = monthKey.slice(0, 4);
  const month = Number(monthKey.slice(5));
  return `tháng ${month} năm ${year}`;
}
