import { describe, it, expect } from 'vitest';
import { costPerUse, pickWeeklyRelease } from './itemCost';

describe('costPerUse', () => {
  it('chia giá mua cho số lần dùng', () => {
    expect(costPerUse(1_200_000, 4)).toBe(300_000);
  });

  it('làm tròn về số nguyên VND', () => {
    expect(costPerUse(1_000_000, 3)).toBe(333_333);
  });

  it('chưa dùng lần nào thì không có con số', () => {
    expect(costPerUse(1_200_000, 0)).toBeNull();
  });

  it('chưa ghi giá thì không có con số', () => {
    expect(costPerUse(null, 10)).toBeNull();
  });
});

describe('pickWeeklyRelease', () => {
  const items = [
    { id: 'a', useCount: 9 },
    { id: 'b', useCount: 1 },
    { id: 'c', useCount: 1 },
  ];

  it('không có món nào thì không hỏi', () => {
    expect(pickWeeklyRelease([], '2026-08-24')).toBeNull();
  });

  it('cùng một tuần luôn ra cùng một món', () => {
    const first = pickWeeklyRelease(items, '2026-08-24');
    const second = pickWeeklyRelease(items, '2026-08-24');
    expect(first).toEqual(second);
  });

  it('chỉ có một món thì luôn là món đó', () => {
    expect(pickWeeklyRelease([{ id: 'a', useCount: 9 }], '2026-08-24')?.id).toBe('a');
  });

  it('không đổi thứ tự mảng gốc', () => {
    const source = [...items];
    pickWeeklyRelease(source, '2026-08-24');
    expect(source.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });
});
