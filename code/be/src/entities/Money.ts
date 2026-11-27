/**
 * Hai ô MỨC của một tháng. Mọi số là VND nguyên.
 *
 * Năm ô **dòng chảy** — thu nhập, chi tiêu, đầu tư, lãng phí, trả nợ — KHÔNG còn ở đây
 * từ migration 013. Chúng là tổng các `money_entry` của tháng, và giữ thêm một bản sao
 * trong bảng này là dựng lại đúng cái bẫy "một sự thật, hai chỗ ghi" đã cắn kho mã này
 * ba lần.
 *
 * Hai ô còn lại là **ảnh chụp tại một thời điểm**, không phải tổng: "tôi đang nợ 240
 * triệu" không cộng dồn được. `netWorth` đã trừ nợ rồi; `debtBalance` chỉ để quy dư nợ
 * ra số tháng tự do bị giữ lại — không bao giờ trừ hai lần.
 */
export interface Money {
  readonly id: string;
  readonly month: string;
  readonly debtBalance: number | null;
  readonly netWorth: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
