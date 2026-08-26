import { describe, expect, it } from 'vitest';
import { isMomentOnly, isWhiteDay, isWithinCurfew } from '../quiet';

// 2026-08-24 là thứ hai, nên getDay() = 1.
const MONDAY = 1;
const TUESDAY = 2;

function mondayAt(hour: number): Date {
  return new Date(2026, 7, 24, hour, 0, 0, 0);
}

describe('isWhiteDay', () => {
  it('chưa chọn ngày trắng thì luôn false', () => {
    expect(isWhiteDay(mondayAt(10), null)).toBe(false);
  });

  it('trùng thứ đã chọn thì true', () => {
    expect(isWhiteDay(mondayAt(10), MONDAY)).toBe(true);
  });

  it('khác thứ đã chọn thì false', () => {
    expect(isWhiteDay(mondayAt(10), TUESDAY)).toBe(false);
  });

  it('đúng cả lúc nửa đêm và cuối ngày', () => {
    expect(isWhiteDay(mondayAt(0), MONDAY)).toBe(true);
    expect(isWhiteDay(mondayAt(23), MONDAY)).toBe(true);
  });
});

describe('isWithinCurfew', () => {
  it('trước giờ giới nghiêm thì false', () => {
    expect(isWithinCurfew(mondayAt(20), 21)).toBe(false);
  });

  it('đúng giờ giới nghiêm là đã vào', () => {
    expect(isWithinCurfew(mondayAt(21), 21)).toBe(true);
  });

  it('vắt qua nửa đêm vẫn còn giới nghiêm', () => {
    expect(isWithinCurfew(mondayAt(0), 21)).toBe(true);
    expect(isWithinCurfew(mondayAt(5), 21)).toBe(true);
  });

  it('tới 6 giờ sáng là hết', () => {
    expect(isWithinCurfew(mondayAt(6), 21)).toBe(false);
  });

  it('đổi giờ giới nghiêm thì mốc đổi theo', () => {
    expect(isWithinCurfew(mondayAt(19), 19)).toBe(true);
    expect(isWithinCurfew(mondayAt(22), 23)).toBe(false);
  });
});

describe('isMomentOnly', () => {
  it('ngày thường giờ hành chính thì app hoạt động đầy đủ', () => {
    expect(isMomentOnly(mondayAt(10), 21, null)).toBe(false);
  });

  it('ngày trắng thì im lặng cả ngày dù chưa tới giờ giới nghiêm', () => {
    expect(isMomentOnly(mondayAt(10), 21, MONDAY)).toBe(true);
  });

  it('qua giới nghiêm thì im lặng dù không phải ngày trắng', () => {
    expect(isMomentOnly(mondayAt(22), 21, TUESDAY)).toBe(true);
  });
});
