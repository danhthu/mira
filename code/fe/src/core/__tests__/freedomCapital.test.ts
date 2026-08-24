import { describe, it, expect } from 'vitest';
import { calculateFreedomCapital, formatFreedomMonths } from '../freedomCapital';

describe('formatFreedomMonths', () => {
  it('returns days for values less than 1 month', () => {
    expect(formatFreedomMonths(0.5)).toEqual({ unit: 'days', value: 15 });
    expect(formatFreedomMonths(0)).toEqual({ unit: 'days', value: 0 });
    expect(formatFreedomMonths(0.9999)).toEqual({ unit: 'days', value: 29 });
  });

  it('returns months for values between 1 and 24', () => {
    expect(formatFreedomMonths(1)).toEqual({ unit: 'months', value: 1 });
    expect(formatFreedomMonths(12)).toEqual({ unit: 'months', value: 12 });
    expect(formatFreedomMonths(24)).toEqual({ unit: 'months', value: 24 });
    expect(formatFreedomMonths(6.7)).toEqual({ unit: 'months', value: 7 });
  });

  it('returns years (1 decimal) for values above 24 months', () => {
    expect(formatFreedomMonths(36)).toEqual({ unit: 'years', value: 3.0 });
    expect(formatFreedomMonths(100)).toEqual({ unit: 'years', value: 8.3 });
  });
});

describe('calculateFreedomCapital', () => {
  it('returns no_expense_data when monthlyExpense is 0', () => {
    expect(calculateFreedomCapital({ netWorth: 100_000_000, monthlyExpense: 0 })).toEqual({
      status: 'no_expense_data',
    });
  });

  it('returns in_debt when netWorth is negative', () => {
    const result = calculateFreedomCapital({
      netWorth: -5_000_000,
      monthlyExpense: 10_000_000,
      monthlySaving: 1_000_000,
    });
    expect(result.status).toBe('in_debt');
    if (result.status === 'in_debt') {
      expect(result.distanceMonths).toBeCloseTo(5);
    }
  });

  it('sets distanceMonths to null when in_debt and monthlySaving is 0', () => {
    const result = calculateFreedomCapital({
      netWorth: -5_000_000,
      monthlyExpense: 10_000_000,
      monthlySaving: 0,
    });
    expect(result).toEqual({ status: 'in_debt', distanceMonths: null });
  });

  it('sets distanceMonths to null when in_debt and monthlySaving is negative', () => {
    const result = calculateFreedomCapital({
      netWorth: -5_000_000,
      monthlyExpense: 10_000_000,
      monthlySaving: -500_000,
    });
    expect(result).toEqual({ status: 'in_debt', distanceMonths: null });
  });

  it('sets distanceMonths to null when in_debt and monthlySaving is not provided', () => {
    const result = calculateFreedomCapital({
      netWorth: -5_000_000,
      monthlyExpense: 10_000_000,
    });
    expect(result).toEqual({ status: 'in_debt', distanceMonths: null });
  });

  it('returns ok with 0 freedom months when netWorth is 0', () => {
    const result = calculateFreedomCapital({ netWorth: 0, monthlyExpense: 10_000_000 });
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.freedomMonths).toBe(0);
      expect(result.display).toEqual({ unit: 'days', value: 0 });
      expect(result.freedomDaysGained).toBeNull();
    }
  });

  it('calculates freedomMonths correctly', () => {
    const result = calculateFreedomCapital({
      netWorth: 120_000_000,
      monthlyExpense: 10_000_000,
    });
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.freedomMonths).toBeCloseTo(12);
      expect(result.display).toEqual({ unit: 'months', value: 12 });
    }
  });

  it('calculates freedomDaysGained when monthlySaving is positive', () => {
    // saving 1M / expense 10M × 30 days = 3 days gained
    const result = calculateFreedomCapital({
      netWorth: 120_000_000,
      monthlyExpense: 10_000_000,
      monthlySaving: 1_000_000,
    });
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.freedomDaysGained).toBeCloseTo(3);
    }
  });

  it('sets freedomDaysGained to null when monthlySaving is not provided', () => {
    const result = calculateFreedomCapital({ netWorth: 100_000_000, monthlyExpense: 10_000_000 });
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.freedomDaysGained).toBeNull();
    }
  });

  it('sets freedomDaysGained to null when monthlySaving is 0', () => {
    const result = calculateFreedomCapital({
      netWorth: 100_000_000,
      monthlyExpense: 10_000_000,
      monthlySaving: 0,
    });
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.freedomDaysGained).toBeNull();
    }
  });

  it('sets freedomDaysGained to null when monthlySaving is negative', () => {
    const result = calculateFreedomCapital({
      netWorth: 100_000_000,
      monthlyExpense: 10_000_000,
      monthlySaving: -500_000,
    });
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.freedomDaysGained).toBeNull();
    }
  });

  it('displays in days when freedomMonths is less than 1', () => {
    // netWorth = 5M, expense = 10M → freedomMonths = 0.5 → 15 days
    const result = calculateFreedomCapital({ netWorth: 5_000_000, monthlyExpense: 10_000_000 });
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.display).toEqual({ unit: 'days', value: 15 });
    }
  });

  it('displays in years when freedomMonths exceeds 24', () => {
    // netWorth = 300M, expense = 10M → freedomMonths = 30 → 2.5 years
    const result = calculateFreedomCapital({ netWorth: 300_000_000, monthlyExpense: 10_000_000 });
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.display).toEqual({ unit: 'years', value: 2.5 });
    }
  });
});
