import { View } from 'react-native';


import { useState } from 'react';

import { GroupTitle } from '../../../../libs/components/GroupTitle';
import { getLogger } from '../../../Common';

import { DateData } from 'react-native-calendars';
import { useAsyncAction } from '../../../Common/Hooks';
import { useCommonStyle } from '../../../Common/Styles';
import { DataMonth } from '../../Components/DataMonth';
import { DataRecord } from '../../Components/DataRecord';
import { Header } from '../../Components/Header';
import { habitRepository } from '../../Entities';
import { useText } from '../../Text';
const logger = getLogger('StatisticScreen');


export const StatisticDetailScreen = ({ route }) => {
  console.log('detail statistic');
  const commonStyle = useCommonStyle();
  const text = useText();
  const [date, setDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  } as DateData);

  //filter by route
  const habit = useAsyncAction(async () => {
    console.log(route.params);
    return await habitRepository.findOne(h => h.id == route.params?.id);
    // return hs
  }, [route.params]);
  if (!habit) return <View></View>;
  return (
    <View style={[commonStyle.screen, { backgroundColor: '#ddd', flex: 1 }]}>
      <Header
        title={habit.name}
      />
      <View>
      </View>
      <GroupTitle label={text.for('Data in month')} actionText="" />
      <DataMonth
        habits={[habit]}
        hideTextComponent={true}
        onMonthChanged={setDate}
      />
      <GroupTitle label={text.for('Record')} actionText="" />
      <DataRecord
        habits={[habit]}
        hideTextComponent={true}
        month={date.month - 1}
        year={date.year}
      />
    </View>
  );
};
