import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useRef, useState } from 'react';
import { FlatList, LayoutAnimation, ScrollView, View } from 'react-native';
import { sortBy } from 'sort-by-typescript';
import { BICon, BText as Text } from '../../../libs/components';
import { AddButtonBottom } from '../../../libs/components/AddButtonBottom';
import { Link } from '../../../libs/components/Link';
import { getCurrentDay, getDay } from '../../../libs/dateUtils';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import { HEADER_HEIGHT } from '../../../theme/Constraints';
import {
  CalendarRef,
  CCalendarStrip,
} from '../../Common/Components/CCalendarStrip';
import { useAsyncAction } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { HabitItem } from '../Components/HabitItem';
import {
  Habit,
  habitRepository,
  HabitTracker,
  habitTrackerRepository,
} from '../Entities';
import { useColors } from '../Styles/HomeStyle';
import { useText } from '../Text';

export const HomeScreen = ({ navigation }) => {
  const [day, setDay] = useState(getCurrentDay());
  const [visibleMonth, setVisibleMonth] = useState(moment(getCurrentDay()));
  const habitColors = useColors();
  const calendarRef = useRef<CalendarRef>();
  const text = useText();
  const commonStyle = useCommonStyle();
  const colors = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: habitColors.bg }}>
      <View
        style={[
          { backgroundColor: habitColors.bg },
          commonStyle.screen,
          { paddingLeft: 0, paddingRight: 0, paddingBottom: 0 },
        ]}
      >
        <View style={{ height: HEADER_HEIGHT, flexDirection: 'row' }}>
          <Link
            style={{
              lineHeight: HEADER_HEIGHT,
              paddingLeft: 16,
              width: 110,
              color: colors.token.textSecondary,
            }}
            onPress={() =>
              navigation.navigate('Statistic', { screen: 'Statistic.Home' })
            }
          >
            {text.screen_statistic}
          </Link>
          <Text
            style={{
              flex: 1,
              lineHeight: HEADER_HEIGHT,
              textAlign: 'center',
              color: habitColors.textColor,
            }}
          >
            {visibleMonth.format('MM/YYYY')}
          </Text>
          <Link
            style={{
              lineHeight: HEADER_HEIGHT,
              paddingRight: 16,
              width: 110,
              textAlign: 'right',
              color: colors.token.textSecondary,
            }}
            onPress={() => {
              calendarRef.current.scrollToDate(getCurrentDay());
              setDay(getCurrentDay());
            }}
          >
            {text.today}
          </Link>
        </View>
        <CCalendarStrip
          style={{ backgroundColor: habitColors.bg_calendar }}
          selectedDay={day}
          onDateSelected={(date) => setDay(date.toDate())}
          ref={calendarRef}
          onWeekScrollStartChanged={(start) => setVisibleMonth(start)}
          renderHeader={() => null}
        />
      </View>
      <ScrollView style={{ padding: 16, paddingTop: 24 }}>
        <Body day={day} />
      </ScrollView>
      <AddButtonBottom
        onPlusClick={() =>
          Router.Open(navigation, 'HabitAppModal', { screen: 'Add' })
        }
      />
    </View>
  );
};

const Body = (props: { day: Date }) => {
  const colors = useTheme();
  const text = useText();
  const navigation = useNavigation();
  const habitColors = useColors();
  const [data, setData] = useState(
    [] as Array<{ habit: Habit; tracker: HabitTracker }>,
  );

  const loadData = async (day: Date) => {
    const marked = getDay(day);
    const trackers = await habitTrackerRepository.filter(
      (tr) => tr.day == marked.getTime(),
    );
    setData(
      (await habitRepository.getListByDate(marked))
        .map((h) => ({
          habit: h,
          // 'CREATED' là trạng thái "chưa ghi" thật của HabitTracker; sắp
          // tăng dần nên nó đứng trước 'DONE'.
          tracker:
            trackers.findLast((t) => t.hid == h.id) ||
            Object.assign(new HabitTracker(h.id, marked.getTime()), {
              status: 'CREATED' as const,
            }),
        }))
        .sort(sortBy('tracker.status')),
    );
  };

  const doneChanged = async (item: Habit, done: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (done) {
      await habitTrackerRepository.doneTracker(item.id, props.day);
    } else {
      await habitTrackerRepository.unDoneTracker(item.id, props.day);
    }
    await loadData(props.day);
  };

  useAsyncAction(
    async () => {
      await loadData(props.day);
      return [];
    },
    [props.day],
    [] as [],
  );

  if (data.length == 0) {
    return (
      <EmptyState
        message={text.empty_habit}
        actionText={text.empty_habit_action}
        onAction={() =>
          Router.Open(navigation, 'HabitAppModal', { screen: 'Add' })
        }
      />
    );
  }

  return (
    <FlatList
      data={data}
      scrollEnabled={false}
      keyExtractor={(item) => item.habit.id}
      renderItem={({ item, index }) => (
        <View
          style={{
            backgroundColor: colors.hexToRGB(
              habitColors.habitColors[index % habitColors.habitColors.length],
              0.12,
            ),
            marginBottom: 8,
            paddingLeft: 16,
            borderRadius: 16,
            height: 70,
            justifyContent: 'center',
          }}
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
      )}
    />
  );
};

/**
 * Trạng thái rỗng dùng chung cho mọi màn của module: một câu mô tả trung tính và
 * đúng một hành động. Bản Batify cũ đặt ở đây ảnh mặt buồn (`no_habit.png`) và tô
 * câu thông báo bằng `colors.error` — hai cách nói "bạn làm chưa đủ" mà ràng buộc
 * #3 cấm. Ảnh đã xoá khỏi Assets, màu chữ về `textSecondary`.
 */
export const EmptyState = (props: {
  message: string
  actionText: string
  onAction: () => void
}) => {
  const colors = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 24 }}>
      <BICon
        name="pluscircle"
        style={{
          fontSize: 28,
          color: colors.token.borderStrong,
          marginBottom: 12,
        }}
      />
      <Text
        style={{
          textAlign: 'center',
          marginBottom: 12,
          color: colors.token.textSecondary,
        }}
      >
        {props.message}
      </Text>
      <Link onPress={props.onAction} style={{ textAlign: 'center' }}>
        {props.actionText}
      </Link>
    </View>
  );
};
