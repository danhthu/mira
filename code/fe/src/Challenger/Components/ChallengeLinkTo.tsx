import { useActionSheet } from '@expo/react-native-action-sheet';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, View } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import { FONT_SIZE, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { useAsyncAction, useStateData } from '../../Common/Hooks';
import { Habit, habitRepository } from '../../HabitTracker/Entities';
import { Work, workRepository } from '../../Work/Entities';
import { Challenge, ChallengeAssociate } from '../Entities';
import { useText } from '../Text';

/**
 * Gắn thử thách với những thói quen / công việc mà nó nói về.
 *
 * Bản cũ, sau khi chọn xong, còn mở một hộp thoại "thiết lập mục tiêu" bắt chọn
 * một hạn mức (50%…100% số ngày). Hạn mức đó không màn nào đọc lại, chỉ nằm
 * trong kho — một hệ chấm điểm ghi rồi bỏ đó. Đã gỡ: liên kết bây giờ chỉ nói
 * "thử thách này nói về việc kia", một chạm là xong (ràng buộc #1).
 *
 * Đây là chỗ duy nhất còn lại của module đọc sang `HabitTracker/` và `Work/` —
 * xem "Câu hỏi còn mở" trong HANDOFF.md.
 */
type LinkedRow = { associate: ChallengeAssociate; item: Habit | Work };

/** Đọc tên thật của những mục đã gắn; mục đã bị xoá ở module kia thì bỏ qua. */
const useLinkedRows = (value: ChallengeAssociate[]): LinkedRow[] =>
  useAsyncAction<LinkedRow[]>(
    async () => {
      const rows = await Promise.all(
        value.map(async (associate) => ({
          associate,
          item:
            associate.table === 'Work'
              ? await workRepository.findOne((w) => w.id === associate.tableId)
              : await habitRepository.findOne((h) => h.id === associate.tableId),
        })),
      );
      return rows.filter((row) => row.item != undefined);
    },
    [value],
    [],
  );

/** Bản chỉ đọc dùng ở màn Chi tiết — không sửa được liên kết từ đó. */
export const LinkedItemList = (props: { value: ChallengeAssociate[] }) => {
  const colors = useTheme();
  const text = useText();
  const rows = useLinkedRows(props.value);
  if (rows.length === 0)
    return (
      <Text style={{ color: colors.token.textMuted, fontSize: 13 }}>
        {text.link_empty}
      </Text>
    );
  return (
    <View>
      {rows.map((row, index) => (
        <View
          key={index}
          style={{ flexDirection: 'row', alignItems: 'center', height: TBL_ROW_HEIGHT }}
        >
          <B.ICon
            name={row.associate.option.link === 'Work' ? 'business-center' : 'heart'}
            style={{
              fontSize: FONT_SIZE.ICon,
              marginRight: 10,
              color: colors.token.textSecondary,
            }}
          />
          <Text style={{ flex: 1, color: colors.token.textPrimary }}>
            {row.item.name}
          </Text>
        </View>
      ))}
    </View>
  );
};

export const ChallengeLinkTo = (props: {
  challenge: Challenge
  value: ChallengeAssociate[]
  onChanged: (val: ChallengeAssociate[]) => void
}) => {
  const text = useText();
  const colors = useTheme();
  const nav = useNavigation();
  const [data, setData, dataRef] = useStateData([] as LinkedRow[]);

  useAsyncAction(async () => {
    const rows = await Promise.all(
      props.value.map(async (associate) => ({
        associate,
        item:
          associate.table === 'Work'
            ? await workRepository.findOne((w) => w.id === associate.tableId)
            : await habitRepository.findOne((h) => h.id === associate.tableId),
      })),
    );
    setData(rows.filter((row) => row.item != undefined));
  }, [props.value]);

  const onSelected = (table: 'Work' | 'Habit') => (item: Work | Habit) => {
    props.onChanged([
      ...dataRef.current.map((row) => row.associate),
      {
        ...new ChallengeAssociate(),
        challengeId: props.challenge.id,
        table,
        tableId: item.id,
        option: { link: table },
      },
    ]);
  };

  const { showActionSheetWithOptions } = useActionSheet();
  const onAddPress = () => {
    showActionSheetWithOptions(
      {
        options: [text.link_habit, text.link_work, text.cancel],
        message: text.link,
        cancelButtonIndex: 2,
      },
      (selectedIndex: number) => {
        const chosen = dataRef.current.map((row) => row.item.id);
        if (selectedIndex === 0) {
          Router.Open(nav, 'ChallengerApp', {
            screen: 'HabitSelection',
            data: chosen,
            onGoback: onSelected('Habit'),
          });
        }
        if (selectedIndex === 1) {
          Router.Open(nav, 'ChallengerApp', {
            screen: 'WorkSelection',
            data: chosen,
            onGoback: onSelected('Work'),
          });
        }
      },
    );
  };

  const onRemove = (row: LinkedRow) =>
    props.onChanged(
      dataRef.current
        .filter((r) => r !== row)
        .map((r) => r.associate),
    );

  return (
    <>
      <View style={{ flexDirection: 'row', height: TBL_ROW_HEIGHT }}>
        <B.ICon
          name="link"
          style={{
            marginRight: 10,
            fontSize: FONT_SIZE.InputText,
            color: colors.token.accent,
          }}
        />
        <Text
          style={{
            color: colors.token.accent,
            lineHeight: TBL_ROW_HEIGHT,
            flex: 1,
            fontSize: FONT_SIZE.InputText,
          }}
        >
          {text.link}
        </Text>
        <TouchableOpacity
          style={{ height: TBL_ROW_HEIGHT, justifyContent: 'center' }}
          onPress={onAddPress}
        >
          <B.ICon
            name="pluscircle"
            style={{ fontSize: FONT_SIZE.ICon, color: colors.token.accent }}
          />
        </TouchableOpacity>
      </View>
      {data.length === 0 && (
        <Text style={{ color: colors.token.textMuted, fontSize: 13 }}>
          {text.link_empty}
        </Text>
      )}
      {data.map((row, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.token.surface,
            borderRadius: 8,
            paddingLeft: 14,
            paddingRight: 6,
            marginBottom: 8,
          }}
        >
          <B.ICon
            name={row.associate.option.link === 'Work' ? 'business-center' : 'heart'}
            style={{
              fontSize: FONT_SIZE.ICon,
              marginRight: 10,
              color: colors.token.textSecondary,
            }}
          />
          <Text
            style={{
              flex: 1,
              lineHeight: TBL_ROW_HEIGHT,
              color: colors.token.textPrimary,
            }}
          >
            {row.item.name}
          </Text>
          <TouchableOpacity
            accessibilityLabel={text.link_remove}
            onPress={() => onRemove(row)}
            style={{
              height: TBL_ROW_HEIGHT,
              width: 44,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <B.ICon
              name="minuscircleo"
              style={{ fontSize: FONT_SIZE.ICon, color: colors.token.textMuted }}
            />
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
};
