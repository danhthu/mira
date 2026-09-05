import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { B, BICon, BText as Text } from '../../../libs/components';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import {
  FONT_SIZE,
  FONT_WEIGHT,
  HEADER_HEIGHT,
  ICON_TOUCH_WIDTH,
} from '../../../theme/Constraints';
import {
  useAsyncAction,
  useDectectDataChanged,
  useSettings,
} from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { Background } from '../Components/Background';
import { LinkedItemList } from '../Components/ChallengeLinkTo';
import { RowItem } from '../Components/RowItem';
import {
  Challenge,
  ChallengeAssociate,
  challengeAssociateRepository,
  challengeRepository,
} from '../Entities';
import {
  challengeState,
  daysLeft,
  daysPassed,
  totalDays,
} from '../Models/challengeState';
import { useText } from '../Text';

type DetailData = { challenge?: Challenge; links: ChallengeAssociate[] };

/**
 * Chi tiết một thử thách. Bản cũ dựng một bảng "Ngày | Kết quả" trên
 * `details: []` không bao giờ được nạp, cạnh một `let percentage: 0` (khai kiểu
 * chứ không gán, nên luôn `undefined`) rồi trả nó ra ngoài. Cả hai đã gỡ; màn
 * này giờ chỉ nói ba thứ app biết chắc: quãng thời gian, những việc đã gắn, và
 * một hành động người dùng tự bấm.
 *
 * params: id
 */
export const Detail = ({ route, navigation }) => {
  const text = useText();
  const colors = useTheme();
  const style = useCommonStyle();
  const [settings] = useSettings();
  const id: string = route.params && route.params.id;

  const data = useAsyncAction<DetailData>(
    async () => {
      if (!id) return { links: [] };
      return {
        challenge: await challengeRepository.findById(id),
        links: await challengeAssociateRepository.filter(
          (a) => a.challengeId === id,
        ),
      };
    },
    [
      id,
      useDectectDataChanged(challengeRepository),
      useDectectDataChanged(challengeAssociateRepository),
    ],
    { links: [] },
  );

  const challenge = data.challenge;
  const now = new Date();
  const state = challenge ? challengeState(challenge, now) : 'doing';

  const onToggleReached = async () => {
    await challengeRepository.update(id, (c) => {
      c.status = c.status === 'SUCCESS' ? 'DOING' : 'SUCCESS';
    });
  };

  return (
    <Background>
      <View style={{ paddingLeft: 16, paddingRight: 16 }}>
        <Header id={id} />
        {challenge && <RowItem challenge={challenge} />}
      </View>
      <ScrollView style={[style.screen, { paddingTop: 0 }]}>
        {challenge && (
          <View
            style={{
              backgroundColor: colors.token.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.token.border,
              padding: 20,
            }}
          >
            <Section title={text.window}>
              <Text style={{ color: colors.token.textPrimary }}>
                {moment(challenge.start).format(settings.dateFormat)}
                {' – '}
                {moment(challenge.end).format(settings.dateFormat)}
              </Text>
              <Text style={{ color: colors.token.textSecondary, fontSize: 13 }}>
                {daysPassed(challenge, now)} / {totalDays(challenge)}{' '}
                {text.unit_day} {text.days_passed}
                {state === 'doing'
                  ? `, ${daysLeft(challenge, now)} ${text.unit_day} ${text.days_left}`
                  : ''}
              </Text>
            </Section>

            {challenge.gif ? (
              <Section title={text.reward}>
                <Text style={{ color: colors.token.textPrimary }}>
                  {challenge.gif}
                </Text>
              </Section>
            ) : null}

            {challenge.description ? (
              <Section title={text.note}>
                <Text style={{ color: colors.token.textPrimary }}>
                  {challenge.description}
                </Text>
              </Section>
            ) : null}

            <Section title={text.link}>
              <LinkedItemList value={data.links} />
            </Section>

            {state === 'closed' && (
              <Text
                style={{
                  color: colors.token.textMuted,
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                {text.closed_note}
              </Text>
            )}

            <TouchableOpacity onPress={onToggleReached}>
              <Text style={{ color: colors.token.accent }}>
                {state === 'reached' ? text.mark_reopen : text.mark_reached}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Background>
  );
};

const Section = (props: { title: string; children: React.ReactNode }) => {
  const colors = useTheme();
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          color: colors.token.textMuted,
          fontSize: 13,
          marginBottom: 4,
        }}
      >
        {props.title}
      </Text>
      {props.children}
    </View>
  );
};

const Header = (props: { id: string }) => {
  const navigation = useNavigation();
  return (
    <View style={{ height: HEADER_HEIGHT }}>
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
      <TouchableOpacity
        style={{
          height: HEADER_HEIGHT,
          justifyContent: 'center',
          alignItems: 'flex-end',
          position: 'absolute',
          right: 0,
          paddingRight: 10,
        }}
        onPress={() =>
          Router.Open(navigation, 'ChallengerApp', {
            screen: 'Edit',
            id: props.id,
          })
        }
      >
        <BICon name="edit" style={{ fontSize: FONT_SIZE.ICon }} />
      </TouchableOpacity>
    </View>
  );
};
