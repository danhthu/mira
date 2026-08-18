export function formatDateYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayYMD(): string {
  return formatDateYMD(new Date());
}

export function getCurrentISOString(): string {
  return new Date().toISOString();
}

export function formatDisplayMonth(dateStr: string): string {
  const parts = dateStr.split('-');
  const year = parts[0] ?? '';
  const month = parts[1] ?? '';
  if (!year || !month) return dateStr;
  return `Tháng ${parseInt(month, 10)}/${year}`;
}

export function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

export function weekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return formatDateYMD(d);
}
