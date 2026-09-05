/**
 * Toàn bộ chuỗi của màn hình chính. Giọng theo `docs/00-vision.md`: sentence case,
 * không "nên/phải/hãy", không dấu chấm than, không phán xét.
 */

const homeText = {
  meaningfulLabel: 'Giờ ý nghĩa tuần này',
  wasteLabel: 'Giờ lãng phí tuần này',
  wealthLabel: 'Bạn giàu',
  evaporationLabel: 'Tháng này bốc hơi',
  overspendLabel: 'Tháng này tiêu quá thu',

  hourUnit: 'h',
  monthUnit: 'tháng',
  minuteUnit: 'phút',

  /** Dùng cho mọi ô chưa đủ dữ liệu — không bao giờ hiện số 0. */
  missingValue: '—',

  meaningfulEmpty: 'chưa ghi giờ nào tuần này',
  meaningfulHint: 'chạm một người bên dưới là bắt đầu',
  wasteEmpty: 'chưa ghi giờ nào tuần này',
  wasteHint: 'chạm một nhãn bên dưới là ghi',
  wealthEmpty: 'chưa có năm ô tài chính',
  wealthHint: 'năm ô, mỗi tháng một lần',
  evaporationEmpty: 'chưa có năm ô tài chính',
  timeInconsistent: 'số giờ đã ghi vượt quỹ giờ trong tuần',
  notApplicable: 'chưa áp dụng được',

  learningPrefix: 'đang tính · có',
  learningSeparator: '/',
  learningSuffix: 'ngày',

  wealthStandingPrefix: 'ở nấc',
  wealthGapPrefix: 'còn',
  wealthGapSuffix: 'nữa tới',
  wealthTopTier: 'không còn nấc nào phía trước',
  wealthSavingPacePrefix: 'ở nhịp tiết kiệm này, khoảng',
  wealthSavingPaceSuffix: 'tháng nữa',
  wealthBelowZero: 'chưa tới vạch 0',
  wealthShortfallPrefix: 'còn',
  wealthShortfallSuffix: 'nữa về vạch 0',
  wealthBreakEvenPrefix: 'khoảng',
  wealthBreakEvenSuffix: 'tháng tiết kiệm',

  lifeHoursPrefix: '=',
  lifeHoursUnit: 'giờ đời',
  moneyMonthNotePrefix: 'số của',

  tierSurvival: 'sống sót',
  tierSafe: 'an toàn',
  tierFlexible: 'linh hoạt',
  tierFree: 'tự do',

  peopleTitle: 'Ghi giờ ý nghĩa',
  peopleHint: 'chạm để đếm giờ · giữ để ghi nhanh',
  peopleEmpty: 'chưa có ai trong danh sách',
  peopleAdd: 'thêm người',
  peopleAddPlaceholder: 'tên người quan trọng',
  peopleAddSave: 'lưu',
  peopleAddCancel: 'bỏ',
  peopleRunningPrefix: 'đang đếm với',
  peopleStop: 'dừng và ghi',

  wasteTitle: 'Ghi giờ lãng phí',
  wasteHintRow: 'chạm ghi 30 phút · giữ để chọn',
  wasteDrift: 'lướt vô định',
  wasteMeeting: 'họp vô ích',
  wasteTraffic: 'kẹt xe',
  wasteWaiting: 'chờ đợi',

  quickTitle: 'Ghi nhanh',
  quick30: '30 phút',
  quick60: '1 giờ',
  quick120: '2 giờ',
  quickCancel: 'bỏ',

  momentPlaceholder: 'khoảnh khắc vừa rồi',
  momentSave: 'ghi',
  momentSaved: 'đã ghi',

  settings: 'Cài đặt',
  logged: 'đã ghi',
} as const;

export type HomeText = typeof homeText;

export const useText = (): HomeText => homeText;
