import { useText as useCommonText } from '../../../lang';

/**
 * Bốn file trong `Common/Components` (CustomCalendarView, DateTimeBottomModal,
 * ReminderBottomModal, RichEditorBottomModal) đọc chữ từ đây theo mẫu
 * `text.<key> || 'chữ tiếng Việt'`. Trước đợt này không key nào trong số đó tồn
 * tại, nên mọi câu đều rơi về nhánh fallback nằm rải trong JSX của `Common/`.
 * Khai đủ chúng ở đây để chữ có một chỗ ở duy nhất; `Common/` nằm ngoài phạm vi
 * sửa của đợt này nên nhánh fallback bên đó vẫn còn, chỉ là không bao giờ chạy.
 */
const dictionary = {
  // màn danh sách
  title: 'công việc',
  today: 'hôm nay',
  previousDay: 'hôm trước',
  nextDay: 'hôm sau',
  backToToday: 'về hôm nay',
  review: 'nhìn lại',
  composePlaceholder: 'việc gì cho hôm nay',
  emptyDay: 'chưa có việc nào cho ngày này',
  doneGroup: 'đã xong',
  openWorkDetail: 'mở chi tiết',
  moreOptions: 'thêm chi tiết',

  // màn thêm
  addTitle: 'thêm việc',
  name: 'tên việc',
  startDate: 'ngày làm',
  note: 'ghi chú',
  repeat: 'lặp lại',
  reminder: 'nhắc',
  save: 'lưu',
  cancel: 'huỷ',

  // màn chi tiết
  detailTitle: 'chi tiết',
  markDone: 'đánh dấu xong',
  markOpen: 'mở lại',
  moveToTomorrow: 'mai làm',
  pickDay: 'chọn ngày khác',
  edit: 'sửa',
  remove: 'xoá',
  confirmRemove: 'xoá việc này chứ',
  removed: 'đã xoá',
  moved: 'đã chuyển sang ngày khác',
  done: 'đã đánh dấu xong',
  reopened: 'đã mở lại',
  ok: 'ok',

  // màn chọn việc cho một ngày
  assignTitle: 'chọn việc cho ngày',
  assignAll: 'tất cả',
  assignUnscheduled: 'chưa có ngày',
  assignEmpty: 'không còn việc nào chưa có ngày',

  // màn nhìn lại
  reviewTitle: 'nhìn lại',
  rangeWeek: 'tuần',
  rangeMonth: 'tháng',
  rangeYear: 'năm',
  countDone: 'đã xong',
  countOpen: 'đang mở',
  countUnscheduled: 'chưa có ngày',
  reviewEmpty: 'chưa có việc nào trong quãng này',

  // chữ mà Common/Components đọc qua useText của module này
  quaylai: 'quay lại',
  xong: 'xong',
  hoanthanh: 'xong',
  homnay: 'hôm nay',
  ngaymai: 'ngày mai',
  tuantoi: 'tuần tới',
  cuoingay: 'cuối ngày',
  loaibo: 'bỏ chọn',
  ngaylam: 'ngày làm',
  chongnay: 'chọn ngày',
  chonngaygio: 'chọn ngày và giờ',
  chongio: 'chọn giờ',
  chonthoigian: 'chọn thời gian',
  xemtruoc: 'xem trước',
  chinhsua: 'chỉnh sửa',
  ghichu: 'ghi chú',
};

export type WorkTextKey = keyof typeof dictionary;

export type WorkText = Record<WorkTextKey, string> & {
  for: (name: string) => string
  translate: (name: string, def?: string) => string
};

export const useText = (): WorkText => {
  const common = useCommonText();
  return { ...dictionary, for: common.for, translate: common.translate };
};
