import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { getCurrentDay, getDay } from '../../Common/Utils/common';
import { Habit, habitRepository, HabitTracker, habitTrackerRepository } from '../Entities';
import { HabitTrackerModel } from './HabitTrackerModel';

//#region homeScreen
export const useGetTags = () => {
  return useAsyncAction(
    async () => {
      const result = []
        ; (await habitRepository.list())
          .filter((h) => h.tags && h.tags.data)
          .filter((h) => h.tags.data.filter((d) => d.selected).length > 0)
          .map((h) => h.tags.data.map((k) => k.text))
          .forEach((h) => h.forEach((i) => result.push(i)));
      return ['all', ...new Set(result)];
    },
    [useDectectDataChanged(habitRepository)],
    ['all'],
  );
};

export const useCalcCalendarMarkedDates = () => {
  const deps = [
    useDectectDataChanged(habitRepository),
    useDectectDataChanged(habitTrackerRepository),
  ];
  return useAsyncAction(

    async () => {
      const result = [];
      const trackers = await habitTrackerRepository.list();
      const habits = await habitRepository.list();
      //get data
      await Promise.all(
        [...new Set(trackers.map((s) => s.day))].map(async (d) => {
          //ngay full
          if (
            (
              await Promise.all(
                habits
                  .filter((ha) => ha.created_date <= d)
                  .map(
                    async (h) =>
                      await habitTrackerRepository.getTracker(
                        h.id,
                        new Date(d),
                      ),
                  ),
              )
            ).filter((h) => h.status != 'DONE').length == 0
          ) {
            result.push({
              date: getDay(new Date(d)),
              isCurrent: false,
            });
          }
        }),
      );
      if (
        result.filter((h) => h.date.getTime() == getCurrentDay().getTime())
          .length == 0
      ) {
        //ngay hiện tại
        result.push({
          date: getCurrentDay(),
          isCurrent: true
        });
      }

      return result;
    },
    deps,
    [{ date: getCurrentDay(), }]
  );
};
//hook
export const useGetData = (day: Date, tag) => {
  const deps = [
    useDectectDataChanged(habitRepository),
    useDectectDataChanged(habitTrackerRepository),
    day,
    tag
  ];
  const data = useAsyncAction(
    async () => {
      const trackers = await habitTrackerRepository.list();
      const habits = (await HabitTrackerModel.getListHabit(day)).map(h => ({
        habit: h,
        tracker: trackers.findLast(t => t.hid == h.id && t.day == day.getTime())
      }));

      const priorityMap = { hight: 1, normal: 0, low: -1 };
      habits.forEach((a) => (a.habit.priority = a.habit.priority || 'normal'));
      habits.sort(
        (a, b) => priorityMap[a.habit.priority] - priorityMap[b.habit.priority],
      );
      const unDone = habits.filter((h) => h.tracker.status != 'DONE');
      const done = habits.filter((h) => h.tracker.status == 'DONE');
      return [...unDone, ...done];
    },
    deps,
    [{ habit: new Habit(), tracker: {} as HabitTracker }],
  );
  return data;
};

//#endregion