import { describe, it, expect } from 'vitest';
import {
  buildWorkPeriods,
  currentMonth,
  liquidNetWorth,
  monthOf,
  monthlySaving,
} from '../lib/deriveMoney';
import type { MonthlyMoneyRow, WeeklyWorkRow } from '../lib/deriveMoney';
import { calculateLifeRate } from '../../../core/lifeRate';

const august: MonthlyMoneyRow = {
  month: '2026-08',
  netIncome: 30_000_000,
  monthlyExpense: 15_000_000,
  netWorth: 60_000_000,
  debt: 10_000_000,
};

describe('monthOf', () => {
  it('cắt ngày thành tháng', () => {
    expect(monthOf('2026-08-17')).toBe('2026-08');
  });
});

describe('currentMonth', () => {
  it('đệm số 0 cho tháng một chữ số', () => {
    expect(currentMonth(new Date(2026, 0, 5))).toBe('2026-01');
  });
});

describe('liquidNetWorth', () => {
  it('trừ nợ ngắn hạn khỏi tài sản thanh khoản', () => {
    expect(liquidNetWorth(august)).toBe(50_000_000);
  });

  it('cho ra số âm khi nợ lớn hơn tài sản', () => {
    expect(liquidNetWorth({ ...august, netWorth: 5_000_000 })).toBe(-5_000_000);
  });
});

describe('monthlySaving', () => {
  it('là thu nhập ròng trừ chi tiêu tháng', () => {
    expect(monthlySaving(august)).toBe(15_000_000);
  });
});

describe('buildWorkPeriods', () => {
  it('cộng dồn các tuần vào đúng tháng của chúng', () => {
    const loads: WeeklyWorkRow[] = [
      {
        weekStart: '2026-08-03',
        workMinutes: 2_400,
        commuteMinutes: 300,
        prepMinutes: 100,
        recoveryMinutes: 200,
      },
      {
        weekStart: '2026-08-10',
        workMinutes: 2_400,
        commuteMinutes: 300,
        prepMinutes: 100,
        recoveryMinutes: 200,
      },
      {
        weekStart: '2026-07-27',
        workMinutes: 9_999,
        commuteMinutes: 0,
        prepMinutes: 0,
        recoveryMinutes: 0,
      },
    ];

    const periods = buildWorkPeriods([august], loads);

    expect(periods).toEqual([
      {
        month: '2026-08',
        netIncome: 30_000_000,
        workMinutes: 4_800,
        commuteMinutes: 600,
        prepMinutes: 200,
        recoveryMinutes: 400,
      },
    ]);
  });

  it('trả về 0 phút cho tháng chưa có dòng tải công việc nào', () => {
    const periods = buildWorkPeriods([august], []);
    expect(periods[0]?.workMinutes).toBe(0);
    expect(calculateLifeRate(periods)).toEqual({ status: 'no_work_hours' });
  });

  it('ghép được với calculateLifeRate ra tỷ giá theo tổng giờ thật của tháng', () => {
    const loads: WeeklyWorkRow[] = [
      {
        weekStart: '2026-08-03',
        workMinutes: 12_000,
        commuteMinutes: 0,
        prepMinutes: 0,
        recoveryMinutes: 0,
      },
    ];

    const result = calculateLifeRate(buildWorkPeriods([august], loads));

    expect(result).toEqual({
      status: 'ok',
      ratePerHour: 150_000,
      realWorkHoursPerMonth: 200,
      monthsUsed: 1,
    });
  });

  it('không có tháng nào thì không có kỳ nào', () => {
    expect(buildWorkPeriods([], [])).toEqual([]);
  });
});
