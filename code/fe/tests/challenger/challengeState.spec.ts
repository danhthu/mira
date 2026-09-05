import {
  challengeState,
  coversDay,
  daysLeft,
  daysPassed,
  daysUntilStart,
  elapsedRatio,
  isReached,
  totalDays,
} from '../../src/Challenger/Models/challengeState';

const window = (startDay: number, endDay: number) => ({
  start: new Date(2026, 8, startDay),
  end: new Date(2026, 8, endDay),
});

describe('trạng thái thử thách', () => {
  const now = new Date(2026, 8, 10);

  it('chưa tới ngày bắt đầu thì sắp bắt đầu', () => {
    expect(challengeState(window(15, 30), now)).toBe('upcoming');
  });

  it('trong quãng thì đang diễn ra', () => {
    expect(challengeState(window(1, 30), now)).toBe('doing');
  });

  it('hết hạn mà chưa đánh dấu thì khép lại, không phải thất bại', () => {
    expect(challengeState(window(1, 5), now)).toBe('closed');
  });

  it('người dùng đánh dấu đạt thì đạt, kể cả khi quãng đã qua', () => {
    expect(challengeState({ ...window(1, 5), status: 'SUCCESS' }, now)).toBe(
      'reached',
    );
  });

  it('không có mốc thời gian thì vẫn là đang diễn ra, không rơi vào trạng thái xấu', () => {
    expect(challengeState({}, now)).toBe('doing');
  });

  it('chỉ SUCCESS mới là đã đạt', () => {
    expect(isReached({ status: 'SUCCESS' })).toBe(true);
    expect(isReached({ status: 'DOING' })).toBe(false);
    expect(isReached({})).toBe(false);
  });
});

describe('đếm ngày', () => {
  const now = new Date(2026, 8, 10);

  it('quãng tính cả ngày bắt đầu lẫn ngày kết thúc', () => {
    expect(totalDays(window(1, 30))).toBe(30);
    expect(totalDays(window(10, 10))).toBe(1);
  });

  it('thiếu mốc thì trả 0 chứ không trả số bịa', () => {
    expect(totalDays({ start: new Date(2026, 8, 1) })).toBe(0);
    expect(totalDays({})).toBe(0);
  });

  it('ngày đã qua và còn lại cộng đúng bằng độ dài quãng', () => {
    const w = window(1, 30);
    expect(daysPassed(w, now)).toBe(10);
    expect(daysLeft(w, now)).toBe(20);
  });

  it('ngày đã qua không vượt quá độ dài quãng', () => {
    expect(daysPassed(window(1, 5), now)).toBe(5);
    expect(daysLeft(window(1, 5), now)).toBe(0);
  });

  it('quãng chưa bắt đầu thì chưa qua ngày nào', () => {
    expect(daysPassed(window(15, 30), now)).toBe(0);
    expect(daysUntilStart(window(15, 30), now)).toBe(5);
    expect(daysUntilStart(window(1, 30), now)).toBe(0);
  });

  it('tỷ lệ thời gian trôi qua nằm trong 0..1', () => {
    expect(elapsedRatio(window(1, 30), now)).toBeCloseTo(10 / 30);
    expect(elapsedRatio(window(1, 5), now)).toBe(1);
    expect(elapsedRatio(window(15, 30), now)).toBe(0);
    expect(elapsedRatio({}, now)).toBe(0);
  });
});

describe('ngày nằm trong quãng', () => {
  it('bao gồm cả hai đầu mút', () => {
    const w = window(5, 10);
    expect(coversDay(w, new Date(2026, 8, 5))).toBe(true);
    expect(coversDay(w, new Date(2026, 8, 10, 23, 30))).toBe(true);
    expect(coversDay(w, new Date(2026, 8, 4))).toBe(false);
    expect(coversDay(w, new Date(2026, 8, 11))).toBe(false);
  });

  it('thiếu mốc thì không phủ ngày nào', () => {
    expect(coversDay({}, new Date(2026, 8, 5))).toBe(false);
  });
});
