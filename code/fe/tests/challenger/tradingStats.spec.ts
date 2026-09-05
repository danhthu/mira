import {
  formatDayLabel,
  recentDayCounts,
  shortestGapMinutes,
  timesOnDay,
} from '../../src/Trading/Models/stats';

const at = (day: number, hour: number, minute = 0) =>
  new Date(2026, 8, day, hour, minute).toISOString();

describe('nhịp xem giá', () => {
  const now = new Date(2026, 8, 10, 20, 0);

  it('lọc đúng những lần xem trong ngày', () => {
    const times = [at(9, 10), at(10, 8), at(10, 9), at(11, 8)];
    expect(timesOnDay(times, now)).toEqual([at(10, 8), at(10, 9)]);
  });

  it('khoảng ngắn nhất tính bằng phút', () => {
    expect(shortestGapMinutes([at(10, 8), at(10, 9), at(10, 9, 5)])).toBe(5);
  });

  it('dưới hai lần thì không có khoảng nào để nói', () => {
    expect(shortestGapMinutes([])).toBeNull();
    expect(shortestGapMinutes([at(10, 8)])).toBeNull();
  });

  it('chỉ liệt kê ngày thật sự có ghi, mới nhất trước', () => {
    const times = [at(10, 8), at(10, 9), at(8, 7)];
    expect(recentDayCounts(times, now, 7)).toEqual([
      { day: '2026-09-10', count: 2 },
      { day: '2026-09-08', count: 1 },
    ]);
  });

  it('ngoài cửa sổ thì không đếm', () => {
    expect(recentDayCounts([at(1, 8)], now, 7)).toEqual([]);
  });

  it('nhãn ngày viết kiểu Việt', () => {
    expect(formatDayLabel('2026-09-05')).toBe('5 tháng 9, 2026');
  });
});
