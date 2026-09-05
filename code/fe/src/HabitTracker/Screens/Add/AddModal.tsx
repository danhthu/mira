import React from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';
import { B, BImageIConSet } from '../../../../libs/components';
import { debugStyle } from '../../../../libs/components/debugStyle';
import { useTheme } from '../../../../theme';
import { getLogger } from '../../../Common';
import { ColorCtrl } from '../../../Common/FormControls/ColorCtrl';
import { GoalCtrl } from '../../../Common/FormControls/GoalCtrl';
import { RepeatCtrl } from '../../../Common/FormControls/RepeatCtrl';
import { TagCtrl } from '../../../Common/FormControls/TagCtrl';
import { TimeCtrl } from '../../../Common/FormControls/TimeCtrl';
import { TimeReminderCtrl } from '../../../Common/FormControls/TimeReminderCtrl';
import { useCommonStyle } from '../../../Common/Styles';
import { Habit, habitRepository } from '../../Entities';
import { useText } from '../../Text';

import usePerformance from '../../../../hook/useScreenLoadTime';
import { DescriptionCtrl } from '../../../Common/FormControls/DescriptionCtrl';
import { useStateData } from '../../../Common/Hooks';
import { Header } from '../../Components/Header';

const logger = getLogger('HabitTracker_Screens_Add');
const rowHeight = 50;

export const AddModal = ({ route, navigation }) => {
  usePerformance('HabitTracker\Add');
  const text = useText();
  const style = useStyle();
  const theme = useTheme();
  const colors = useTheme();
  const [data, setData, habitRef] = useStateData({ ...new Habit(), name: 'New Habit' });

  const update = (updated) => {
    setData((prevHabit) => ({ ...prevHabit, ...updated }));
  };

  const commonStyle = useCommonStyle();

  const save = async () => {
    await habitRepository.add(habitRef.current);
    await habitRepository.save();
    navigation.goBack();
  };




  return (
    <ScrollView
      style={[{ backgroundColor: theme.background }, commonStyle.modalScreen]}
    >
      <Header title='' right={{ text: text.save || 'Save', onTouch: save }} />
      <View style={[{
        alignSelf: 'center', marginTop: 10, marginBottom: 10, padding: 10, borderRadius: 10,
        backgroundColor: theme.background
      }, debugStyle]}>
        <BImageIConSet
          width={40}
          height={40}
          name="abc"
          navigation={navigation}
          onChanged={(val) => update({ icon: val })}
        ></BImageIConSet>
      </View>
      <View style={style.sectionContainer}>
        <B.TextBox label={text.habit_name || 'Tên thói quen'}
          inputStyle={{ textAlign: 'center', }}
          viewStyle={{ borderBottomWidth: 0 }}
          value={data.name}
          onChanged={val => update({ name: val })} />
      </View>

      <View style={style.sectionContainer}>
        <ColorCtrl value={data.color} onChanged={val => update({ color: val })} />
      </View>

      <View style={style.sectionContainer}>
        <TimeCtrl value={data.time} onChanged={val => update({ time: val })} />
      </View>

      <View style={style.sectionContainer}>
        <RepeatCtrl value={data.repeatOption} onChanged={val => update({ repeatOption: val })} />
      </View>

      <View style={style.sectionContainer}>
        <GoalCtrl value={data.goalOption} onChanged={val => update({ goalOption: val })} />
      </View>

      <View style={style.sectionContainer}>
        <TagCtrl values={data.tags} onChanged={val => update({ tags: val })} />
      </View>

      <View style={style.sectionContainer}>
        <TimeReminderCtrl value={data.reminderOption} onChanged={val => update({ reminderOption: val })} />
      </View>

      <View style={[style.sectionContainer]}>
        <B.TextBox dataType="date"
          icon={'calendar-end'}
          label={text.batdau || 'Chọn thời gian kết thúc'}
          value={data.endDate} onChanged={val => update({ endDate: val })} />
      </View>
      {/*ghi chú */}
      <View style={[style.sectionContainer]}>
        <DescriptionCtrl value={data.description} onChanged={val => update({ description: val })} />
      </View>
    </ScrollView>
  );
};





const useStyle = () => {
  const common = useCommonStyle();
  const colors = useTheme();
  return {
    ...common,
    ...StyleSheet.create({

      sectionContainer: {
        marginTop: 15,
        marginBottom: 15,

        paddingLeft: 20,
        backgroundColor: '#fff'
      },

    }),
  };
};

