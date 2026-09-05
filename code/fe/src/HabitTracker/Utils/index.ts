import { repeatOption } from '../../../common/interface';
import { HabitTextKey } from '../Text';

/**
 * Mô tả lịch lặp bằng tiếng Việt.
 *
 * Bản trước trả chuỗi tiếng Anh viết thẳng ('Everyday', '3 days per week') và
 * nhánh `monthly` trả nhầm 'days per week'. Chuỗi giờ lấy từ bảng `Text`, truyền
 * vào để hàm không phải là hook và vẫn gọi được từ mọi chỗ.
 */
export const repeateToString = (
  repeat: repeatOption,
  text: Record<HabitTextKey, string>,
): string => {
  if (!repeat || !repeat.enable) return text.no_repeat;
  if (repeat.kind == 'daily') return text.repeat_daily;
  if (repeat.kind == 'weekly')
    return `${repeat.dayOfWeek.length} ${text.repeat_weekly}`;
  return `${repeat.days.length} ${text.repeat_monthly}`;
};
