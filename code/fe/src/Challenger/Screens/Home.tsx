import { useNavigation } from '@react-navigation/native';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { AddButtonBottom } from '../../../libs/components/AddButtonBottom';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import {
  FONT_SIZE,
  FONT_WEIGHT,
  HEADER_HEIGHT,
  ICON_TOUCH_WIDTH,
} from '../../../theme/Constraints';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { Background } from '../Components/Background';
import { RowItem } from '../Components/RowItem';
import { Challenge, challengeRepository } from '../Entities';
import { challengeState } from '../Models/challengeState';
import { useText } from '../Text';

/** Đang diễn ra và sắp bắt đầu lên trước; đã đạt và đã khép lại xuống dưới. */
const STATE_ORDER = { doing: 0, upcoming: 1, reached: 2, closed: 3 } as const;

export const Home = ({ navigation }) => {
  const commonStyle = useCommonStyle();
  return (
    <Background style={commonStyle.screen}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Body />
      </ScrollView>
      <AddButtonBottom
        onPlusClick={() =>
          Router.Open(navigation, 'ChallengerApp', { screen: 'Add' })
        }
      />
    </Background>
  );
};

const Header = () => {
  const text = useText();
  const colors = useTheme();
  const navigation = useNavigation();
  return (
    <View style={{ height: HEADER_HEIGHT, marginBottom: 8 }}>
      <Text
        style={{
          color: colors.token.textPrimary,
          fontSize: FONT_SIZE.PageTitle,
          fontWeight: FONT_WEIGHT.SEMIBOLD,
          height: HEADER_HEIGHT,
          lineHeight: HEADER_HEIGHT,
          textAlign: 'center',
        }}
      >
        {text.screen_home}
      </Text>
      <TouchableOpacity
        style={{
          width: ICON_TOUCH_WIDTH,
          height: HEADER_HEIGHT,
          justifyContent: 'center',
          alignItems: 'flex-start',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        onPress={navigation.goBack}
      >
        <B.ICon name="return-up-back" style={{ fontSize: FONT_SIZE.PageTitle }} />
      </TouchableOpacity>
    </View>
  );
};

const Body = () => {
  const colors = useTheme();
  const text = useText();
  const now = new Date();
  const data = useAsyncAction<Challenge[]>(
    async () => {
      const challenges = await challengeRepository.list();
      return [...challenges].sort(
        (a, b) =>
          STATE_ORDER[challengeState(a, now)] -
          STATE_ORDER[challengeState(b, now)],
      );
    },
    [useDectectDataChanged(challengeRepository)],
    [],
  );

  if (data.length === 0) return <EmptyData />;
  return (
    <View>
      <Text
        style={{
          color: colors.token.textMuted,
          fontSize: 13,
          marginBottom: 16,
        }}
      >
        {text.home_hint}
      </Text>
      {data.map((challenge) => (
        <RowItem touchToDetail key={challenge.id} challenge={challenge} />
      ))}
    </View>
  );
};

const EmptyData = () => {
  const text = useText();
  const colors = useTheme();
  const navigation = useNavigation();
  return (
    <View style={{ paddingTop: 60, alignItems: 'center' }}>
      <Text
        style={{
          textAlign: 'center',
          color: colors.token.textSecondary,
          marginBottom: 12,
        }}
      >
        {text.empty_title}
      </Text>
      <TouchableOpacity
        onPress={() =>
          Router.Open(navigation, 'ChallengerApp', { screen: 'Add' })
        }
      >
        <Text style={{ textAlign: 'center', color: colors.token.accent }}>
          {text.empty_action}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
