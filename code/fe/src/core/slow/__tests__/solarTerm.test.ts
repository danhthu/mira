import { describe, expect, it } from 'vitest';
import { getSolarTermAt, SOLAR_TERMS } from '../solarTerm';

describe('SOLAR_TERMS', () => {
  it('có đúng 24 tiết khí', () => {
    expect(SOLAR_TERMS).toHaveLength(24);
  });

  it('không trùng id', () => {
    const ids = new Set(SOLAR_TERMS.map((term) => term.id));
    expect(ids.size).toBe(24);
  });

  it('xếp tăng dần theo ngày trong năm', () => {
    const keys = SOLAR_TERMS.map((term) => term.month * 100 + term.day);
    const sorted = [...keys].sort((a, b) => a - b);
    expect(keys).toEqual(sorted);
  });
});

describe('getSolarTermAt', () => {
  it('đúng ngày bắt đầu thì đã thuộc tiết đó', () => {
    expect(getSolarTermAt(new Date(2026, 1, 4))).toBe('lapXuan');
    expect(getSolarTermAt(new Date(2026, 5, 21))).toBe('haChi');
    expect(getSolarTermAt(new Date(2026, 11, 22))).toBe('dongChi');
  });

  it('ngày trước mốc vẫn thuộc tiết liền trước', () => {
    expect(getSolarTermAt(new Date(2026, 1, 3))).toBe('daiHan');
    expect(getSolarTermAt(new Date(2026, 5, 20))).toBe('mangChung');
  });

  it('giữa hai mốc thì lấy mốc trước', () => {
    expect(getSolarTermAt(new Date(2026, 7, 15))).toBe('lapThu');
    expect(getSolarTermAt(new Date(2026, 9, 30))).toBe('suongGiang');
  });

  it('năm ngày đầu tháng 1 vẫn là Đông chí năm trước', () => {
    expect(getSolarTermAt(new Date(2026, 0, 1))).toBe('dongChi');
    expect(getSolarTermAt(new Date(2026, 0, 5))).toBe('dongChi');
    expect(getSolarTermAt(new Date(2026, 0, 6))).toBe('tieuHan');
  });

  it('cuối tháng 12 vẫn là Đông chí', () => {
    expect(getSolarTermAt(new Date(2026, 11, 31))).toBe('dongChi');
  });

  it('mỗi tiết khí đều xuất hiện ít nhất một ngày trong năm', () => {
    const seen = new Set<string>();
    for (let day = new Date(2026, 0, 1); day.getFullYear() === 2026; day.setDate(day.getDate() + 1)) {
      seen.add(getSolarTermAt(day));
    }
    expect(seen.size).toBe(24);
  });
});
