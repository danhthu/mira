/**
 * Thống kê nhịp xem giá — hàm thuần, không React, có test.
 *
 * Không hàm nào ở đây trả về một phán quyết. `shortestGapMinutes` là khoảng
 * ngắn nhất giữa hai lần xem trong ngày; nó được hiển thị cạnh khoảng cách
 * người dùng tự đặt để họ tự so, chứ app không nói ngày đó "đạt" hay không.
 */

const MS_PER_MINUTE = 60 * 1000;

export type DayCount = { day: string; count: number };

function dayKey(value: string | number | Date): string {
  const d = new Date(value);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function timesOnDay(viewTimes: string[], day: Date): string[] {
  const key = dayKey(day);
  return viewTimes.filter((time) => dayKey(time) === key);
}

/** Khoảng ngắn nhất giữa hai lần liên tiếp, tính bằng phút. Dưới hai lần thì null. */
export function shortestGapMinutes(times: string[]): number | null {
  if (times.length < 2) return null;
  const sorted = times
    .map((time) => new Date(time).getTime())
    .sort((a, b) => a - b);
  let shortest = Infinity;
  for (let i = 1; i < sorted.length; i++) {
    shortest = Math.min(shortest, sorted[i] - sorted[i - 1]);
  }
  return Math.round(shortest / MS_PER_MINUTE);
}

/** Số lần xem mỗi ngày trong `days` ngày gần đây, mới nhất trước. */
export function recentDayCounts(
  viewTimes: string[],
  now: Date,
  days: number,
): DayCount[] {
  const counts = new Map<string, number>();
  viewTimes.forEach((time) => {
    const key = dayKey(time);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const result: DayCount[] = [];
  for (let back = 0; back < days; back++) {
    const date = new Date(now.getTime());
    date.setDate(date.getDate() - back);
    const key = dayKey(date);
    const count = counts.get(key);
    if (count) result.push({ day: key, count });
  }
  return result;
}

export function formatDayLabel(day: string): string {
  const [year, month, date] = day.split('-');
  return `${Number(date)} tháng ${Number(month)}, ${year}`;
}
