import { useActionSheet } from '@expo/react-native-action-sheet';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { B } from '../../../libs/components';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import { FONT_SIZE, FONTSIZE, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { Challenge } from '../../Challenger/Entities';
import { useStateData } from '../../Common/Hooks';
import { Goal } from '../../Goal/Entities';
import { useText } from '../Text';
const rowHeigh = TBL_ROW_HEIGHT;
export const LinkTo = () => {
  const colors = useTheme();
  const text = useText();
  const [data, setData, dataRef] = useStateData([]);
  const nav = useNavigation();
  const { showActionSheetWithOptions } = useActionSheet();
  const onSelection = (type: 'Challenge' | 'Goal') => (item: Challenge | Goal) => { };
  const onPlusPress = useCallback(() => {
    showActionSheetWithOptions(
      {
        options: [
          text.LinkActionTypeHabit || 'Liên kết thói quen',
          text.LinkActionTypeWork || 'Liên kết công việc',
          text.LinkActionSheetCancel || 'Hủy',
        ],
        message: text.LinkActionSheet || 'Chọn liên kết',
        cancelButtonIndex: 2,
        messageTextStyle: {
          textAlign: 'center',
          fontSize: FONTSIZE.NORMAL,
          alignSelf: 'center',
        },
      },
      (selectedIndex: number) => {
        if (selectedIndex == 1) {
          const callback = onSelection('Challenge');
          Router.Open(nav, 'GoalApp', {
            screen: 'WorkSelection',
            data: dataRef.current.filter(d => d.item != undefined).map((d) => d.item.id),
            onGoback: callback,
          });
        }
        if (selectedIndex == 0) {
          const callback = onSelection('Goal');
          Router.Open(nav, 'GoalApp', {
            screen: 'HabitSelection',
            data: dataRef.current.filter(d => d.item != undefined).map((d) => d.item.id),
            onGoback: callback,
          });
        }
      },
    );
  }, []);
  const onRemoveItemTouch = (item) => {
    setData(dataRef.current.filter((d) => d.item != item));
  };

  return (
    <>
      {/**row link */}
      <View style={{ flexDirection: 'row', height: rowHeigh }}>
        <B.ICon
          name="link"
          style={{
            marginRight: 10,
            fontSize: FONT_SIZE.InputText,
            color: colors.primary,
          }}
        />
        <B.Text
          style={{ color: colors.primary, lineHeight: rowHeigh, flex: 1, fontSize: FONT_SIZE.InputText }}
        >
          {text.lienket || 'Liên kết'}
        </B.Text>
        <TouchableOpacity
          style={{
            alignSelf: 'flex-end',
            height: rowHeigh,
            justifyContent: 'center',
          }}
          onPress={onPlusPress}
        >
          <B.ICon
            name="pluscircle"
            style={{ fontSize: FONTSIZE.NORMAL, color: colors.primary }}
          />
        </TouchableOpacity>
      </View>
      {/**list */}
      <View>
        {data.map(({ item, associate }, index) => (
          <RowLinkItem
            key={index}
            item={item}

            onDel={() => onRemoveItemTouch(item)}
          />
        ))}
      </View>
    </>
  );
};

const RowLinkItem = (props: {
  item: Goal | Challenge,
  onDel: () => void

}) => {
  return <View />;
};