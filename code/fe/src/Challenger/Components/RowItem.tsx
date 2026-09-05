import { useNavigation } from '@react-navigation/native';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { BText as Text } from '../../../libs/components';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import { FONT_SIZE, FONT_WEIGHT } from '../../../theme/Constraints';
import { Challenge } from '../Entities';
import {
  challengeState,
  daysLeft,
  daysUntilStart,
  daysPassed,
  elapsedRatio,
  totalDays,
} from '../Models/challengeState';
import { useText } from '../Text';
import { ChallengeAwatar } from './ChallengeAwatar';
import { StateChip } from './StateChip';

/**
 * Một dòng thử thách.
 *
 * Bản cũ vẽ một vòng tròn phần trăm với ba ngưỡng màu (`>80%` xanh, `>55%` vàng,
 * còn lại `colors.error` đỏ) trên một biến `percentage` luôn bằng 0 — nghĩa là
 * mọi thử thách đều hiện vòng tròn đỏ 0%. Ở đây chỉ còn thanh **thời gian đã
 * trôi qua**: nó chạy đều bất kể người dùng làm gì, nên không nói ai làm đủ hay
 * chưa đủ, và nó là con số duy nhất app biết chắc.
 */
export const RowItem = (props: {
  challenge: Challenge
  touchToDetail?: boolean
  style?: StyleProp<ViewStyle>
}) => {
  const { challenge } = props;
  const colors = useTheme();
  const text = useText();
  const navigation = useNavigation();
  const now = new Date();
  const state = challengeState(challenge, now);
  const total = totalDays(challenge);
  const ratio = state === 'upcoming' ? 0 : elapsedRatio(challenge, now);

  const onItemClick = () => {
    Router.Open(navigation, 'ChallengerApp', {
      screen: 'Detail',
      id: challenge.id,
    });
  };

  const line =
    state === 'upcoming'
      ? `${text.starts_in} ${daysUntilStart(challenge, now)} ${text.unit_day}`
      : state === 'doing'
        ? `${daysLeft(challenge, now)} ${text.unit_day} ${text.days_left}`
        : `${daysPassed(challenge, now)} / ${total} ${text.unit_day}`;

  return (
    <TouchableOpacity
      disabled={!props.touchToDetail}
      onPress={onItemClick}
      style={[
        {
          backgroundColor: colors.token.surface,
          borderColor: colors.token.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
        },
        props.style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ChallengeAwatar
          src={challenge.icon}
          size={48}
          style={{ borderRadius: 12 }}
        />
        <View style={{ flex: 1, paddingLeft: 14 }}>
          <Text
            style={{
              fontWeight: FONT_WEIGHT.SEMIBOLD,
              fontSize: FONT_SIZE.Text,
              color: colors.token.textPrimary,
            }}
          >
            {challenge.name}
          </Text>
          <Text style={{ fontSize: 13, color: colors.token.textSecondary }}>
            {line}
          </Text>
        </View>
        <StateChip state={state} />
      </View>
      {total > 0 && (
        <View
          style={{
            height: 4,
            borderRadius: 2,
            marginTop: 14,
            backgroundColor: colors.token.surfaceMuted,
          }}
        >
          <View
            style={{
              height: 4,
              borderRadius: 2,
              width: `${Math.round(ratio * 100)}%`,
              backgroundColor:
                state === 'reached'
                  ? colors.token.positive
                  : colors.token.accentSoft,
            }}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};
