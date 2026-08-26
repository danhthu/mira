import { TouchableOpacity, View } from 'react-native';
import { useAsyncAction, useStateData } from '../../Common/Hooks';
import { TimeData } from '../Entities/TimeData';
import { timeCatRepository, timeDataRepository } from '../Entities/repositories';
import { Background } from '../Components/Background';
import { useCommonStyle } from '../../Common/Styles';
import { useText } from '../Text';
import { useTheme } from '../../../theme';
import { FONT_SIZE, FONT_WEIGHT, HEADER_HEIGHT, ICON_TOUCH_WIDTH } from '../../../theme/Constraints';
import { B } from '../../../libs/components';
import { BText as Text } from '../../../libs/components';
import RNPickerSelect from 'react-native-picker-select';
import { RepeatCtrl } from '../../Common/FormControls/RepeatCtrl';
export const Add = ({ route, navigation }) => {
  const style = useCommonStyle();
  const text = useText();
  const [data, setData, dataRef] = useStateData(new TimeData);
  const cats = useAsyncAction(async () => {
    return await timeCatRepository.list();
  }, [], []);
  const onSave = async () => {
    await timeDataRepository.addOrUpdate(dataRef.current);
    navigation.goBack();
  };
  return <Background style={style.modalScreen}>
    <Header route={route} navigation={navigation} onSave={onSave}></Header>
    <View>
      <B.TextBox value={data.label} label={text.label || 'Tên'} onChanged={val => setData({ ...data, label: val })} />
      <B.TextBox value={data.minut} dataType="number" label={text.minut || 'Thời gian'} onChanged={val => setData({ ...data, label: val })} />
      <RNPickerSelect
        value={data.catId}
        placeholder={text.choose_cat || 'Chọn time '}
        onValueChange={(value) => setData({ ...data, catId: value })}
        items={cats.map(c => ({ label: c.label, value: c.id }))}
      />
      <B.TextBox dataType="date" value={data.day} label={text.day || 'Ngày'} onChanged={val => setData({ ...data, day: val })} />
      <View style={style.sectionContainer}>
        <RepeatCtrl
          value={data.repeatOption}
          onChanged={(val) => setData({ ...data, repeatOption: val })}
        />
      </View>
    </View>
  </Background>;
};

const Header = ({ route, navigation, onSave }) => {
  const text = useText();
  const colors = useTheme();
  return (
    <View>
      <View >
        <Text style={{ lineHeight: HEADER_HEIGHT, textAlign: 'center', fontSize: FONT_SIZE.PageTitle }}>{text.add_title || 'Add Time Usage'}</Text>
      </View>
      <TouchableOpacity
        style={[
          {
            width: ICON_TOUCH_WIDTH,
            height: HEADER_HEIGHT,
            justifyContent: 'center',
            alignItems: 'flex-start',
            position: 'absolute',
            top: 0,
            left: 0
          }
        ]}
        onPress={navigation.goBack}
      >
        <B.ICon
          name="return-up-back"
          style={{ fontSize: FONT_SIZE.PageTitle }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          {
            width: ICON_TOUCH_WIDTH + 16,
            height: HEADER_HEIGHT - 12,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 6,
            right: 0,
            paddingLeft: 8,
            paddingRight: 8,
            backgroundColor: colors.secondary,
            borderRadius: HEADER_HEIGHT / 2,
          },
        ]}
        onPress={onSave}
      >
        <Text style={{ fontSize: FONT_SIZE.Text, color: colors.onSecondary, fontWeight: FONT_WEIGHT.SEMIBOLD }}>{text.save || 'Lưu'}</Text>
      </TouchableOpacity>
    </View>
  );
};