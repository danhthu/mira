/**
 * Logic niêm phong thư gửi mình. Để ở feature chứ chưa ở `core/` vì phạm vi
 * sửa đổi hiện tại không chạm được `core/` — xem HANDOFF, mục Bước tiếp theo.
 */

/** Thư viết hôm nay mở lại đúng một năm sau. */
export const LETTER_SEAL_YEARS = 1;

function parseYMD(dateYMD: string): { year: number; month: number; day: number } | null {
  const parts = dateYMD.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  return { year, month, day };
}

/**
 * Ngày mở lại lá thư viết vào `writtenYMD`. Dùng Date.UTC nên 29/02 tự trượt
 * sang 01/03 của năm sau thay vì tạo ra một ngày không tồn tại.
 */
export function letterOpenDate(writtenYMD: string): string {
  const parsed = parseYMD(writtenYMD);
  if (parsed === null) return writtenYMD;
  const opened = new Date(
    Date.UTC(parsed.year + LETTER_SEAL_YEARS, parsed.month - 1, parsed.day),
  );
  return opened.toISOString().slice(0, 10);
}

/** Còn niêm phong khi hôm nay chưa tới ngày mở. */
export function isLetterSealed(writtenYMD: string, todayYMD: string): boolean {
  return todayYMD < letterOpenDate(writtenYMD);
}

/** `2027-03-09` → `9/3/2027`. */
export function formatDayMonthYear(dateYMD: string): string {
  const parsed = parseYMD(dateYMD);
  if (parsed === null) return dateYMD;
  return `${parsed.day}/${parsed.month}/${parsed.year}`;
}
