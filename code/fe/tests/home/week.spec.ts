import { TimeEntryLike } from '../../src/Core/time';
import {
  entriesInRange,
  previousWeekRangeOf,
  toIsoDate,
  toMonthKey,
  weekRangeOf,
} from '../../src/Home/Models/week';

describe('cắt tuần', () => {
  it('tuần bắt đầu thứ hai và kết thúc chủ nhật', () => {
    expect(weekRangeOf(new Date(2026, 8, 5))).toEqual({
      start: '2026-08-31',
      end: '2026-09-06',
    });
  });

  it('chủ nhật thuộc về tuần đã bắt đầu từ thứ hai trước đó', () => {
    expect(weekRangeOf(new Date(2026, 8, 6))).toEqual({
      start: '2026-08-31',
      end: '2026-09-06',
    });
  });

  it('tuần trước là bảy ngày liền trước', () => {
    expect(previousWeekRangeOf(new Date(2026, 8, 5))).toEqual({
      start: '2026-08-24',
      end: '2026-08-30',
    });
  });

  it('chuỗi ngày và tháng có số 0 đứng đầu', () => {
    expect(toIsoDate(new Date(2026, 0, 4))).toBe('2026-01-04');
    expect(toMonthKey(new Date(2026, 0, 4))).toBe('2026-01');
  });
});

describe('lọc bản ghi theo tuần', () => {
  const entries: TimeEntryLike[] = [
    { date: '2026-08-30', minutes: 60, bucket: 'people' },
    { date: '2026-08-31', minutes: 60, bucket: 'people' },
    { date: '2026-09-06', minutes: 60, bucket: 'waste' },
    { date: '2026-09-07', minutes: 60, bucket: 'waste' },
  ];

  it('lấy đúng hai đầu mút, bỏ ngày ngoài khoảng', () => {
    const inWeek = entriesInRange(entries, weekRangeOf(new Date(2026, 8, 5)));
    expect(inWeek.map((entry) => entry.date)).toEqual(['2026-08-31', '2026-09-06']);
  });
});
