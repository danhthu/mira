import moment from 'moment';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../../theme';
import { BLACK_COLOR, GROUP_MARGIN, ROUND_NORMAL, ROUND_SMALL, WHITE_COLOR } from '../../../../theme/Constraints';
import { FONTSIZE } from '../../../Common';
import { useAsyncAction } from '../../../Common/Hooks';
import { getStartOfWeek } from '../../../Common/Utils/common';
import { ScoreComponent } from '../../Components/ScoreComponent';
import { habitRepository, habitTrackerRepository } from '../../Entities';
import { getDailyScore } from '../../Entities/habitRepository';
import { useText } from '../../Text';

export const TodayTab = () => {
  const text = useText();
  const colors = useTheme();
  const [state, setState] = useState({} as { score, habits, prevScore, trackers, maxScore });
  useAsyncAction(async () => {
    const habits = (await habitRepository.getListByDate(new Date()));
    const trackers = await habitTrackerRepository.filter(h => moment().diff(moment(new Date(h.day)), 'day') == 0);
    const prevTrackers = await habitTrackerRepository.filter(h => moment().add(-1, 'days').diff(moment(new Date(h.day)), 'day') == 0);
    setState({
      score: getDailyScore(trackers, habits, new Date()).totalScore,
      habits,
      trackers,
      maxScore: habits.map(h => h.score || 20).reduce((h1, h2) => h1 + h2, 0),
      prevScore: getDailyScore(prevTrackers, habits, moment().add(-1, 'days').toDate()).totalScore,
    });
  }, []);

  return (
    <View style={[{ flexDirection: 'column' }]}>
      <View >
        <ScoreComponent score={state.score} isCompleted={state.score == state.maxScore} habits={state.habits} />
      </View>
      <View >
        <TouchableOpacity style={{ height: 40, borderRadius: 20, width: 170, alignSelf: 'center', justifyContent: 'center', backgroundColor: BLACK_COLOR }}>
          <Text style={{ fontSize: FONTSIZE.NORMAL, color: WHITE_COLOR, textAlign: 'center' }}>{text.add_habit || 'Add Habit'}</Text>
        </TouchableOpacity>
      </View>
      {state.score != state.prevScore && <View style={[{ padding: ROUND_NORMAL, borderRadius: ROUND_NORMAL, marginTop: GROUP_MARGIN }, { backgroundColor: colors.hexToRGB(state.score < state.prevScore ? colors.error : colors.success, 0.15) }]}>

        {state.score < state.prevScore && <View ><Text style={{ fontSize: FONTSIZE.NORMAL, textAlign: 'center' }}>{text.your_habits_score_dropped || 'Your habits score dropped'} <Text style={{ color: colors.error, fontWeight: 'bold' }}>{Math.round(1 - state.score / (state.prevScore))}%</Text> {text.compared_to_yesterday || 'compared to yesterday.'}</Text></View>}
        {state.score > state.prevScore && <View><Text style={{ fontSize: FONTSIZE.NORMAL, textAlign: 'center' }}>{text.your_habits_score_dropped || 'Your habits score raised '} <Text style={{ color: colors.success, fontWeight: 'bold' }}>{Math.round(state.score / (state.prevScore - 1))}%</Text> {text.compared_to_yesterday || 'compared to yesterday.'}</Text>
        </View>}

      </View>
      }
      <View style={[{ marginTop: GROUP_MARGIN }]}><Text style={{ fontSize: FONTSIZE.NORMAL, fontWeight: 'bold' }}>{text.summary || 'Summary:'}</Text></View>
      <Summary />
    </View>
  );
};

const Summary = () => {
  const [state, setState] = useState([]);
  const dayOfWeek = new Date().getDay() == 0 ? 7 : new Date().getDay() - 1;
  const startDayOfWeek = getStartOfWeek(new Date);
  useAsyncAction(async () => {
    const dayOfWeek = new Date().getDay() == 0 ? 7 : new Date().getDay() - 1;
    const startDayOfWeek = getStartOfWeek(new Date);
    const totalHabits = await habitRepository.getListByDate(new Date());
    const days = Array.from({ length: 7 }, i => ({ currentScore: 0, totalScore: totalHabits.map(h => h.score || 20).reduce((h1, h2) => h1 + h2, 0) }));  //6  + 3
    for (let i = 0; i <= dayOfWeek; i++) {
      const day = moment(startDayOfWeek).add(i, 'days');
      const habits = await habitRepository.getListByDate(day.toDate());
      const trackers = await habitTrackerRepository.filter(h => day.isSame(new Date(h.day), 'day'));
      days[i] = {
        currentScore: getDailyScore(trackers, habits, day.toDate()).totalScore,
        totalScore: habits.map(h => h.score || 20).reduce((h1, h2) => h1 + h2, 0)
      };
    }
    setState([...days]);
  }, []);

  const colors = useTheme();
  const chartColors = [colors.hexToRGB(colors.primary, 0.7), colors.hexToRGB(colors.secondary, 0.7)];
  return <View style={[{ flex: 1, marginTop: 20, height: 150, flexDirection: 'row' }]}>
    {state?.map((h, i) => <View style={{ flex: 1, alignItems: 'flex-start' }} key={i}>
      <View style={{ backgroundColor: '#eee', width: 30, borderRadius: ROUND_SMALL, flex: 1, flexDirection: 'column' }}>
        <View style={{ flex: 1 - h.currentScore / h.totalScore, }} />
        <View style={[{ borderRadius: ROUND_SMALL, width: 30, alignSelf: 'flex-end' }, { flex: h.currentScore / h.totalScore, backgroundColor: chartColors[i % chartColors.length] }]}></View>
      </View>
      <Text style={[{ width: 30, fontSize: 12, textAlign: 'center', marginTop: 5 }, i == dayOfWeek && { fontWeight: 'bold' }]}>{moment(startDayOfWeek).add(i, 'days').format('ddd')}</Text>
    </View>)}
  </View>;
};


