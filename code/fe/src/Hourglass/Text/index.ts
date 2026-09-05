/**
 * Toàn bộ chữ của module Đồng hồ cát và của màn Cài đặt. Không chuỗi nào viết thẳng
 * trong `.tsx`.
 *
 * Giọng theo `00-vision.md`: sentence case, không "nên/phải/hãy", không dấu chấm
 * than, không câu nào nói người dùng làm chưa đủ. Con số là sự thật đặt lên bàn.
 * `03-formulas.md` §5 còn cấm chữ đếm ngược sinh tử — nên card của bố mẹ chỉ nói
 * "còn khoảng N lần gặp", không nói còn bao nhiêu năm.
 */

import { MetricEmptyReason } from '../../Core/dataState';
import { groupThousands, readableDate, readableHour, WEEKDAY_NAMES } from '../Models/calendar';
import { QuietReason } from '../Models/quietTime';

const quietLine: Record<QuietReason, string> = {
  curfew: 'giới nghiêm buổi tối đang bật, con số nghỉ tới sáng mai',
  white_day: 'hôm nay là ngày trắng, con số nghỉ',
};

/** Lý do chưa tính được, nói bằng lời mời chứ không bằng lỗi. */
const unavailableLine: Record<MetricEmptyReason, string> = {
  no_data: 'con số hiện ra khi có nhịp gặp và vài lần ghi đầu tiên',
  divide_by_zero: 'con số hiện ra khi có nhịp gặp mong muốn',
  not_applicable: 'quỹ gặp gỡ theo công thức này đã khép lại, thời gian bên nhau thì chưa',
  inconsistent: 'năm sinh đang lệch, sửa lại là con số hiện ra',
};

export const hourglassText = {
  screenTitle: 'Đồng hồ cát',

  emptyHeadline: 'Đồng hồ cát đang tắt',
  emptyExplain:
    'Đồng hồ cát cho thấy quỹ gặp gỡ còn lại với một người. Con số có thể nặng, nên nó tắt sẵn và chỉ bật cho ai bạn chọn.',
  emptyAction: 'Bật cho một người',
  emptyNoPeople: 'danh sách người quan trọng đang trống',

  pickTitle: 'Chọn người',
  /** Nguyên văn `05-v1-spec.md` §Onboarding. */
  enableExplain:
    'Để tính con số này, Mira cần biết tuổi. Con số có thể khiến bạn thấy nặng — bạn có thể tắt bất cứ lúc nào.',
  birthYearLabel: 'Năm sinh',
  birthYearPlaceholder: '1960',
  cadenceLabel: 'Số lần gặp mỗi tháng',
  daysPerVisitLabel: 'Số ngày mỗi lần gặp',
  targetHoursLabel: 'Giờ mỗi tuần mong muốn',
  confirmEnable: 'Bật đồng hồ cát',
  saveBirthYear: 'Lưu năm sinh',
  cancel: 'Để sau',
  birthYearInvalid: 'năm sinh nằm trong khoảng 1900 tới năm nay',

  cadenceLine: (visitsPerYear: number, daysPerVisit: number) =>
    'Gặp ' + visitsPerYear + ' lần/năm · ' + daysPerVisit + ' ngày mỗi lần',
  visitsLeft: (visits: number) => 'Còn khoảng ' + groupThousands(visits) + ' lần gặp',
  daysTogether: (days: number) => 'khoảng ' + groupThousands(days) + ' ngày bên nhau',
  childHoursLeft: (hours: number) =>
    'Còn khoảng ' + groupThousands(hours) + ' giờ trước tuổi 18',
  childHoursIfMore: (hours: number, targetWeeklyHours: number) =>
    'nhịp ' + targetWeeklyHours + ' giờ mỗi tuần cho khoảng ' + groupThousands(hours) + ' giờ',

  needsBirthYear: 'chưa có năm sinh, nên chưa có con số nào',
  quiet: (reason: QuietReason) => quietLine[reason],
  unavailable: (reason: MetricEmptyReason) => unavailableLine[reason],

  actionEnterBirthYear: 'Nhập năm sinh',
  actionPlanContact: 'Đặt lịch gọi',
  actionPostponeContact: 'Dời sang tuần sau',
  actionHide: 'Ẩn card',
  plannedContact: (iso: string) => 'đã hẹn gọi ngày ' + readableDate(iso),

  hideConfirmTitle: 'Ẩn card này',
  hideConfirmBody: 'Card của người này không hiện lại nữa, kể cả sau khi mở lại app.',
  hideConfirmYes: 'Ẩn',
  hideConfirmNo: 'Giữ lại',
};

export const settingText = {
  screenTitle: 'Cài đặt',

  peopleTitle: 'Người quan trọng',
  peopleRow: 'Danh sách người quan trọng',
  peopleHint: 'thêm, sửa, xoá người trong danh sách',

  hourglassTitle: 'Đồng hồ cát',
  hourglassHint: 'tắt sẵn, bật riêng cho từng người',
  hourglassEmpty: 'danh sách người quan trọng đang trống',
  hourglassNeedsBirthYear: 'chưa có năm sinh',
  hourglassOpen: 'Mở màn đồng hồ cát',

  curfewTitle: 'Giới nghiêm buổi tối',
  curfewHint: 'sau giờ này, đồng hồ cát không đưa con số nào ra nữa',
  curfewHour: (hour: number) => 'từ ' + readableHour(hour) + ' tới 05:00',

  whiteDayTitle: 'Ngày trắng',
  whiteDayHint: 'một ngày trong tuần không có con số nào',
  weekday: (index: number) => WEEKDAY_NAMES[index],

  exportTitle: 'Xuất dữ liệu ra JSON',
  exportHint: 'một file chứa mọi thứ đang nằm trên máy này',
  exportAction: 'Xuất ra JSON',
  exportRunning: 'đang xuất',
  exportDone: (storeCount: number, location: string) =>
    'đã xuất ' + storeCount + ' kho vào ' + location,

  wipeTitle: 'Xoá toàn bộ dữ liệu',
  wipeHint: 'xoá mọi kho trên máy này, không lấy lại được',
  wipeAction: 'Xoá toàn bộ dữ liệu',
  wipeConfirmTitle: 'Xoá toàn bộ dữ liệu',
  wipeConfirmBody:
    'Mọi bản ghi trên máy này bị xoá và không lấy lại được. Bản xuất JSON là cách duy nhất giữ lại.',
  wipeConfirmYes: 'Xoá',
  wipeConfirmNo: 'Giữ lại',
  wipeRunning: 'đang xoá',
  wipeDone: (repositories: number, keys: number) =>
    'đã xoá ' + repositories + ' bảng và ' + keys + ' kho trên máy',
};
