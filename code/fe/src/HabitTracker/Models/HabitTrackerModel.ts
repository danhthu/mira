import { useEffect, useState } from 'react';
import { dateEqual, dateLesser, getDay } from '../../Common/Utils/common';
import { Habit, habitRepository, HabitTracker, habitTrackerRepository } from '../Entities';

export const HabitTrackerModel2 = {
  useCurrent: (): { total: number; done: number; status: 0 | 1 | number } => {
    const [data, setData] = useState({ total: 0, done: 0, status: 0 });
    useEffect(() => {
      setData({ total: 10, done: 10, status: 0 });
    }, []);
    return data;
  },
  useHomeData: (): Array<Habit> => {
    const [data, setData] = useState([] as Array<Habit>);
    useEffect(() => {
      const loadData = async () => {
        setData(await habitRepository.list());
      };
      habitRepository.registerDataChanged(loadData);
      return () => {
        habitRepository.unRegisterDataChanged(loadData);
      };
    }, []);
    return data;
  },
  useCalendarData: (): Array<HabitTracker> => {
    const [data, setData] = useState([] as Array<HabitTracker>);
    useEffect(() => {
      const loadData = async () => {
        setData(await habitTrackerRepository.list());
      };
      habitTrackerRepository.registerDataChanged(loadData);
      return () => {
        habitTrackerRepository.unRegisterDataChanged(loadData);
      };
    }, []);
    return data;
  },
  getListHabit: async (date: Date): Promise<Habit[]> => {
    date.setHours(0, 0, 0, 0);
    const list = await habitRepository.filter(h => !h.endDate || dateLesser(date, h.endDate, 1) && dateLesser(new Date(h.created_date), date, 1));
    const result = [...list.filter(h => dateEqual(new Date(h.created_date), date))]; //habit cùng ngày
    //tính repeate
    list
      .filter(h => !dateEqual(new Date(h.created_date), date))
      .forEach((h) => {
        if (result.indexOf(h) > -1) return;
        if (h.repeatOption && h.repeatOption.enable) {
          // console.log(h)
          if (h.repeatOption.kind == 'daily') {
            //kiểm tra
            let tmp = getDay(new Date(h.created_date));
            while (tmp.getTime() < date.getTime()) {
              tmp = new Date(
                tmp.getTime() + h.repeatOption.repeat * 24 * 60 * 60 * 1000,
              );
            }

            if (tmp.getTime() == date.getTime() && result.indexOf(h) == -1) {
              result.push(h);
            }
          }
          if (h.repeatOption.kind == 'weekly') {
            //kiểm tra dateofek
            if (
              h.repeatOption.dayOfWeek.indexOf(new Date(date).getDay()) > -1
            ) {
              let tmp = new Date(h.created_date);
              tmp.setHours(0, 0, 0, 0);
              while (tmp.getTime() <= date.getTime()) {
                tmp = new Date(
                  tmp.getTime() +
                  h.repeatOption.repeat * 7 * 24 * 60 * 60 * 1000,
                );
              }
              if (tmp.getTime() == date.getTime() && result.indexOf(h) == -1) {
                result.push(h);
              }
            }
          }

          if (h.repeatOption.kind == 'monthly') {
            //kiểm tra dateofek
            if (h.repeatOption.days.indexOf(new Date(date).getDate()) > -1) {
              let tmp = new Date(h.created_date);
              tmp.setHours(0, 0, 0, 0);
              while (tmp.getTime() <= date.getTime()) {
                //get total days
                let stt = 1;
                while (stt <= h.repeatOption.repeat) {
                  tmp = new Date(
                    tmp.getTime() +
                    new Date(
                      tmp.getFullYear(),
                      tmp.getMonth() + 1,
                      0,
                    ).getDate() *
                    24 *
                    60 *
                    60 *
                    1000,
                  );
                  stt++;
                }
              }
              if (tmp.getTime() == date.getTime() && result.indexOf(h) == -1) {
                result.push(h);
              }
            }
          }
        }
      });
    return list;
  },
  getTracker: async (id: string, day: Date): Promise<HabitTracker> => {
    day.setHours(0, 0, 0, 0);
    return await habitTrackerRepository.getTracker(id, day);
  },
  useGetTracker: (id: string, day: Date): HabitTracker => {
    day.setHours(0, 0, 0, 0);
    const [data, setData] = useState({} as HabitTracker);
    useEffect(() => {
      const getTracker = async () => {
        const obj = await habitTrackerRepository.getTracker(id, day);
        setData(obj);
      };
      habitTrackerRepository.registerDataChanged(getTracker);
      return () => {
        habitTrackerRepository.unRegisterDataChanged(getTracker);
      };
    }, [id, day]);
    return data;
  },
};
