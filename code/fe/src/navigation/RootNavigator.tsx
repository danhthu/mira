import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TodayScreen from '@/features/today/screens/TodayScreen';
import HourglassScreen from '@/features/hourglass/screens/HourglassScreen';
import MomentsScreen from '@/features/moments/screens/MomentsScreen';
import SettingsScreen from '@/features/settings/screens/SettingsScreen';
import { vi } from '@/i18n/vi';
import type { MainTabParamList } from '@/shared/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B5BDB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { borderTopColor: '#F3F4F6' },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{ tabBarLabel: vi.nav.today }}
      />
      <Tab.Screen
        name="Hourglass"
        component={HourglassScreen}
        options={{ tabBarLabel: vi.nav.hourglass }}
      />
      <Tab.Screen
        name="Moments"
        component={MomentsScreen}
        options={{ tabBarLabel: vi.nav.moments }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: vi.nav.settings }}
      />
    </Tab.Navigator>
  );
}

export default RootNavigator;
