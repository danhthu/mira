/**
 * Giới nghiêm buổi tối và ngày trắng — `05-v1-spec.md` §Settings.
 *
 * Hàm thuần, không chạm lưu trữ: nhận cấu hình và một mốc thời gian, trả về lý do
 * đang yên tĩnh. Đặt ở đây thay vì `Core/` vì hai mục này thuộc cấu hình app chứ
 * không thuộc công thức của `03-formulas.md`.
 */

import { DAYS_IN_WEEK, DEFAULT_CURFEW_HOUR, DEFAULT_WHITE_DAY_WEEKDAY, QUIET_MORNING_END_HOUR } from '../constants';

export interface QuietTimeSettings {
  readonly curfewEnabled: boolean;
  /** Giờ bắt đầu giới nghiêm, 0..23. */
  readonly curfewHour: number;
  readonly whiteDayEnabled: boolean;
  /** 0 là chủ nhật, khớp `Date.getDay()`. */
  readonly whiteDayWeekday: number;
}

/**
 * Giới nghiêm bật sẵn: nó chỉ làm app im bớt, không đòi thêm việc gì của người dùng,
 * nên trạng thái an toàn khi chưa ai chọn gì là bật. Ngày trắng tắt sẵn theo spec.
 */
export const DEFAULT_QUIET_TIME: QuietTimeSettings = {
  curfewEnabled: true,
  curfewHour: DEFAULT_CURFEW_HOUR,
  whiteDayEnabled: false,
  whiteDayWeekday: DEFAULT_WHITE_DAY_WEEKDAY,
};

export type QuietReason = 'curfew' | 'white_day';

export function isValidHour(hour: number): boolean {
  return Number.isInteger(hour) && hour >= 0 && hour <= 23;
}

export function isValidWeekday(weekday: number): boolean {
  return Number.isInteger(weekday) && weekday >= 0 && weekday < DAYS_IN_WEEK;
}

/**
 * Trong khoảng giới nghiêm nếu giờ hiện tại từ `curfewHour` trở đi, hoặc còn trước
 * 5h sáng. Giới nghiêm đặt trước 5h sáng thì khoảng chạy liền một mạch tới giờ đó.
 */
function inCurfew(hour: number, curfewHour: number): boolean {
  if (curfewHour <= QUIET_MORNING_END_HOUR) {
    return hour >= curfewHour && hour < QUIET_MORNING_END_HOUR;
  }
  return hour >= curfewHour || hour < QUIET_MORNING_END_HOUR;
}

/** Ngày trắng thắng giới nghiêm: nó phủ cả ngày nên là lý do đúng hơn khi cả hai trùng. */
export function quietReasonAt(
  settings: QuietTimeSettings,
  at: Date,
): QuietReason | null {
  if (settings.whiteDayEnabled && at.getDay() === settings.whiteDayWeekday) {
    return 'white_day';
  }
  if (settings.curfewEnabled && inCurfew(at.getHours(), settings.curfewHour)) {
    return 'curfew';
  }
  return null;
}

export function isQuietAt(settings: QuietTimeSettings, at: Date): boolean {
  return quietReasonAt(settings, at) !== null;
}

/** Đọc lại cấu hình từ JSON đã lưu, bỏ qua mọi giá trị không hợp lệ. */
export function readQuietTime(stored: Record<string, unknown>): QuietTimeSettings {
  const curfewHour = stored.curfewHour;
  const whiteDayWeekday = stored.whiteDayWeekday;
  return {
    curfewEnabled:
      typeof stored.curfewEnabled === 'boolean'
        ? stored.curfewEnabled
        : DEFAULT_QUIET_TIME.curfewEnabled,
    curfewHour:
      typeof curfewHour === 'number' && isValidHour(curfewHour)
        ? curfewHour
        : DEFAULT_QUIET_TIME.curfewHour,
    whiteDayEnabled: stored.whiteDayEnabled === true,
    whiteDayWeekday:
      typeof whiteDayWeekday === 'number' && isValidWeekday(whiteDayWeekday)
        ? whiteDayWeekday
        : DEFAULT_QUIET_TIME.whiteDayWeekday,
  };
}
