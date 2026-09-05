import { MINUTES_PER_WEEK } from '../../src/Core/constants';
import { TimeEntryLike } from '../../src/Core/time';
import {
  awakeMinutes,
  daysCovered,
  minutesToHours,
  miraIndex,
  sumMinutes,
  weeklyShift,
  weeklyTime,
} from '../../src/Core/time';

/** 7 ngày dữ liệu để mặc định ra `ready`; các ca thiếu ngày tự dựng riêng. */
function fullWeek(entries: Omit<TimeEntryLike, 'date'>[]): TimeEntryLike[] {
  return entries.map((entry, index) => ({
    ...entry,
    date: `2026-09-0${(index % 7) + 1}`,
  }));
}

const SEVEN_DAYS: string[] = [
  '2026-09-01',
  '2026-09-02',
  '2026-09-03',
  '2026-09-04',
  '2026-09-05',
  '2026-09-06',
  '2026-09-07',
];

function spreadOverWeek(
  bucket: TimeEntryLike['bucket'],
  minutesPerDay: number,
): TimeEntryLike[] {
  return SEVEN_DAYS.map((date) => ({ date, minutes: minutesPerDay, bucket }));
}

describe('awakeMinutes', () => {
  it('giờ tỉnh = 168 giờ trừ giờ ngủ', () => {
    const result = awakeMinutes(56 * 60);
    expect(result.status).toBe('ready');
    expect(result.status === 'ready' && result.value).toBe(MINUTES_PER_WEEK - 3360);
  });

  it('chưa nhập giờ ngủ thì rỗng, không trả 168 giờ', () => {
    expect(awakeMinutes(0)).toEqual({ status: 'empty', reason: 'no_data' });
  });

  it('ngủ nhiều hơn cả tuần là dữ liệu mâu thuẫn', () => {
    expect(awakeMinutes(MINUTES_PER_WEEK)).toEqual({
      status: 'empty',
      reason: 'inconsistent',
    });
  });
});

describe('sumMinutes theo nhóm', () => {
  const entries: TimeEntryLike[] = fullWeek([
    { minutes: 60, bucket: 'people' },
    { minutes: 30, bucket: 'learn' },
    { minutes: 90, bucket: 'waste' },
    { minutes: 480, bucket: 'work' },
  ]);

  it('gom năm khoang ý nghĩa lại', () => {
    expect(sumMinutes(entries, 'meaningful')).toBe(90);
  });

  it('lãng phí tách riêng', () => {
    expect(sumMinutes(entries, 'waste')).toBe(90);
  });

  it('khoang work thuộc nhóm cần thiết', () => {
    expect(sumMinutes(entries, 'necessary')).toBe(480);
  });
});

describe('daysCovered', () => {
  it('đếm ngày khác nhau, không đếm bản ghi', () => {
    const entries: TimeEntryLike[] = [
      { date: '2026-09-01', minutes: 10, bucket: 'people' },
      { date: '2026-09-01', minutes: 20, bucket: 'waste' },
      { date: '2026-09-02', minutes: 30, bucket: 'rest' },
    ];
    expect(daysCovered(entries)).toBe(2);
  });
});

describe('weeklyTime', () => {
  it('giờ cần thiết là phần dư, không phải tổng bản ghi work', () => {
    const entries = [
      ...spreadOverWeek('people', 60),
      ...spreadOverWeek('waste', 30),
      // Bản ghi work có mặt nhưng KHÔNG được trừ lần nữa: nó đã nằm trong phần dư.
      ...spreadOverWeek('work', 480),
    ];
    const result = weeklyTime({ sleepMinutes: 56 * 60, entries });

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') return;
    expect(result.value.awakeMinutes).toBe(MINUTES_PER_WEEK - 3360);
    expect(result.value.meaningfulMinutes).toBe(420);
    expect(result.value.wasteMinutes).toBe(210);
    expect(result.value.necessaryMinutes).toBe(MINUTES_PER_WEEK - 3360 - 420 - 210);
  });

  it('chỉ số Mira = ý nghĩa / tỉnh', () => {
    const result = miraIndex({
      sleepMinutes: 56 * 60,
      entries: spreadOverWeek('people', 100),
    });
    expect(result.status).toBe('ready');
    expect(result.status === 'ready' && result.value).toBeCloseTo(
      700 / (MINUTES_PER_WEEK - 3360),
      10,
    );
  });

  it('chưa ghi gì thì rỗng — không hiện 0', () => {
    expect(weeklyTime({ sleepMinutes: 56 * 60, entries: [] })).toEqual({
      status: 'empty',
      reason: 'no_data',
    });
  });

  it('chỉ có bản ghi work vẫn coi là chưa ghi gì', () => {
    const result = weeklyTime({
      sleepMinutes: 56 * 60,
      entries: spreadOverWeek('work', 480),
    });
    expect(result).toEqual({ status: 'empty', reason: 'no_data' });
  });

  it('tuần mới có 3 ngày dữ liệu thì learning, không ngoại suy', () => {
    const entries: TimeEntryLike[] = SEVEN_DAYS.slice(0, 3).map((date) => ({
      date,
      minutes: 60,
      bucket: 'people' as const,
    }));
    const result = weeklyTime({ sleepMinutes: 56 * 60, entries });

    expect(result.status).toBe('learning');
    if (result.status !== 'learning') return;
    expect(result.samplesHave).toBe(3);
    expect(result.samplesNeed).toBe(7);
    // Giá trị vẫn là tổng thật, không nhân 7/3.
    expect(result.value.meaningfulMinutes).toBe(180);
  });

  it('ghi vượt quỹ giờ tỉnh thì báo mâu thuẫn, không trả số âm', () => {
    const result = weeklyTime({
      sleepMinutes: 56 * 60,
      entries: spreadOverWeek('waste', 24 * 60),
    });
    expect(result).toEqual({ status: 'empty', reason: 'inconsistent' });
  });
});

describe('weeklyShift', () => {
  const previous = {
    sleepMinutes: 56 * 60,
    entries: [...spreadOverWeek('people', 60), ...spreadOverWeek('waste', 90)],
  };

  it('chuyển 1 giờ lãng phí sang ý nghĩa được tính là chuyển dịch', () => {
    const current = {
      sleepMinutes: 56 * 60,
      entries: [...spreadOverWeek('people', 120), ...spreadOverWeek('waste', 30)],
    };
    const result = weeklyShift(current, previous);

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') return;
    expect(result.value.meaningfulDeltaMinutes).toBe(420);
    expect(result.value.wasteDeltaMinutes).toBe(-420);
    expect(result.value.shiftedMinutes).toBe(420);
  });

  it('tăng giờ ý nghĩa bằng cách cắt giấc ngủ không tính là chuyển dịch', () => {
    const current = {
      sleepMinutes: 42 * 60,
      entries: [...spreadOverWeek('people', 180), ...spreadOverWeek('waste', 90)],
    };
    const result = weeklyShift(current, previous);

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') return;
    expect(result.value.meaningfulDeltaMinutes).toBe(840);
    expect(result.value.wasteDeltaMinutes).toBe(0);
    expect(result.value.shiftedMinutes).toBe(0);
  });

  it('không có tuần trước thì rỗng, không so với 0', () => {
    const current = { sleepMinutes: 56 * 60, entries: spreadOverWeek('people', 60) };
    expect(weeklyShift(current, { sleepMinutes: 56 * 60, entries: [] })).toEqual({
      status: 'empty',
      reason: 'no_data',
    });
  });
});

describe('minutesToHours', () => {
  it('làm tròn một chữ số thập phân', () => {
    expect(minutesToHours(870)).toBe(14.5);
    expect(minutesToHours(875)).toBe(14.6);
  });
});
