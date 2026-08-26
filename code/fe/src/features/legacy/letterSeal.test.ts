import { describe, it, expect } from 'vitest';
import {
  letterOpenDate,
  isLetterSealed,
  formatDayMonthYear,
} from './letterSeal';

describe('letterOpenDate', () => {
  it('mở lại đúng một năm sau', () => {
    expect(letterOpenDate('2026-03-09')).toBe('2027-03-09');
  });

  it('29/02 trượt sang 01/03 năm sau', () => {
    expect(letterOpenDate('2028-02-29')).toBe('2029-03-01');
  });

  it('trả lại nguyên chuỗi khi không phải ngày hợp lệ', () => {
    expect(letterOpenDate('chưa-có')).toBe('chưa-có');
  });
});

describe('isLetterSealed', () => {
  it('còn niêm phong trước ngày mở', () => {
    expect(isLetterSealed('2026-03-09', '2027-03-08')).toBe(true);
  });

  it('mở được đúng ngày mở', () => {
    expect(isLetterSealed('2026-03-09', '2027-03-09')).toBe(false);
  });

  it('mở được sau ngày mở', () => {
    expect(isLetterSealed('2026-03-09', '2030-01-01')).toBe(false);
  });
});

describe('formatDayMonthYear', () => {
  it('bỏ số 0 thừa ở đầu', () => {
    expect(formatDayMonthYear('2027-03-09')).toBe('9/3/2027');
  });
});
