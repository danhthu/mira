/**
 * Định dạng kiểu Việt. `03-formulas.md` §1: "làm tròn 1 chữ số thập phân,
 * '14,5 giờ'" — dấu phẩy thập phân, không phải dấu chấm.
 */

import { MINUTES_PER_HOUR } from '../../Core/constants';
import { VND_PER_MILLION, VND_PER_THOUSAND } from './constants';

const WEEKDAY_NAMES: readonly string[] = [
  'chủ nhật',
  'thứ hai',
  'thứ ba',
  'thứ tư',
  'thứ năm',
  'thứ sáu',
  'thứ bảy',
];

/** Dấu trừ toán học U+2212, đúng ký tự trong khung của `08-three-pillars.md`. */
export const MINUS_SIGN = '−';

export function formatDecimal(value: number, digits: number): string {
  return value.toFixed(digits).replace('.', ',');
}

export function formatHours(minutes: number): string {
  return formatDecimal(minutes / MINUTES_PER_HOUR, 1);
}

export function formatMonths(months: number): string {
  return formatDecimal(months, 1);
}

/**
 * Tiền rút gọn: "5,0 tr", "500 ng", "800 đ". Số âm không bao giờ vào đây — chỗ gọi
 * đổi nhãn (bốc hơi ↔ tiêu quá thu) rồi truyền trị tuyệt đối.
 */
export function formatMoneyShort(amount: number): string {
  if (amount >= VND_PER_MILLION) {
    return `${formatDecimal(amount / VND_PER_MILLION, 1)} tr`;
  }
  if (amount >= VND_PER_THOUSAND) {
    return `${Math.round(amount / VND_PER_THOUSAND)} ng`;
  }
  return `${Math.round(amount)} đ`;
}

/**
 * Delta giờ có dấu. `null` khi bằng 0: không có gì chuyển dịch thì không hiện dấu
 * cộng giả, cũng không hiện số 0.
 */
export function formatHourDelta(minutes: number): string | null {
  const hours = minutes / MINUTES_PER_HOUR;
  const rounded = Math.round(hours * 10) / 10;
  if (rounded === 0) return null;
  const sign = rounded > 0 ? '+' : MINUS_SIGN;
  return `${sign}${formatDecimal(Math.abs(rounded), 1)}`;
}

/** "thứ bảy, 5 tháng 9" — thay cho `moment().format('dddd, MMM Do')` tiếng Anh. */
export function formatVietnameseDate(date: Date): string {
  const weekday = WEEKDAY_NAMES[date.getDay()];
  return `${weekday}, ${date.getDate()} tháng ${date.getMonth() + 1}`;
}

/** "tháng 8" — dùng khi số tài chính đang hiện là của tháng trước. */
export function formatMonthLabel(month: string): string {
  const parts = month.split('-');
  return `tháng ${Number(parts[1])}`;
}

export function formatMinutes(minutes: number): string {
  return `${Math.round(minutes)}`;
}

/** "= 43 giờ đời" — khung của `08-three-pillars.md` để số nguyên ở chỗ này. */
export function formatWhole(value: number): string {
  return `${Math.round(value)}`;
}
