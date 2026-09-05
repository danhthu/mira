import moment from 'moment';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../theme';
import { getCurrentDay, getDay } from '../../Common/Utils/common';
import { useText } from '../Text';

/**
 * Chọn ngày làm bằng một chạm, không mở hộp thoại.
 *
 * `B.TextBox dataType="date"` của `libs/` chỉ dựng bộ chọn ngày trên native; trên
 * web nó rơi về ô chữ thường và in nguyên `Date.toString()` (hoặc chuỗi
 * "undefined" khi chưa có giá trị). Bốn lựa chọn dưới đây phủ gần hết việc của
 * một ngày, nên không cần lịch đầy đủ ở đường nhập nhanh.
 */
export const DayPicker = ({
  value,
  onChanged,
}: {
  value?: Date
  onChanged: (value?: Date) => void
}) => {
  const text = useText();
  const style = useStyle();
  const today = getCurrentDay();
  const options: Array<{ label: string, day?: Date }> = [
    { label: text.homnay, day: getDay(moment(today).toDate()) },
    { label: text.ngaymai, day: getDay(moment(today).add(1, 'days').toDate()) },
    { label: text.tuantoi, day: getDay(moment(today).add(7, 'days').toDate()) },
    { label: text.assignUnscheduled },
  ];
  const current = value ? getDay(new Date(value.getTime())).getTime() : null;

  return (
    <View>
      <Text style={style.label}>{text.startDate}</Text>
      <View style={style.row}>
        {options.map((option) => {
          const selected = option.day
            ? current == option.day.getTime()
            : current == null;
          return (
            <TouchableOpacity
              key={option.label}
              style={[style.chip, selected && style.chipSelected]}
              onPress={() => onChanged(option.day)}
            >
              <Text style={selected ? style.chipTextSelected : style.chipText}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {value && current != options[0].day.getTime() && (
        <Text style={style.hint}>{moment(value).format('dddd, D [tháng] M')}</Text>
      )}
    </View>
  );
};

const useStyle = () => {
  const theme = useTheme();
  const c = theme.token;
  return StyleSheet.create({
    label: {
      fontSize: theme.fontSize.caption,
      color: c.textMuted,
      marginBottom: theme.space.xs,
    },
    row: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.space.md,
      paddingVertical: theme.space.sm,
      marginRight: theme.space.sm,
      marginBottom: theme.space.xs,
    },
    chipSelected: { backgroundColor: c.accent, borderColor: c.accent },
    chipText: { fontSize: theme.fontSize.body, color: c.textSecondary },
    chipTextSelected: { fontSize: theme.fontSize.body, color: c.textOnAccent },
    hint: {
      fontSize: theme.fontSize.caption,
      color: c.textSecondary,
      marginTop: theme.space.xs,
    },
  });
};
