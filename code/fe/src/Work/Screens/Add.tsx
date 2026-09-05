import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { B } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { DescriptionCtrl } from '../../Common/FormControls/DescriptionCtrl';
import { ReminderCtrl } from '../../Common/FormControls/ReminderCtrl';
import { RepeatCtrl } from '../../Common/FormControls/RepeatCtrl';
import { getDay } from '../../Common/Utils/common';
import { DayPicker } from '../Components/DayPicker';
import { Work, workRepository } from '../Entities';
import { useText } from '../Text';

/**
 * Biểu mẫu đầy đủ, chỉ dùng khi việc cần hơn một cái tên. Đường thêm việc hằng
 * ngày là dòng soạn nhanh ở màn danh sách (ràng buộc #1).
 *
 * Bản Batify có mười hai control: biểu tượng, màu, ETA, mức ưu tiên, checklist,
 * thẻ, nhóm cha, liên kết mục tiêu. Chúng hoặc không có nơi hiển thị kết quả,
 * hoặc buộc `Work/` import feature khác (luật import #2). Còn lại năm thứ thật
 * sự đổi hành vi của việc: tên, ngày làm, ghi chú, lặp, nhắc.
 */
export const Add = ({ route, navigation }) => {
  const text = useText();
  const style = useStyle();
  const initialDay = route.params && route.params.date
    ? getDay(new Date(route.params.date))
    : getDay(new Date());
  const [data, setData] = useState<Work>({
    ...new Work(),
    startDate: initialDay,
    status: 'PLAN',
  });

  const save = async () => {
    if (!data.name || !data.name.trim()) return;
    await workRepository.add({ ...data, name: data.name.trim() });
    await workRepository.save();
    navigation.goBack();
  };

  return (
    <View style={style.screen}>
      <View style={style.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={style.link}>{text.cancel}</Text>
        </TouchableOpacity>
        <Text style={style.title}>{text.addTitle}</Text>
        <TouchableOpacity onPress={save}>
          <Text style={style.link}>{text.save}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={style.body}>
        <View style={style.field}>
          <B.TextBox
            label={text.name}
            value={data.name || ''}
            onChanged={(val) => setData({ ...data, name: val })}
          />
        </View>
        <View style={style.field}>
          <DayPicker
            value={data.startDate}
            onChanged={(val) => setData({ ...data, startDate: val })}
          />
        </View>
        <View style={style.field}>
          <DescriptionCtrl
            value={data.description}
            onChanged={(val) => setData({ ...data, description: val })}
          />
        </View>
        <View style={style.field}>
          <RepeatCtrl
            value={data.repeatOption}
            onChanged={(val) => setData({ ...data, repeatOption: val })}
          />
        </View>
        <View style={style.field}>
          <ReminderCtrl
            value={data.reminderOption}
            onChanged={(val) => setData({ ...data, reminderOption: val })}
          />
        </View>
      </ScrollView>
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
      paddingBottom: theme.space.md,
    },
    title: { fontSize: theme.fontSize.subtitle, color: c.textPrimary },
    link: { fontSize: theme.fontSize.body, color: c.accent },
    body: { paddingBottom: theme.space.xxl },
    field: {
      backgroundColor: c.surface,
      borderRadius: theme.radius.normal,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: theme.space.md,
      marginBottom: theme.space.sm,
    },
  });
};
