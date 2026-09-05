/**
 * Định dạng kiểu Việt. `03-formulas.md` §1: "làm tròn 1 chữ số thập phân,
 * '14,5 giờ'" — dấu phẩy thập phân, không phải dấu chấm.
 */

import { MINUTES_PER_HOUR } from '../../Core/constants';

const WEEKDAY_NAMES: readonly string[] = [
  'chủ nhật',
  'thứ hai',
  'thứ ba',
  'thứ tư',
  'thứ năm',
  'thứ sáu',
  'thứ bảy',
];

const HOUR_DIGITS = 1;

function formatDecimal(value: number, digits: number): string {
  return value.toFixed(digits).replace('.', ',');
}

export function formatHours(minutes: number): string {
  return formatDecimal(minutes / MINUTES_PER_HOUR, HOUR_DIGITS);
}

export function formatMinutes(minutes: number): string {
  return `${Math.round(minutes)}`;
}

/** "thứ bảy, 5 tháng 9" — thay cho `moment().format('dddd, MMM Do')` tiếng Anh. */
export function formatVietnameseDate(date: Date): string {
  const weekday = WEEKDAY_NAMES[date.getDay()];
  return `${weekday}, ${date.getDate()} tháng ${date.getMonth() + 1}`;
}
