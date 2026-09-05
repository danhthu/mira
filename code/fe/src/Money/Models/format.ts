/**
 * Định dạng số cho mắt người Việt: nghìn tách bằng dấu chấm, thập phân bằng dấu phẩy.
 * Ở đây không có công thức nào của trụ Tài chính — mọi phép tính chỉ số nằm trong
 * `Core/money.ts`. Việc còn lại là đổi đơn vị lúc hiển thị theo `03-formulas.md` §3.
 */

import { DAYS_PER_MONTH, MONTHS_PER_YEAR } from '../../Core/constants';
import {
  BILLION,
  MILLION,
  MONTHS_SHOWN_AS_DAYS,
  MONTHS_SHOWN_AS_YEARS,
  THOUSAND,
  VND_GROUP_SIZE,
} from '../constants';

/** Chỉ giữ chữ số, bỏ số 0 vô nghĩa ở đầu. Tiền là số nguyên VND, không thập phân. */
export function digitsOnly(text: string): string {
  const digits = text.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return digits === '0' ? '' : digits;
}

/** `30000000` → `30.000.000`. Chuỗi rỗng giữ nguyên rỗng: ô trống không hiện số 0. */
export function groupThousands(digits: string): string {
  if (digits.length <= VND_GROUP_SIZE) return digits;

  const groups: string[] = [];
  let rest = digits;
  while (rest.length > VND_GROUP_SIZE) {
    groups.unshift(rest.slice(rest.length - VND_GROUP_SIZE));
    rest = rest.slice(0, rest.length - VND_GROUP_SIZE);
  }
  groups.unshift(rest);
  return groups.join('.');
}

/** Người dùng gõ gì cũng ra số nguyên VND, hoặc `null` khi ô còn trống. */
export function parseAmount(text: string): number | null {
  const digits = digitsOnly(text);
  if (digits === '') return null;
  return Number(digits);
}

export function formatAmount(amount: number): string {
  return groupThousands(String(Math.round(Math.abs(amount))));
}

/** Số thập phân kiểu Việt, cắt phần `,0` thừa. */
export function formatDecimal(value: number, fractionDigits: number): string {
  const fixed = Math.abs(value).toFixed(fractionDigits);
  // Chỉ cắt số 0 ở phần thập phân. Cắt cả phần nguyên thì 500 thành 5.
  const trimmed =
    fixed.indexOf('.') < 0 ? fixed : fixed.replace(/0+$/, '').replace(/\.$/, '');
  return trimmed.replace('.', ',');
}

/**
 * Tiền đọc thành lời: `5.000.000` → `5 triệu`. Dùng cho câu kể (bốc hơi, quãng đường
 * còn lại) — chỗ nào cần con số chính xác thì dùng `formatAmount`.
 */
export function formatAmountShort(amount: number): string {
  const value = Math.abs(amount);
  if (value >= BILLION) return `${formatDecimal(value / BILLION, 1)} tỷ`;
  if (value >= MILLION) return `${formatDecimal(value / MILLION, 1)} triệu`;
  if (value >= THOUSAND) return `${formatDecimal(value / THOUSAND, 0)} nghìn`;
  return `${formatDecimal(value, 0)} đồng`;
}

/** `03-formulas.md` §3: <1 tháng hiện bằng ngày, 1–24 bằng tháng, >24 bằng năm. */
export function formatMonths(months: number): string {
  const value = Math.abs(months);
  if (value < MONTHS_SHOWN_AS_DAYS) {
    return `${formatDecimal(value * DAYS_PER_MONTH, 0)} ngày`;
  }
  if (value <= MONTHS_SHOWN_AS_YEARS) return `${formatDecimal(value, 1)} tháng`;
  return `${formatDecimal(value / MONTHS_PER_YEAR, 1)} năm`;
}

/** Quãng đường tính bằng số tháng tiết kiệm — luôn đọc là "tháng", không đổi sang năm. */
export function formatMonthsOfSaving(months: number): string {
  return `${formatDecimal(months, 1)} tháng`;
}

export function formatDays(days: number): string {
  return `${formatDecimal(days, 1)} ngày`;
}

export function formatHours(hours: number): string {
  return `${formatDecimal(hours, 1)} giờ`;
}

export function formatPercent(ratio: number): string {
  return `${formatDecimal(ratio * 100, 1)}%`;
}
