/**
 * Năm ô nhập của một tháng. Mọi số là VND nguyên.
 *
 * `netWorth` đã trừ nợ rồi; `debtBalance` chỉ để quy dư nợ ra số tháng tự do bị
 * giữ lại — không bao giờ trừ hai lần. Mọi ô được phép null: ô chưa nhập hiện dấu
 * hỏi xám trên giao diện, app không đoán hộ.
 */
export interface Money {
  readonly id: string;
  readonly month: string;
  readonly netIncome: number | null;
  readonly monthlyExpense: number | null;
  readonly debtPayment: number | null;
  readonly debtBalance: number | null;
  readonly netWorth: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
