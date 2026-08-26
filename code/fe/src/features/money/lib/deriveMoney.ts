import type { WorkPeriodInput } from '@/core/lifeRate';

export interface MonthlyMoneyRow {
  month: string; // YYYY-MM
  netIncome: number;
  monthlyExpense: number;
  netWorth: number;
  debt: number;
}

export interface WeeklyWorkRow {
  weekStart: string; // YYYY-MM-DD
  workMinutes: number;
  commuteMinutes: number;
  prepMinutes: number;
  recoveryMinutes: number;
}

export function monthOf(dateString: string): string {
  return dateString.slice(0, 7);
}

export function currentMonth(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Q-010: `docs/03-formulas.md` viết `lifeRate = netIncome / (realWorkHours × 52 / 12)`,
 * ngụ ý các trường phút là số của MỘT tuần. `core/lifeRate.ts` lại nhận tổng phút
 * của cả tháng (test hiện có chốt cách hiểu này). Chọn cách hiểu của core: cộng dồn
 * các dòng `work_load` theo tuần thành tổng tháng thật trước khi gọi hàm, nên không
 * nhân thêm 52/12. Dùng số thật thay vì ngoại suy từ một tuần đại diện.
 */
export function buildWorkPeriods(
  months: MonthlyMoneyRow[],
  loads: WeeklyWorkRow[],
): WorkPeriodInput[] {
  const minutesByMonth = new Map<string, WeeklyWorkRow>();

  for (const load of loads) {
    const key = monthOf(load.weekStart);
    const acc = minutesByMonth.get(key) ?? {
      weekStart: key,
      workMinutes: 0,
      commuteMinutes: 0,
      prepMinutes: 0,
      recoveryMinutes: 0,
    };
    minutesByMonth.set(key, {
      weekStart: key,
      workMinutes: acc.workMinutes + load.workMinutes,
      commuteMinutes: acc.commuteMinutes + load.commuteMinutes,
      prepMinutes: acc.prepMinutes + load.prepMinutes,
      recoveryMinutes: acc.recoveryMinutes + load.recoveryMinutes,
    });
  }

  return months.map((m) => {
    const load = minutesByMonth.get(m.month);
    return {
      month: m.month,
      netIncome: m.netIncome,
      workMinutes: load?.workMinutes ?? 0,
      commuteMinutes: load?.commuteMinutes ?? 0,
      prepMinutes: load?.prepMinutes ?? 0,
      recoveryMinutes: load?.recoveryMinutes ?? 0,
    };
  });
}

/**
 * `netWorth` trong bảng là tài sản thanh khoản; `debt` là nợ ngắn hạn nằm ở cột
 * riêng. Công thức Vốn tự do cần hiệu của hai cột (03-formulas.md mục 3).
 */
export function liquidNetWorth(row: MonthlyMoneyRow): number {
  return row.netWorth - row.debt;
}

export function monthlySaving(row: MonthlyMoneyRow): number {
  return row.netIncome - row.monthlyExpense;
}
