import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BText as Text } from '../../../../libs/components';
import {
  BLACK_COLOR,
  FONTSIZE,
  GRAY_COLOR,
  GROUP_MARGIN,
  ROUND_NORMAL,
  WHITE_COLOR
} from '../../../../theme/Constraints';

import { createStackNavigator } from '@react-navigation/stack';
import { useState } from 'react';
import { useCommonStyle } from '../../../Common/Styles';
import { Header } from '../../Components/Header';
import { useText } from '../../Text';
import { StatisticDetailScreen } from './StatisticDetail';
import { OverallTab } from './StatisticOverall';
import { TodayTab } from './StatisticToday';
import { WeeklyTab } from './StatisticWeekly';

const Stack = createStackNavigator();

export const StatisticScreen = ({ route, navigation }) => {
  const initialRouteName =
    route.params && route.params.sub ? 'Statistic.' + route.params.sub : 'Statistic.Home';
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerBackTitleVisible: false,
        cardStyle: { flex: 1 },
      }}
    >
      <Stack.Screen
        name="Statistic.Home"
        options={{ title: 'Statistic', headerShown: false }}
        component={Home}
      />
      <Stack.Screen
        name="Statistic.Details"
        initialParams={route.params}
        component={StatisticDetailScreen}
        options={{ title: 'Statistic', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const Home = () => {
  const commonStyle = useCommonStyle();
  const text = useText();
  const styles = StyleSheet.create({
    tab_today: {
      backgroundColor: '#fff',
    },
    tab_weekly: {
      backgroundColor: '#fff',
    },
    tab_overall: {
      backgroundColor: '#ddd',
    },
  });
  const [activeIndex, setActivedIndex] = useState(0);
  return (
    <View
      style={[
        commonStyle.screen,
        { flex: 1 },
        activeIndex == 0
          ? styles.tab_today
          : activeIndex == 1
            ? styles.tab_weekly
            : styles.tab_overall,
      ]}
    >
      <Header title={text.Statistic || 'Statistic'} />
      <ScrollView
        contentContainerStyle={[{ paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: 60 }}>
          <Tab
            onTabIndexChanged={(index) => setActivedIndex(index)}
            activedIndex={activeIndex}
          />
        </View>
        {activeIndex == 0 && <TodayTab />}
        {activeIndex == 1 && <WeeklyTab />}
        {activeIndex == 2 && <OverallTab />}
      </ScrollView>
    </View>
  );
};

const Tab = (
  props: { activedIndex?; onTabIndexChanged?} = {
    activedIndex: 0,
    onTabIndexChanged: (index) => { },
  },
) => {
  const text = useText();
  const styles = StyleSheet.create({
    activedBg: {
      backgroundColor: BLACK_COLOR,
      borderRadius: ROUND_NORMAL,
    },
    activedText: {
      color: WHITE_COLOR,
    },
    bg: {
      backgroundColor: GRAY_COLOR,
      justifyContent: 'center',
      flex: 1,
      padding: GROUP_MARGIN / 4,
    },
    text: {
      color: BLACK_COLOR,
      textAlign: 'center',
      lineHeight: 30,
      fontSize: FONTSIZE.NORMAL,
    },
  });
  return (
    <View
      style={[
        styles.bg,
        {
          flexDirection: 'row',
          borderRadius: ROUND_NORMAL,
          marginBottom: GROUP_MARGIN,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => props.onTabIndexChanged(0)}
        style={[
          styles.bg,
          {
            borderTopLeftRadius: ROUND_NORMAL,
            borderBottomLeftRadius: ROUND_NORMAL,
          },
          props.activedIndex == 0 && styles.activedBg,
        ]}
      >
        <Text
          style={[styles.text, props.activedIndex == 0 && styles.activedText]}
        >
          {text.Today || 'Today'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.onTabIndexChanged(1)}
        style={[styles.bg, props.activedIndex == 1 && styles.activedBg]}
      >
        <Text
          style={[styles.text, props.activedIndex == 1 && styles.activedText]}
        >
          {text.Weekly || 'Weekly'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.onTabIndexChanged(2)}
        style={[
          styles.bg,
          {
            borderTopRightRadius: ROUND_NORMAL,
            borderBottomRightRadius: ROUND_NORMAL,
          },
          props.activedIndex == 2 && styles.activedBg,
        ]}
      >
        <Text
          style={[styles.text, props.activedIndex == 2 && styles.activedText]}
        >
          {text.overall || 'Overall'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
