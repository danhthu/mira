import moment from 'moment';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../theme';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { dateGreater, dateLesser } from '../../Common/Utils/common';
import { workRepository } from '../Entities';
import { useText } from '../Text';

type Range = 'w' | 'm' | 'y';

function rangeToDates(range: Range): { from: Date, to: Date } {
  const unit = range == 'w' ? 'isoWeek' : range == 'm' ? 'month' : 'year';
  return {
    from: moment().startOf(unit).toDate(),
    to: moment().endOf(unit).toDate(),
  };
}

/**
 * Nhìn lại một quãng: ba con số đếm được, không mẫu số nào.
 *
 * Bản Batify hiện bốn tỷ lệ phần trăm — tổng, "bắt buộc", đúng hạn, quá hạn.
 * Tỷ lệ cần một mẫu số, và mẫu số là chỗ người dùng tự chấm điểm mình; "quá hạn"
 * thì phán xét thẳng. Cả hai đi ngược ràng buộc #3 và mục "Mira KHÔNG phải là gì".
 */
export const Statistic = ({ navigation }) => {
  const text = useText();
  const style = useStyle();
  const [range, setRange] = useState<Range>('w');
  const changed = useDectectDataChanged(workRepository);

  const totals = useAsyncAction(
    async () => {
      const { from, to } = rangeToDates(range);
      const all = await workRepository.list();
      const inRange = all.filter(
        (w) =>
          w.startDate &&
          dateGreater(w.startDate, from, -1) &&
          dateLesser(w.startDate, to, 1),
      );
      return {
        done: inRange.filter((w) => w.status == 'DONE').length,
        open: inRange.filter((w) => w.status != 'DONE').length,
        unscheduled: (await workRepository.getUnscheduled()).length,
      };
    },
    [range, changed],
    { done: 0, open: 0, unscheduled: 0 },
  );

  const options: Array<{ key: Range, label: string }> = [
    { key: 'w', label: text.rangeWeek },
    { key: 'm', label: text.rangeMonth },
    { key: 'y', label: text.rangeYear },
  ];
  const { from, to } = rangeToDates(range);
  const isEmpty = totals.done + totals.open == 0;

  return (
    <View style={style.screen}>
      <View style={style.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={style.link}>{text.quaylai}</Text>
        </TouchableOpacity>
        <Text style={style.title}>{text.reviewTitle}</Text>
        <View style={style.headerSpacer} />
      </View>

      <View style={style.rangeRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[style.rangeButton, range == option.key && style.rangeButtonActive]}
            onPress={() => setRange(option.key)}
          >
            <Text
              style={range == option.key ? style.rangeTextActive : style.rangeText}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={style.rangeLabel}>
        {moment(from).format('D [tháng] M')} – {moment(to).format('D [tháng] M, YYYY')}
      </Text>

      {isEmpty ? (
        <Text style={style.empty}>{text.reviewEmpty}</Text>
      ) : (
        <View style={style.cardRow}>
          <Count label={text.countDone} value={totals.done} />
          <Count label={text.countOpen} value={totals.open} />
        </View>
      )}

      {totals.unscheduled > 0 && (
        <Text style={style.footNote}>
          {totals.unscheduled} {text.countUnscheduled}
        </Text>
      )}
    </View>
  );
};

const Count = ({ label, value }: { label: string, value: number }) => {
  const style = useStyle();
  return (
    <View style={style.card}>
      <Text style={style.cardValue}>{value}</Text>
      <Text style={style.cardLabel}>{label}</Text>
    </View>
  );
};

const useStyle = () => {
  const theme = useTheme();
  const c = theme.token;
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background, padding: theme.space.lg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: theme.space.lg,
    },
    headerSpacer: { width: 60 },
    title: { fontSize: theme.fontSize.subtitle, color: c.textPrimary },
    link: { fontSize: theme.fontSize.body, color: c.accent, width: 60 },
    rangeRow: {
      flexDirection: 'row',
      backgroundColor: c.surfaceMuted,
      borderRadius: theme.radius.pill,
      padding: theme.space.xxs,
    },
    rangeButton: {
      flex: 1,
      paddingVertical: theme.space.sm,
      alignItems: 'center',
      borderRadius: theme.radius.pill,
    },
    rangeButtonActive: { backgroundColor: c.accent },
    rangeText: { fontSize: theme.fontSize.body, color: c.textSecondary },
    rangeTextActive: { fontSize: theme.fontSize.body, color: c.textOnAccent },
    rangeLabel: {
      fontSize: theme.fontSize.caption,
      color: c.textMuted,
      textAlign: 'center',
      marginTop: theme.space.md,
    },
    cardRow: { flexDirection: 'row', marginTop: theme.space.xl },
    card: {
      flex: 1,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: theme.radius.normal,
      padding: theme.space.lg,
      marginHorizontal: theme.space.xs,
    },
    cardValue: {
      fontSize: theme.fontSize.display,
      fontWeight: theme.fontWeight.bold,
      color: c.textPrimary,
    },
    cardLabel: {
      fontSize: theme.fontSize.body,
      color: c.textSecondary,
      marginTop: theme.space.xs,
    },
    empty: {
      fontSize: theme.fontSize.body,
      color: c.textMuted,
      textAlign: 'center',
      paddingVertical: theme.space.xxl,
    },
    footNote: {
      fontSize: theme.fontSize.caption,
      color: c.textMuted,
      textAlign: 'center',
      marginTop: theme.space.xl,
    },
  });
};
