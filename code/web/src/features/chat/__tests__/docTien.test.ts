import { describe, expect, it } from 'vitest';
import { docTien } from '../EditWritten';

describe('ô số tiền trong khay sửa', () => {
  it('đọc số có dấu chấm nghìn', () => {
    expect(docTien('60.000')).toBe(60_000);
  });
  it('đọc "60k" và "35 nghìn"', () => {
    expect(docTien('60k')).toBe(60_000);
    expect(docTien('35 nghìn')).toBe(35_000);
  });
  it('đọc "1tr2" và "1,5 triệu"', () => {
    expect(docTien('1tr2')).toBe(1_200_000);
    expect(docTien('1,5 triệu')).toBe(1_500_000);
  });
  it('chữ không phải số thì NaN', () => {
    expect(docTien('abc')).toBeNaN();
  });
});
