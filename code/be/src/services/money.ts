import type { MoneyDerived, MoneyMonth } from '@mira/contract';
import type { MoneyRepository } from '../database/repositories/MoneyRepository';
import type { MoneyEntryRepository } from '../database/repositories/MoneyEntryRepository';
import { badRequest } from '../shared/errors';

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function assertMonth(value: string): string {
  if (!MONTH_RE.test(value)) {
    throw badRequest('month phải có dạng YYYY-MM');
  }
  return value;
}

export interface MoneyDeps {
  readonly money: MoneyRepository;
  readonly moneyEntries: MoneyEntryRepository;
}

/**
 * Dựng bảy ô của một tháng.
 *
 * NĂM Ô DÒNG CHẢY LÀ TỔNG CÁC KHOẢN, không còn cột nào giữ chúng (migration 013). Hai ô
 * mức vẫn đọc từ bảng `money`.
 *
 * Ô dòng chảy không có khoản nào thì là **null**, không phải 0. Hai thứ đó khác nhau:
 * chưa nhập thì mọi con số suy ra từ nó là dấu hỏi xám, còn 0 là một lời khẳng định
 * ("tháng này tôi không tiêu đồng nào"). Ghi 0 thay người dùng là app tự bịa một câu.
 */
/** Tháng cùng các số suy ra, đã xét chuyện tháng đang dở. Hai route tiền dùng chung. */
export async function buildMonthWithDerived(
  deps: MoneyDeps,
  userId: string,
  month: string,
  /** Tháng hiện tại theo giờ Việt Nam, 'YYYY-MM'. Truyền vào để kiểm được. */
  currentMonth: string = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 7),
): Promise<{ month: MoneyMonth; derived: MoneyDerived }> {
  const m = await buildMonth(deps, userId, month);
  const isCurrentMonth = month === currentMonth;
  let expenseDays = MIN_EXPENSE_DAYS;
  if (isCurrentMonth) {
    const ds = await deps.moneyEntries.findByDateRange(userId, `${month}-01`, `${month}-31`);
    expenseDays = new Set(ds.filter((e) => e.cell === 'monthlyExpense').map((e) => e.date)).size;
  }
  return { month: m, derived: derive(m, isThinExpense(m, { isCurrentMonth, expenseDays })) };
}

export async function buildMonth(
  deps: MoneyDeps,
  userId: string,
  month: string,
): Promise<MoneyMonth> {
  const [row, sums, lastEntry] = await Promise.all([
    deps.money.findByMonth(userId, month),
    deps.moneyEntries.sumByCell(userId, month),
    deps.moneyEntries.lastTouched(userId, month),
  ]);

  const tong = new Map(sums.map((s) => [s.cell, s.amount]));
  const lay = (cell: string): number | null => tong.get(cell as never) ?? null;

  // "Đã nhập · 25/11" lấy mốc MUỘN HƠN trong hai nguồn: sửa một khoản cũng là nhập, và
  // chỉ nhìn bảng `money` thì mốc đứng im mãi ở lần cuối gõ dư nợ.
  const moc =
    row === null
      ? lastEntry
      : lastEntry === null
        ? row.updatedAt
        : maxIso(row.updatedAt, lastEntry);

  return {
    month,
    netIncome: lay('netIncome'),
    monthlyExpense: lay('monthlyExpense'),
    investment: lay('investment'),
    wastedMoney: lay('wastedMoney'),
    debtPayment: lay('debtPayment'),
    debtBalance: row?.debtBalance ?? null,
    netWorth: row?.netWorth ?? null,
    updatedAt: moc,
  };
}

const maxIso = (a: string, b: string): string => (a >= b ? a : b);

/**
 * Số suy ra từ bảy ô. Thiếu ô nào thì số phụ thuộc ô đó là null — app không đoán hộ,
 * giao diện hiện dấu hỏi xám.
 *
 * `netWorth` đã trừ nợ rồi, nên `monthsHeldByDebt` chỉ là một cách đọc khác của dư nợ,
 * không phải một khoản trừ thứ hai vào vốn tự do.
 *
 * ──────────────── VÌ SAO MỨC DƯ TRỪ LÃNG PHÍ MÀ KHÔNG TRỪ ĐẦU TƯ ────────────────
 *
 * Mức dư trả lời "tháng này thu nhập có bị tiêu hết không". Lãng phí là tiền mất, nên
 * nó phải trừ. Đầu tư thì rời tay mà không rời người — nó chuyển sang `netWorth`. Trừ
 * đầu tư ở đây sẽ làm mức dư TỤT mỗi lần người dùng gửi tiết kiệm, tức là app khen
 * người tiêu hết và phạt người để dành. Đúng ngược.
 */
/**
 * Số tháng vượt ngưỡng này là dấu hiệu CHƯA ĐỦ CHI TIÊU ĐỂ CHIA, không phải người giàu.
 *
 * Ngày đầu, người mới khai tài sản ròng 300 triệu rồi ghi một bữa trưa 60 nghìn. Phép
 * chia đúng về số học và ra "5000 tháng tự do" — bốn trăm năm, hiện ngay trên đầu màn
 * chủ. Một con số như thế làm người ta thôi tin mọi con số khác.
 *
 * 1200 tháng là một trăm năm. Quá mức đó thì trả null, và giao diện hiện "?" như mọi chỗ
 * chưa đủ dữ liệu khác.
 *
 * ĐÂY LÀ CHẶN CÁI VÔ LÝ, CHƯA PHẢI SỬA GỐC. Gốc là chi tiêu của một tháng ĐANG DỞ luôn
 * nhỏ hơn cả tháng, nên con số này phồng lên suốt nửa đầu mỗi tháng.
 */
export const MAX_PLAUSIBLE_MONTHS = 1200;

const plausibleMonths = (n: number | null): number | null =>
  n !== null && n > MAX_PLAUSIBLE_MONTHS ? null : n;

/**
 * SỬA GỐC của "5000 tháng tự do" (26/11/2026).
 *
 * Chi tiêu của một tháng đang dở luôn nhỏ hơn cả tháng. Ngày đầu, người mới khai 50 triệu
 * tài sản, 240 triệu nợ và một bữa sáng 30 nghìn: vốn tự do ra 1.667 tháng, nợ "giữ lại
 * 8000 tháng", mức dư 99,6%. Ba con số sai cùng một gốc.
 *
 * Chi tiêu bị coi là MỎNG khi đủ cả ba:
 *   • đang là tháng hiện tại (tháng đã qua thì con số là con số cuối),
 *   • mới ghi chi tiêu trên dưới MIN_EXPENSE_DAYS ngày khác nhau,
 *   • và tổng chi còn dưới 30% thu nhập (hoặc chưa khai thu nhập).
 *
 * Điều thứ ba để dành cho người gõ MỘT khoản "chi tiêu tháng 15 triệu": một ngày ghi,
 * nhưng đó là con số cả tháng, không được nghi oan.
 */
export const MIN_EXPENSE_DAYS = 5;

export function isThinExpense(
  m: MoneyMonth,
  basis: { readonly isCurrentMonth: boolean; readonly expenseDays: number },
): boolean {
  if (!basis.isCurrentMonth || basis.expenseDays >= MIN_EXPENSE_DAYS) return false;
  if (m.monthlyExpense === null || m.monthlyExpense <= 0) return false;
  return m.netIncome === null || m.netIncome <= 0 || m.monthlyExpense * 10 < m.netIncome * 3;
}

export function derive(m: MoneyMonth | null, thin = false): MoneyDerived {
  if (m === null || thin) {
    return {
      freeCapitalMonths: null,
      surplusPerMille: null,
      monthsHeldByDebt: null,
      thinExpense: thin,
    };
  }

  const { netIncome, monthlyExpense, wastedMoney, debtPayment, debtBalance, netWorth } = m;
  const spends = monthlyExpense !== null && monthlyExpense > 0;

  return {
    freeCapitalMonths: plausibleMonths(
      spends && netWorth !== null ? netWorth / monthlyExpense : null,
    ),

    surplusPerMille:
      netIncome !== null && netIncome > 0 && monthlyExpense !== null
        ? Math.round(
            ((netIncome - monthlyExpense - (wastedMoney ?? 0) - (debtPayment ?? 0)) * 1000) /
              netIncome,
          )
        : null,

    monthsHeldByDebt: plausibleMonths(
      spends && debtBalance !== null ? debtBalance / monthlyExpense : null,
    ),
    thinExpense: false,
  };
}
