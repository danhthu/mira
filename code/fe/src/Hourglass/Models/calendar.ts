/** Ngày tháng và định dạng số. Hàm thuần, không chạm lưu trữ. */

import { DAYS_IN_WEEK, DEFAULT_CURFEW_HOUR } from '../constants';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_MONTH = 30;

export function isoDate(at: Date): string {
  const month = at.getMonth() + 1;
  const day = at.getDate();
  return (
    at.getFullYear() +
    '-' +
    (month < 10 ? '0' + month : String(month)) +
    '-' +
    (day < 10 ? '0' + day : String(day))
  );
}

export function addDays(at: Date, days: number): Date {
  return new Date(at.getTime() + days * MS_PER_DAY);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (new Date(toIso + 'T00:00:00').getTime() -
      new Date(fromIso + 'T00:00:00').getTime()) /
      MS_PER_DAY,
  );
}

/**
 * Lần liên lạc kế tiếp suy từ nhịp mong muốn: 2 lần/tháng là cách nhau 15 ngày.
 * Nhịp bằng 0 thì không suy được, trả ngày mai — người dùng luôn đổi được sau đó.
 */
export function nextContactDate(monthlyCadence: number, from: Date): string {
  const gap =
    monthlyCadence > 0 ? Math.max(1, Math.round(DAYS_PER_MONTH / monthlyCadence)) : 1;
  return isoDate(addDays(from, gap));
}

export function postponeOneWeek(currentIso: string): string {
  return isoDate(addDays(new Date(currentIso + 'T00:00:00'), DAYS_IN_WEEK));
}

/** `2026-09-12` thành `12/09`. */
export function readableDate(iso: string): string {
  const parts = iso.split('-');
  return parts.length === 3 ? parts[2] + '/' + parts[1] : iso;
}

export function readableHour(hour: number): string {
  return (hour < 10 ? '0' + hour : String(hour)) + ':00';
}

export const HOUR_CHOICES: readonly number[] = [19, 20, DEFAULT_CURFEW_HOUR, 22, 23];

export const WEEKDAY_NAMES: readonly string[] = [
  'chủ nhật',
  'thứ hai',
  'thứ ba',
  'thứ tư',
  'thứ năm',
  'thứ sáu',
  'thứ bảy',
];

/** Nhóm nghìn bằng dấu chấm, kiểu Việt. Không dùng `Intl` để bản native không lệ thuộc ICU. */
export function groupThousands(value: number): string {
  const negative = value < 0;
  const digits = String(Math.abs(Math.round(value)));
  let out = '';
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += '.';
    out += digits[i];
  }
  return negative ? '-' + out : out;
}
