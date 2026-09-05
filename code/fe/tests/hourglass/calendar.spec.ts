import {
  groupThousands,
  isoDate,
  nextContactDate,
  postponeOneWeek,
  readableDate,
  readableHour,
} from '../../src/Hourglass/Models/calendar';

describe('ngày tháng', () => {
  it('đệm số 0 cho tháng và ngày một chữ số', () => {
    expect(isoDate(new Date('2026-01-05T10:00:00'))).toBe('2026-01-05');
  });

  it('nhịp 2 lần mỗi tháng cho lần kế tiếp cách 15 ngày', () => {
    expect(nextContactDate(2, new Date('2026-09-05T10:00:00'))).toBe('2026-09-20');
  });

  it('nhịp hằng ngày cho lần kế tiếp là ngày mai', () => {
    expect(nextContactDate(30, new Date('2026-09-05T10:00:00'))).toBe('2026-09-06');
  });

  it('chưa có nhịp thì hẹn ngày mai, người dùng đổi được sau', () => {
    expect(nextContactDate(0, new Date('2026-09-05T10:00:00'))).toBe('2026-09-06');
  });

  it('dời một tuần cộng đúng 7 ngày, kể cả qua tháng', () => {
    expect(postponeOneWeek('2026-09-28')).toBe('2026-10-05');
  });

  it('hiện ngày theo kiểu ngày/tháng', () => {
    expect(readableDate('2026-09-20')).toBe('20/09');
  });

  it('hiện giờ hai chữ số', () => {
    expect(readableHour(9)).toBe('09:00');
    expect(readableHour(21)).toBe('21:00');
  });
});

describe('nhóm nghìn', () => {
  it('dùng dấu chấm kiểu Việt', () => {
    expect(groupThousands(6240)).toBe('6.240');
    expect(groupThousands(288)).toBe('288');
    expect(groupThousands(1234567)).toBe('1.234.567');
  });

  it('làm tròn về số nguyên', () => {
    expect(groupThousands(1234.6)).toBe('1.235');
  });
});
