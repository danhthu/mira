import { createStackNavigator } from '@react-navigation/stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BText as Text } from '../../../../libs/components';
import { useTheme } from '../../../../theme';
import {
  FONTSIZE,
  GROUP_MARGIN,
  ROUND_NORMAL,
} from '../../../../theme/Constraints';
import { useCommonStyle } from '../../../Common/Styles';
import { Header } from '../../Components/Header';
import { useText } from '../../Text';
import { StatisticDetailScreen } from './StatisticDetail';
import { OverallTab } from './StatisticOverall';
import { WeeklyTab } from './StatisticWeekly';

const Stack = createStackNavigator();

/**
 * Bản trước có ba tab: Hôm nay, Hàng tuần, Tổng thể.
 *
 * Tab "Hôm nay" là vòng tròn điểm số — số to ở giữa cùng câu "your daily habits
 * are not completed" và một dòng "điểm hôm nay giảm x% so với hôm qua" nền đỏ.
 * Gỡ cơ chế chấm điểm đi thì tab đó không còn nói được gì mà màn danh sách chưa
 * nói rõ hơn, nên bỏ hẳn thay vì để lại một vòng tròn rỗng.
 */
export const StatisticScreen = ({ route }) => {
  const initialRouteName =
    route.params && route.params.sub
      ? 'Statistic.' + route.params.sub
      : 'Statistic.Home';
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
        options={{ headerShown: false }}
        component={Home}
      />
      <Stack.Screen
        name="Statistic.Details"
        initialParams={route.params}
        component={StatisticDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const Home = () => {
  const commonStyle = useCommonStyle();
  const text = useText();
  const colors = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <View
      style={[
        commonStyle.screen,
        { flex: 1, backgroundColor: colors.token.background },
      ]}
    >
      <Header title={text.screen_statistic} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <Tab
          activeIndex={activeIndex}
          labels={[text.tab_week, text.tab_overall]}
          onChanged={setActiveIndex}
        />
        {activeIndex == 0 && <WeeklyTab />}
        {activeIndex == 1 && <OverallTab />}
      </ScrollView>
    </View>
  );
};

const Tab = (props: {
  activeIndex: number
  labels: Array<string>
  onChanged: (index: number) => void
}) => {
  const colors = useTheme();
  const styles = StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: colors.token.surfaceMuted,
      borderRadius: ROUND_NORMAL,
      padding: 4,
      marginBottom: GROUP_MARGIN,
    },
    item: { flex: 1, padding: 6, borderRadius: ROUND_NORMAL },
    itemActive: { backgroundColor: colors.token.accent },
    label: {
      textAlign: 'center',
      lineHeight: 26,
      fontSize: FONTSIZE.NORMAL,
      color: colors.token.textSecondary,
    },
    labelActive: { color: colors.token.textOnAccent },
  });
  return (
    <View style={styles.bar}>
      {props.labels.map((label, index) => (
        <TouchableOpacity
          key={label}
          style={[
            styles.item,
            props.activeIndex == index && styles.itemActive,
          ]}
          onPress={() => props.onChanged(index)}
        >
          <Text
            style={[
              styles.label,
              props.activeIndex == index && styles.labelActive,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
