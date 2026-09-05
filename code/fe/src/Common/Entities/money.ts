import { base } from './base';

/**
 * Bảng `money` theo `02-data-model.md`, một bản ghi mỗi tháng. Mọi số là VND nguyên.
 *
 * `savings` không có trong bốn cột của `02-data-model.md` nhưng là ô nhập số 4 của
 * `08-three-pillars.md` §"Chỉ 5 ô nhập" — thiếu nó thì không tính được bốc hơi,
 * phát hiện chính của cả trụ Tài chính. Lệch spec, đã ghi trong `src/Core/HANDOFF.md`.
 */
export class Money extends base {
  /** `YYYY-MM`. */
  public month: string;
  /** Ô 1 — thu nhập ròng sau thuế và bảo hiểm. */
  public netIncome: number;
  /** Ô 2 — chi phí cố định mỗi tháng. */
  public monthlyExpense: number;
  /** Ô 5 — tài sản thanh khoản trừ dư nợ. Âm được: đang nợ nhiều hơn có. */
  public netWorth: number;
  /** Ô 3 — tiền trả nợ mỗi tháng (gốc + lãi), không phải dư nợ còn lại. */
  public debt: number;
  /** Ô 4 — tiết kiệm + đầu tư mỗi tháng. */
  public savings: number;
}
