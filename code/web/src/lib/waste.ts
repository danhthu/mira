/**
 * Gom các mục lãng phí theo tên, lớn trước nhỏ sau.
 *
 * Dùng cho dải Lãng phí ở cả Thời gian lẫn Tài chính (27/11/2026). Một con số "17h lãng
 * phí" chưa giúp ai bớt được giờ nào; câu giúp được là "phần lớn là lướt điện thoại".
 */
export interface WasteItem {
  readonly name: string;
  readonly amount: number;
}

export function topWaste(items: readonly WasteItem[], limit = 2): readonly WasteItem[] {
  const tong = new Map<string, number>();
  for (const it of items) tong.set(it.name, (tong.get(it.name) ?? 0) + it.amount);
  return [...tong.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .filter((x) => x.amount > 0)
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/**
 * Tên một mục: danh mục; không có thì ghi chú, kèm chữ "Chưa xếp:" để không ai đọc ghi chú
 * thành tên danh mục (một ghi chú "Gia đình, …" nằm trong ô lãng phí đọc rất lạ).
 */
export function wasteName(categoryName: string | null | undefined, note: string | null): string {
  if (categoryName != null && categoryName.trim() !== '') return categoryName;
  if (note !== null && note.trim() !== '') return `Chưa xếp: ${note.trim()}`;
  return 'Chưa xếp danh mục';
}

/**
 * Một dòng so với kỳ trước, để con số thành động lực: bớt được hay tệ đi.
 *
 * So CÙNG KỲ chứ không so cả kỳ: thứ Tư tuần này mà so với cả tuần trước thì lần nào cũng
 * "giảm", và câu khen đó là câu nói dối. Gần như bằng nhau (dưới `nguong`) thì nói không đổi.
 */
export interface WasteTrend {
  readonly text: string;
  /** true khi lãng phí ít đi: dải tô xanh. */
  readonly good: boolean | null;
}

export function wasteTrend(
  now: number,
  before: number | null,
  fmt: (n: number) => string,
  ky: string,
  nguong = 0,
): WasteTrend | null {
  if (before === null || (now === 0 && before === 0)) return null;
  const d = now - before;
  if (Math.abs(d) <= nguong) return { text: `Gần như bằng ${ky}`, good: null };
  return d < 0
    ? { text: `↓ Ít hơn ${fmt(-d)} so với ${ky}`, good: true }
    : { text: `↑ Nhiều hơn ${fmt(d)} so với ${ky}`, good: false };
}
