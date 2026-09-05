import moment from 'moment';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { B } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { DescriptionCtrl } from '../../Common/FormControls/DescriptionCtrl';
import { ReminderCtrl } from '../../Common/FormControls/ReminderCtrl';
import { RepeatCtrl } from '../../Common/FormControls/RepeatCtrl';
import { useAsyncAction } from '../../Common/Hooks';
import { getCurrentDay } from '../../Common/Utils/common';
import { DayPicker } from '../Components/DayPicker';
import { Work, workRepository } from '../Entities';
import { useText } from '../Text';

/**
 * Xem và sửa một việc trong cùng một màn. Batify tách `Detail` (chỉ xem, kèm
 * thanh phần trăm ghi vào `did` mà không màn nào đọc) và `Edit` (biểu mẫu gần
 * trùng `Add`); hai màn cộng lại vẫn thiếu chỗ sửa tên nếu vào từ danh sách.
 */
export const Detail = ({ route, navigation }) => {
  const text = useText();
  const style = useStyle();
  const [data, setData] = useState<Work>(null);

  useAsyncAction(async () => {
    setData(await workRepository.findById(route.params.id));
  }, [route.params]);

  if (!data) return <View style={style.screen} />;

  const isDone = data.status == 'DONE';

  const save = async () => {
    await workRepository.addOrUpdate(data);
    navigation.goBack();
  };

  const toggleDone = async () => {
    if (isDone) {
      await workRepository.unDone(data);
      showMessage({ type: 'info', message: text.reopened });
    } else {
      await workRepository.done(data);
      showMessage({ type: 'success', message: text.done });
    }
    navigation.goBack();
  };

  const moveToTomorrow = async () => {
    await workRepository.setDayWillDo(
      data,
      moment(getCurrentDay()).add(1, 'days').toDate(),
    );
    showMessage({ type: 'info', message: text.moved });
    navigation.goBack();
  };

  const remove = () => {
    Alert.alert(text.confirmRemove, null, [
      {
        text: text.ok,
        onPress: async () => {
          await workRepository.delete(data);
          showMessage({ type: 'info', message: text.removed });
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={style.screen}>
      <View style={style.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={style.link}>{text.cancel}</Text>
        </TouchableOpacity>
        <Text style={style.title}>{text.detailTitle}</Text>
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

        <TouchableOpacity style={style.primaryAction} onPress={toggleDone}>
          <Text style={style.primaryActionText}>
            {isDone ? text.markOpen : text.markDone}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.secondaryAction} onPress={moveToTomorrow}>
          <Text style={style.secondaryActionText}>{text.moveToTomorrow}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.removeAction} onPress={remove}>
          <Text style={style.removeActionText}>{text.remove}</Text>
        </TouchableOpacity>
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
    primaryAction: {
      backgroundColor: c.accent,
      borderRadius: theme.radius.normal,
      paddingVertical: theme.space.md,
      alignItems: 'center',
      marginTop: theme.space.lg,
    },
    primaryActionText: { color: c.textOnAccent, fontSize: theme.fontSize.body },
    secondaryAction: {
      backgroundColor: c.accentSurface,
      borderRadius: theme.radius.normal,
      paddingVertical: theme.space.md,
      alignItems: 'center',
      marginTop: theme.space.sm,
    },
    secondaryActionText: { color: c.textPrimary, fontSize: theme.fontSize.body },
    removeAction: {
      paddingVertical: theme.space.md,
      alignItems: 'center',
      marginTop: theme.space.lg,
    },
    // `destructive` là token duy nhất được phép "nặng", dành riêng cho xoá vĩnh viễn.
    removeActionText: { color: c.destructive, fontSize: theme.fontSize.body },
  });
};
