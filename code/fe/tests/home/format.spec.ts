import {
  formatHours,
  formatMinutes,
  formatVietnameseDate,
} from '../../src/Home/Models/format';

describe('định dạng số kiểu Việt', () => {
  it('giờ dùng dấu phẩy thập phân, một chữ số', () => {
    expect(formatHours(870)).toBe('14,5');
    expect(formatHours(540)).toBe('9,0');
  });

  it('phút là số nguyên, không có phần thập phân giả', () => {
    expect(formatMinutes(45)).toBe('45');
    expect(formatMinutes(45.4)).toBe('45');
  });
});

describe('ngày tháng tiếng Việt', () => {
  it('không còn "Saturday, Sep 5th"', () => {
    expect(formatVietnameseDate(new Date(2026, 8, 5))).toBe('thứ bảy, 5 tháng 9');
  });

  it('chủ nhật gọi đúng tên', () => {
    expect(formatVietnameseDate(new Date(2026, 8, 6))).toBe('chủ nhật, 6 tháng 9');
  });
});
