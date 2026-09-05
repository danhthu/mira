/**
 * Style của module Người. Mọi màu lấy từ `theme/Tokens.ts` — không hex trong màn
 * hình, `scripts/soi-mau.mjs` soi việc này.
 */

import { StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';

export const usePersonStyle = () => {
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
    headerTitle: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.title,
      color: token.textPrimary,
    },
    headerAction: {
      paddingHorizontal: theme.space.sm,
      paddingVertical: theme.space.sm,
    },
    headerActionText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.accent,
    },

    groupTitle: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      marginTop: theme.space.lg,
      marginBottom: theme.space.sm,
    },

    card: {
      backgroundColor: token.surface,
      borderColor: token.border,
      borderWidth: 1,
      borderRadius: theme.radius.large,
      padding: theme.space.lg,
      marginBottom: theme.space.sm,
    },
    cardLine: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    cardName: {
      flex: 1,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.bodyLarge,
      color: token.textPrimary,
    },
    cardValue: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.title,
      color: token.textPrimary,
    },
    cardValueMissing: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.title,
      color: token.textMuted,
    },
    cardUnit: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textSecondary,
      marginLeft: theme.space.xs,
    },
    cardWeek: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      marginLeft: theme.space.sm,
    },
    cardNote: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      marginTop: theme.space.xxs,
    },
    cardEdit: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.accent,
      marginTop: theme.space.sm,
    },

    addButton: {
      marginTop: theme.space.lg,
      paddingVertical: theme.space.lg,
      borderRadius: theme.radius.normal,
      borderWidth: 1,
      borderColor: token.accentMuted,
      backgroundColor: token.accentSurface,
      alignItems: 'center',
    },
    addButtonText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.accent,
    },

    emptyText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textSecondary,
      marginTop: theme.space.lg,
    },
    emptyPath: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      marginTop: theme.space.xxs,
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
    fieldLabel: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      marginBottom: theme.space.xs,
      marginTop: theme.space.lg,
    },
    input: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.bodyLarge,
      color: token.textPrimary,
      backgroundColor: token.surfaceMuted,
      borderRadius: theme.radius.normal,
      borderWidth: 1,
      borderColor: token.border,
      paddingHorizontal: theme.space.md,
      paddingVertical: theme.space.md,
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
    chipSelected: {
      backgroundColor: token.accentSurface,
      borderColor: token.accent,
    },
    chipText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textSecondary,
    },
    chipTextSelected: {
      color: token.accent,
    },

    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.space.xl,
    },
    primaryAction: {
      paddingHorizontal: theme.space.xl,
      paddingVertical: theme.space.md,
      borderRadius: theme.radius.pill,
      backgroundColor: token.accent,
    },
    primaryActionText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textOnAccent,
    },
    primaryActionDisabled: {
      backgroundColor: token.surfaceMuted,
    },
    primaryActionTextDisabled: {
      color: token.textMuted,
    },
    secondaryActionText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textMuted,
      paddingHorizontal: theme.space.md,
      paddingVertical: theme.space.md,
    },
    removeText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.destructive,
      paddingVertical: theme.space.md,
    },
    removeNote: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
    },
  });
};
