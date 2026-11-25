/**
 * Năm ô của một tháng. `undefined` nghĩa là giữ nguyên ô đang có, `null` tường minh
 * nghĩa là xoá giá trị về trạng thái chưa nhập (dấu hỏi xám trên giao diện).
 */
export interface UpsertMoneyDto {
  netIncome?: number | null;
  monthlyExpense?: number | null;
  debtPayment?: number | null;
  debtBalance?: number | null;
  netWorth?: number | null;
}
