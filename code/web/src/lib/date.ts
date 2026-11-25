/** Ngày giờ thuần chuỗi YYYY-MM-DD, không kéo thư viện ngày tháng vào cho bốn hàm. */

export function today(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Thứ hai của tuần chứa `date`. Tuần của Mira bắt đầu từ thứ hai. */
export function weekStartOf(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const weekday = (d.getUTCDay() + 6) % 7;
  return addDays(date, -weekday);
}

/** YYYY-MM của một ngày. */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

const WEEKDAY_VI = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

export function labelDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const weekday = WEEKDAY_VI[(d.getUTCDay() + 6) % 7] ?? '';
  return `${weekday}, ${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}
