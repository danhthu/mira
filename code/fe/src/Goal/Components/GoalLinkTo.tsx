import { useActionSheet } from '@expo/react-native-action-sheet';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import React, { useImperativeHandle, useRef } from 'react';
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import {
  B,
  BText as Text
} from '../../../libs/components';
import { Router } from '../../../Router';
import { useTheme } from '../../../theme';
import {
  FONT_SIZE,
  TBL_ROW_HEIGHT
} from '../../../theme/Constraints';
import { FONTSIZE, getLogger } from '../../Common';
import { useAsyncAction, useStateData } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { Habit, habitRepository } from '../../HabitTracker/Entities';
import { Work, workRepository } from '../../Work/Entities';
import { Goal, GoalAssociate } from '../Entities';
import { GoalOption } from '../Entities/GoalAssociate';
import { useText } from '../Text';

const rowHeigh = TBL_ROW_HEIGHT;
const logger = getLogger('GoalLinkTo');

export const GoalLinkTo = (props: {
  Goal: Goal
  value: GoalAssociate[]
  totalDays: number
  onChanged: (val: GoalAssociate[]) => void
}) => {
  const text = useText();
  const colors = useTheme();
  const nav = useNavigation();
  const [data, setData, dataRef] = useStateData(
    [] as Array<{ associate: GoalAssociate; item: Habit | Work }>,
  );
  useAsyncAction(async () => {
    const tmp = await Promise.all(props.value.map(async d => {
      return {
        associate: d,
        item: (d.table == 'Work' ? await workRepository.findOne(w => w.id == d.tableId) :
          await habitRepository.findOne(w => w.id == d.tableId))
      };
    }));
    setData(tmp.filter(d => d.item != undefined));
  }, [props.value]);
  const onSelection = (type: 'Work' | 'Habit') => (item: Work | Habit) => {
    props.onChanged([
      ...dataRef.current.map(d => d.associate),
      {
        goalId: props.Goal.id,
        table: type,
        tableId: item.id,
        option: {
          link: type,
          type: 'Times',
          value: props.totalDays,
        } as GoalOption,
      } as GoalAssociate,
    ]);
  };
  const { showActionSheetWithOptions } = useActionSheet();
  const onPlusPress = () => {
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
          const callback = onSelection('Work');
          Router.Open(nav, 'GoalApp', {
            screen: 'WorkSelection',
            data: dataRef.current.filter(d => d.item != undefined).map((d) => d.item.id),
            onGoback: callback,
          });
        }
        if (selectedIndex == 0) {
          const callback = onSelection('Habit');
          Router.Open(nav, 'GoalApp', {
            screen: 'HabitSelection',
            data: dataRef.current.filter(d => d.item != undefined).map((d) => d.item.id),
            onGoback: callback,
          });
        }
      },
    );
  };
  const onRemoveItemTouch = (item) => {
    setData(dataRef.current.filter((d) => d.item != item));
  };

  const onGoalTargetChanged = (associate: GoalAssociate) => {
    const exist = dataRef.current.findLast((h) => h.associate.id == associate.id);
    if (exist) {
      exist.associate = associate;
    }
    setData([...dataRef.current]);
  };
  const GoalTargetRef = useRef<GoalTargetDialogAction>();

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
            associate={associate}
            key={index}
            item={item}
            totalDays={props.totalDays}
            onDetail={() => GoalTargetRef.current.show(
              item,
              associate,
              props.totalDays,
              props.Goal,
            )}
            onDel={() => onRemoveItemTouch(item)}
          />
        ))}
        {
          <GoalTargetDialog
            onChanged={onGoalTargetChanged}
            ref={GoalTargetRef}
          />
        }
      </View>
    </>
  );
};
const RowLinkItem = (props: {
  item: Habit | Work
  associate: GoalAssociate
  totalDays: number
  onDel: () => void,
  onDetail: () => void,
}) => {
  const text = useText();
  const { item, totalDays } = props;
  const colors = useTheme();
  const isRepeat = (props.item || {}).repeatOption != null;
  const GoalTarget =
    props.associate && props.associate.option.type == 'Target'
      ? props.associate.option.value
      : isRepeat
        ? props.totalDays + ' ' + text.done || 'Done'
        : text.done || 'Done';

  {
    /* 3 column */
  }
  if (!item) return <View />;
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 4,
        paddingLeft: 16,
        paddingRight: 16,
        marginBottom: 16,
      }}
    >
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <B.ICon
          name={
            props.associate?.option?.link == 'Work'
              ? 'business-center'
              : 'heart'
          }
          style={{
            fontSize: FONT_SIZE.ICon, marginRight: 10, color: props.associate?.option?.link == 'Work'
              ? 'black'
              : 'pink'
          }}
        />
        <B.Text
          style={{
            overflow: 'hidden',
            lineHeight: rowHeigh,
            color:
              props.associate?.option.link == 'Habit'
                ? colors.tertiary
                : colors.primary,
          }}
        >
          {item.name}
        </B.Text>
      </View>
      <View>
        <TouchableOpacity
          onPress={() => {
            props.onDel();
          }}
          style={{
            height: rowHeigh,
            marginLeft: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <B.ICon
            name="minuscircleo"
            style={{ fontSize: FONT_SIZE.ICon, color: colors.error }}
          />
        </TouchableOpacity>
      </View>
      {/**
        <View style={{ width: 100, alignItems: 'flex-end' }}>
            <TouchableOpacity style={{ justifyContent: 'center', height: rowHeigh, marginLeft: 10 }}
                onPress={props.onGoalTargetPress}
            >
                <Text style={{ marginLeft: 5, color: colors.primary }}>{GoalTarget}</Text>
            </TouchableOpacity>
        </View>
         */}
    </View>
  );
};
interface GoalTargetDialogAction {
  show: (
    item: Habit | Work,
    associate: GoalAssociate,
    totalDays: number,
    Goal: Goal,
  ) => void

  hide: () => void
}
export const GoalTargetDialog = React.forwardRef(
  (props: { onChanged: (associate: GoalAssociate) => void }, ref) => {
    type stateObject = {
      visible?: boolean
      value?: string
      custVal?: boolean
      type?: string
      item: Habit | Work
      associate: GoalAssociate
      totalDays: number
      Goal: Goal
    }
    const style = useCommonStyle();
    const colors = useTheme();
    const text = useText();
    const [state, setState, stateRef] = useStateData({
      visible: false,
    } as stateObject);
    const setVisible = (val: boolean) =>
      setState({ ...stateRef.current, visible: val });
    const setValue = (val: string) =>
      setState({ ...stateRef.current, value: val });
    const setType = (val: string) =>
      setState({ ...stateRef.current, type: val });
    const show = (
      item: Habit | Work,
      associate: GoalAssociate,
      totalDays: number,
      Goal: Goal,
    ) => {

      setState({
        ...stateRef.current,
        item,
        associate,
        totalDays,
        Goal,
        visible: true,
      });
    };
    useImperativeHandle(ref, () => {
      return {
        show,
        hide: () => {
          setVisible(false);
        },
      };
    });

    let typeList = [{ value: 'DONE', text: text.done || 'Hoàn thành' }];
    let typeDefaultIndex = 0;
    let valueList = [{ value: state.totalDays, text: '' + state.totalDays }];
    let valueDefaultIndex = 0;
    if (state.associate) {
      if (state.associate.option.link == 'Work') {
        typeList = [
          { value: 'DONE', text: text.done || 'Hoàn thành' },
          { value: 'ONETIME', text: text.onTime || 'Đúng thời hạn' },
        ];
        typeDefaultIndex = 0;
        if (state.item.repeatOption) {
          valueList = [
            Math.round(state.totalDays * 0.5),
            Math.round(state.totalDays * 0.6),
            Math.round(state.totalDays * 0.7),
            Math.round(state.totalDays * 0.8),
            Math.round(state.totalDays * 0.9),

            Math.round(state.totalDays),
          ].map((d) => ({ value: d, text: d + text.days || ' days' }));
          valueDefaultIndex = 2;
        }
      }
      if (state.associate.option.link == 'Habit') {
        if ((state.item as Habit).goalOption) {
          typeList = [
            { value: 'DONE', text: text.done || 'Hoàn thành' },
            {
              value: (state.item as Habit).goalOption.unit,
              text: (state.item as Habit).goalOption.unit,
            },
          ];
          typeDefaultIndex = 0;
          const goal = (state.item as Habit).goalOption.total;
          if (state.item.repeatOption) {
            valueList = [
              Math.round(state.totalDays * goal * 0.5),
              Math.round(state.totalDays * goal * 0.6),
              Math.round(state.totalDays * goal * 0.7),
              Math.round(state.totalDays * goal * 0.8),
              Math.round(state.totalDays * goal * 0.9),

              Math.round(state.totalDays),
              -1,
            ].map((d) => ({
              value: d,
              text: d == -1 ? text.orther || 'Khác' : d + text.days || ' days',
            }));
            valueDefaultIndex = 2;
          }
        } else {
          typeList = [text.done || 'Hoàn thành'];
          typeDefaultIndex = 0;
          if (state.item.repeatOption) {
            valueList = [
              Math.round(state.totalDays * 0.5),
              Math.round(state.totalDays * 0.6),
              Math.round(state.totalDays * 0.7),
              Math.round(state.totalDays * 0.8),
              Math.round(state.totalDays * 0.9),

              Math.round(state.totalDays),
            ].map((d) => ({
              value: d,
              text: d == -1 ? text.orther || 'Khác' : d + text.days || ' days',
            }));
            valueDefaultIndex = 2;
          }
        }
      }
    }
    return (
      <Modal
        animationType="none"
        transparent
        style={style.modal.container}
        visible={state.visible}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={style.modal.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={style.modal.modalContent}>
          <Text style={[]}>
            {text.configure_target || 'Thiết lập mục tiêu'}
          </Text>
          <TouchableOpacity
            style={{ position: 'absolute', right: 20, top: 20 }}
            onPress={() =>
              props.onChanged({
                ...state.associate,
                option: {
                  value: parseInt(state.value.replace(' days', '').trim()),
                  type: state.type,
                  link: state.associate.option.link,
                },
              })
            }
          >
            <Text style={[{ color: colors.primary }]}>
              {text.done || 'Xong'}
            </Text>
          </TouchableOpacity>
          <View style={[{ flexDirection: 'row' }]}>
            <Picker
              selectedValue={state.type}
              onValueChange={(val) => setType(val)}
              style={{ flex: 1, fontSize: FONTSIZE.LARGE, textAlign: 'center' }}
            >
              {typeList.map((val, index) => (
                <Picker.Item key={index} label={val.text} value={val.value} />
              ))}
            </Picker>
            {valueList.length > 0 && (
              <Picker
                style={{
                  flex: 1,
                  fontSize: FONTSIZE.LARGE,
                  textAlign: 'center',
                }}
                selectedValue={state.value}
                onValueChange={(val) => setValue(val)}
              >
                {valueList.map((val, index) => (
                  <Picker.Item key={index} label={val.text} value={val.value} />
                ))}
              </Picker>
            )}
          </View>
          {state.custVal && (
            <View>
              <B.TextBox
                dataType="string"
                onChanged={(val) => setValue(val)}
                label=""
              />
            </View>
          )}
        </View>
      </Modal>
    );
  },
);
