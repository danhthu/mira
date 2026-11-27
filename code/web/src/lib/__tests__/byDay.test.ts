import { describe, expect, it } from 'vitest';
import { dayLabel, groupByDay } from '../byDay';

const m = (date: string, amount: number) => ({ date, amount });

describe('groupByDay', () => {
  it('gom các mục cùng ngày và cộng tổng ngày', () => {
    const ra = groupByDay([m('2026-11-25', 60), m('2026-11-25', 40)], (x) => x.amount);
    expect(ra).toHaveLength(1);
    expect(ra[0]?.total).toBe(100);
    expect(ra[0]?.items).toHaveLength(2);
  });

  it('xếp ngày mới trước cũ sau, kể cả khi đầu vào lộn xộn', () => {
    const ra = groupByDay(
      [m('2026-11-02', 1), m('2026-11-25', 1), m('2026-11-10', 1)],
      (x) => x.amount,
    );
    expect(ra.map((g) => g.date)).toEqual(['2026-11-25', '2026-11-10', '2026-11-02']);
  });

  it('giữ nguyên thứ tự trong một ngày, không sắp lại hộ người gọi', () => {
    const ra = groupByDay([m('2026-11-25', 10), m('2026-11-25', 99)], (x) => x.amount);
    expect(ra[0]?.items.map((x) => x.amount)).toEqual([10, 99]);
  });

  it('danh sách rỗng ra mảng rỗng', () => {
    expect(groupByDay([], (x: { amount: number }) => x.amount)).toEqual([]);
  });

  it('sang tháng khác vẫn xếp đúng, không so theo số ngày', () => {
    const ra = groupByDay([m('2026-10-30', 1), m('2026-11-02', 1)], (x) => x.amount);
    expect(ra.map((g) => g.date)).toEqual(['2026-11-02', '2026-10-30']);
  });
});

describe('dayLabel', () => {
  it('đọc đúng thứ trong tuần', () => {
    // 25/11/2026 là thứ Tư.
    expect(dayLabel('2026-11-25')).toEqual({ day: '25', weekday: 'Thứ 4', month: 'tháng 11/2026' });
  });

  it('không rơi lệch ngày ở mùng 1', () => {
    expect(dayLabel('2026-11-01').day).toBe('1');
    expect(dayLabel('2026-11-01').month).toBe('tháng 11/2026');
  });

  it('chủ nhật ra đúng chữ, không ra "Thứ 1"', () => {
    // 1/11/2026 là Chủ nhật.
    expect(dayLabel('2026-11-01').weekday).toBe('Chủ nhật');
  });
});
