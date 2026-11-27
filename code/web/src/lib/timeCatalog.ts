import type { Category, TimeBucket, TimeEntry } from '@mira/contract';
import { buildCatalog, type CatalogCell, type CatalogRow } from './catalog';

/**
 * Catalog giờ: mỗi danh mục một dòng, kèm tổng phút trong tuần.
 *
 * Bản sao đúng khuôn catalog tiền, và cố ý — hai màn trả lời cùng một kiểu câu hỏi:
 *
 *   vòng tròn  →  danh mục kèm tổng  →  từng mục
 *
 * Phần gom nằm ở `catalog.ts`, dùng chung. Ở đây chỉ đổi `TimeEntry` thành thứ nó đọc
 * được: `minutes` vào chỗ `value`.
 *
 * ─── MỘT CHỖ KHÁC TIỀN, CÓ CHỦ Ý ───
 *
 * Mục giờ gõ từ màn Nhật ký thường có GHI CHÚ mà không có danh mục ("Giờ làm việc", "Đi
 * lại đi làm"). Catalog vẫn gom hết chúng vào một dòng "Chưa xếp danh mục" chứ không gom
 * theo ghi chú. Gom theo ghi chú thì "Ăn trưa" và "ăn trưa " thành hai dòng, và catalog
 * biến thành đúng cái danh sách phẳng mà nó sinh ra để thay. Muốn tách thì xếp danh mục —
 * đó chính là việc catalog đang mời người ta làm.
 */
export type TimeCatalogRow = CatalogRow<TimeBucket>;
export type TimeCatalogCell = CatalogCell<TimeBucket>;

export function catalogOf(
  entries: readonly TimeEntry[],
  categories: readonly Category[],
): readonly TimeCatalogCell[] {
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  return buildCatalog(
    entries.map((e) => ({
      cell: e.bucket,
      categoryId: e.categoryId,
      value: e.minutes,
      date: e.date,
    })),
    (id) => nameById.get(id) ?? null,
  );
}

export { longestIn } from './catalog';
