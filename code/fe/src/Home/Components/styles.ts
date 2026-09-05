/**
 * Style của màn hình chính. Mọi màu lấy từ `theme/Tokens.ts` — không hex trong
 * màn hình, `scripts/soi-mau.mjs` soi việc này.
 *
 * Không có style nào đổi màu theo "đã xong / chưa xong": mọi ô dùng đúng một nền và
 * một viền, khác nhau chỉ ở câu chữ (ràng buộc cứng #3).
 */

import { StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';

/** Hai cột, chừa khe giữa. Ô hẹp hơn nửa để `space-between` còn chỗ thở. */
const TILE_WIDTH = '48%';
const TILE_MIN_HEIGHT = 92;

export const useHomeStyle = () => {
  const theme = useTheme();
  const token = theme.token;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: token.background,
    },
    content: {
      padding: theme.space.lg,
      paddingBottom: theme.space.xxl,
    },
    headerDate: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.title,
      color: token.textSecondary,
      marginBottom: theme.space.lg,
    },

    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    tile: {
      width: TILE_WIDTH,
      minHeight: TILE_MIN_HEIGHT,
      justifyContent: 'space-between',
      backgroundColor: token.surface,
      borderColor: token.border,
      borderWidth: 1,
      borderRadius: theme.radius.large,
      paddingVertical: theme.space.md,
      paddingHorizontal: theme.space.md,
      marginBottom: theme.space.md,
    },
    tileTitle: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.subtitle,
      color: token.textPrimary,
    },
    tileLine: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textSecondary,
      marginTop: theme.space.sm,
    },

    section: {
      marginTop: theme.space.lg,
    },
    sectionTitle: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.subtitle,
      color: token.textPrimary,
      marginBottom: theme.space.sm,
    },

    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: token.surface,
      borderRadius: theme.radius.normal,
      borderWidth: 1,
      borderColor: token.border,
      paddingLeft: theme.space.md,
    },
    input: {
      flex: 1,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textPrimary,
      paddingVertical: theme.space.md,
    },
    inputAction: {
      paddingHorizontal: theme.space.lg,
      paddingVertical: theme.space.md,
    },
    inputActionText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.accent,
    },
    hintText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      marginTop: theme.space.xs,
    },
  });
};
