import { StyleProp, View, ViewStyle } from 'react-native';
import { BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { ChallengeState } from '../Models/challengeState';
import { ChallengerText, useText } from '../Text';

/**
 * Nhãn trạng thái. Bảng màu chỉ có `positive` (đã đạt), `accent` (đang diễn ra)
 * và `neutral` (sắp bắt đầu / đã khép lại) — không sắc đỏ hay cam nào, kể cả cho
 * thử thách hết hạn: `theme/Tokens.ts` cũng không còn token nào trong dải đó.
 */
export const useStateLabel = (): ((state: ChallengeState) => string) => {
  const text = useText();
  const labels: Record<ChallengeState, keyof ChallengerText> = {
    upcoming: 'state_upcoming',
    doing: 'state_doing',
    reached: 'state_reached',
    closed: 'state_closed',
  };
  return (state) => text[labels[state]];
};

export const StateChip = (props: {
  state: ChallengeState
  style?: StyleProp<ViewStyle>
}) => {
  const colors = useTheme();
  const label = useStateLabel();
  const palette: Record<ChallengeState, { fg: string; bg: string }> = {
    upcoming: {
      fg: colors.token.textSecondary,
      bg: colors.token.neutralSurface,
    },
    doing: { fg: colors.token.accent, bg: colors.token.accentSurface },
    reached: { fg: colors.token.positive, bg: colors.token.positiveSurface },
    closed: { fg: colors.token.textMuted, bg: colors.token.neutralSurface },
  };
  const tone = palette[props.state];
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 3,
          backgroundColor: tone.bg,
        },
        props.style,
      ]}
    >
      <Text style={{ fontSize: 13, color: tone.fg }}>{label(props.state)}</Text>
    </View>
  );
};
