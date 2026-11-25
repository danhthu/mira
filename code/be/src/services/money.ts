import type { MoneyDerived } from '@mira/contract';
import type { Money } from '../entities/Money';
import { badRequest } from '../shared/errors';

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function assertMonth(value: string): string {
  if (!MONTH_RE.test(value)) {
    throw badRequest('month phải có dạng YYYY-MM');
  }
  return value;
}

/**
 * Số suy ra từ năm ô. Thiếu ô nào thì số phụ thuộc ô đó là null — app không đoán hộ,
 * giao diện hiện dấu hỏi xám.
 *
 * `netWorth` đã trừ nợ rồi, nên `monthsHeldByDebt` chỉ là một cách đọc khác của dư nợ,
 * không phải một khoản trừ thứ hai vào vốn tự do.
 */
export function derive(money: Money | null): MoneyDerived {
  if (money === null) {
    return { freeCapitalMonths: null, surplusPerMille: null, monthsHeldByDebt: null };
  }

  const { netIncome, monthlyExpense, debtPayment, debtBalance, netWorth } = money;
  const spends = monthlyExpense !== null && monthlyExpense > 0;

  return {
    freeCapitalMonths: spends && netWorth !== null ? netWorth / monthlyExpense : null,

    // Mức dư: phần thu nhập còn lại sau chi tiêu và trả nợ. Tháng âm vẫn trả về số
    // âm — hiện màu xám chứ không bôi đỏ, theo ràng buộc cứng.
    surplusPerMille:
      netIncome !== null && netIncome > 0 && monthlyExpense !== null
        ? Math.round(((netIncome - monthlyExpense - (debtPayment ?? 0)) * 1000) / netIncome)
        : null,

    monthsHeldByDebt: spends && debtBalance !== null ? debtBalance / monthlyExpense : null,
  };
}
