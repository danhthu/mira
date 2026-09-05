import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { DateData } from 'react-native-calendars';
import { GroupTitle } from '../../../../libs/components/GroupTitle';
import { useTheme } from '../../../../theme';
import { useAsyncAction } from '../../../Common/Hooks';
import { useCommonStyle } from '../../../Common/Styles';
import { DataMonth } from '../../Components/DataMonth';
import { DataRecord } from '../../Components/DataRecord';
import { Header } from '../../Components/Header';
import { Habit, habitRepository } from '../../Entities';
import { useText } from '../../Text';

export const StatisticDetailScreen = ({ route }) => {
  const commonStyle = useCommonStyle();
  const colors = useTheme();
  const text = useText();
  const [date, setDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  } as DateData);

  const habit = useAsyncAction(
    async () => await habitRepository.findOne((h) => h.id == route.params?.id),
    [route.params],
    null as Habit,
  );

  if (!habit) {
    return (
      <View
        style={[
          commonStyle.screen,
          { flex: 1, backgroundColor: colors.token.background },
        ]}
      >
        <Header title={text.screen_detail} />
      </View>
    );
  }

  return (
    <View
      style={[
        commonStyle.screen,
        { backgroundColor: colors.token.background, flex: 1 },
      ]}
    >
      <Header title={habit.name} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <GroupTitle label={text.month_view} actionText="" />
        <DataMonth
          habits={[habit]}
          hideTextComponent={true}
          onMonthChanged={setDate}
        />
        <GroupTitle label={text.record_view} actionText="" />
        <DataRecord
          habit={habit}
          month={date.month - 1}
          year={date.year}
        />
      </ScrollView>
    </View>
  );
};
