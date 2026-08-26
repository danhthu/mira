/**
 * Từ vựng chung cho "chỉ số này hiện đang ở trạng thái nào".
 *
 * Vì sao cần: ba module trong core/ tự đặt tên riêng cho cùng một khái niệm —
 * goldenHours dùng `insufficient`/`empty`, lifeRate dùng `no_work_hours`/`no_data`,
 * freedomCapital dùng `no_expense_data`. Mỗi màn hình vì thế lại tự chế một kiểu
 * hiển thị, và màn Đồng hồ cát thì bỏ qua luôn: người thiếu năm sinh bị lọc khỏi
 * danh sách, người dùng thấy màn hình trống mà không biết vì sao.
 *
 * Ba trạng thái dưới đây là mức tối thiểu đủ dùng. Cố tình KHÔNG có trạng thái nào
 * đánh giá người dùng (kiểu "đang sa sút", "bỏ bê") — chúng mô tả *dữ liệu*, không
 * mô tả người. Đây là ranh giới cứng, không phải lựa chọn phong cách.
 */
export type MetricState =
  /** Chưa có bản ghi nào để tính. Mời ghi lần đầu, không hiện số 0. */
  | { kind: 'empty' }
  /** Có dữ liệu nhưng chưa đủ để con số đáng tin. Nói rõ còn thiếu gì. */
  | { kind: 'needs-more'; reason: string }
  /** Đủ để hiển thị. */
  | { kind: 'ready' };
