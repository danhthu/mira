import { describe, expect, it } from 'vitest';
import { topWaste, wasteName, wasteTrend } from '../waste';

describe('lãng phí nhiều nhất', () => {
  it('cộng cùng tên rồi xếp lớn trước', () => {
    expect(
      topWaste([
        { name: 'Lướt điện thoại', amount: 60 },
        { name: 'Xem phim', amount: 90 },
        { name: 'Lướt điện thoại', amount: 45 },
      ]),
    ).toEqual([
      { name: 'Lướt điện thoại', amount: 105 },
      { name: 'Xem phim', amount: 90 },
    ]);
  });

  it('chỉ lấy đúng số mục xin', () => {
    expect(
      topWaste(
        [
          { name: 'a', amount: 1 },
          { name: 'b', amount: 2 },
        ],
        1,
      ),
    ).toEqual([{ name: 'b', amount: 2 }]);
  });

  it('không có gì thì rỗng', () => {
    expect(topWaste([])).toEqual([]);
  });

  it('tên: danh mục, rồi ghi chú, rồi "chưa xếp"', () => {
    expect(wasteName('Trà sữa', 'quán A')).toBe('Trà sữa');
    expect(wasteName(null, ' quán A ')).toBe('Chưa xếp: quán A');
    expect(wasteName(undefined, null)).toBe('Chưa xếp danh mục');
  });
});

describe('so với kỳ trước', () => {
  const f = (n: number) => `${n}`;
  it('ít đi là tốt', () => {
    expect(wasteTrend(60, 90, f, 'tuần trước')).toEqual({
      text: '↓ Ít hơn 30 so với tuần trước',
      good: true,
    });
  });
  it('nhiều lên là không tốt', () => {
    expect(wasteTrend(90, 60, f, 'tuần trước')?.good).toBe(false);
  });
  it('lệch trong ngưỡng thì nói gần bằng', () => {
    expect(wasteTrend(62, 60, f, 'tuần trước', 5)).toEqual({
      text: 'Gần như bằng tuần trước',
      good: null,
    });
  });
  it('không có kỳ trước, hoặc cả hai bằng 0, thì im', () => {
    expect(wasteTrend(60, null, f, 'tuần trước')).toBeNull();
    expect(wasteTrend(0, 0, f, 'tuần trước')).toBeNull();
  });
});
