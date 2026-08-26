import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONTSIZE, FONT_SIZE } from '../../../theme/Constraints';
import { useStateData } from '../../Common/Hooks';
import { useCommonStyle } from '../../Common/Styles';
import { Habit } from '../../HabitTracker/Entities';
import { Work } from '../../Work/Entities';
import { Background } from '../Components/Background';
import { Challenge, ChallengeAssociate } from '../Entities';
import { useText } from '../Text';
export const LinkToDetail = ({ route, navigation }) => {
  const style = useCommonStyle();
  return <Background style={style.modalScreen}>
    <Header />
    <Body route={route} onChanged={data => { console.log(data); }} />
  </Background>;
};

const Header = () => {
  const navigation = useNavigation();
  const text = useText();
  const style = useCommonStyle();
  return (
    <View>
      <View >
        <Text style={style.header.title}>{text.habitSelectionTitle || 'Chọn thói quen'}</Text>
      </View>
      <TouchableOpacity
        style={[style.header.left]}
        onPress={navigation.goBack}
      >
        <B.ICon
          name="return-up-back"
          style={{ fontSize: FONT_SIZE.PageTitle }}
        />
      </TouchableOpacity>

    </View>
  );
};


const Body = ({ route, onChanged }) => {
  type stateObject = {
    value?: string
    type?: string
    item: Habit | Work
    associate: ChallengeAssociate
    totalDays: number
    challenge: Challenge
  }
  const style = useCommonStyle();
  const colors = useTheme();
  const text = useText();
  const [state, setState, stateRef] = useStateData({} as stateObject);
  const setValue = (val: string) =>
    setState({ ...stateRef.current, value: val });
  const setType = (val: string) =>
    setState({ ...stateRef.current, type: val });
  const [visibleCustVal, setVisibleCusVal] = useState(false);
  useEffect(() => {
    const { item,
      associate,
      totalDays,
      challenge } = route.params;
    setState({
      ...stateRef.current,
      item,
      associate,
      totalDays,
      challenge,
    });

  }, [route.params]);

  let typeList = [{ value: 'DONE', text: text.done || 'Hoàn thành' }];
  let typeDefaultIndex = 0;
  let valueList = [{ value: state.totalDays, text: '' + state.totalDays }];
  let valueDefaultIndex = 0;

  if (state.associate && state.associate.option) {
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
    <>
      <View style={style.modal.modalContent}>
        <Text style={[]}>
          {text.configure_target || 'Thiết lập mục tiêu'}
        </Text>
        <TouchableOpacity
          style={{ position: 'absolute', right: 20, top: 20 }}
          onPress={() =>
            onChanged({
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
        {visibleCustVal && (
          <View>
            <B.TextBox
              dataType="string"
              onChanged={(val) => setValue(val)}
              label=""
            />
          </View>
        )}
      </View>
    </>
  );
};