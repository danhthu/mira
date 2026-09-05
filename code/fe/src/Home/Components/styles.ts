/**
 * Style của màn hình chính. Mọi màu lấy từ `theme/Tokens.ts` — không hex trong
 * màn hình, `scripts/soi-mau.mjs` soi việc này.
 */

import { StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';

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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.space.lg,
    },
    headerDate: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.title,
      color: token.textSecondary,
    },
    headerAction: {
      padding: theme.space.sm,
    },

    board: {
      backgroundColor: token.surface,
      borderColor: token.border,
      borderWidth: 1,
      borderRadius: theme.radius.large,
      paddingVertical: theme.space.sm,
      paddingHorizontal: theme.space.lg,
    },
    boardDivider: {
      height: 1,
      backgroundColor: token.border,
      marginVertical: theme.space.sm,
    },

    metric: {
      paddingVertical: theme.space.md,
    },
    metricLine: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    metricLabel: {
      flex: 1,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textSecondary,
    },
    metricValue: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.headline,
      color: token.textPrimary,
    },
    metricValueMissing: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.headline,
      color: token.textMuted,
    },
    metricUnit: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textSecondary,
      marginLeft: theme.space.xs,
    },
    metricDelta: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textMuted,
      marginLeft: theme.space.sm,
      minWidth: 44,
      textAlign: 'right',
    },
    metricNote: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      marginTop: theme.space.xxs,
    },

    section: {
      marginTop: theme.space.xl,
    },
    sectionTitle: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.subtitle,
      color: token.textPrimary,
    },
    sectionHint: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      marginTop: theme.space.xxs,
      marginBottom: theme.space.sm,
    },

    personRow: {
      flexDirection: 'row',
      paddingVertical: theme.space.xs,
    },
    person: {
      alignItems: 'center',
      marginRight: theme.space.lg,
      width: 64,
    },
    personCircle: {
      width: 56,
      height: 56,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token.accentSurface,
      borderWidth: 1,
      borderColor: token.accentMuted,
    },
    personCircleRunning: {
      backgroundColor: token.accent,
      borderColor: token.accent,
    },
    personInitial: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.title,
      color: token.accent,
    },
    personInitialRunning: {
      color: token.textOnAccent,
    },
    personName: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textSecondary,
      marginTop: theme.space.xs,
      textAlign: 'center',
    },
    personAddCircle: {
      width: 56,
      height: 56,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token.surfaceMuted,
      borderWidth: 1,
      borderColor: token.border,
    },

    running: {
      marginTop: theme.space.sm,
      padding: theme.space.md,
      borderRadius: theme.radius.normal,
      backgroundColor: token.accentSurface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    runningText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textPrimary,
      flex: 1,
    },
    runningStop: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.accent,
      paddingHorizontal: theme.space.sm,
      paddingVertical: theme.space.xs,
    },

    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chip: {
      paddingHorizontal: theme.space.lg,
      paddingVertical: theme.space.md,
      borderRadius: theme.radius.pill,
      backgroundColor: token.surfaceMuted,
      borderWidth: 1,
      borderColor: token.border,
      marginRight: theme.space.sm,
      marginBottom: theme.space.sm,
    },
    chipText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textPrimary,
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

    sheetScrim: {
      flex: 1,
      backgroundColor: theme.hexToRGB(token.scrim, 0.4),
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: token.surface,
      borderTopLeftRadius: theme.radius.large,
      borderTopRightRadius: theme.radius.large,
      padding: theme.space.xl,
    },
    sheetTitle: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.subtitle,
      color: token.textPrimary,
      marginBottom: theme.space.md,
    },
    sheetOption: {
      paddingVertical: theme.space.lg,
      borderTopWidth: 1,
      borderTopColor: token.border,
    },
    sheetOptionText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.bodyLarge,
      color: token.textPrimary,
    },
    sheetCancelText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.bodyLarge,
      color: token.textMuted,
    },
  });
};
