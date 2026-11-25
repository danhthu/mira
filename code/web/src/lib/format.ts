/**
 * Định dạng hiển thị. Hai quy tắc của Mira nằm ở đây:
 * giá trị chưa nhập hiện dấu hỏi xám chứ không hiện 0, và không có màu đỏ cho "chưa đủ".
 */

export const UNKNOWN = '?';

/** 215 → "3h 35m", 60 → "1h", 45 → "45m". */
export function minutes(value: number): string {
  const h = Math.floor(value / 60);
  const m = value % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

/** Giờ gọn cho nhãn donut: 215 → "3,6h". */
export function hours(value: number): string {
  return `${(value / 60).toFixed(1).replace('.', ',')}h`;
}

/** VND rút gọn: 18_500_000 → "18,5tr", 342_000 → "342k". */
export function vnd(value: number | null): string {
  if (value === null) return UNKNOWN;
  const sign = value < 0 ? '−' : '';
  const n = Math.abs(value);
  if (n >= 1_000_000) {
    const tr = n / 1_000_000;
    return `${sign}${(tr >= 100 ? Math.round(tr) : Number(tr.toFixed(1))).toString().replace('.', ',')}tr`;
  }
  if (n >= 1_000) return `${sign}${Math.round(n / 1_000)}k`;
  return `${sign}${n}`;
}

/** 367 phần nghìn → "36,7%". null → "?". */
export function perMille(value: number | null): string {
  if (value === null) return UNKNOWN;
  return `${(value / 10).toFixed(1).replace('.', ',')}%`;
}

/** 9.47 tháng → "9,5". null → "?". */
export function months(value: number | null): string {
  if (value === null) return UNKNOWN;
  return value.toFixed(1).replace('.', ',');
}
