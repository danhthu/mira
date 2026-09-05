/**
 * Style của onboarding. Mọi màu lấy từ `theme/Tokens.ts` — không hex trong màn
 * hình, `scripts/soi-mau.mjs` soi việc này.
 */

import { StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';

export const useWelcomeStyle = () => {
  const theme = useTheme();
  const token = theme.token;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: token.background,
    },
    content: {
      flex: 1,
      padding: theme.space.xl,
    },
    stepCount: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      marginBottom: theme.space.sm,
    },
    question: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.headline,
      color: token.textPrimary,
    },
    hint: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      marginTop: theme.space.xs,
      marginBottom: theme.space.lg,
    },
    body: {
      flex: 1,
    },

    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chip: {
      paddingHorizontal: theme.space.xl,
      paddingVertical: theme.space.lg,
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
      fontSize: theme.fontSize.bodyLarge,
      color: token.textSecondary,
    },
    chipTextSelected: {
      color: token.accent,
    },
    chipSmall: {
      paddingHorizontal: theme.space.lg,
      paddingVertical: theme.space.sm,
      borderRadius: theme.radius.pill,
      backgroundColor: token.surfaceMuted,
      borderWidth: 1,
      borderColor: token.border,
      marginRight: theme.space.sm,
      marginBottom: theme.space.sm,
    },
    chipSmallText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textSecondary,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.space.sm,
    },
    rowRole: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      width: 64,
    },
    input: {
      flex: 1,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.bodyLarge,
      color: token.textPrimary,
      backgroundColor: token.surface,
      borderRadius: theme.radius.normal,
      borderWidth: 1,
      borderColor: token.border,
      paddingHorizontal: theme.space.md,
      paddingVertical: theme.space.md,
    },
    rowRemove: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      paddingHorizontal: theme.space.md,
      paddingVertical: theme.space.md,
    },

    cadenceBlock: {
      marginBottom: theme.space.xl,
    },
    cadenceHead: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: theme.space.sm,
    },
    cadenceName: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.bodyLarge,
      color: token.textPrimary,
    },
    cadenceValue: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.accent,
    },
    track: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 44,
    },
    trackStop: {
      flex: 1,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    trackLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: token.border,
    },
    trackDot: {
      width: 10,
      height: 10,
      borderRadius: theme.radius.pill,
      backgroundColor: token.borderStrong,
    },
    trackDotSelected: {
      width: 24,
      height: 24,
      borderRadius: theme.radius.pill,
      backgroundColor: token.accent,
    },

    doneTitle: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.display,
      color: token.textPrimary,
    },
    doneLine: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textSecondary,
      marginTop: theme.space.md,
    },
    doneNote: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.caption,
      color: token.textMuted,
      marginTop: theme.space.lg,
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.space.xl,
      paddingBottom: theme.space.xl,
    },
    footerSide: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ghostAction: {
      paddingHorizontal: theme.space.md,
      paddingVertical: theme.space.md,
    },
    ghostActionText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: token.textMuted,
    },
    primaryAction: {
      paddingHorizontal: theme.space.xxl,
      paddingVertical: theme.space.lg,
      borderRadius: theme.radius.pill,
      backgroundColor: token.accent,
    },
    primaryActionText: {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.bodyLarge,
      color: token.textOnAccent,
    },
  });
};
