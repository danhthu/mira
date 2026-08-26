import { MORNING_HOUR } from './constants';

/** Ngày trắng: app im lặng trọn ngày người dùng đã chọn (0 = Chủ nhật). */
export function isWhiteDay(now: Date, whiteDayOfWeek: number | null): boolean {
  return whiteDayOfWeek !== null && now.getDay() === whiteDayOfWeek;
}

/**
 * Giới nghiêm kéo dài từ `curfewHour` tối hôm trước tới `MORNING_HOUR` sáng hôm
 * sau, nên cửa sổ này vắt qua nửa đêm: 01:00 vẫn là đang giới nghiêm.
 */
export function isWithinCurfew(now: Date, curfewHour: number): boolean {
  const hour = now.getHours();
  return hour >= curfewHour || hour < MORNING_HOUR;
}

/**
 * Trong ngày trắng hoặc trong giới nghiêm, giao diện chỉ giữ lại đường ghi
 * khoảnh khắc. Mọi thứ khác lùi lại — đây là lúc app nói ít đi, không phải lúc
 * nhắc nhiều hơn.
 */
export function isMomentOnly(
  now: Date,
  curfewHour: number,
  whiteDayOfWeek: number | null,
): boolean {
  return isWhiteDay(now, whiteDayOfWeek) || isWithinCurfew(now, curfewHour);
}
