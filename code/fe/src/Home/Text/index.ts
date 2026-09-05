/**
 * Toàn bộ chuỗi của màn hình chính. Giọng theo `docs/00-vision.md`: sentence case,
 * không "nên/phải/hãy", không dấu chấm than, không phán xét.
 *
 * Mỗi ô module có hai nhóm chuỗi: một câu khi đã có dữ liệu, một câu trung tính khi
 * chưa có. Không nhóm nào ghép ra được số 0 — `00-vision.md` rủi ro #3.
 */

const homeText = {
  workTitle: 'Công việc',
  workRemainingPrefix: 'còn',
  workRemainingSuffix: 'việc hôm nay',
  workAllDone: 'việc hôm nay đã xong',
  workEmpty: 'chưa có việc nào hôm nay',

  habitTitle: 'Thói quen',
  habitPlannedPrefix: 'hôm nay có',
  habitPlannedSuffix: 'thói quen',
  habitPartialPrefix: 'đã làm',
  habitPartialMiddle: 'trong',
  habitPartialSuffix: 'thói quen hôm nay',
  habitAllPrefix: 'đã làm cả',
  habitAllSuffix: 'thói quen hôm nay',
  habitEmpty: 'chưa có thói quen nào hôm nay',

  challengeTitle: 'Thử thách',
  challengeActivePrefix: 'đang theo',
  challengeActiveSuffix: 'thử thách',
  challengeEmpty: 'chưa có thử thách nào',

  tradingTitle: 'Trading',
  tradingLine: 'nhịp xem bảng giá',

  emotionTitle: 'Cảm xúc',
  emotionLoggedPrefix: 'hôm nay đã ghi',
  emotionLoggedSuffix: 'lần',
  emotionEmpty: 'chưa ghi cảm xúc hôm nay',

  goalTitle: 'Mục tiêu',
  goalActivePrefix: 'đang theo',
  goalActiveSuffix: 'mục tiêu',
  goalEmpty: 'chưa có mục tiêu nào',

  timeTitle: 'Thời gian',
  timeLoggedPrefix: 'hôm nay đã ghi',
  timeHourUnit: 'giờ',
  timeMinuteUnit: 'phút',
  timeEmpty: 'chưa ghi giờ nào hôm nay',

  settingTitle: 'Cài đặt',
  settingLine: 'đồng bộ, giao diện, dữ liệu',

  momentTitle: 'Khoảnh khắc',
  momentPlaceholder: 'khoảnh khắc vừa rồi',
  momentSave: 'ghi',
  momentSaved: 'đã ghi',
} as const;

export type HomeText = typeof homeText;

export const useText = (): HomeText => homeText;
