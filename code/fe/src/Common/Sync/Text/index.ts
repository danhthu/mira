import moment from 'moment';

/**
 * Chuỗi hiển thị của tầng đồng bộ. Giọng trung tính: chưa đồng bộ xong là trạng
 * thái bình thường của app offline-first, không phải việc người dùng làm thiếu.
 */
export const syncText = {
  sectionTitle: 'Đồng bộ',
  toggleLabel: 'Bật đồng bộ',
  toggleHint: 'Khi tắt, dữ liệu chỉ nằm trên máy này',
  serverUrlLabel: 'Địa chỉ máy chủ',
  serverUrlPlaceholder: 'http://127.0.0.1:3000',
  statusOff: 'Đồng bộ đang tắt, dữ liệu vẫn được lưu trên máy',
  statusRunning: 'Đang đồng bộ',
  statusNever: 'Chưa đồng bộ lần nào',
  lastSyncedAt: (at: number) => 'Đồng bộ lúc ' + moment(at).format('HH:mm DD/MM'),
  pendingNone: 'Không có mục nào chờ',
  pending: (count: number) => count + ' mục đang chờ',
  separator: ' · ',
};
