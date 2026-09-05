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
import { useAsyncAction, useSettings } from '../Common/Hooks';
import { personRepository } from '../Common/Repositories';
import { ChallengerApp } from '../Challenger';
import { EmotionApp } from '../Emotion';
import { GoalApp } from '../Goal';
import { HabitApp } from '../HabitTracker';
import { Home } from '../Home/Screens/Home';
import { TimeTrackerApp } from '../TimeTracker';
import { TradingScreen } from '../Trading';
import { WelcomApp } from '../Welcome';
import { WorkApp } from '../Work';

// Person · Money · Hourglass tạm ẩn (chốt 2026-09-05): chúng thuộc mô hình ba trụ
// của `docs/08-three-pillars.md`, còn sản phẩm đang chạy là bốn module Batify. Code
// giữ nguyên trong `src/`, mở lại chỉ cần khai `Stack.Screen` như cũ.
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

  // Đã có người trong danh sách nghĩa là đã dùng app thật, dù cờ onboarding có thể
  // chưa được đặt (người dùng từ bản cũ, hoặc bỏ qua onboarding rồi tự thêm người).
  // Không có bước này thì bản nâng cấp sẽ ném họ về màn onboarding.
  const people = useAsyncAction(async () => personRepository.list(), [], null);
  const peopleLoaded = people !== null;

  // initialRouteName chỉ có tác dụng lúc navigator mount, nên phải chờ cả settings
  // lẫn danh sách người nạp xong mới dựng navigator.
  if (!settingsLoaded || !peopleLoaded) return null;

  const goStraightToHome = settings.hasSetupProfile === true || people.length > 0;

  return (
    <SafeAreaProvider>
      <Background>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={goStraightToHome ? 'Home' : 'Welcome'}
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

            <Stack.Screen
              name="ChallengerApp"
              component={ChallengerApp.Screens.Container}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="HabitAppModal"
              component={HabitApp.Screens.Container}
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen
              name="WorkAppModal"
              component={WorkApp.Screens.Container}
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen
              name="Trading"
              component={TradingScreen}
              options={{ presentation: 'modal', headerStyle: { backgroundColor: theme.background } }}
            />
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
