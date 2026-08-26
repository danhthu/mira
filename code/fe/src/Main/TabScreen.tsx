import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useTheme } from '../../theme';
import { HomeScreen } from '../Home';

import { FontICon } from '../../libs/components/Icon';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';
import { SheetProvider } from 'react-native-actions-sheet';
import {
  useSafeAreaInsets
} from 'react-native-safe-area-context';
import { BICon } from '../../libs/components';
import { HabitApp } from '../HabitTracker';
import * as WorkApp from '../Work';
import CustomModal from './CustomModal';
import { useText } from './Text';
const Tab = createBottomTabNavigator();
export const TabScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  console.log('tabscreen');
  const theme = useTheme();
  const text = useText();
  const initialRouteName = route.params.screen || 'Tools';
  console.log(initialRouteName);
  return (
    <View
      style={[{
        // paddingTop: insets.top,
        // paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        flex: 1,
      }]}
    >
      <BottomSheetModalProvider>
        <SheetProvider >
          <Tab.Navigator
            sceneContainerStyle={{ backgroundColor: theme.primary }}
            //safeAreaInsets={{bottom:0}}
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: styles.tabBar,
              tabBarActiveTintColor: theme.primary,
              tabBarInactiveTintColor: 'black',
            })}
            initialRouteName={initialRouteName}
          >
            <Tab.Screen
              name="HomeScreen"
              component={HomeScreen}

              options={{

                headerShown: false,
                tabBarLabel: text.app_today || 'Hôm nay',
                tabBarIcon: ({ color, size }) => (
                  <FontICon name="calendar-today" color={color} size={size} />
                ),
                tabBarStyle: {
                  display: 'none',
                },

              }}
            />
            <Tab.Screen
              name="WorkApp"
              component={WorkApp.Screens.Container}
              options={{
                headerShown: false,
                tabBarLabel: text.app_work || 'Công việc',
                tabBarIcon: ({ color, size }) => (
                  <FontICon name="work-outline" color={color} size={size} />
                ),
              }}
            />

            <Tab.Screen
              name="Discover"
              component={WorkApp.Screens.Container}
              options={{
                headerShown: false,
                tabBarLabel: text.app_discover || 'Khám phá',
                tabBarIcon: ({ color, size }) => (
                  <BICon name="search" color={color} size={size} />
                ),
              }}
            />

            <Tab.Screen
              name="HabitApp"
              component={HabitApp.Screens.Container}
              options={{
                headerShown: false,
                tabBarLabel: text.app_habit || 'Thói quen',

                tabBarIcon: ({ color, size }) => (
                  <BICon name="self-improvement" color={color} size={size} />
                ),
              }}
            />

            <Tab.Screen
              name="H"
              component={HabitApp.Screens.Container}
              options={{
                headerShown: false,
                tabBarLabel: text.app_tools || 'Công cụ',
                tabBarIcon: ({ color, size }) => (
                  <BICon name="grid-outline" color={color} size={size} />
                ),
              }}
            />

          </Tab.Navigator>
        </SheetProvider>
      </BottomSheetModalProvider>
      <CustomModal />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    position: 'absolute',

    borderTopWidth: 0,
    elevation: 0,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255,0.3)', // Adjust the transparency here
  },
});