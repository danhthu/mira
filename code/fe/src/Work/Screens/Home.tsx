import moment from 'moment';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BICon } from '../../../libs/components';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { getCurrentDay, getDay } from '../../Common/Utils/common';
import { Work, workRepository } from '../Entities';
import { useText } from '../Text';

/** Việc mới gõ ở dòng soạn nhanh mặc định thuộc về ngày đang xem. */
const newWorkOn = (name: string, day: Date): Work => ({
  ...new Work(),
  name,
  startDate: getDay(new Date(day.getTime())),
  status: 'PLAN',
});

export const Home = ({ navigation }) => {
  const text = useText();
  const style = useStyle();
  const [day, setDay] = useState(getCurrentDay());
  const changed = useDectectDataChanged(workRepository);

  const data = useAsyncAction(
    async () => {
      const ofDay = await workRepository.getListByDate(day);
      const unscheduled = await workRepository.getUnscheduled();
      return {
        open: ofDay.filter((w) => w.status != 'DONE'),
        done: ofDay.filter((w) => w.status == 'DONE'),
        unscheduled: unscheduled.length,
      };
    },
    [day, changed],
    { open: [] as Work[], done: [] as Work[], unscheduled: 0 },
  );

  const isToday = getDay(new Date(day.getTime())).getTime() == getCurrentDay().getTime();
  const shiftDay = (days: number) =>
    setDay(getDay(moment(day).add(days, 'days').toDate()));

  return (
    <View style={style.screen}>
      <View style={style.headerRow}>
        <Text style={style.title}>{text.title}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => Router.Open(navigation, 'WorkAppModal', { screen: 'Statistic' })}
        >
          <Text style={style.link}>{text.review}</Text>
        </TouchableOpacity>
      </View>

      <View style={style.dayRow}>
        <TouchableOpacity
          accessibilityLabel={text.previousDay}
          style={style.dayArrow}
          onPress={() => shiftDay(-1)}
        >
          <BICon name="left" style={style.dayArrowIcon} />
        </TouchableOpacity>
        <Text style={style.dayLabel}>
          {isToday ? text.today : moment(day).format('dddd, D [tháng] M')}
        </Text>
        <TouchableOpacity
          accessibilityLabel={text.nextDay}
          style={style.dayArrow}
          onPress={() => shiftDay(1)}
        >
          <BICon name="right" style={style.dayArrowIcon} />
        </TouchableOpacity>
        {!isToday && (
          <TouchableOpacity onPress={() => setDay(getCurrentDay())}>
            <Text style={style.link}>{text.backToToday}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Compose day={day} />

      <TouchableOpacity
        style={style.detailedAddRow}
        onPress={() =>
          Router.Open(navigation, 'WorkAppModal', {
            screen: 'Add',
            date: day.getTime(),
          })
        }
      >
        <Text style={style.link}>{text.moreOptions}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={style.listBody}>
        {data.open.length == 0 && data.done.length == 0 && (
          <Text style={style.empty}>{text.emptyDay}</Text>
        )}
        {data.open.map((w) => (
          <Item key={w.id} work={w} navigation={navigation} />
        ))}

        {data.done.length > 0 && (
          <Text style={style.groupLabel}>{text.doneGroup}</Text>
        )}
        {data.done.map((w) => (
          <Item key={w.id} work={w} navigation={navigation} />
        ))}

        {data.unscheduled > 0 && (
          <TouchableOpacity
            style={style.unscheduledRow}
            onPress={() =>
              Router.Open(navigation, 'WorkAppModal', {
                screen: 'Assign',
                date: day.getTime(),
              })
            }
          >
            <Text style={style.link}>
              {data.unscheduled} {text.countUnscheduled}
            </Text>
            <BICon name="right" style={style.rowChevron} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

/**
 * Dòng soạn nhanh, luôn hiện ở đầu danh sách. Gõ tên rồi gửi là xong — không mở
 * màn nào, không nút lưu. Ràng buộc #1 tính theo giây nhập mỗi ngày, nên đường
 * thêm việc hằng ngày không đi qua biểu mẫu; biểu mẫu đầy đủ nằm sau "thêm chi tiết".
 */
const Compose = ({ day }: { day: Date }) => {
  const text = useText();
  const style = useStyle();
  const [name, setName] = useState('');

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setName('');
    await workRepository.add(newWorkOn(trimmed, day));
    await workRepository.save();
  };

  return (
    <View style={style.composeRow}>
      <BICon name="pluscircleo" style={style.composeIcon} />
      <TextInput
        style={style.composeInput}
        placeholder={text.composePlaceholder}
        placeholderTextColor={style.placeholder.color}
        value={name}
        onChangeText={setName}
        onSubmitEditing={submit}
        returnKeyType="done"
        blurOnSubmit={false}
      />
    </View>
  );
};

const Item = ({ work, navigation }: { work: Work, navigation }) => {
  const text = useText();
  const style = useStyle();
  const isDone = work.status == 'DONE';

  const toggle = async () => {
    if (isDone) {
      await workRepository.unDone(work);
    } else {
      await workRepository.done(work);
    }
  };

  return (
    <View style={style.itemRow}>
      <TouchableOpacity
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isDone }}
        accessibilityLabel={isDone ? text.markOpen : text.markDone}
        style={style.itemToggle}
        onPress={toggle}
      >
        <BICon
          name={isDone ? 'check-circle' : 'radio-button-off-outline'}
          style={isDone ? style.itemToggleIconDone : style.itemToggleIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityLabel={text.openWorkDetail}
        style={style.itemBody}
        onPress={() =>
          Router.Open(navigation, 'WorkAppModal', { screen: 'Detail', id: work.id })
        }
      >
        <Text style={isDone ? style.itemNameDone : style.itemName}>{work.name}</Text>
      </TouchableOpacity>
      <BICon name="right" style={style.rowChevron} />
    </View>
  );
};

const useStyle = () => {
  const theme = useTheme();
  const c = theme.token;
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background, padding: theme.space.lg },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: theme.fontSize.headline,
      fontWeight: theme.fontWeight.bold,
      color: c.textPrimary,
    },
    link: { fontSize: theme.fontSize.body, color: c.accent },
    dayRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.space.sm,
      marginBottom: theme.space.md,
    },
    dayArrow: { width: 32, height: 32, justifyContent: 'center' },
    dayArrowIcon: { fontSize: theme.fontSize.body, color: c.textSecondary },
    dayLabel: {
      fontSize: theme.fontSize.body,
      color: c.textSecondary,
      minWidth: 150,
      textAlign: 'center',
    },
    composeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: theme.radius.normal,
      paddingHorizontal: theme.space.md,
    },
    composeIcon: {
      fontSize: theme.fontSize.bodyLarge,
      color: c.accent,
      marginRight: theme.space.md,
    },
    composeInput: {
      flex: 1,
      height: 46,
      fontSize: theme.fontSize.body,
      color: c.textPrimary,
    },
    placeholder: { color: c.textMuted },
    detailedAddRow: { alignSelf: 'flex-end', paddingTop: theme.space.sm },
    listBody: { paddingTop: theme.space.md, paddingBottom: theme.space.xxl },
    empty: {
      fontSize: theme.fontSize.body,
      color: c.textMuted,
      paddingVertical: theme.space.xl,
      textAlign: 'center',
    },
    groupLabel: {
      fontSize: theme.fontSize.caption,
      color: c.textMuted,
      marginTop: theme.space.xl,
      marginBottom: theme.space.xs,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: theme.radius.normal,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: theme.space.md,
      paddingVertical: theme.space.sm,
      marginBottom: theme.space.sm,
    },
    itemToggle: { width: 40, height: 40, justifyContent: 'center' },
    itemToggleIcon: { fontSize: 24, color: c.borderStrong },
    itemToggleIconDone: { fontSize: 24, color: c.positive },
    itemBody: { flex: 1, paddingVertical: theme.space.xs },
    itemName: { fontSize: theme.fontSize.body, color: c.textPrimary },
    itemNameDone: { fontSize: theme.fontSize.body, color: c.textMuted },
    rowChevron: { fontSize: theme.fontSize.caption, color: c.textMuted },
    unscheduledRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.space.xl,
      paddingVertical: theme.space.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
  });
};
