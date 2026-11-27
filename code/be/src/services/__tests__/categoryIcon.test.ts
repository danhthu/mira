/**
 * Hình và màu đi được trọn đường TẠO, không chỉ đường sửa.
 *
 * Giao diện mới cho chọn hình ngay lúc tạo danh mục (trước đây phải tạo xong rồi sửa).
 * Bài này giữ cho máy chủ không lặng lẽ nuốt hai trường đó ở bước tạo — nếu nuốt, người
 * dùng chọn hình, bấm Tạo, và nhận lại một danh mục trống hình mà không ai báo gì.
 */
import { describe, it, expect } from 'vitest';
import { createMoneyCategory } from '../moneyCategory';
import { createCategory } from '../category';

function fakeDeps() {
  const daGhi: Record<string, unknown>[] = [];
  const repo = {
    async countInCell() {
      return 0;
    },
    async countInBucket() {
      return 0;
    },
    async create(_userId: string, rec: Record<string, unknown>) {
      daGhi.push(rec);
      return { id: 'x', ...rec };
    },
  };
  return { deps: { moneyCategories: repo, categories: repo } as never, daGhi };
}

describe('tạo danh mục kèm hình và màu', () => {
  it('danh mục tiền giữ hình và màu đã chọn', async () => {
    const { deps, daGhi } = fakeDeps();
    await createMoneyCategory(deps, 'u', {
      name: 'Cà phê',
      cell: 'monthlyExpense',
      icon: 'mug',
      color: 'candy',
    });
    expect(daGhi[0]).toMatchObject({ icon: 'mug', color: 'candy' });
  });

  it('danh mục giờ giữ hình và màu đã chọn', async () => {
    const { deps, daGhi } = fakeDeps();
    await createCategory(deps, 'u', {
      name: 'Đọc sách',
      bucket: 'personal',
      golden: false,
      icon: 'book',
      color: 'navy',
    });
    expect(daGhi[0]).toMatchObject({ icon: 'book', color: 'navy' });
  });

  it('bỏ trống thì ra null, vẫn tạo được', async () => {
    const { deps, daGhi } = fakeDeps();
    await createMoneyCategory(deps, 'u', { name: 'Chợ', cell: 'monthlyExpense' });
    expect(daGhi[0]).toMatchObject({ icon: null, color: null });
  });

  it('khoá hình lạ thì từ chối, không lặng lẽ về null', async () => {
    const { deps } = fakeDeps();
    await expect(
      createMoneyCategory(deps, 'u', { name: 'X', cell: 'monthlyExpense', icon: 'khong-co' }),
    ).rejects.toThrow(/icon/);
  });
});
