import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TodayScreen from '@/features/today/screens/TodayScreen';
import MomentsScreen from '@/features/moments/screens/MomentsScreen';
import MeScreen from '@/features/me/screens/MeScreen';
import MoneyScreen from '@/features/money/screens/MoneyScreen';
import GoalsScreen from '@/features/goals/screens/GoalsScreen';
import HourglassScreen from '@/features/hourglass/screens/HourglassScreen';
import MoodScreen from '@/features/mood/screens/MoodScreen';
import HealthScreen from '@/features/health/screens/HealthScreen';
import ConnectScreen from '@/features/connect/screens/ConnectScreen';
import SpaceScreen from '@/features/space/screens/SpaceScreen';
import LegacyScreen from '@/features/legacy/screens/LegacyScreen';
import LearningScreen from '@/features/learning/screens/LearningScreen';
import ItemsScreen from '@/features/items/screens/ItemsScreen';
import SettingsScreen from '@/features/settings/screens/SettingsScreen';
import { vi } from '@/i18n/vi';
import { colors } from '@/shared/theme/tokens';
import type { MainTabParamList, MeStackParamList } from '@/shared/types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const MeStack = createNativeStackNavigator<MeStackParamList>();

/**
 * Tab "Tôi" là một stack chứ không phải màn hình phẳng: tám module ít dùng hơn
 * mở chồng lên từ đây, thay vì chen hết vào thanh tab dưới cùng.
 */
function MeNavigator() {
  return (
    <MeStack.Navigator screenOptions={{ headerShown: true }}>
      <MeStack.Screen name="MeHome" component={MeScreen} options={{ title: vi.me.title }} />
      <MeStack.Screen name="Hourglass" component={HourglassScreen} options={{ title: vi.nav.hourglass }} />
      <MeStack.Screen name="Mood" component={MoodScreen} options={{ title: vi.mood.title }} />
      <MeStack.Screen name="Health" component={HealthScreen} options={{ title: vi.health.title }} />
      <MeStack.Screen name="Connect" component={ConnectScreen} options={{ title: vi.connect.title }} />
      <MeStack.Screen name="Space" component={SpaceScreen} options={{ title: vi.space.title }} />
      <MeStack.Screen name="Legacy" component={LegacyScreen} options={{ title: vi.legacy.title }} />
      <MeStack.Screen name="Learning" component={LearningScreen} options={{ title: vi.learning.title }} />
      <MeStack.Screen name="Items" component={ItemsScreen} options={{ title: vi.items.title }} />
      <MeStack.Screen name="Settings" component={SettingsScreen} options={{ title: vi.nav.settings }} />
    </MeStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.borderSubtle },
      }}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ tabBarLabel: vi.nav.today }} />
      <Tab.Screen name="Money" component={MoneyScreen} options={{ tabBarLabel: vi.money.tabLabel }} />
      <Tab.Screen name="Goals" component={GoalsScreen} options={{ tabBarLabel: vi.goals.tabLabel }} />
      <Tab.Screen name="Moments" component={MomentsScreen} options={{ tabBarLabel: vi.nav.moments }} />
      <Tab.Screen name="Me" component={MeNavigator} options={{ tabBarLabel: vi.me.tabLabel }} />
    </Tab.Navigator>
  );
}

export default RootNavigator;
