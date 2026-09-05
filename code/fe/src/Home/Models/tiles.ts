/**
 * Màn chính là bảng dẫn vào các module. File này biến `HomeSummary` thành danh sách
 * ô đã có sẵn chữ và đích điều hướng — hàm thuần, để test được mà không cần dựng
 * navigator hay AsyncStorage.
 *
 * Mỗi ô nói một điều thật về hôm nay, không chỉ tên module. Khi chưa có dữ liệu thì
 * câu chuyển sang dạng trung tính, không có số nào (`00-vision.md` rủi ro #3), và
 * không có màu nào phân biệt "xong" với "chưa xong" (ràng buộc cứng #3).
 */

import { MINUTES_PER_HOUR } from '../../Core/constants';
import { MetricState } from '../../Core/dataState';
import { HomeText } from '../Text';
import { formatHours, formatMinutes } from './format';
import { DailyProgress, HomeSummary } from './summary';

export type ModuleKey =
  | 'work'
  | 'habit'
  | 'challenge'
  | 'trading'
  | 'emotion'
  | 'goal'
  | 'time'
  | 'setting';

/** Tên route đã đăng ký trong `src/Main/MainScreen.tsx`, kèm tham số nếu route cần. */
export interface ModuleRoute {
  readonly name: string;
  readonly params?: Readonly<Record<string, string>>;
}

export interface ModuleEntry {
  readonly key: ModuleKey;
  readonly title: string;
  readonly line: string;
  readonly route: ModuleRoute;
}

function workLine(state: MetricState<DailyProgress>, text: HomeText): string {
  if (state.status === 'empty') return text.workEmpty;
  const remaining = state.value.total - state.value.done;
  if (remaining <= 0) return text.workAllDone;
  return `${text.workRemainingPrefix} ${remaining} ${text.workRemainingSuffix}`;
}

function habitLine(state: MetricState<DailyProgress>, text: HomeText): string {
  if (state.status === 'empty') return text.habitEmpty;
  const { done, total } = state.value;
  // Chưa làm cái nào thì đếm số thói quen của ngày, không hiện "đã làm 0".
  if (done <= 0) return `${text.habitPlannedPrefix} ${total} ${text.habitPlannedSuffix}`;
  if (done >= total) return `${text.habitAllPrefix} ${total} ${text.habitAllSuffix}`;
  return `${text.habitPartialPrefix} ${done} ${text.habitPartialMiddle} ${total} ${text.habitPartialSuffix}`;
}

function challengeLine(state: MetricState<number>, text: HomeText): string {
  if (state.status === 'empty') return text.challengeEmpty;
  return `${text.challengeActivePrefix} ${state.value} ${text.challengeActiveSuffix}`;
}

function goalLine(state: MetricState<number>, text: HomeText): string {
  if (state.status === 'empty') return text.goalEmpty;
  return `${text.goalActivePrefix} ${state.value} ${text.goalActiveSuffix}`;
}

function emotionLine(state: MetricState<number>, text: HomeText): string {
  if (state.status === 'empty') return text.emotionEmpty;
  return `${text.emotionLoggedPrefix} ${state.value} ${text.emotionLoggedSuffix}`;
}

/**
 * Dưới một giờ thì hiện phút. Ghi 15 phút xong mà ô hiện "0,2 giờ" thì trông hệt như
 * chưa ghi gì — đổi đơn vị thay vì đổi con số.
 */
function timeLine(state: MetricState<number>, text: HomeText): string {
  if (state.status === 'empty') return text.timeEmpty;
  if (state.value >= MINUTES_PER_HOUR) {
    return `${text.timeLoggedPrefix} ${formatHours(state.value)} ${text.timeHourUnit}`;
  }
  return `${text.timeLoggedPrefix} ${formatMinutes(state.value)} ${text.timeMinuteUnit}`;
}

export function buildTiles(
  summary: HomeSummary,
  text: HomeText,
): readonly ModuleEntry[] {
  return [
    {
      key: 'work',
      title: text.workTitle,
      line: workLine(summary.work, text),
      route: { name: 'WorkAppModal' },
    },
    {
      key: 'habit',
      title: text.habitTitle,
      line: habitLine(summary.habit, text),
      route: { name: 'HabitAppModal' },
    },
    {
      key: 'challenge',
      title: text.challengeTitle,
      line: challengeLine(summary.challenge, text),
      route: { name: 'ChallengerApp' },
    },
    {
      key: 'trading',
      // Trading giữ dữ liệu trong AsyncStorage riêng, không có repository để đọc,
      // nên ô này chỉ nói module làm gì cho tới khi module có kho dữ liệu chung.
      title: text.tradingTitle,
      line: text.tradingLine,
      route: { name: 'Trading' },
    },
    {
      key: 'emotion',
      title: text.emotionTitle,
      line: emotionLine(summary.emotion, text),
      route: { name: 'EmotionApp' },
    },
    {
      key: 'goal',
      title: text.goalTitle,
      line: goalLine(summary.goal, text),
      route: { name: 'GoalApp' },
    },
    {
      key: 'time',
      title: text.timeTitle,
      line: timeLine(summary.timeMinutes, text),
      route: { name: 'TimeApp' },
    },
    {
      key: 'setting',
      title: text.settingTitle,
      line: text.settingLine,
      route: { name: 'SettingApp', params: { screen: 'Setting' } },
    },
  ];
}
