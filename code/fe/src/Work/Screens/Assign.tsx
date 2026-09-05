import moment from 'moment';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BICon } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { getCurrentDay, getDay } from '../../Common/Utils/common';
import { Work, workRepository } from '../Entities';
import { useText } from '../Text';

/**
 * Xếp việc chưa có ngày vào một ngày. Chạm một lần là ghi ngay — bản Batify gom
 * thay đổi vào state rồi ghi trong hàm dọn của `useEffect`, nên thoát bằng cử chỉ
 * vuốt hay tắt app giữa chừng là mất hết.
 */
export const Assign = ({ route, navigation }) => {
  const text = useText();
  const style = useStyle();
  const day = route.params && route.params.date
    ? getDay(new Date(route.params.date))
    : getCurrentDay();
  const changed = useDectectDataChanged(workRepository);

  const data = useAsyncAction(
    async () => await workRepository.getUnscheduled(),
    [changed],
    [] as Work[],
  );

  const assign = async (work: Work) => {
    await workRepository.setDayWillDo(work, new Date(day.getTime()));
  };

  return (
    <View style={style.screen}>
      <View style={style.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={style.link}>{text.quaylai}</Text>
        </TouchableOpacity>
        <Text style={style.title}>
          {text.assignTitle} {moment(day).format('D [tháng] M')}
        </Text>
        <View style={style.headerSpacer} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={style.empty}>{text.assignEmpty}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={style.row} onPress={() => assign(item)}>
            <Text style={style.rowName}>{item.name}</Text>
            <BICon name="pluscircleo" style={style.rowIcon} />
          </TouchableOpacity>
        )}
      />
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: theme.radius.normal,
      padding: theme.space.md,
      marginBottom: theme.space.sm,
    },
    rowName: { flex: 1, fontSize: theme.fontSize.body, color: c.textPrimary },
    rowIcon: { fontSize: theme.fontSize.bodyLarge, color: c.accent },
    empty: {
      fontSize: theme.fontSize.body,
      color: c.textMuted,
      textAlign: 'center',
      paddingVertical: theme.space.xxl,
    },
  });
};
