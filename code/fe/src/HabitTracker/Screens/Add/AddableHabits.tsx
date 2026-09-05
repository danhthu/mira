import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import iconifyAssets from '../../../../assets/iconifyAssets';
import { BICon, BText as Text } from '../../../../libs/components';
import { getDay } from '../../../../libs/dateUtils';
import { useTheme } from '../../../../theme';
import { FONTSIZE, ROUND_BIG, ROUND_NORMAL } from '../../../../theme/Constraints';
import { AssetManagement } from '../../Assets/';
import { Habit, HabitTemplate, habitRepository } from '../../Entities';

/** Mẫu kèm cờ đã-có-trong-danh-sách; `owned` không phải trạng thái của tracker. */
export type AddableTemplate = HabitTemplate & { owned?: boolean };

/**
 * Một chạm vào dấu cộng là thói quen đã nằm trong danh sách hôm nay.
 *
 * Mẫu được chép sang một `Habit` mới với `created_date` là hôm nay; mọi trường
 * riêng của bảng mẫu (`group`, `collection`, ... ) bị bỏ lại để bản ghi lưu đúng
 * hình dạng `Habit` như mọi thói quen tự đặt — không thêm khoá mới nào vào kho.
 */
export const AddableHabits = ({
  habits = [],
  onAdded,
}: {
  habits: Array<AddableTemplate>
  onAdded: () => void
}) => {
  const colors = useTheme();
  const styles = StyleSheet.create({
    image_container: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: { width: 24, height: 24 },
    title: {
      lineHeight: 50,
      height: 50,
      fontSize: FONTSIZE.NORMAL,
      color: colors.token.textPrimary,
      flex: 1,
    },
    row: { flexDirection: 'row', marginBottom: ROUND_NORMAL },
    action: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const add = async (template: AddableTemplate) => {
    const habit: Habit = {
      ...new Habit(),
      name: template.name,
      description: template.description,
      icon: template.icon,
      color: template.color,
      repeatOption: template.repeatOption,
      goalOption: template.goalOption,
      created_date: getDay(new Date()).getTime(),
    };
    await habitRepository.add(habit);
    await habitRepository.save();
    onAdded();
  };

  return (
    <FlatList
      scrollEnabled={false}
      data={habits}
      keyExtractor={(item, index) => item.id || String(index)}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View
            style={[
              { flex: 1, flexDirection: 'row', borderRadius: ROUND_BIG },
              { backgroundColor: colors.token.surfaceMuted },
            ]}
          >
            <View style={styles.image_container}>
              <Image
                style={styles.image}
                source={
                  iconifyAssets[item.icon] || AssetManagement.habit_default
                }
              />
            </View>
            <Text style={styles.title}>{item.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.action}
            disabled={!!item.owned}
            onPress={() => add(item)}
          >
            <BICon
              name={item.owned ? 'checkcircle' : 'pluscircle'}
              style={{
                fontSize: 20,
                color: item.owned
                  ? colors.token.positive
                  : colors.token.accent,
              }}
            />
          </TouchableOpacity>
        </View>
      )}
    />
  );
};
