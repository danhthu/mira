import { View } from 'react-native';

import { useTheme } from '../../../theme';

import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { Col, Grid } from 'react-native-easy-grid';
import { FlatList } from 'react-native-gesture-handler';
import { sortBy } from 'sort-by-typescript';
import { useText } from '../../../lang';
import { getSegmentsFor } from '../../../libs';
import { BText as Text } from '../../../libs/components';
import { getCurrentDay } from '../../../libs/dateUtils';
import { BORDER_ROUND, FONT_SIZE, FONT_WEIGHT, PADDING, TBL_ROW_HEIGHT } from '../../../theme/Constraints';
import { getLogger } from '../../Common';
import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { dateEqual } from '../../Common/Utils/common';
import { Habit, habitRepository, habitTrackerRepository } from '../Entities';
const dayToMiliseconds = 24 * 60 * 60 * 1000;
const logger = getLogger('DataRecord');
export const DataRecord = (props: { habits: Habit[], hideTextComponent?: boolean, month?: number, year?: number }) => {
  const nav = useNavigation();
  const colors = useTheme();
  const text = useText();
  const deps = [useDectectDataChanged(habitRepository), useDectectDataChanged(habitTrackerRepository), props.habits, props.month, props.year];
  const data = useAsyncAction<Array<{ name: string, total: any, unit?: string, filters?: any }>>(async () => {
    const habits = (props.habits || [] as Array<Habit>);
    const month = props.month || new Date().getMonth();
    const year = props.year || new Date().getFullYear();
    const chkDayInMonth = d => new Date(d).getMonth() == month && new Date(d).getFullYear() == year;
    const records = (await habitTrackerRepository.filter(h => h.status == 'DONE'))
      .filter(h => habits.filter(a => a.id == h.hid).length > 0);
    records.sort(sortBy('day'));
    const firstDayMonth = new Date(getCurrentDay().getFullYear(), month, 1);
    const endDayMonth = moment(new Date(getCurrentDay().getFullYear(), month + 1, 1)).add(-1, 'day');
    //best
    let best = 0;
    let current = 0;
    const dayList = [...new Set(records.map(h => h.day))];

    for (let i = 0; i < dayList.length - 1; i++) {

      if (dayList[i + 1] - dayList[i] == dayToMiliseconds) {
        current++;
        best = best < current ? current : best;
      } else {
        current = 0;
      }
    }
    const dayInSecond = 24 * 3600 * 1000;
    const totalDays = (dayList[dayList.length - 1] - dayList[0]) / ((dayInSecond));

    if (habits.length == 0 || habits.length > 1) {
      const perfect = (await Promise.all(dayList.map(async d => {
        const doneDay = records.filter(r => r.day == d).map(r => r.hid).sort();
        const habitInDay = (await habitRepository.getListByDate(new Date(d))).map(h => h.id).sort();
        return { filter: JSON.stringify(doneDay) === JSON.stringify(habitInDay), day: d };
      }))).filter(d => d.filter);
      const bestStreak = perfect.length == 0 ? 0 : Math.max(...getSegmentsFor(perfect).map(a => (a.endDay - a.startDay) / (dayInSecond)));
      console.log(perfect);
      const totalDoneMonth = [...new Set(records.filter(h => chkDayInMonth(h.day) && new Date(h.day).getFullYear() == year).map(d => d.day))].length;

      return [
        //group
        { name: 'Perfect Days', unit: 'days', total: perfect.length },
        { name: 'Best Streak', unit: 'days', total: bestStreak },
        { name: 'Habit Done Total', total: dayList.length },
        { name: 'Habit Done This Month', total: totalDoneMonth },
        { name: 'OverallRate', unit: '%', total: dayList.length / totalDays },
        { name: 'MonthlyRate', unit: '%', total: totalDoneMonth / (endDayMonth.diff(moment(firstDayMonth), 'days')) },
      ];
    }

    if (habits.length == 1) {
      const totalDone = records.length;
      const doneInMonth = [... new Set(records.filter(h => chkDayInMonth(h.day)).map(h => h.day))].length;
      logger.info('doneInMonth: ', doneInMonth);
      let currentStreak = 0;
      let curDay = getCurrentDay().getTime() - dayInSecond;
      while (true) {
        curDay += dayInSecond;
        if (records.filter(h => dateEqual(new Date(h.day), new Date(curDay))).length == 0) {
          break;
        } else {
          currentStreak++;
        }
      }
      logger.info('currentStreak: ', currentStreak);
      const bestStreak = records.length == 0 ? 0 : Math.max(...getSegmentsFor(records).map(a => (a.endDay - a.startDay) / (dayInSecond)));

      logger.info('bestStreak: ', bestStreak);
      const Vol_ThisMonth = records.filter(h => chkDayInMonth(h.day))
        .map(h => h.data?.goal?.done || 0)
        .reduce((a, b) => a + b, 0);
      logger.info('Vol_ThisMonth: ', Vol_ThisMonth);
      const Vol_Total = records
        .map(h => h.data?.goal?.done || 0)
        .reduce((a, b) => a + b, 0);
      logger.info('Vol_Total: ', Vol_Total);
      const Vol_avg = Math.floor(Vol_Total / dayList.length);
      const overallRate = Math.floor(dayList.length * 100 / totalDays);

      const habit = habits[0];
      let unit = '';
      const result = [ //detail
        { name: 'Done this month', total: doneInMonth, filters: { hids: habits.map(h => h.id), time: { from_date: new Date(year, month, 1).getTime(), to_date: new Date(year, month + 1, 1).getTime() } } },
        { name: 'Total Done', total: totalDone, filters: { hids: habits.map(h => h.id), time: { from_date: new Date(year - 20, month, 1).getTime(), to_date: new Date().getTime() } } },
        { name: 'Current Streak', unit: 'days', total: currentStreak },
        { name: 'Best Streak', unit: 'days', total: bestStreak },
      ];
      if (habit.goalOption && habit.goalOption.enable) {
        unit = habit.goalOption.unit;
        result.push(...[{ name: 'Vol.This month', unit, total: Vol_ThisMonth },
        { name: 'Vol.Total', unit, total: Vol_Total },
        { name: 'Daily Avg.', unit, total: Vol_avg }]);
      }
      //normal
      result.push({ name: 'OverallRate', unit: '%', total: overallRate });
      return result;
    }
  }, deps, [{ name: 'Perfect Days', unit: 'days', total: null },
  { name: 'Best Streak', unit: 'days', total: null },
  { name: 'Habit Done Total', total: null },
  { name: 'Habit Done This Month', total: null },
  { name: 'OverallRate', unit: '%', total: null },
  ], 'HabitTracker\DataRecord');
  return (
    <View style={{ borderRadius: BORDER_ROUND.NORMAL, borderWidth: 1, backgroundColor: 'white', borderColor: colors.outline, padding: PADDING.ELEMENT }}>
      <FlatList data={data}
        renderItem={({ item }) => (<Grid>
          <Col style={{ paddingLeft: 2, height: TBL_ROW_HEIGHT, justifyContent: 'center', }}>
            <Text >{text.for(item.name)}</Text>
          </Col>
          <Col style={{ paddingRight: 2, flex: null, height: TBL_ROW_HEIGHT, justifyContent: 'center' }}>
            <Text style={{ fontWeight: FONT_WEIGHT.SEMIBOLD, textAlign: 'right', }}>{item.total || '--'} {<Text style={{ fontWeight: FONT_WEIGHT.SEMIBOLD, textAlign: 'right', fontSize: FONT_SIZE.SecondaryText }}>{item.total ? item.unit : null}</Text>}</Text>
          </Col>
        </Grid>)}
        ItemSeparatorComponent={() => <View style={{ borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, }} />}
      />
    </View>
  );
};


