import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { groupBy } from '../../../../libs/arrayUtils';
import { BICon, BText as Text } from '../../../../libs/components';
import { Router } from '../../../../Router';
import { useTheme } from '../../../../theme';
import {
  CAPTION_HEIGHT,
  FONTSIZE,
  GRID_GUTTER,
  GROUP_MARGIN,
  ROUND_NORMAL,
  ROUND_SMALL,
} from '../../../../theme/Constraints';
import { useAsyncAction } from '../../../Common/Hooks';
import { getDay } from '../../../Common/Utils/common';
import { Habit, habitRepository, habitTrackerRepository } from '../../Entities';
import { useColors } from '../../Styles/HomeStyle';
import { useText } from '../../Text';
import { repeateToString } from '../../Utils';
import { EmptyState } from '../HomeScreen';

const WEEKS_SHOWN = 15;

export const OverallTab = () => {
  const navigation = useNavigation();
  const text = useText();
  const habits = useAsyncAction(
    async () => await habitRepository.list(),
    [],
    [] as Array<Habit>,
  );
  if (habits.length == 0) {
    return (
      <EmptyState
        message={text.empty_overall}
        actionText={text.empty_overall_action}
        onAction={() =>
          Router.Open(navigation, 'HabitAppModal', { screen: 'Home' })
        }
      />
    );
  }
  return (
    <View>
      <Totals />
      {habits.map((h, i) => (
        <HabitHeatmap key={h.id} habit={h} index={i} />
      ))}
    </View>
  );
};

/**
 * Ba con số đếm được.
 *
 * Bản trước là bốn ô: "Success Rate", "Perfect days", "Total days done",
 * "Completed habits" — và hai ô đầu khởi tạo bằng số bịa (`successRate: 92`,
 * `completedHabits: 7`) nên trước khi dữ liệu thật về, màn hình hiện 92% cho một
 * người chưa ghi ngày nào. Tỷ lệ và "ngày hoàn hảo" đều là cách chấm điểm, đã bỏ
 * cùng với `getRecord`; ba ô còn lại chỉ đếm, và khởi tạo bằng 0.
 */
const Totals = () => {
  const text = useText();
  const colors = useTheme();
  const data = useAsyncAction(
    async () =>
      await habitTrackerRepository.getTotals(
        new Date().getMonth(),
        new Date().getFullYear(),
      ),
    [],
    { totalMarks: 0, daysMarked: 0, marksThisMonth: 0 },
  );
  const styles = StyleSheet.create({
    row: { flexDirection: 'row', marginBottom: GROUP_MARGIN },
    box: {
      flex: 1,
      borderRadius: ROUND_NORMAL,
      backgroundColor: colors.token.surface,
      borderWidth: 1,
      borderColor: colors.token.border,
      padding: GRID_GUTTER / 2,
      marginRight: 8,
    },
    label: { color: colors.token.textSecondary, fontSize: FONTSIZE.SMALL },
    value: {
      fontWeight: '600',
      lineHeight: 34,
      fontSize: FONTSIZE.Title,
      color: colors.token.textPrimary,
    },
  });
  const boxes = [
    { label: text.total_marked, value: data.totalMarks },
    { label: text.total_days, value: data.daysMarked },
    { label: text.days_this_month, value: data.marksThisMonth },
  ];
  return (
    <View style={styles.row}>
      {boxes.map((b) => (
        <View key={b.label} style={styles.box}>
          <Text style={styles.label}>{b.label}</Text>
          <Text style={styles.value}>{b.value}</Text>
        </View>
      ))}
    </View>
  );
};

/**
 * Lưới 15 tuần × 7 ngày cho một thói quen: ô đậm là ngày có ghi, ô nhạt là ngày
 * không. Bản trước đặt sẵn một mã màu dải đỏ viết cứng làm nền mặc định của ô;
 * nó bị đè trong mọi nhánh nên không ai thấy, nhưng vẫn nằm đó chờ lộ ra khi có
 * nhánh mới — nay lấy từ token màu của chính thói quen.
 */
const HabitHeatmap = (props: { habit: Habit; index: number }) => {
  const text = useText();
  const colors = useTheme();
  const habitColors = useColors().habitColors;
  const color = habitColors[props.index % habitColors.length];
  const navigation = useNavigation<{ navigate: (name: string, params: object) => void }>();
  const [marked, setMarked] = useState(
    Array.from({ length: WEEKS_SHOWN * 7 }, () => false),
  );
  const days = [
    text.mon,
    text.tue,
    text.wed,
    text.thu,
    text.fri,
    text.sat,
    text.sun,
  ];

  useAsyncAction(async () => {
    const cells = Array.from({ length: WEEKS_SHOWN * 7 }, () => false);
    const today = new Date().getDay();
    const lastIndex = WEEKS_SHOWN * 7 - 1 - (7 - (today == 0 ? 7 : today));
    const trackers = groupBy(
      await habitTrackerRepository.filter((t) => t.hid == props.habit.id),
      (tr) => tr.day,
    );
    for (let i = lastIndex; i >= 0; i--) {
      const dayValue = getDay(
        moment(new Date()).add(i - lastIndex, 'days').toDate(),
      ).getTime();
      cells[i] = !!trackers.findLast((tr) => tr.key == dayValue);
    }
    setMarked(cells);
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
    cell: {
      height: 16,
      borderRadius: ROUND_SMALL / 2,
      margin: 1,
      backgroundColor: colors.hexToRGB(color, 0.15),
    },
    cellMarked: { backgroundColor: color },
    dayLabel: {
      color: colors.token.textMuted,
      fontSize: FONTSIZE.SSSMALL,
      lineHeight: 18,
      width: 20,
    },
    repeat: {
      lineHeight: CAPTION_HEIGHT,
      color: colors.token.textSecondary,
      marginRight: 5,
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
        <View>
          {days.map((d) => (
            <Text key={d} style={styles.dayLabel}>
              {d}
            </Text>
          ))}
        </View>
        {Array.from({ length: WEEKS_SHOWN }, (_, w) => (
          <View key={w} style={{ flex: 1 }}>
            {days.map((_d, i) => (
              <View
                key={i}
                style={[styles.cell, marked[w * 7 + i] && styles.cellMarked]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};
