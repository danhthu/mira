import { describe, expect, it } from 'vitest';
import { canAddGoalAt, nextMorningAfter } from '../friction';

describe('nextMorningAfter', () => {
  it('buổi chiều thì mốc là 6 giờ sáng hôm sau', () => {
    expect(nextMorningAfter(new Date(2026, 7, 24, 15, 30))).toEqual(
      new Date(2026, 7, 25, 6, 0, 0, 0),
    );
  });

  it('rạng sáng thì mốc là 6 giờ sáng cùng ngày', () => {
    expect(nextMorningAfter(new Date(2026, 7, 24, 2, 0))).toEqual(
      new Date(2026, 7, 24, 6, 0, 0, 0),
    );
  });

  it('đúng 6 giờ sáng thì mốc là hôm sau', () => {
    expect(nextMorningAfter(new Date(2026, 7, 24, 6, 0))).toEqual(
      new Date(2026, 7, 25, 6, 0, 0, 0),
    );
  });

  it('qua được ranh giới tháng', () => {
    expect(nextMorningAfter(new Date(2026, 7, 31, 20, 0))).toEqual(
      new Date(2026, 8, 1, 6, 0, 0, 0),
    );
  });
});

describe('canAddGoalAt', () => {
  it('chưa có mục tiêu nào thì thêm được ngay', () => {
    expect(canAddGoalAt(null, new Date(2026, 7, 24, 15, 0))).toBe(true);
  });

  it('vừa thêm xong thì phải chờ', () => {
    const last = new Date(2026, 7, 24, 15, 0);
    expect(canAddGoalAt(last, new Date(2026, 7, 24, 15, 1))).toBe(false);
    expect(canAddGoalAt(last, new Date(2026, 7, 24, 23, 59))).toBe(false);
    expect(canAddGoalAt(last, new Date(2026, 7, 25, 5, 59))).toBe(false);
  });

  it('sáng hôm sau là mở lại', () => {
    const last = new Date(2026, 7, 24, 15, 0);
    expect(canAddGoalAt(last, new Date(2026, 7, 25, 6, 0))).toBe(true);
    expect(canAddGoalAt(last, new Date(2026, 7, 25, 9, 0))).toBe(true);
  });

  it('mục tiêu thêm lúc rạng sáng chỉ phải chờ tới 6 giờ cùng ngày', () => {
    const last = new Date(2026, 7, 24, 1, 0);
    expect(canAddGoalAt(last, new Date(2026, 7, 24, 5, 0))).toBe(false);
    expect(canAddGoalAt(last, new Date(2026, 7, 24, 6, 0))).toBe(true);
  });
});
