import type { MoneyCategory, MoneyEntry, MoneyFlowCell } from '@mira/contract';
import { buildCatalog, type CatalogCell, type CatalogRow } from './catalog';

/**
 * Catalog tiền: mỗi danh mục một dòng, kèm tổng tiền trong kỳ.
 *
 * Phần gom nằm ở `catalog.ts`, dùng chung với catalog giờ — xem phần đầu file đó để biết
 * vì sao. Ở đây chỉ còn đúng một việc: đổi `MoneyEntry` thành thứ phần gom đọc được.
 */
export type MoneyCatalogRow = CatalogRow<MoneyFlowCell>;
export type MoneyCatalogCell = CatalogCell<MoneyFlowCell>;

export function catalogOf(
  entries: readonly MoneyEntry[],
  categories: readonly MoneyCategory[],
): readonly MoneyCatalogCell[] {
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  return buildCatalog(
    entries.map((e) => ({
      cell: e.cell,
      categoryId: e.categoryId,
      value: e.amount,
      date: e.date,
    })),
    (id) => nameById.get(id) ?? null,
  );
}

export { longestIn } from './catalog';
