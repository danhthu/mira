
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';
import { Habit, HabitTracker, habitTrackerRepository } from '../Entities';

import moment from 'moment';
import { getDay } from '../../../libs/dateUtils';
import { useAsyncAction } from '../../Common/Hooks';

export const DataTimeLine = (props: { habits: Habit[] | Habit, hideTextComponent?: boolean }) => {
  const habit = props.habits && Array.isArray(props.habits) ? props.habits[0] : props.habits ? props.habits as Habit : new Habit;
  const deps = [props.habits];
  const data = useAsyncAction(async () => {
    //await generalTrackers(props.habit.id)
    const trackers = await habitTrackerRepository.filter(h => h.hid == habit.id);
    trackers.sort((h, h2) => h.day - h2.day);
    const yearList = [...new Set(trackers.map(h => new Date(h.day).getFullYear()))];
    let events = [];
    for (let i = Math.min(...trackers.map(h => new Date(h.day).getMonth())); i < 12; i++) {
      yearList.forEach(y => {
        console.log(y, i, 1, new Date(y, i + 1, 1));
        if (new Date(y, i, 1).getTime() < trackers[trackers.length - 1].day) {
          events.push(getMonthEvent(y, i, trackers));
        }
      });
    }
    events = await generateWeeklyEvents(trackers[0].day, trackers[trackers.length - 1].day, trackers);
    console.log(events);
    return events;
  }, deps);
  if (!data || data.length == 0) return <View></View>;
  return <View >
    <Timeline
      data={data}
    />
  </View>;
};

const generateWeeklyEvents = async (startDate, endDate, data: Array<any>) => {
  const events = [];
  const currentDate = new Date(startDate);

  // Đặt currentDate là ngày đầu tiên của tuần (tính từ thứ 2)
  currentDate.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1));

  while (currentDate.getTime() <= new Date(endDate).getTime()) {
    const weekStartDate = new Date(currentDate);
    const weekEndDate = new Date(currentDate);
    weekEndDate.setDate(currentDate.getDate() + 6);

    const weekLabel = `${moment(weekStartDate).format('DD/MM/YYYY')} - ${moment(weekEndDate).format('DD/MM/YYYY')}`;
    const event = {
      time: weekLabel,
      title: `Events for ${weekLabel}`,
      description: `Description for ${weekLabel}`,
    };
    events.push(event);

    // Move to the next week
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return events;
};

const generalTrackers = async (hid) => {
  const habitTrackers: HabitTracker[] = [];
  const endDate = new Date();


  const currentDate = getDay(new Date(2023, 1, 1));

  while (currentDate.getTime() <= endDate.getTime()) {
    const habitTracker = new HabitTracker(hid, currentDate.getDate(), { enable: false }, { data: [] });
    habitTracker.day = currentDate.getTime();
    habitTracker.status = 'DONE';
    if (Math.floor(Math.random() * 5) % 2 == 0) {
      habitTrackers.push(habitTracker);
      await habitTrackerRepository.add(habitTracker);
      console.log('new tracker');
    }

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  await habitTrackerRepository.save();
};


const getMonthEvent = (year: number, month: number, data: Array<HabitTracker>) => {
  return {
    time: `${month + 1}/${year}`,
    title: `Event in ${month} ${year}`,
    description: `Description for ${month} ${year}`,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
});
