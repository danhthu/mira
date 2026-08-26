import moment from 'moment';
import { useState } from 'react';
import { ColorValue, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BICon, BText as Text } from '../../../../libs/components';
import {
  BLACK_COLOR,
  CAPTION_HEIGHT,
  FONTSIZE,
  GRAY_COLOR,
  GRID_GUTTER,
  GROUP_MARGIN,
  ROUND_NORMAL,
  SECOND_BLACK_COLOR,
  WHITE_COLOR,
} from '../../../../theme/Constraints';

import { useNavigation } from '@react-navigation/native';
import { getCurrentDay } from '../../../../libs/dateUtils';
import { useAsyncAction } from '../../../Common/Hooks';
import { getDay, getStartOfWeek } from '../../../Common/Utils/common';
import { WeeklyScoreView } from '../../Components/WeekScore';
import { Habit, habitRepository, habitTrackerRepository } from '../../Entities';
import { useColors } from '../../Styles/HomeStyle';
import { useText } from '../../Text';
import { repeateToString } from '../../Utils';

export const WeeklyTab = () => {
  const [state, setState] = useState({ habits: [], start: new Date });
  const habitColors = useColors().habitColors;
  useAsyncAction(async () => {
    setState({ ...state, habits: await habitRepository.getHabitsForThisWeek() });
  }, []);

  return (
    <View>
      <View style={{ alignItems: 'center' }}>
        <WeeklyScoreView width={200} onWeekChanged={async (start, end) => {
          setState({ habits: await habitRepository.getHabitsForThisWeek({ start, end }), start: start });
        }} />
      </View>
      {state.habits.map((h, i) => (
        <HabitWeekView
          key={i}
          habit={h}
          start={state.start}
          color={habitColors[i % habitColors.length]}
        />
      ))}
    </View>
  );
};

const HabitWeekView = (props: { habit: Habit; color: ColorValue, start?: Date, end?: Date }) => {
  const text = useText();
  const navigation = useNavigation<any>();
  const days = [
    text.Mon || 'Mon',
    text.Tue || 'Tue',
    text.Web || 'Web',
    text.Thu || 'Thu',
    text.Fri || 'Fri',
    text.Sat || 'Sat',
    text.Sun || 'Sun',
  ];
  const [data, setData] = useState(
    Array.from({ length: days.length }).map((i, index) => ({
      status: false,
    })) as Array<{ status: boolean }>,
  );
  useAsyncAction(async () => {
    if (props.habit) {
      const startDay = props.start ? getStartOfWeek(props.start) : getStartOfWeek(new Date);
      for (let i = 0; i <= 6; i++) {
        const date = getDay(
          moment((startDay))
            .add(i, 'days')
            .toDate(),
        );
        const status = (
          await habitTrackerRepository.getTracker(props.habit.id, date)
        )?.status;
        data[i] = date.getTime() > getCurrentDay().getTime() ? { status: false } : status == 'DONE' ? { status: true } : { status: false };
      }

      setData([...data]);
    }
  }, [props.habit, props.start]);

  const styles = StyleSheet.create({
    dayComponentContainer: { flex: 1 },
    dayNameContainer: {},
    dayName: {
      fontSize: FONTSIZE.SSMALL,
      color: SECOND_BLACK_COLOR,
      textAlign: 'center',
    },
    dayValueContainer: {
      marginTop: 5,
      height: 30,
      width: 30,
      borderRadius: 15,
      alignSelf: 'center',
      justifyContent: 'center',
      backgroundColor: WHITE_COLOR,
    },
    dayValueContainerActived: {
      backgroundColor: props.color,
    },
    dayValue: {
      fontSize: FONTSIZE.NORMAL,
    },
  });

  return (
    <View
      style={{
        backgroundColor: GRAY_COLOR,
        borderRadius: ROUND_NORMAL,
        padding: ROUND_NORMAL,
        paddingLeft: ROUND_NORMAL * 1.5,
        paddingRight: ROUND_NORMAL * 1.5,
        marginBottom: GROUP_MARGIN,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          paddingLeft: 5,

          borderBottomWidth: 1,
          borderBottomColor: BLACK_COLOR,
          marginBottom: GRID_GUTTER / 2,
        }}
      >
        <Text
          style={{ flex: 1, lineHeight: CAPTION_HEIGHT, fontWeight: 'bold' }}
        >
          {props.habit?.name}
        </Text>
        <TouchableOpacity
          style={{ alignSelf: 'flex-end', flexDirection: 'row' }}
          onPress={() => {
            navigation.navigate('Statistic.Details', { habit: props.habit });
          }}
        >
          <Text
            style={{
              lineHeight: CAPTION_HEIGHT,
              color: SECOND_BLACK_COLOR,
              marginRight: 3,
            }}
          >
            {repeateToString(props.habit.repeatOption)}
          </Text>
          <BICon
            name="right"
            style={{
              lineHeight: CAPTION_HEIGHT,
              color: SECOND_BLACK_COLOR,
            }}
          />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {days.map((d, i) => (
          <View key={i} style={styles.dayComponentContainer}>
            <View style={styles.dayNameContainer}>
              <Text style={styles.dayName}>{d}</Text>
            </View>
            <View
              style={[
                styles.dayValueContainer,
                data[i].status && styles.dayValueContainerActived,
              ]}
            >
              {data[i].status && <BICon style={styles.dayValue} name="check" />}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};


