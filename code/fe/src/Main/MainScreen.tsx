import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useTheme } from '../../theme';
import { Container as SettingContainer } from '../Common/Screens/Container';
import { IconSelectionModal } from '../Common/Screens/IconSelectionModal';
import { TabScreen } from './TabScreen';

import { LinearGradient } from 'expo-linear-gradient';
import FlashMessage from 'react-native-flash-message';
import {
  SafeAreaProvider
} from 'react-native-safe-area-context';
import { RichEditorBottomModal } from '../Common/Components';
import { useSettings } from '../Common/Hooks';
import { EmotionApp } from '../Emotion';
import { GoalApp } from '../Goal';
import { Home } from '../Home/Screens/Home';
import { MoneyApp } from '../Money';
import { TimeTrackerApp } from '../TimeTracker';
import { WelcomApp } from '../Welcome';
import { useText } from './Text';


const Background = ({ children }) => {
  const colors = useTheme();
  return <LinearGradient colors={[colors.hexToRGB(colors.primaryColors[500], 0.5), colors.hexToRGB(colors.primaryColors[500], 0.03)]} style={{ flex: 1 }}>
    {children}
  </LinearGradient>;
};
const Stack = createStackNavigator();
export const MainScreen = () => {
  const theme = useTheme();
  const text = useText();
  const [settings, setSettings, settingsLoaded] = useSettings();
  const [route, setRoute] = useState();

  // initialRouteName chỉ có tác dụng lúc navigator mount, nên phải chờ settings
  // nạp xong — không thì người dùng cũ lần nào mở app cũng bị đưa về Welcome.
  if (!settingsLoaded) return null;

  return (
    <SafeAreaProvider>
      <Background>
        <NavigationContainer>
          {/* Work · HabitTracker · Challenger · Trading không còn đăng ký ở đây: Mira
              không phải app năng suất (`docs/00-vision.md`), cờ `mandatory` của Work là
              cơ chế áp lực ngược ràng buộc cứng #3, còn Trading là tính năng gốc Batify.
              Thư mục của chúng vẫn nằm nguyên trong `src/` chờ đợt dọn file. */}
          <Stack.Navigator
            initialRouteName={settings.is_first_init ? 'Home' : 'Welcome'}
          >
            <Stack.Screen
              name="Welcome"
              component={WelcomApp.Screens.Home}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={Home}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TabScreen"
              component={TabScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="EmotionApp"
              component={EmotionApp.Screens.Container}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="GoalApp"
              component={GoalApp.Screens.Container}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GoalAppModal"
              component={GoalApp.Screens.Container}
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen name="TimeApp" component={TimeTrackerApp.Screens.Container} options={{ headerShown: false }} />
            <Stack.Screen name="MoneyApp" component={MoneyApp.Screens.Container} options={{ headerShown: false }} />
            {/* Container của Common (Setting/Privacy/Term/HelpCenter) trước đây không được
                đăng ký ở navigator nào — màn Cài đặt (có công tắc đồng bộ) không có đường vào. */}
            <Stack.Screen name="SettingApp" component={SettingContainer} options={{ headerShown: false }} />

            <Stack.Screen
              name="IconSelectionModal"
              component={IconSelectionModal}
              options={{
                presentation: 'modal',
                headerStyle: { backgroundColor: theme.background },
              }}
            />

            <Stack.Screen
              name="RichEditorBottomModal"
              component={RichEditorBottomModal}
              options={{
                presentation: 'modal',
                headerShown: false,
                headerStyle: { backgroundColor: theme.background },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>



      </Background>
      <FlashMessage
        position="bottom"
        textStyle={{ textAlign: 'center', }}
        floating={true}
        titleStyle={{ textAlign: 'center' }}
      />
      {/* <--- here as the last component */}
    </SafeAreaProvider>

  );
};
