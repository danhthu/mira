import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useTheme } from '../../theme';
import { IconSelectionModal } from '../Common/Screens/IconSelectionModal';
import { TabScreen } from './TabScreen';

import { LinearGradient } from 'expo-linear-gradient';
import FlashMessage from 'react-native-flash-message';
import {
  SafeAreaProvider
} from 'react-native-safe-area-context';
import { ChallengerApp } from '../Challenger';
import { RichEditorBottomModal } from '../Common/Components';
import { useSettings } from '../Common/Hooks';
import { EmotionApp } from '../Emotion';
import { GoalApp } from '../Goal';
import { HabitApp } from '../HabitTracker';
import { Home } from '../Home/Screens/Home';
import { TimeTrackerApp } from '../TimeTracker';
import { TradingScreen } from '../Trading';
import { WelcomApp } from '../Welcome';
import { WorkApp } from '../Work';
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
  const [settings, setSettings] = useSettings();
  const [route, setRoute] = useState();

  return (
    <SafeAreaProvider>
      <Background>
        <NavigationContainer>
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
            <Stack.Screen
              name="ChallengerApp"
              component={ChallengerApp.Screens.Container}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="HabitAppModal"
              component={HabitApp.Screens.Container}
              options={{ headerShown: false, presentation: 'transparentModal' }}
            />
            <Stack.Screen
              name="WorkAppModal"
              component={WorkApp.Screens.Container}
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen name="TimeApp" component={TimeTrackerApp.Screens.Container} options={{ headerShown: false }} />

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
            <Stack.Screen
              name="Trading"
              component={TradingScreen}
              options={{
                presentation: 'modal',
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
