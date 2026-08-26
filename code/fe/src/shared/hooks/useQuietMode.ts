import { vi } from '@/i18n/vi';
import { useSettingsStore } from '@/store/settingsStore';
import { isMomentOnly, isWhiteDay, isWithinCurfew } from '@/core/slow/quiet';

export interface QuietMode {
  isWhiteDay: boolean;
  isCurfew: boolean;
  /** Khi true, màn hình chỉ giữ lại đường ghi khoảnh khắc. */
  momentOnly: boolean;
  /** Một câu giải thích vì sao màn hình đang ít đi, hoặc null khi app hoạt động bình thường. */
  notice: string | null;
}

/**
 * Trạng thái im lặng của lớp da, tính lại mỗi lần render từ giờ máy. Không có
 * timer chạy nền: lớp này chỉ ẩn bớt giao diện, không đẩy thông báo nào, nên
 * không cần biết chính xác giây nào cửa sổ giới nghiêm mở ra.
 */
export function useQuietMode(now: Date = new Date()): QuietMode {
  const curfewHour = useSettingsStore((state) => state.curfewHour);
  const whiteDayOfWeek = useSettingsStore((state) => state.whiteDayOfWeek);

  const whiteDay = isWhiteDay(now, whiteDayOfWeek);
  const curfew = isWithinCurfew(now, curfewHour);

  return {
    isWhiteDay: whiteDay,
    isCurfew: curfew,
    momentOnly: isMomentOnly(now, curfewHour, whiteDayOfWeek),
    notice: whiteDay
      ? vi.slow.whiteDayActive
      : curfew
        ? vi.slow.curfewActive
        : null,
  };
}
