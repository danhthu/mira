import { MINUTES_IN_HOUR, PREFERRED_MONTHS_FOR_LIFE_RATE } from './constants';

export interface WorkPeriodInput {
  month: string;           // YYYY-MM
  netIncome: number;       // integer VND
  workMinutes: number;     // integer minutes (monthly total)
  commuteMinutes: number;
  prepMinutes: number;
  recoveryMinutes: number;
}

export type LifeRateResult =
  | { status: 'ok'; ratePerHour: number; realWorkHoursPerMonth: number; monthsUsed: number }
  | { status: 'no_work_hours' }
  | { status: 'no_data' };

export function calculateLifeRate(periods: WorkPeriodInput[]): LifeRateResult {
  if (periods.length === 0) {
    return { status: 'no_data' };
  }

  const sorted = [...periods].sort((a, b) => b.month.localeCompare(a.month));
  const recent = sorted.slice(0, PREFERRED_MONTHS_FOR_LIFE_RATE);
  const numMonths = recent.length;

  const totalIncome = recent.reduce((sum, p) => sum + p.netIncome, 0);
  const totalMinutes = recent.reduce(
    (sum, p) => sum + p.workMinutes + p.commuteMinutes + p.prepMinutes + p.recoveryMinutes,
    0,
  );

  const totalRealWorkHours = totalMinutes / MINUTES_IN_HOUR;

  if (totalRealWorkHours === 0) {
    return { status: 'no_work_hours' };
  }

  const realWorkHoursPerMonth = totalRealWorkHours / numMonths;
  const ratePerHour = totalIncome / totalRealWorkHours;

  return { status: 'ok', ratePerHour, realWorkHoursPerMonth, monthsUsed: numMonths };
}
