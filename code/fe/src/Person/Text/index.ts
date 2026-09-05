/**
 * Toàn bộ chuỗi của module Người. Giọng theo `docs/00-vision.md` §"Giọng của sản
 * phẩm": sentence case, không "nên/phải/hãy", không dấu chấm than, không câu nào
 * nói người dùng làm chưa đủ.
 */

const personText = {
  title: 'Người quan trọng',
  done: 'xong',

  roleChild: 'con',
  roleParent: 'bố mẹ',
  rolePartner: 'bạn đời',
  roleFriend: 'bạn thân',
  roleSelf: 'bản thân',
  roleOther: 'người khác',

  /** Dùng cho mọi ô chưa có dữ liệu — không bao giờ hiện số 0. */
  missingValue: '—',
  hourUnit: 'h',
  minuteUnit: 'phút',

  weekLabel: 'tuần này',
  hoursEmpty: 'chưa ghi giờ nào tuần này',
  hoursEmptyPath: 'màn hôm nay có nút bắt đầu đếm',
  learningPrefix: 'đang tính · có',
  learningSeparator: '/',
  learningSuffix: 'ngày',

  lastMetToday: 'ở cùng hôm nay',
  lastMetYesterday: 'ở cùng hôm qua',
  lastMetDaysPrefix: 'ở cùng',
  lastMetDaysSuffix: 'ngày trước',
  lastMetNever: 'chưa có lần nào được ghi',

  cadencePrefix: 'muốn gặp',
  cadenceDaily: 'hằng ngày',
  cadenceTimesSuffix: 'lần một tháng',

  listEmpty: 'chưa có ai trong danh sách',
  listEmptyPath: 'chạm thêm người là bắt đầu',

  add: 'thêm người',
  edit: 'sửa',
  namePlaceholder: 'tên',
  nameLabel: 'tên',
  roleLabel: 'vai',
  cadenceLabel: 'muốn gặp bao nhiêu lần một tháng',
  save: 'lưu',
  cancel: 'bỏ',
  remove: 'xoá khỏi danh sách',
  removeConfirm: 'xoá',
  removeQuestionPrefix: 'xoá',
  removeQuestionSuffix: 'khỏi danh sách',
  removeNote: 'giờ đã ghi vẫn giữ nguyên',
} as const;

export type PersonText = typeof personText;

export const useText = (): PersonText => personText;
