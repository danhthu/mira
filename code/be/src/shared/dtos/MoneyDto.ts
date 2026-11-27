/**
 * Hai ô mức của một tháng. `undefined` giữ nguyên ô đang có, `null` tường minh xoá giá
 * trị về trạng thái chưa nhập (dấu hỏi xám trên giao diện).
 *
 * Năm ô dòng chảy không có mặt ở đây: ghi chúng là tạo một `money_entry`.
 */
export interface UpsertMoneyDto {
  debtBalance?: number | null;
  netWorth?: number | null;
}
