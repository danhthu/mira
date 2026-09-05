import moment from 'moment';
import { View } from 'react-native';
import { BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import {
  BORDER_ROUND,
  FONT_SIZE,
  FONT_WEIGHT,
  PADDING,
  TBL_ROW_HEIGHT,
} from '../../../theme/Constraints';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { Habit, habitRepository, habitTrackerRepository } from '../Entities';
import { useText } from '../Text';

/**
 * Bảng số liệu của một thói quen trong một tháng.
 *
 * Bản trước liệt kê 'Perfect Days', 'OverallRate' và 'MonthlyRate' — nhãn tiếng
 * Anh, và cả ba đều là tỷ lệ hoàn thành: một mẫu số để đối chiếu, tức là chấm
 * điểm. Ở đây chỉ còn số đếm và khối lượng thật người dùng đã ghi.
 */
export const DataRecord = (props: {
  habit: Habit
  month: number
  year: number
}) => {
  const colors = useTheme();
  const text = useText();
  const deps = [
    useDectectDataChanged(habitRepository),
    useDectectDataChanged(habitTrackerRepository),
    props.habit,
    props.month,
    props.year,
  ];

  const rows = useAsyncAction<Array<{ label: string; value: number; unit?: string }>>(
    async () => {
      const records = (
        await habitTrackerRepository.filter(
          (h) => h.status == 'DONE' && h.hid == props.habit.id,
        )
      ).sort((a, b) => a.day - b.day);
      const inMonth = (day: number) =>
        moment(new Date(day)).isSame(
          new Date(props.year, props.month, 1),
          'month',
        );
      const monthRecords = records.filter((h) => inMonth(h.day));
      const volume = (list: typeof records) =>
        list.map((h) => h.data?.goal?.done || 0).reduce((a, b) => a + b, 0);

      const result: Array<{ label: string; value: number; unit?: string }> = [
        { label: text.days_this_month, value: monthRecords.length },
        { label: text.total_marked, value: records.length },
      ];
      if (props.habit.goalOption && props.habit.goalOption.enable) {
        const unit = props.habit.goalOption.unit;
        const days = new Set(records.map((h) => h.day)).size;
        result.push(
          { label: text.volume_this_month, value: volume(monthRecords), unit },
          { label: text.volume_total, value: volume(records), unit },
          {
            label: text.volume_daily,
            value: days == 0 ? 0 : Math.floor(volume(records) / days),
            unit,
          },
        );
      }
      return result;
    },
    deps,
    [],
  );

  if (rows.length == 0) {
    return (
      <View style={{ padding: PADDING.ELEMENT }}>
        <Text style={{ color: colors.token.textSecondary }}>
          {text.empty_record}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        borderRadius: BORDER_ROUND.NORMAL,
        borderWidth: 1,
        backgroundColor: colors.token.surface,
        borderColor: colors.token.border,
        padding: PADDING.ELEMENT,
      }}
    >
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={{
            flexDirection: 'row',
            height: TBL_ROW_HEIGHT,
            alignItems: 'center',
            borderTopWidth: index == 0 ? 0 : 1,
            borderTopColor: colors.token.border,
          }}
        >
          <Text style={{ flex: 1 }}>{row.label}</Text>
          <Text style={{ fontWeight: FONT_WEIGHT.SEMIBOLD }}>
            {row.value}
            {row.unit ? (
              <Text style={{ fontSize: FONT_SIZE.SecondaryText }}>
                {' ' + row.unit}
              </Text>
            ) : null}
          </Text>
        </View>
      ))}
    </View>
  );
};
