import { TouchableOpacity, View } from 'react-native';
import { useAsyncAction, useSettings, useStateData } from '../../Common/Hooks';
import { useText } from '../Text';
import { useTheme } from '../../../theme';
import { FONT_SIZE, FONT_WEIGHT, HEADER_HEIGHT, ICON_TOUCH_WIDTH } from '../../../theme/Constraints';
import { B, BText as Text } from '../../../libs/components';
import { Background } from '../Components/Background';
import { useCommonStyle } from '../../Common/Styles';
import { TimeData } from '../Entities/TimeData';
import { timeDataRepository } from '../Entities/repositories';
import moment from 'moment';
export const Detail = ({ route,navigation })=>{
  const text = useText();
  const [data,setData,dataRef] = useStateData({} as TimeData);
  const [settings] = useSettings();
  const style = useCommonStyle();
  useAsyncAction(async()=>{
    const id = route.params.id;
    setData(await timeDataRepository.findOne(d=>d.id==id));
  },[route.params]);
  const onDeleted=async ()=>{
    await timeDataRepository.delete2(t=>t.id==data.id);
    navigation.goBack();
  };
  if(!data) return <View />;
  return <Background style={style.modalPadding}>
    <Header route={route} navigation={navigation}  />
    <View>
      <Text>{moment(data.day).format(settings.dateFormat)}</Text>
      <Text>{data.label}</Text>
      <Text>{data.minut}</Text>
      <Text>{data.catId}</Text>
    </View>
    <TouchableOpacity onPress={onDeleted}>
      <Text>{text.deleted||'Deleted'}</Text>
    </TouchableOpacity>
  </Background>;
};


const Header = ({ route, navigation }) => {
  const text = useText();
  const colors = useTheme();
  return (
    <View>
      <View >
        <Text style={{ lineHeight: HEADER_HEIGHT, textAlign: 'center', fontSize: FONT_SIZE.PageTitle }}>{text.detail_title || 'Thời gian sử dụng'}</Text>
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

    </View>
  );
};