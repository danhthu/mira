import {
  MINUS_SIGN,
  formatHourDelta,
  formatHours,
  formatMoneyShort,
  formatMonthLabel,
  formatMonths,
  formatVietnameseDate,
  formatWhole,
} from '../../src/Home/Models/format';

describe('định dạng số kiểu Việt', () => {
  it('giờ dùng dấu phẩy thập phân, một chữ số', () => {
    expect(formatHours(870)).toBe('14,5');
    expect(formatHours(540)).toBe('9,0');
  });

  it('tháng vốn tự do cũng một chữ số thập phân', () => {
    expect(formatMonths(9.47)).toBe('9,5');
  });

  it('delta có dấu, dấu trừ là ký tự toán học', () => {
    expect(formatHourDelta(90)).toBe('+1,5');
    expect(formatHourDelta(-90)).toBe(`${MINUS_SIGN}1,5`);
  });

  it('delta bằng 0 không hiện gì — không có dấu cộng giả', () => {
    expect(formatHourDelta(0)).toBeNull();
    expect(formatHourDelta(2)).toBeNull();
  });

  it('tiền rút gọn theo triệu rồi nghìn', () => {
    expect(formatMoneyShort(5000000)).toBe('5,0 tr');
    expect(formatMoneyShort(500000)).toBe('500 ng');
    expect(formatMoneyShort(800)).toBe('800 đ');
  });

  it('giờ đời là số nguyên, đúng khung của 08-three-pillars', () => {
    expect(formatWhole(43.2)).toBe('43');
  });
});

describe('ngày tháng tiếng Việt', () => {
  it('không còn "Saturday, Sep 5th"', () => {
    expect(formatVietnameseDate(new Date(2026, 8, 5))).toBe('thứ bảy, 5 tháng 9');
  });

  it('chủ nhật gọi đúng tên', () => {
    expect(formatVietnameseDate(new Date(2026, 8, 6))).toBe('chủ nhật, 6 tháng 9');
  });

  it('nhãn tháng của bản ghi tài chính', () => {
    expect(formatMonthLabel('2026-08')).toBe('tháng 8');
  });
});
