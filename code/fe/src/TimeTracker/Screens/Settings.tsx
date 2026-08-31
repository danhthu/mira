import { TouchableOpacity, View } from 'react-native';
import { B, BText as Text } from '../../../libs/components';
import { useTheme } from '../../../theme';
import { FONT_SIZE, HEADER_HEIGHT, ICON_TOUCH_WIDTH } from '../../../theme/Constraints';
import { Background } from '../Components/Background';
import { useText } from '../Text';


import { createStackNavigator } from '@react-navigation/stack';
import { useCommonStyle } from '../../Common/Styles';
import { SettingsCat } from './Settings.Cat';
const Stack = createStackNavigator();

export const Settings = ({ route, navigation }) => {
  const initialRouteName =
    route.params && route.params.screen ? route.params.screen : 'SettingMenu';
  const colors = useTheme();
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
    >

      <Stack.Screen
        name="SettingsCat"
        component={SettingsCat}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SettingMenu"
        component={SettingsMenu}
        options={{ headerShown: false }}
        initialParams={route.params}
      />
    </Stack.Navigator>
  );
};

export const SettingsMenu = ({ route, navigation }) => {
  const style = useCommonStyle();
  return <Background style={style.screen}>
    <Header route={route} navigation={navigation} />
    <Body route={route} navigation={navigation} />
  </Background>;
};

const Body = ({ route, navigation }) => {
  const text = useText();

  return <View>
    <View>
      <Text>{text.settings_group_desc_cat || 'Thiết lập danh mục thời gian'}</Text>
      <View>
        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
          navigation.navigate('SettingsCat');
        }}>
          <B.ICon name="view-list" />
          <Text>{text.settings_group_label_cat || 'Danh mục thời gian'}</Text>
          <B.ICon name="right" />
        </TouchableOpacity>
      </View>
    </View>
  </View>;
};

const Header = ({ route, navigation }) => {
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
    </View>
  );
};

