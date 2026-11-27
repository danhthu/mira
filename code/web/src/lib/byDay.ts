/**
 * Gom một danh sách mục thành **từng ngày**, mỗi ngày một tổng.
 *
 * ─────────────────────────── LẤY TỪ MONEY LOVER ───────────────────────────
 *
 * Danh sách giao dịch của Money Lover nói ngày **một lần** cho cả cụm, kèm tổng của ngày,
 * rồi mới tới các dòng. Mira trước đây nhắc lại ngày tháng ở từng dòng:
 *
 *   Chợ búa   −560k   Thứ 6, 30/10 · Chi tiêu tháng
 *   Ăn uống    −82k   Thứ 4, 28/10 · Chi tiêu tháng
 *   Đi lại     −90k   Thứ 3, 27/10 · Chi tiêu tháng
 *
 * Ba dòng nhắc ba lần một chuyện, và vẫn không trả lời được câu *hôm đó tiêu hết bao
 * nhiêu* — câu mà một đầu ngày có tổng trả lời miễn phí.
 */

export interface DayGroup<T> {
  /** YYYY-MM-DD. */
  readonly date: string;
  readonly total: number;
  readonly items: readonly T[];
}

/**
 * Gom theo ngày, **mới trước cũ sau**.
 *
 * Thứ tự trong một ngày giữ nguyên thứ tự đầu vào: người gọi đã sắp xếp theo ý họ rồi,
 * và sắp lại ở đây là lặng lẽ ghi đè quyết định đó.
 */
export function groupByDay<T extends { readonly date: string }>(
  items: readonly T[],
  valueOf: (item: T) => number,
): readonly DayGroup<T>[] {
  const gom = new Map<string, { items: T[]; total: number }>();

  for (const it of items) {
    const co = gom.get(it.date);
    if (co === undefined) {
      gom.set(it.date, { items: [it], total: valueOf(it) });
      continue;
    }
    co.items.push(it);
    co.total += valueOf(it);
  }

  return [...gom.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, v]) => ({ date, total: v.total, items: v.items }));
}

const THU = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'] as const;

/**
 * Nhãn cho đầu ngày: số ngày to, thứ và tháng nhỏ.
 *
 * Dựng ngày bằng `Date.UTC` chứ không `new Date('2026-11-25')` rồi đọc giờ địa phương:
 * chuỗi YYYY-MM-DD được hiểu là UTC, nên ở múi giờ Việt Nam (UTC+7) đọc bằng `getDay()`
 * vẫn đúng, nhưng ở múi giờ âm thì lùi một ngày. Mira chỉ chạy ở Việt Nam hôm nay — đó
 * là một giả định, không phải một sự thật, nên không dựa vào nó.
 */
export function dayLabel(date: string): { day: string; weekday: string; month: string } {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1));
  return {
    day: String(d ?? 1),
    weekday: THU[t.getUTCDay()] ?? '',
    month: `tháng ${m ?? 1}/${y ?? 2026}`,
  };
}
