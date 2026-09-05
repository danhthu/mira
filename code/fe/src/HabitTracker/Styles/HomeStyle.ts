import { useTheme } from '../../../theme';

/**
 * Bảng màu của module Thói quen, lấy hết từ token.
 *
 * Bản Batify cũ khai 28 mã màu viết cứng ở đây (vàng/hồng/tím pastel) — nhiều
 * nhất repo — nên module không đổi theo chủ đề sáng/tối và không ai kiểm được có
 * màu đỏ lọt vào hay không. `habitColors` giờ là dải nhấn trung tính rút từ token:
 * nó chỉ để phân biệt các thói quen với nhau, không mã hoá "tốt/xấu" hay
 * "đủ/chưa đủ", nên không có sắc độ nào mang nghĩa cảnh báo.
 */
export const useColors = () => {
  const colors = useTheme();
  const t = colors.token;
  return {
    habitColors: [
      t.accent,
      t.accentAlt,
      t.accentSoft,
      t.positive,
      t.info,
      t.neutral,
    ],
    surface: t.surface,
    outline: t.border,
    marked: t.accent,
    secondTextColor: t.textMuted,
    textColor: t.textPrimary,
    bg: t.background,
    bg_calendar: t.surface,
    bg_calendar_actived: t.accentSurface,
    bg_calendar_selected: t.accentMuted,
  };
};
