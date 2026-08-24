import { describe, it, expect } from 'vitest';
import { calculateLifeRate, type WorkPeriodInput } from '../lifeRate';

function makePeriod(month: string, netIncome: number, workMinutes: number): WorkPeriodInput {
  return { month, netIncome, workMinutes, commuteMinutes: 0, prepMinutes: 0, recoveryMinutes: 0 };
}

function makePeriodFull(month: string, overrides: Partial<WorkPeriodInput> = {}): WorkPeriodInput {
  return {
    month,
    netIncome: 30_000_000,
    workMinutes: 12_000,
    commuteMinutes: 0,
    prepMinutes: 0,
    recoveryMinutes: 0,
    ...overrides,
  };
}

describe('calculateLifeRate', () => {
  it('returns no_data when periods array is empty', () => {
    expect(calculateLifeRate([])).toEqual({ status: 'no_data' });
  });

  it('returns no_work_hours when all minute fields are zero', () => {
    const periods: WorkPeriodInput[] = [
      { month: '2024-01', netIncome: 30_000_000, workMinutes: 0, commuteMinutes: 0, prepMinutes: 0, recoveryMinutes: 0 },
    ];
    expect(calculateLifeRate(periods)).toEqual({ status: 'no_work_hours' });
  });

  it('calculates correctly for a single month', () => {
    // 12000 min = 200 h, income 30M → rate = 30M/200 = 150,000
    const result = calculateLifeRate([makePeriod('2024-01', 30_000_000, 12_000)]);
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.ratePerHour).toBeCloseTo(150_000);
      expect(result.realWorkHoursPerMonth).toBeCloseTo(200);
      expect(result.monthsUsed).toBe(1);
    }
  });

  it('averages across 3 months with equal data', () => {
    const periods = ['2024-01', '2024-02', '2024-03'].map(m =>
      makePeriod(m, 30_000_000, 12_000),
    );
    const result = calculateLifeRate(periods);
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.ratePerHour).toBeCloseTo(150_000);
      expect(result.realWorkHoursPerMonth).toBeCloseTo(200);
      expect(result.monthsUsed).toBe(3);
    }
  });

  it('uses only the 3 most recent months when more are available', () => {
    const periods = [
      makePeriod('2023-12', 60_000_000, 24_000), // older — should be ignored
      makePeriod('2024-01', 30_000_000, 12_000),
      makePeriod('2024-02', 30_000_000, 12_000),
      makePeriod('2024-03', 30_000_000, 12_000),
    ];
    const result = calculateLifeRate(periods);
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.monthsUsed).toBe(3);
      // Only 2024-01/02/03 used → rate = 30M/200 = 150,000
      expect(result.ratePerHour).toBeCloseTo(150_000);
    }
  });

  it('uses all available months when fewer than 3 are provided', () => {
    const periods = [makePeriod('2024-01', 30_000_000, 12_000)];
    const result = calculateLifeRate(periods);
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.monthsUsed).toBe(1);
    }
  });

  it('sums all four minute fields into real work hours', () => {
    const period: WorkPeriodInput = {
      month: '2024-01',
      netIncome: 30_000_000,
      workMinutes: 9_000,
      commuteMinutes: 1_000,
      prepMinutes: 500,
      recoveryMinutes: 500,
    };
    // total = 11000 min = 183.333 h
    const result = calculateLifeRate([period]);
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.realWorkHoursPerMonth).toBeCloseTo(11_000 / 60);
      expect(result.ratePerHour).toBeCloseTo(30_000_000 / (11_000 / 60));
    }
  });

  it('handles variable income across months correctly', () => {
    // Month A: 20M income, 10000 min. Month B: 40M income, 10000 min.
    // Total: 60M / (20000/60 h) = 60M / 333.33h = 180,000 rate
    const periods = [
      makePeriod('2024-01', 20_000_000, 10_000),
      makePeriod('2024-02', 40_000_000, 10_000),
    ];
    const result = calculateLifeRate(periods);
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.ratePerHour).toBeCloseTo(60_000_000 / (20_000 / 60));
      expect(result.realWorkHoursPerMonth).toBeCloseTo(10_000 / 60);
      expect(result.monthsUsed).toBe(2);
    }
  });

  it('sorts by month desc before slicing (handles unsorted input)', () => {
    // 2024-03 is most recent — ensure it and 2024-01/02 are used, not 2023-12
    const periods = [
      makePeriod('2023-12', 999_000_000, 60_000), // very different numbers
      makePeriod('2024-01', 30_000_000, 12_000),
      makePeriod('2024-03', 30_000_000, 12_000),
      makePeriod('2024-02', 30_000_000, 12_000),
    ];
    const result = calculateLifeRate(periods);
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.monthsUsed).toBe(3);
      expect(result.ratePerHour).toBeCloseTo(150_000);
    }
  });
});
