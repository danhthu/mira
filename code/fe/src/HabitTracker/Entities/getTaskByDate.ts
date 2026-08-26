import { getDay } from '../../Common/Utils/common';
import { habitRepository } from './habitRepository';
import { habitTrackerRepository } from './HabitTrackerRepository';

export const getTaskByDate = async (day: Date) => {
  const all = await habitRepository.getListByDate(day);
  const trackers = await habitTrackerRepository.filter(h => h.day == getDay(day).getTime());
  return {
    done: all.length - all.filter(h => trackers.filter(t => t.hid == h.id && t.status == 'DONE').length > 0).length,
    all: all.length
  };
};
