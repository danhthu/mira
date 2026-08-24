import { describe, it, expect } from 'vitest';
import { convertExpense } from '../expenseConversion';

describe('convertExpense', () => {
  it('returns 0 for both when amount is 0, regardless of other inputs', () => {
    expect(convertExpense({ amount: 0, lifeRate: null, monthlyExpense: 0 })).toEqual({
      hoursCost: 0,
      freedomDaysCost: 0,
    });
  });

  it('returns 0 for both when amount is 0 even with valid lifeRate and expense', () => {
    expect(convertExpense({ amount: 0, lifeRate: 150_000, monthlyExpense: 10_000_000 })).toEqual({
      hoursCost: 0,
      freedomDaysCost: 0,
    });
  });

  it('returns null hoursCost when lifeRate is null', () => {
    const result = convertExpense({ amount: 100_000, lifeRate: null, monthlyExpense: 5_000_000 });
    expect(result.hoursCost).toBeNull();
    expect(result.freedomDaysCost).toBeCloseTo((100_000 / 5_000_000) * 30);
  });

  it('returns null hoursCost when lifeRate is 0', () => {
    const result = convertExpense({ amount: 100_000, lifeRate: 0, monthlyExpense: 5_000_000 });
    expect(result.hoursCost).toBeNull();
  });

  it('returns null freedomDaysCost when monthlyExpense is 0', () => {
    const result = convertExpense({ amount: 100_000, lifeRate: 150_000, monthlyExpense: 0 });
    expect(result.freedomDaysCost).toBeNull();
    expect(result.hoursCost).toBeCloseTo(100_000 / 150_000);
  });

  it('returns both null when lifeRate is null and monthlyExpense is 0 (and amount > 0)', () => {
    const result = convertExpense({ amount: 100_000, lifeRate: null, monthlyExpense: 0 });
    expect(result).toEqual({ hoursCost: null, freedomDaysCost: null });
  });

  it('correctly calculates hoursCost', () => {
    // iPhone 25M, lifeRate = 115,000 → hours = 25M/115k ≈ 217.39
    const result = convertExpense({
      amount: 25_000_000,
      lifeRate: 115_000,
      monthlyExpense: 15_000_000,
    });
    expect(result.hoursCost).toBeCloseTo(25_000_000 / 115_000);
  });

  it('correctly calculates freedomDaysCost', () => {
    // 25M / 15M × 30 = 50 days
    const result = convertExpense({
      amount: 25_000_000,
      lifeRate: 115_000,
      monthlyExpense: 15_000_000,
    });
    expect(result.freedomDaysCost).toBeCloseTo(50);
  });

  it('calculates both correctly with round numbers', () => {
    // amount = 1M, lifeRate = 100,000, expense = 10M
    // hoursCost = 1M/100k = 10 hours
    // freedomDaysCost = 1M/10M × 30 = 3 days
    const result = convertExpense({
      amount: 1_000_000,
      lifeRate: 100_000,
      monthlyExpense: 10_000_000,
    });
    expect(result.hoursCost).toBeCloseTo(10);
    expect(result.freedomDaysCost).toBeCloseTo(3);
  });

  it('handles large VND amounts without overflow', () => {
    // 10B VND car, lifeRate = 150,000 → ~66,667 hours
    const result = convertExpense({
      amount: 10_000_000_000,
      lifeRate: 150_000,
      monthlyExpense: 20_000_000,
    });
    expect(result.hoursCost).toBeCloseTo(10_000_000_000 / 150_000);
    expect(result.freedomDaysCost).toBeCloseTo((10_000_000_000 / 20_000_000) * 30);
  });
});
