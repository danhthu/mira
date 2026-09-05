import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutAnimation,
  ScrollView,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { sortBy } from 'sort-by-typescript';
import { Router } from '../../../Router';
import { BICon, BText as Text } from '../../../libs/components';
import { AddButtonBottom } from '../../../libs/components/AddButtonBottom';
import { Link } from '../../../libs/components/Link';
import { Cel, Row } from '../../../libs/components/Row';
import { getCurrentDay, getDay } from '../../../libs/dateUtils';
import { useTheme } from '../../../theme';
import { useAsyncAction } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { HabitItem } from '../Components/HabitItem';
import {
  Habit,
  habitRepository,
  HabitTracker,
  habitTrackerRepository,
} from '../Entities';
import { useText } from '../Text';

import moment from 'moment';
import { HEADER_HEIGHT } from '../../../theme/Constraints';
import { CalendarRef, CCalendarStrip } from '../../Common/Components/CCalendarStrip';
import { useColors } from '../Styles/HomeStyle';

export const HomeScreen = ({ navigation }) => {
  const [state, setState] = useState({ day: getCurrentDay(), tag: 'all' });
  const { day, tag } = state;
  const habitColors = useColors();
  const onPlusClick = () => {
    Router.Open(navigation, 'HabitAppModal', { screen: 'Add' });
  };
  return (
    <View style={{ flex: 1, backgroundColor: habitColors.bg }}>
      <Header
        day={day}
        tag={tag}
        onTagChanged={(tag) => setState({ tag, day: day })}
        onDayChanged={(day) => {
          setState({ day: day, tag: 'all' });
          console.log('homescreen_daychanged', day);
        }}
      />
      <ScrollView style={{ padding: 16, paddingTop: 30 }}>
        <Body day={day} tag={tag}></Body>
      </ScrollView>
      <AddButtonBottom onPlusClick={onPlusClick}></AddButtonBottom>
    </View>
  );
};

const Header = (props: {
  day: Date
  tag: string
  onTagChanged: (tag) => void
  onDayChanged: (date) => void
}) => {
  const habitColors = useColors();
  const commonStyle = useCommonStyle();
  return (
    <View
      style={[
        {
          //marginTop: 100,
          backgroundColor: habitColors.bg,
        },
        commonStyle.screen,
        { paddingLeft: 0, paddingRight: 0, paddingBottom: 0 },
      ]}
    >
      <CaptionRow
        selectedDay={props.day}
        onDateSelected={props.onDayChanged}
      ></CaptionRow>
    </View>
  );
};

const CaptionRow = (props: {
  onDateSelected?: (date: Date) => void
  selectedDay: Date
  style?: StyleProp<ViewStyle>
}) => {
  //marked
  const habitColors = useColors();
  const style = useCommonStyle().header;
  const navigation = useNavigation();
  const t = useText().translate;
  const calendarRef = useRef<CalendarRef>();
  const [visibleWeekEndDate, setVisibleWeekEndDate] = useState(moment(props.selectedDay).endOf('isoWeek'));
  return (
    <>
      <View
        style={[{ height: HEADER_HEIGHT, backgroundColor: habitColors.bg }]}
      >
        <Text
          style={[
            { lineHeight: HEADER_HEIGHT, textAlign: 'center', color: '#000' },
          ]}
        >
          {visibleWeekEndDate.format('MMM YYYY')}
        </Text>
        <TouchableOpacity
          style={[style.left]}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
        >
          <BICon name="menu" style={[style.icon, { color: '#000' }]}></BICon>
        </TouchableOpacity>
        <TouchableOpacity
          style={[style.right, { width: 'auto', right: 16 }]}
          onPress={() => {
            //console.log(calendarRef.current)
            calendarRef.current.scrollToDate(moment().toDate());
            props.onDateSelected(moment().toDate());
          }}
        >
          <Text>{t('Today')}</Text>
        </TouchableOpacity>
      </View>
      <CCalendarStrip

        style={{ backgroundColor: habitColors.bg_calendar }}
        selectedDay={props.selectedDay}
        onDateSelected={date => {
          console.log(['CaptionRow', 'onDateSelected', date]);
          props.onDateSelected(date.toDate());
        }}
        ref={calendarRef}
        onWeekScrollStartChanged={start => {
          setVisibleWeekEndDate(start.add(7, 'days'));
        }}
        renderHeader={() => null}
      />

    </>
  );
};

const Body = (props: {
  tag?: string
  day: Date
  styles?: StyleProp<ViewStyle>
}) => {
  const colors = useTheme();
  const text = useText();
  const navigation = useNavigation();
  const habitColors = useColors();
  const [data, setData] = useState([] as Array<{ habit; tracker }>);

  // Hàm để di chuyển phần tử đến vị trí chỉ định
  const doneChanged = async (item: Habit, done: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (done) {
      await habitTrackerRepository.doneTracker(item.id, props.day);
    } else {
      await habitTrackerRepository.unDoneTracker(item.id, props.day);
    }

    await loadData(props.day);
  };
  const loadData = async (day) => {
    day = getDay(day);
    const trackers = await habitTrackerRepository.filter(
      (tr) => day && tr.day == day.getTime(),
    );

    const habits = (await habitRepository.getListByDate(day || new Date()))
      .map((h) => ({
        habit: h,
        tracker: trackers.findLast((t) => t.hid == h.id) || {
          ...new HabitTracker(h.id, (day || new Date()).getTime()),
          status: 'NOT_WORK',
        },
      }))
      .sort(sortBy('-tracker.status')); //bug fix o day
    setData(habits);
  };
  useAsyncAction(
    async () => {
      if (props.day) {
        await loadData(props.day);
      }
      return [];
    },
    [props.day],
    [] as [],
  );

  const RenderItem = ({ item, index }) => {
    return (
      <View
        //entering={FadeIn.delay(500)} // Hiệu ứng khi phần tử xuất hiện
        //exiting={FadeOut.delay(1000)} // Hiệu ứng khi phần tử bị xóa
        //layout={Layout.springify()} // Hiệu ứng layout khi sắp xếp lại
        style={[
          {
            //borderWidth: 1,
            backgroundColor: colors.hexToRGB(
              habitColors.habitColors[index % habitColors.habitColors.length],
              0.25,
            ),
            marginBottom: 8,
            paddingLeft: 16,
            borderRadius: 16,
            height: 70,
            justifyContent: 'center',
          },
        ]}
      >
        <HabitItem
          color={
            habitColors.habitColors[index % habitColors.habitColors.length]
          }
          item={item.habit}
          tracker={item.tracker}
          day={props.day}
          onChanged={(done) => doneChanged(item.habit, done)}
        />
      </View>
    );
  };
  return (
    <View>
      <FlatList
        data={data}
        scrollEnabled={false}
        style={[props.styles]}
        keyExtractor={(item) => item.habit.id}
        ItemSeparatorComponent={() => null}
        renderItem={RenderItem}
      ></FlatList>
      {/**empty */}
      {data.length == 0 && (
        <Row
          style={{ paddingLeft: 16, paddingRight: 16, borderBottomWidth: 0 }}
        >
          <Cel style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', marginBottom: 10 }}>
              <Image
                source={require('../Assets/no_habit.png')}
                style={{ width: 80, height: 80 }}
              />
            </View>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                marginBottom: 10,
                color: colors.error,
              }}
            >
              {text.no_habit || 'Chưa có thói quen nào.'}
            </Text>
            <Link
              onPress={() => {
                Router.Open(navigation, 'HabitAppModal', { screen: 'Add' });
              }}
              style={{ flex: 1, textAlign: 'center' }}
            >
              {text.no_habit_callaction ||
                'Nhấn dấu cộng để thêm thói quen đầu tiên.'}
            </Link>
          </Cel>
        </Row>
      )}
    </View>
  );
};
