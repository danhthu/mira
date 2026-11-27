import { describe, expect, it } from 'vitest';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@mira/contract';
import { ICON_NAMES } from '../../ui/Icon';
import { CATEGORY_COLOR_LABEL, CATEGORY_COLOR_VAR, moneyStyle, timeStyle } from '../categoryStyle';

/**
 * Ba danh sách phải khớp nhau, và không có gì ở tầng kiểu bắt được chuyện đó.
 *
 * `CATEGORY_ICONS` nằm trong contract, `ICON_NAMES` nằm trong gói web, `CATEGORY_ICONS`
 * còn một bản sao nữa trong `be/src/shared/constants.ts` vì máy chủ không phụ thuộc
 * contract lúc chạy. Thêm một hình mà quên một chỗ thì:
 *
 *   • quên ở web  → máy chủ nhận, CSDL lưu, giao diện vẽ ô trống
 *   • quên ở máy chủ → người dùng chọn xong bấm lưu thì ăn lỗi 400
 *
 * Cả hai đều im lặng cho tới khi có người thử đúng cái hình đó.
 */
describe('icon và màu của danh mục', () => {
  it('mọi hình trong contract đều có trong bộ icon của web', () => {
    const thieu = CATEGORY_ICONS.filter((n) => !(ICON_NAMES as readonly string[]).includes(n));
    expect(thieu).toEqual([]);
  });

  it('mọi màu đều có biến CSS và có nhãn đọc được', () => {
    for (const c of CATEGORY_COLORS) {
      expect(CATEGORY_COLOR_VAR[c]).toMatch(/^var\(--[a-z-]+\)$/);
      expect(CATEGORY_COLOR_LABEL[c].length).toBeGreaterThan(0);
    }
  });

  it('danh mục chưa chọn gì thì rơi về hình và màu của ô tiền', () => {
    const ra = moneyStyle(null, 'monthlyExpense', 'receipt');
    expect(ra.icon).toBe('receipt');
    expect(ra.color).toBe('var(--red)');
  });

  it('danh mục đã chọn thì dùng hình và màu của chính nó', () => {
    const ra = moneyStyle({ icon: 'bowl', color: 'family' }, 'monthlyExpense', 'receipt');
    expect(ra.icon).toBe('bowl');
    expect(ra.color).toBe('var(--family-ink)');
  });

  it('chọn hình mà không chọn màu thì màu vẫn rơi về ô', () => {
    const ra = moneyStyle({ icon: 'bowl', color: null }, 'wastedMoney', 'bin');
    expect(ra.icon).toBe('bowl');
    expect(ra.color).toBe('var(--waste-ink)');
  });

  it('bên thời gian cũng rơi về đúng màu nhóm việc', () => {
    expect(timeStyle(null, 'work', 'briefcase')).toEqual({
      icon: 'briefcase',
      color: 'var(--work)',
    });
    expect(timeStyle({ icon: 'laptop', color: 'navy' }, 'work', 'briefcase')).toEqual({
      icon: 'laptop',
      color: 'var(--navy)',
    });
  });
});
