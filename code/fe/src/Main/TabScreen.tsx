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
import CustomModal from './CustomModal';
import { useText } from './Text';
const Tab = createBottomTabNavigator();
// Bốn tab cũ đều dẫn về Work hoặc HabitTracker — hai module bị cắt — và "Khám phá"
// với "Công cụ" còn trỏ trùng vào chính màn của hai module đó. Chỉ còn "Hôm nay",
// nên thanh tab tự ẩn (`tabBarStyle.display`) và không cần chọn tab đầu theo tham số.
export const TabScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const text = useText();
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
            initialRouteName="HomeScreen"
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