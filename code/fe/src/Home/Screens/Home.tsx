import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useState } from 'react';
import {
  Button,
  Image,
  ImageBackground,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import useScreenLoadTime from '../../../hook/useScreenLoadTime';
import { B, BText as Text } from '../../../libs/components';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import { TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { FONTSIZE } from '../../Common';
import {
  useAsyncAction,
  useDectectDataChanged,
  useSettings,
} from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { EmotionApp } from '../../Emotion';
import { wishRepository } from '../../Emotion/Entities';
import { GoalApp } from '../../Goal';
import {
  habitRepository,
  habitTrackerRepository,
} from '../../HabitTracker/Entities';
import { getTaskByDate } from '../../HabitTracker/Entities/getTaskByDate';
import { TimeUsedSection } from '../../TimeTracker/Components/TimeUsedSection';
import { workRepository } from '../../Work/Entities';
import { useText } from '../Text';
export const Home = ({ route, navigation }) => {
  useScreenLoadTime('Home', []);
  const style = useStyle();
  const text = useText();
  const [mode, setMode] = useState('dashboard' as 'dashboard' | 'timeline');
  const colors = useTheme();
  return (
    <ImageBackground style={{ flex: 1 }} source={require('../Assets/bg.jpg')}>
      <ScrollView style={{ marginTop: 70, marginBottom: 80 }}>
        <Header />
        <DailyTask
          style={[{ paddingLeft: 10, paddingRight: 10, paddingBottom: 20 }]}
        />
        {/**{position:'absolute',bottom:0,right:0,left:0,} <Tools style={[style.card_container,]} navigation={navigation} /> */}
        <TimeUsedSection style={[style.card_container]} />
        <EmotionApp.Components.Card style={[style.card_container]} />
        <GoalApp.Components.Card style={[style.card_container]} />
        <Button onPress={() => {
          navigation.navigate('Trading');
        }} title='Trading Monitoring'></Button>
      </ScrollView>
    </ImageBackground>
  );
};

const Header = () => {
  const text = useText();
  const [settings] = useSettings();
  const colors = useTheme();
  const nav = useNavigation();
  const movitationString = useAsyncAction(
    async () => (await wishRepository.getLast()).text,
    [],
  );
  return (
    <View style={{ paddingBottom: 30 }}>
      <View
        style={{
          flexDirection: 'row',
          paddingRight: 5,
          alignItems: 'flex-start',
        }}
      >
        <View style={[{ flex: 1 }]}>
          <B.Text
            style={{
              marginLeft: 20,
              fontSize: 26,
              fontWeight: '600',
              color: colors.secondary,
            }}
          >
            {moment(new Date()).format('dddd, MMM Do')}
          </B.Text>
          <TouchableOpacity
            style={{
              margin: 15,
              marginTop: 5,
              padding: 15,
              borderRadius: 10,
              backgroundColor: colors.hexToRGB(colors.primary, 0.08),
            }}
            onPress={() =>
              Router.Open(nav, 'EmotionApp', {
                screen: 'DailyMovitationString',
              })
            }
          >
            <B.Text
              style={{
                textAlign: 'center',
                fontSize: 21,
                fontWeight: '400',
                color: colors.primary,
              }}
            >
              {movitationString}
            </B.Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            { alignSelf: 'flex-start', alignItems: 'center', marginRight: 10 },
          ]}
        >
          <Image
            source={require('../../../assets/icon.png')}
            style={{ width: 60, height: 60 }}
          />
        </View>
      </View>
    </View>
  );
};

const DailyTask = (props: { style: StyleProp<ViewStyle> }) => {
  const text = useText();
  const colors = useTheme();
  const nav = useNavigation();
  const [workTask, habitTask] = useAsyncAction(
    async () => {
      return [
        await workRepository.getTaskByDate(new Date()),
        await getTaskByDate(new Date()),
      ];
    },
    [
      useDectectDataChanged(workRepository),
      useDectectDataChanged(habitRepository),
      useDectectDataChanged(habitTrackerRepository),
    ],
    [
      { mandatory: 0, total: 0 },
      { done: 0, all: 0 },
    ],
  );
  return (
    <View style={[{ flexDirection: 'row' }, props.style]}>
      {/** daily todo */}
      <View
        style={{
          flex: 1,
          borderRadius: 20,
          marginRight: 10,
          padding: 20,
          backgroundColor: '#fff',
          borderColor: colors.outline,
        }}
      >
        <TouchableOpacity
          onPress={() => Router.Open(nav, 'TabScreen', { screen: 'WorkApp' })}
        >
          <Text style={{ fontWeight: 'bold' }}>
            {text.dailyTask_work || 'Task'}
          </Text>
          <View style={{ marginTop: 20, marginBottom: 10 }}>
            <View style={{ height: 45, justifyContent: 'center' }}>
              {workTask.mandatory == 0 ? (
                <B.ICon
                  name="check"
                  style={[
                    {
                      fontSize: 35,
                      color: colors.success,
                      fontWeight: 'bold',
                      alignSelf: 'flex-start',
                    },
                  ]}
                />
              ) : (
                <Text
                  style={[
                    {
                      fontSize: 35,
                      fontWeight: '600',
                      color: colors.warn,
                      alignSelf: 'flex-start',
                    },
                  ]}
                >
                  {workTask.mandatory}
                </Text>
              )}
            </View>
            <Text style={{ textAlign: 'left', fontWeight: 400 }}>
              {text.mandatory || 'Buộc làm'}
            </Text>
            <Text
              style={{ fontSize: 18, color: colors.hexToRGB('#000000', 0.7) }}
            >
              {workTask.total == 0 ? '-- ' : workTask.total}{' '}
              {text.dailyTask_work_dsc || ' task hôm nay'}
            </Text>
          </View>
        </TouchableOpacity>
        <View
          style={{
            borderRadius: 5,
            backgroundColor: '#F0F8FF',
            width: 35,
            height: 35,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            right: 20,
            top: 20,
          }}
        >
          <B.ICon name="work" style={{ color: '#034694', fontSize: 20 }} />
        </View>
      </View>
      {/**Personal growth */}
      <View
        style={{
          marginLeft: 10,
          flex: 1,
          borderRadius: 15,
          backgroundColor: '#fff',
          borderColor: colors.outline,
          padding: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => Router.Open(nav, 'TabScreen', { screen: 'HabitApp' })}
        >
          <Text style={{ fontWeight: 'bold' }}>
            {text.dailyTask_habit || 'Thói quen'}
          </Text>
          <View style={{ marginTop: 20, marginBottom: 10 }}>
            <View style={{ height: 45, justifyContent: 'center' }}>
              {habitTask.done == 0 ? (
                <B.ICon
                  name="check"
                  style={[
                    {
                      fontSize: 35,
                      color: colors.success,
                      fontWeight: 'bold',
                      alignSelf: 'flex-start',
                    },
                  ]}
                />
              ) : (
                <Text
                  style={[
                    {
                      fontSize: 35,
                      fontWeight: '600',
                      alignSelf: 'flex-start',
                    },
                  ]}
                >
                  {habitTask.done}
                </Text>
              )}
            </View>
            <Text style={{ textAlign: 'left', fontWeight: 400 }}>
              {text.habit_done || 'Thực hiện'}
            </Text>
            <Text
              style={{ fontSize: 18, color: colors.hexToRGB('#000000', 0.7) }}
            >
              {habitTask.all} {text.dailyTask_habit_dsc || ' thói quen '}
            </Text>
          </View>
        </TouchableOpacity>
        <View
          style={{
            borderRadius: 5,
            backgroundColor: '#eec0c8',
            width: 35,
            height: 35,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            right: 20,
            top: 20,
          }}
        >
          <B.ICon
            name="self-improvement"
            style={{ color: '#F9629F', fontSize: 20 }}
          />
        </View>
      </View>
    </View>
  );
};

const Tools = (props: { style?: StyleProp<ViewStyle>; navigation }) => {
  const colors = useTheme();
  const text = useText();
  const toolItemStyle = StyleSheet.create({
    container: {
      flex: 1,
      height: 80,
    },
    content: {
      height: 50,
      justifyContent: 'center',
      borderRadius: 15,
      borderColor: colors.primary,
      borderWidth: 1,
      alignSelf: 'center',
      alignItems: 'center',
    },
    content_text: {
      textAlign: 'center',
      fontSize: 25,
    },
    content_icon: {
      textAlign: 'center',
      fontSize: 25,
      width: 50,
    },
    label: {
      fontSize: FONTSIZE.SMALL,
      lineHeight: 30,
      height: 30,
      textAlign: 'center',
    },
    divider: {
      backgroundColor: colors.primary,
      width: 1,
      height: 40,
      marginTop: 10,
    },
    badge_container: {
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.error,
      position: 'absolute',
      top: -12,
      right: -12,
      paddingLeft: 8,
      paddingRight: 8,
    },
    badge_text: {
      fontSize: 15,
      lineHeight: 24,
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#fff',
    },
  });
  const openListAppModal = () => { };

  return (
    <View style={[props.style]}>
      <View style={{ flexDirection: 'row' }}>
        <View style={[toolItemStyle.container]}>
          <TouchableOpacity
            onPress={() => Router.Open(props.navigation, 'WorkApp')}
          >
            <View style={[toolItemStyle.content]}>
              <B.ICon
                name="business-center"
                style={[toolItemStyle.content_icon, { color: 'black' }]}
              ></B.ICon>
              <View style={[toolItemStyle.badge_container]}>
                <Text style={[toolItemStyle.badge_text]}>5</Text>
              </View>
            </View>
            <Text style={[toolItemStyle.label]}>
              {text.app_work || 'Công việc'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[toolItemStyle.container]}>
          <TouchableOpacity
            onPress={() => Router.Open(props.navigation, 'HabitApp')}
          >
            <View style={[toolItemStyle.content]}>
              <B.ICon
                name="heart"
                style={[toolItemStyle.content_icon, { color: '#C71585' }]}
              ></B.ICon>
              <View style={[toolItemStyle.badge_container]}>
                <Text style={[toolItemStyle.badge_text]}>3</Text>
              </View>
            </View>
            <Text style={[toolItemStyle.label]}>
              {text.app_habit || 'Thói quen'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[toolItemStyle.container]}>
          <TouchableOpacity
            onPress={() => Router.Open(props.navigation, 'ChallengeApp')}
          >
            <View style={[toolItemStyle.content]}>
              <B.ICon
                name="line-graph"
                style={[toolItemStyle.content_icon, { color: 'green' }]}
              ></B.ICon>
              <View style={[toolItemStyle.badge_container]}>
                <Text style={[toolItemStyle.badge_text]}>3</Text>
              </View>
            </View>
            <Text style={[toolItemStyle.label]}>
              {text.app_challenge || 'Thử thách'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[toolItemStyle.container]}>
          <View>
            <View style={[toolItemStyle.content, { justifyContent: 'center' }]}>
              <B.ICon
                name="person"
                style={[toolItemStyle.content_icon, { color: 'black' }]}
              />
            </View>
            <Text style={toolItemStyle.label}>
              {text.app_personProfile || 'Me'}
            </Text>
          </View>
        </View>
      </View>
      <View style={[{ flexDirection: 'row', marginTop: 10 }]}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => Router.Open(props.navigation, 'DiscoverApp')}
            style={[
              {
                paddingLeft: 10,
                backgroundColor: colors.hexToRGB('#dddddd', 0.7),
                borderRadius: 5,
                flex: 1,
                marginRight: 10,
                flexDirection: 'row',
              },
            ]}
          >
            <B.ICon
              name="search"
              style={{
                lineHeight: TBL_ROW_HEIGHT,
                marginRight: 10,
                color: colors.primary,
                fontSize: FONTSIZE.NORMAL,
              }}
            />
            <Text style={{ lineHeight: TBL_ROW_HEIGHT, color: colors.primary }}>
              {text.khampha || 'Khám phá'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={openListAppModal}
          style={[
            {
              backgroundColor: colors.hexToRGB('#dddddd', 0.7),
              borderRadius: 5,
              height: TBL_ROW_HEIGHT,
              justifyContent: 'center',
              width: TBL_ROW_HEIGHT,
              alignItems: 'center',
              alignSelf: 'flex-end',
            },
          ]}
        >
          <B.ICon name="grid" style={{ color: colors.primary, fontSize: 25 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const useStyle = () => {
  const colors = useTheme();
  return {
    ...useCommonStyle(),
    ...StyleSheet.create({
      card_container: {
        backgroundColor: '#fff',
        borderColor: colors.outlineVariant,
        borderWidth: 1,
        margin: 10,
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
        overflow: 'hidden',
      },
    }),
  };
};
