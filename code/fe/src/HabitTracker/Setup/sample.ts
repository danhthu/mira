import moment from 'moment';
import { getDay } from '../../Common/Utils/common';
import {
  Habit,
  HabitTracker,
  habitRepository,
  habitTrackerRepository
} from '../Entities';

export async function sample() {
  console.log('==================');
  console.log('init habit start');
  let startDate = moment(getDay(new Date())).add(-360, 'days').toDate();
  const endDate = moment(getDay(new Date())).add(2, 'days').toDate();
  const data = [] as Habit[];
  await habitRepository.empty();
  const rand = 5;
  for (let i = 0; i < rand; i++) {
    const item = {
      ...new Habit(),
      name: 'Habit ' + i,
      created_date: startDate.getTime(),
      timeCatId: 'Personal',
      did: 10,
      repeatOption: {
        enable: true,
        repeat: 1,
        kind: 'daily',
      },
    } as Habit;
    data.push(item);
  }
  await habitRepository.adds(data);
  await habitRepository.save();
  console.log('init complete');
  console.log('init tracker');
  const trackers = [] as HabitTracker[];
  while (startDate.getTime() < endDate.getTime()) {
    startDate = moment(startDate).add(1, 'days').toDate();
    data.forEach((habit) => {
      {
        trackers.push({
          ...new HabitTracker(
            habit.id,
            getDay(startDate).getTime(),
            null,
            null,
            'DONE',
            habit.name,
            habit.timeCatId,
            habit.did,
          ),
        });
      }
    });
  }
  habitTrackerRepository.empty();
  habitTrackerRepository.adds(trackers);
  habitTrackerRepository.save();
  console.log('init tracker complete');
}

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

