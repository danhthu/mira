/**
 * Vốn tự do không được ra một con số vô lý vào ngày đầu.
 *
 * Bắt được ngày 26/11/2026 khi chạy thử tám câu làm quen: tài sản ròng 300 triệu, một bữa
 * trưa 60 nghìn, màn chủ hiện "5000,0 tháng tự do".
 */
import { describe, it, expect } from 'vitest';
import type { MoneyMonth } from '@mira/contract';
import { derive, isThinExpense, MAX_PLAUSIBLE_MONTHS, MIN_EXPENSE_DAYS } from '../money';

const thang = (netWorth: number | null, monthlyExpense: number | null) =>
  ({
    month: '2026-11',
    netIncome: null,
    monthlyExpense,
    investment: null,
    wastedMoney: null,
    debtPayment: null,
    debtBalance: null,
    netWorth,
    updatedAt: null,
  }) as unknown as MoneyMonth;

describe('derive — vốn tự do', () => {
  it('chia bình thường khi đủ chi tiêu', () => {
    expect(derive(thang(120_000_000, 8_000_000)).freeCapitalMonths).toBe(15);
  });

  it('một bữa trưa chưa đủ để chia: trả null thay vì 5000 tháng', () => {
    expect(derive(thang(300_000_000, 60_000)).freeCapitalMonths).toBeNull();
  });

  it('đúng ngưỡng một trăm năm thì vẫn hiện', () => {
    expect(derive(thang(MAX_PLAUSIBLE_MONTHS * 1_000_000, 1_000_000)).freeCapitalMonths).toBe(
      MAX_PLAUSIBLE_MONTHS,
    );
  });

  it('chưa có chi tiêu thì null như cũ', () => {
    expect(derive(thang(300_000_000, null)).freeCapitalMonths).toBeNull();
  });
});

describe('tháng đang dở: chi tiêu mỏng thì chưa chia', () => {
  const m = (thu: number | null, chi: number | null) => ({
    ...thang(50_000_000, chi),
    netIncome: thu,
  });

  it('ngày đầu, một bữa sáng 30k: mỏng', () => {
    expect(isThinExpense(m(8_000_000, 30_000), { isCurrentMonth: true, expenseDays: 1 })).toBe(
      true,
    );
  });

  it('một khoản "chi tiêu tháng 15 triệu" trên lương 18 triệu: KHÔNG mỏng', () => {
    expect(isThinExpense(m(18_000_000, 15_000_000), { isCurrentMonth: true, expenseDays: 1 })).toBe(
      false,
    );
  });

  it('đã ghi đủ ngày thì không mỏng dù chi ít', () => {
    expect(
      isThinExpense(m(8_000_000, 300_000), { isCurrentMonth: true, expenseDays: MIN_EXPENSE_DAYS }),
    ).toBe(false);
  });

  it('tháng đã qua thì con số là con số cuối', () => {
    expect(isThinExpense(m(8_000_000, 30_000), { isCurrentMonth: false, expenseDays: 1 })).toBe(
      false,
    );
  });

  it('mỏng thì ba số đều null và có cờ', () => {
    expect(derive(m(8_000_000, 30_000), true)).toEqual({
      freeCapitalMonths: null,
      surplusPerMille: null,
      monthsHeldByDebt: null,
      thinExpense: true,
    });
  });

  it('nợ 240 triệu chia một bữa 30k không ra "8000 tháng"', () => {
    const co = { ...thang(50_000_000, 30_000), debtBalance: 240_000_000 };
    expect(derive(co).monthsHeldByDebt).toBeNull();
  });
});
