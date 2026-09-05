import {
  digitsOnly,
  formatAmount,
  formatAmountShort,
  formatDays,
  formatHours,
  formatMonths,
  formatMonthsOfSaving,
  formatPercent,
  groupThousands,
  parseAmount,
} from '../../src/Money/Models/format';

describe('nhập tiền VND', () => {
  it('tách nhóm nghìn lúc gõ', () => {
    expect(groupThousands('30000000')).toBe('30.000.000');
    expect(groupThousands('900')).toBe('900');
    expect(groupThousands('1000')).toBe('1.000');
  });

  it('bỏ mọi ký tự không phải chữ số', () => {
    expect(digitsOnly('30.000.000đ')).toBe('30000000');
    expect(digitsOnly('12,5')).toBe('125');
  });

  it('ô trống ra null, không ra 0', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('0')).toBeNull();
  });

  it('luôn ra số nguyên VND', () => {
    const value = parseAmount('14.000.000');
    expect(value).toBe(14_000_000);
    expect(Number.isInteger(value)).toBe(true);
  });

  it('không có đường nào tạo số âm từ bàn phím', () => {
    expect(parseAmount('-5.000.000')).toBe(5_000_000);
  });
});

describe('hiển thị', () => {
  it('tiền đọc thành lời', () => {
    expect(formatAmountShort(5_000_000)).toBe('5 triệu');
    expect(formatAmountShort(1_200_000_000)).toBe('1,2 tỷ');
    expect(formatAmountShort(500_000)).toBe('500 nghìn');
  });

  it('số âm không bao giờ hiện dấu trừ', () => {
    expect(formatAmount(-180_000_000)).toBe('180.000.000');
    expect(formatAmountShort(-60_000_000)).toBe('60 triệu');
    expect(formatMonths(-9.5)).toBe('9,5 tháng');
    expect(formatDays(-7.9)).toBe('7,9 ngày');
  });

  it('vốn tự do đổi đơn vị theo 03-formulas §3', () => {
    expect(formatMonths(0.4)).toBe('12 ngày');
    expect(formatMonths(9.473)).toBe('9,5 tháng');
    expect(formatMonths(38.4)).toBe('3,2 năm');
  });

  it('quãng đường tính bằng tháng tiết kiệm không đổi sang năm', () => {
    expect(formatMonthsOfSaving(7)).toBe('7 tháng');
    expect(formatMonthsOfSaving(36.5)).toBe('36,5 tháng');
  });

  it('giờ, ngày, phần trăm', () => {
    expect(formatHours(43)).toBe('43 giờ');
    expect(formatDays(7.894)).toBe('7,9 ngày');
    expect(formatPercent(0.2)).toBe('20%');
  });
});
