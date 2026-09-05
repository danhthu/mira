import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BICon, BText as Text } from '../../../../libs/components';
import { getCurrentDay } from '../../../../libs/dateUtils';
import { Router } from '../../../../Router';
import { useTheme } from '../../../../theme';
import {
  CAPTION_HEIGHT,
  FONTSIZE,
  GRID_GUTTER,
  GROUP_MARGIN,
  ROUND_NORMAL,
} from '../../../../theme/Constraints';
import { useAsyncAction } from '../../../Common/Hooks';
import { getDay, getStartOfWeek } from '../../../Common/Utils/common';
import { Habit, habitRepository, habitTrackerRepository } from '../../Entities';
import { useColors } from '../../Styles/HomeStyle';
import { useText } from '../../Text';
import { repeateToString } from '../../Utils';
import { EmptyState } from '../HomeScreen';

/**
 * Lưới bảy ngày cho từng thói quen của tuần hiện tại.
 *
 * Bản trước đặt phía trên lưới một `WeeklyScoreView`: điểm tuần cỡ 48px kèm một
 * đến ba ngôi sao vàng, cuộn ngang qua các tuần cũ. Đó là điểm số và huy hiệu,
 * ràng buộc #3 cấm cả hai, nên component và hàm `getWeeklyScores` sau lưng nó đã
 * xoá. Lưới còn lại chỉ nói ngày nào có ghi — không tính tỷ lệ, không so tuần này
 * với tuần trước.
 */
export const WeeklyTab = () => {
  const habitColors = useColors().habitColors;
  const navigation = useNavigation();
  const text = useText();
  const habits = useAsyncAction(
    async () => await habitRepository.getHabitsForThisWeek(),
    [],
    [] as Array<Habit>,
  );

  if (habits.length == 0) {
    return (
      <EmptyState
        message={text.empty_week}
        actionText={text.empty_week_action}
        onAction={() =>
          Router.Open(navigation, 'HabitAppModal', { screen: 'Add' })
        }
      />
    );
  }

  return (
    <View>
      {habits.map((h, i) => (
        <HabitWeekView
          key={h.id}
          habit={h}
          color={habitColors[i % habitColors.length]}
        />
      ))}
    </View>
  );
};

const HabitWeekView = (props: { habit: Habit; color: string }) => {
  const text = useText();
  const colors = useTheme();
  const navigation = useNavigation<{ navigate: (name: string, params: object) => void }>();
  const days = [
    text.mon,
    text.tue,
    text.wed,
    text.thu,
    text.fri,
    text.sat,
    text.sun,
  ];
  const [marked, setMarked] = useState(days.map(() => false));

  useAsyncAction(async () => {
    const startDay = getStartOfWeek(new Date());
    const result: boolean[] = [];
    for (let i = 0; i <= 6; i++) {
      const date = getDay(moment(startDay).add(i, 'days').toDate());
      if (date.getTime() > getCurrentDay().getTime()) {
        result.push(false);
        continue;
      }
      const tracker = await habitTrackerRepository.getTracker(
        props.habit.id,
        date,
      );
      result.push(tracker?.status == 'DONE');
    }
    setMarked(result);
  }, [props.habit]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.token.surface,
      borderWidth: 1,
      borderColor: colors.token.border,
      borderRadius: ROUND_NORMAL,
      padding: ROUND_NORMAL,
      marginBottom: GROUP_MARGIN,
    },
    head: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.token.border,
      marginBottom: GRID_GUTTER / 2,
    },
    dayName: {
      fontSize: FONTSIZE.SSMALL,
      color: colors.token.textMuted,
      textAlign: 'center',
    },
    dot: {
      marginTop: 5,
      height: 30,
      width: 30,
      borderRadius: 15,
      alignSelf: 'center',
      justifyContent: 'center',
      backgroundColor: colors.token.surfaceMuted,
    },
    dotMarked: { backgroundColor: props.color },
    repeat: {
      lineHeight: CAPTION_HEIGHT,
      color: colors.token.textSecondary,
      marginRight: 3,
      fontSize: FONTSIZE.SMALL,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={{ flex: 1, lineHeight: CAPTION_HEIGHT, fontWeight: '600' }}>
          {props.habit.name}
        </Text>
        <TouchableOpacity
          style={{ alignSelf: 'flex-end', flexDirection: 'row' }}
          onPress={() =>
            navigation.navigate('Statistic.Details', { id: props.habit.id })
          }
        >
          <Text style={styles.repeat}>
            {repeateToString(props.habit.repeatOption, text)}
          </Text>
          <BICon
            name="right"
            style={{
              lineHeight: CAPTION_HEIGHT,
              color: colors.token.textSecondary,
            }}
          />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {days.map((d, i) => (
          <View key={d} style={{ flex: 1 }}>
            <Text style={styles.dayName}>{d}</Text>
            <View style={[styles.dot, marked[i] && styles.dotMarked]}>
              {marked[i] && (
                <BICon
                  name="check"
                  style={{
                    textAlign: 'center',
                    color: colors.token.textOnAccent,
                  }}
                />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
