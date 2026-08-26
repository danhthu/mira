import { TouchableOpacity, View } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONT_SIZE, FONT_WEIGHT, HEADER_HEIGHT, ICON_TOUCH_WIDTH } from '../../../theme/Constraints';
import { useStateData } from '../../Common/Hooks';
import { Background } from '../Components/Background';
import { useText } from '../Text';
export const Statistic = ({ route, navigation }) => {
  const onSave = () => { };
  const [data, setData] = useStateData({});
  return <Background>
    <Header route={route} navigation={navigation} onSave={onSave} />
    <Body route={route} navigation={navigation} setData={setData} data={data} />
  </Background>;
};

const Body = ({ route, navigation, data, setData }) => {
  return <View />;
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

