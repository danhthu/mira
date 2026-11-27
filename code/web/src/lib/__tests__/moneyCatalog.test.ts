import { describe, it, expect } from 'vitest';
import type { MoneyCategory, MoneyEntry } from '@mira/contract';
import { catalogOf, longestIn } from '../moneyCatalog';

const dm = (id: string, name: string, cell: MoneyCategory['cell']): MoneyCategory => ({
  id,
  name,
  cell,
  archivedAt: null,
  icon: null,
  color: null,
});

const k = (
  id: string,
  amount: number,
  cell: MoneyEntry['cell'],
  categoryId: string | null = null,
): MoneyEntry => ({ id, date: '2026-11-10', amount, cell, categoryId, note: null });

const DANH_MUC = [
  dm('c-trua', 'Ăn trưa', 'monthlyExpense'),
  dm('c-cafe', 'Cà phê', 'monthlyExpense'),
  dm('c-luong', 'Lương', 'netIncome'),
];

describe('catalogOf', () => {
  it('gom các khoản cùng danh mục thành một dòng kèm tổng', () => {
    const ra = catalogOf(
      [k('1', 60_000, 'monthlyExpense', 'c-trua'), k('2', 55_000, 'monthlyExpense', 'c-trua')],
      DANH_MUC,
    );
    expect(ra).toHaveLength(1);
    expect(ra[0]?.rows[0]).toMatchObject({ name: 'Ăn trưa', total: 115_000, count: 2 });
  });

  it('⚑ xếp theo tổng GIẢM DẦN, không theo thứ tự ghi', () => {
    // Catalog để trả lời "tiền đi đâu nhiều nhất". Xếp theo thứ tự ghi thì câu hỏi ấy
    // phải tự cộng trong đầu mới trả lời được — đúng cái mà danh sách phẳng đã bắt làm.
    const ra = catalogOf(
      [
        k('1', 50_000, 'monthlyExpense', 'c-cafe'),
        k('2', 600_000, 'monthlyExpense', 'c-trua'),
        k('3', 40_000, 'monthlyExpense', 'c-cafe'),
      ],
      DANH_MUC,
    );
    expect(ra[0]?.rows.map((r) => r.name)).toEqual(['Ăn trưa', 'Cà phê']);
  });

  it('⚑ khoản chưa xếp danh mục vẫn được một dòng', () => {
    // Bỏ chúng đi thì tổng catalog khác tổng vòng dòng tiền, và không ai hiểu vì sao
    // thiếu tiền. Thà hiện một dòng xấu còn hơn giấu mất một khoản.
    const ra = catalogOf(
      [k('1', 60_000, 'monthlyExpense', 'c-trua'), k('2', 30_000, 'monthlyExpense', null)],
      DANH_MUC,
    );
    expect(ra[0]?.rows.map((r) => r.name)).toContain('Chưa xếp danh mục');
    expect(ra[0]?.total).toBe(90_000);
  });

  it('danh mục đã xoá hẳn thì khoản cũ rơi về "chưa xếp", không làm hỏng dòng', () => {
    const ra = catalogOf([k('1', 70_000, 'monthlyExpense', 'khong-con-nua')], DANH_MUC);
    expect(ra[0]?.rows[0]).toMatchObject({ name: 'Chưa xếp danh mục', total: 70_000 });
  });

  it('hai ô khác nhau không gom lẫn', () => {
    const ra = catalogOf(
      [k('1', 15_000_000, 'netIncome', 'c-luong'), k('2', 600_000, 'monthlyExpense', 'c-trua')],
      DANH_MUC,
    );
    expect(ra.map((c) => c.cell)).toEqual(['netIncome', 'monthlyExpense']);
    expect(ra[0]?.total).toBe(15_000_000);
  });

  it('ô nhiều tiền nhất đứng trước', () => {
    const ra = catalogOf(
      [k('1', 600_000, 'monthlyExpense', 'c-trua'), k('2', 15_000_000, 'netIncome', 'c-luong')],
      DANH_MUC,
    );
    expect(ra[0]?.cell).toBe('netIncome');
  });

  it('không có khoản nào thì catalog rỗng', () => {
    expect(catalogOf([], DANH_MUC)).toEqual([]);
  });

  it('longestIn không bao giờ trả 0', () => {
    expect(longestIn([])).toBe(1);
  });
});
