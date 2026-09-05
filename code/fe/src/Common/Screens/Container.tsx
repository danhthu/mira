
import { createStackNavigator } from '@react-navigation/stack';


import { HelpCenterScreen } from './HelpCenterScreen';
import { LineStringScreen } from './LineStringScreen';
import { PrivacyScreen } from './PrivacyScreen';
import { SettingScreen } from './SettingScreen';
import { TermScreen } from './TermScreen';
// Màn Đồng hồ cát cũng đăng ký ở đây để mục Cài đặt mở được nó ngay. Route cùng tên
// nên đăng ký thêm ở navigator gốc (`Main/MainScreen.tsx`) vẫn không đụng nhau.
import { HourglassApp } from '../../Hourglass';

const Stack = createStackNavigator();
export const Container = ({ route, navigation }) => {
  const initialRouteName = route.params && route.params.screen ? route.params.screen : 'HelpCenter';
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ cardStyle:{ flex:1 } }}>

      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
      ></Stack.Screen>

      <Stack.Screen
        name="LineString"
        component={LineStringScreen}
      ></Stack.Screen>

      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
      ></Stack.Screen>

      <Stack.Screen
        name="Setting"
        component={SettingScreen}
      ></Stack.Screen>

      <Stack.Screen
        name={HourglassApp.Routes.hourglass}
        component={HourglassApp.Screens.Overview}
        options={{ headerShown: false }}
      ></Stack.Screen>

      <Stack.Screen name="Term" component={TermScreen}></Stack.Screen>
    </Stack.Navigator>
  );
};
