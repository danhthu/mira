/**
 * Gom mục thành **catalog**: mỗi danh mục một dòng, kèm tổng.
 *
 * ─────────────────────────────── VÌ SAO CẦN TẦNG NÀY ───────────────────────────────
 *
 * Vòng tròn nói *"chi tiêu 900k"* hoặc *"công việc 89%"*. Danh sách phẳng nói *"60k, 55k,
 * 40k…"* ba mươi lần. Câu người ta thật sự hỏi nằm ở giữa: **ăn trưa hết bao nhiêu**,
 * **họp mất mấy giờ**.
 *
 * ─────────────────────── VÌ SAO MỘT HÀM CHO CẢ TIỀN LẪN GIỜ ───────────────────────
 *
 * Tiền và giờ gom y hệt nhau: cùng khoá `ô|danh mục`, cùng thứ tự giảm dần, cùng luật
 * "khoản chưa xếp vẫn được một dòng". Chỉ khác tên trường — `amount` với `minutes`.
 *
 * Kho mã này đã bị "một sự thật nằm hai chỗ" cắn bốn lần (kiểu `Intent`, GOLDEN_HOURS,
 * file luật đọc câu, màu ô tiền). Chép `moneyCatalog.ts` sang `timeCatalog.ts` là lần thứ
 * năm: sửa thứ tự sắp xếp bên này mà quên bên kia thì hai màn gom khác nhau, và không có
 * bài kiểm nào bắt được vì mỗi bên tự kiểm chính mình.
 *
 * Nên phần gom nằm đúng ở đây. Hai bên chỉ việc đổi mục của mình thành `CatalogItem`.
 *
 * ─────────────────────────────── MẤY LUẬT NHỎ, CÓ LÝ DO ───────────────────────────────
 *
 * • **Mục không có danh mục vẫn được một dòng** tên "Chưa xếp danh mục". Bỏ chúng đi thì
 *   tổng catalog khác tổng vòng tròn, và không ai hiểu vì sao thiếu.
 * • **Danh mục đã cất vẫn hiện ra** nếu kỳ đó có mục trỏ về nó. Cất là "thôi dùng từ
 *   nay", không phải "xoá khỏi lịch sử".
 * • Xếp theo tổng **giảm dần**. Catalog để trả lời "đi đâu nhiều nhất", nên thứ nhiều
 *   nhất phải nằm trên cùng, không phải thứ ghi gần nhất.
 */

/** Một mục đã rút gọn còn đúng bốn thứ phần gom cần biết. */
export interface CatalogItem<O extends string> {
  readonly cell: O;
  readonly categoryId: string | null;
  /** Đồng, hoặc phút. Phần gom không cần biết là gì. */
  readonly value: number;
  /** YYYY-MM-DD. */
  readonly date: string;
}

export interface CatalogRow<O extends string> {
  /** `null` khi gom những mục chưa xếp danh mục. */
  readonly categoryId: string | null;
  readonly name: string;
  readonly cell: O;
  readonly total: number;
  readonly count: number;
  /**
   * Ngày của mục GẦN NHẤT trong danh mục này, YYYY-MM-DD.
   *
   * Concept ghi "Đã nhập · 14/4" dưới mỗi dòng. Mốc đó có thật, lấy từ mục gần nhất,
   * không phải bịa.
   */
  readonly lastDate: string;
}

/** Một ô và các danh mục bên trong nó. */
export interface CatalogCell<O extends string> {
  readonly cell: O;
  readonly total: number;
  readonly rows: readonly CatalogRow<O>[];
}

export const UNFILED = 'Chưa xếp danh mục';

/**
 * Gom mục theo `ô|danh mục`.
 *
 * `nameOf` tra tên danh mục. Danh mục đã bị xoá hẳn khỏi bảng thì vẫn còn mục trỏ về id
 * đó, nên `nameOf` trả `null` là rơi về "Chưa xếp danh mục" thay vì làm hỏng cả dòng.
 */
export function buildCatalog<O extends string>(
  items: readonly CatalogItem<O>[],
  nameOf: (categoryId: string) => string | null,
): readonly CatalogCell<O>[] {
  // Khoá gồm cả ô: hai danh mục khác ô thì không gom lẫn, kể cả khi trùng tên.
  // "Xe" của chi tiêu khác "Xe" của đầu tư.
  const gom = new Map<string, { row: CatalogRow<O>; total: number; count: number; last: string }>();

  for (const it of items) {
    const key = `${it.cell}|${it.categoryId ?? ''}`;
    const co = gom.get(key);
    if (co === undefined) {
      gom.set(key, {
        row: {
          categoryId: it.categoryId,
          name: it.categoryId === null ? UNFILED : (nameOf(it.categoryId) ?? UNFILED),
          cell: it.cell,
          total: it.value,
          count: 1,
          lastDate: it.date,
        },
        total: it.value,
        count: 1,
        last: it.date,
      });
      continue;
    }
    co.total += it.value;
    co.count += 1;
    if (it.date > co.last) co.last = it.date;
  }

  const theoO = new Map<O, CatalogRow<O>[]>();
  for (const { row, total, count, last } of gom.values()) {
    const ds = theoO.get(row.cell) ?? [];
    ds.push({ ...row, total, count, lastDate: last });
    theoO.set(row.cell, ds);
  }

  const ra: CatalogCell<O>[] = [];
  for (const [cell, rows] of theoO) {
    rows.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'vi'));
    ra.push({ cell, total: rows.reduce((t, r) => t + r.total, 0), rows });
  }
  // Ô nhiều nhất đứng trước, cùng lý do với thứ tự dòng bên trong.
  ra.sort((a, b) => b.total - a.total);
  return ra;
}

/** Dòng dài nhất trong một ô, để vẽ thanh tỉ lệ. Luôn ≥ 1 để khỏi chia cho 0. */
export const longestIn = <O extends string>(rows: readonly CatalogRow<O>[]): number =>
  Math.max(1, ...rows.map((r) => r.total));
