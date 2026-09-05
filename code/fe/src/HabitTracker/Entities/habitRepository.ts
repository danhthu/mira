import moment from 'moment';
import { sortBy } from 'sort-by-typescript';
import { groupBy } from '../../../libs/arrayUtils';
import { getCurrentDay } from '../../../libs/dateUtils';
import { checkListOption, goalOption } from '../../Common/Interfaces';
import { Repository as BaseRepo } from '../../Common/Repositories/Repo';
import { dateEqual, dateGreater, dateLesser, getDay } from '../../Common/Utils/common';
import { getLogger } from '../../Common/Utils/getLogger';
import { Habit } from './Habit';
import { HabitTracker } from './Tracker';
export const _getListHabitByDate = (
  trackers: HabitTracker[],
  habits: Habit[],
  date: Date,
) => {
  date.setHours(0, 0, 0, 0);
  const list = habits.filter(
    (h) =>
      dateLesser(new Date(h.created_date), date) &&
      (!h.endDate ||
        (dateLesser(date, h.endDate, 1) &&
          dateLesser(new Date(h.created_date), date, 1))),
  );
  const result = [
    ...list.filter((h) => dateEqual(getDay(new Date(h.created_date)), date)),
  ]; //habit cùng ngày
  //tính repeat
  list
    .filter((h) => !dateEqual(getDay(new Date(h.created_date)), date))
    .forEach((h) => {
      if (result.indexOf(h) > -1) return;
      if (h.repeatOption && h.repeatOption.enable) {
        // console.log(h)
        if (h.repeatOption.kind == 'daily') {
          const startDate = moment(getDay(new Date(h.created_date)));
          const diffDays = moment(date).diff(startDate, 'days');

          if (
            diffDays % h.repeatOption.repeat === 0 &&
            result.indexOf(h) === -1
          ) {
            result.push(h);
          }
        }
        if (h.repeatOption.kind == 'weekly') {
          const startDate = moment(getDay(new Date(h.created_date)));
          const diffDays = moment(date).diff(startDate, 'weeks');
          let chk =
            diffDays % h.repeatOption.repeat === 0 && result.indexOf(h) === -1;
          chk =
            chk && h.repeatOption.dayOfWeek.includes(moment(date).isoWeekday());
          if (chk) {
            result.push(h);
          }
        }

        if (h.repeatOption.kind == 'monthly') {
          const startDate = moment(getDay(new Date(h.created_date)));
          const diffDays = moment(date).diff(startDate, 'months');
          let chk =
            diffDays % h.repeatOption.repeat === 0 && result.indexOf(h) === -1;
          chk = chk && h.repeatOption.days.includes(moment(date).date());
          if (chk) {
            result.push(h);
          }
          // Check if the day of the month matches
          //if (repeatOptions.days && repeatOptions.days.length > 0) {
          //   return repeatOptions.days.includes(providedDate.date());
          // }
        }
      }
    });
  const kk = result.filter(
    (h) =>
      !h.deleted || !h.deleted_date || h.deleted_date > getDay(date).getTime(),
  );
  return kk;
};

class Repository extends BaseRepo<Habit> {
  public getHabitsForThisWeek = async (week = null): Promise<Habit[]> => {
    const startOfWeek = week ? moment(week.start).startOf('isoWeek') : moment().startOf('isoWeek'); // Bắt đầu tuần
    const endOfWeek = week ? moment(week.end).endOf('isoWeek') : moment().endOf('isoWeek'); // Kết thúc tuần

    const habitsInWeek: Habit[] = [];
    const habitIdsSet: Set<string> = new Set(); // Tập hợp chứa các ID đã thấy để tránh trùng lặp

    // Lặp qua từng ngày trong tuần
    for (
      let date = startOfWeek.clone();
      date.isSameOrBefore(endOfWeek);
      date.add(1, 'days')
    ) {
      const habitsOfDay = await this.getListByDate(date.toDate());

      habitsOfDay.forEach((habit) => {
        if (!habitIdsSet.has(habit.id)) {
          // Kiểm tra xem ID đã có trong Set chưa
          habitIdsSet.add(habit.id); // Thêm ID vào Set
          habitsInWeek.push(habit); // Thêm habit vào danh sách nếu chưa tồn tại
        }
      });
    }
    return habitsInWeek;
  };
  public getListByDate = async (date: Date): Promise<Habit[]> => {
    date.setHours(0, 0, 0, 0);
    const list = await habitRepository.filter(
      (h) =>
        dateEqual(new Date(h.created_date), date) || (dateLesser(new Date(h.created_date), date) &&
          (!h.endDate ||
            (dateLesser(date, h.endDate, 1) &&
              dateLesser(new Date(h.created_date), date, 1)))),
    );
    const result = [
      ...list.filter((h) => dateEqual(getDay(new Date(h.created_date)), date)),
    ]; //habit cùng ngày
    //tính repeat
    list
      .filter((h) => !dateEqual(getDay(new Date(h.created_date)), date))
      .forEach((h) => {
        if (result.indexOf(h) > -1) return;
        if (h.repeatOption && h.repeatOption.enable) {
          // console.log(h)
          if (h.repeatOption.kind == 'daily') {
            const startDate = moment(getDay(new Date(h.created_date)));
            const diffDays = moment(date).diff(startDate, 'days');

            if (
              diffDays % h.repeatOption.repeat === 0 &&
              result.indexOf(h) === -1
            ) {
              result.push(h);
            }
          }
          if (h.repeatOption.kind == 'weekly') {
            const startDate = moment(getDay(new Date(h.created_date)));
            const diffDays = moment(date).diff(startDate, 'weeks');
            let chk =
              diffDays % h.repeatOption.repeat === 0 && result.indexOf(h) === -1;
            chk =
              chk &&
              h.repeatOption.dayOfWeek.includes(moment(date).isoWeekday());
            if (chk) {
              result.push(h);
            }
          }

          if (h.repeatOption.kind == 'monthly') {
            const startDate = moment(getDay(new Date(h.created_date)));
            const diffDays = moment(date).diff(startDate, 'months');
            let chk =
              diffDays % h.repeatOption.repeat === 0 && result.indexOf(h) === -1;
            chk = chk && h.repeatOption.days.includes(moment(date).date());
            if (chk) {
              result.push(h);
            }
            // Check if the day of the month matches
            //if (repeatOptions.days && repeatOptions.days.length > 0) {
            //   return repeatOptions.days.includes(providedDate.date());
            // }
          }
        }
      });
    const kk = result.filter(
      (h) =>
        !h.deleted ||
        !h.deleted_date ||
        h.deleted_date > getDay(date).getTime(),
    );
    return kk;
  };

  public getTags = async () => {
    const tagsList = (await habitRepository.list())
      .filter((h) => h.tags)
      .map((h) => h.tags);
    const result = [] as Array<string>;
    tagsList.forEach((item) => {
      result.push(...(item as string[]));
    });
    return [...new Set(result)];
  };

  public clean = async (id, cleanHistory: boolean = false) => {
    if (cleanHistory) {
      await habitTrackerRepository.delete2((h) => h.hid == id);
      await habitRepository.delete2((h) => h.id == id);
    } else {
      await habitRepository.update(
        (h) => h.id === id,
        (h) => {
          h.deleted = true;
          h.deleted_date = new Date().getTime();
        },
      );
    }
  };
}

class HabitTrackerRepository extends BaseRepo<HabitTracker> {
  public getTracker = async (hid: string, day: Date): Promise<HabitTracker> => {
    day = getDay(day);
    const tracker = await this.findOne(
      (h) => h.day == day.getTime() && h.hid == hid,
    );
    const habit = await habitRepository.findOne((h) => h.id == hid);
    if (tracker) return tracker;
    if (!habit) return null;
    const item = new HabitTracker(
      hid,
      day.getTime(),
      habit.goalOption,
      habit.checkList,
    );
    item.status = 'CREATED';
    return item;
  };

  public doneTracker = async (hid: string, date: Date): Promise<void> => {
    const item = await this.getTracker(hid, date);
    const exists = await this.findOne(
      (h) => h.hid == hid && h.day == date.getTime(),
    );

    if (!exists) {
      item.status = 'DONE';
      await this.add(item);
      await this.save();
    } else {
      await this.update(
        (h) => h.id == item.id,
        (h) => {
          h.status = 'DONE';
          h.day = date.getTime();
        },
      );
    }
  };
  public unDoneTracker = async (hid: string, date: Date): Promise<void> => {
    const item = await this.getTracker(hid, date);
    if (item) {
      await this.delete(item);
    }
  };

  public setDid = async (
    id: string,
    date: Date,
    goal?: goalOption,
    checkList?: checkListOption,
  ): Promise<void> => {
    const item = await this.getTracker(id, date);
    if (!(await this.findOne((h) => h.id == item.id))) {
      await this.add(item);
    }

    await this.update(
      (h) => h.id == item.id,
      (h) => {
        if (!h.data) {
          h.data = {};
        }
        if (goal) {
          h.data.goal = goal;
        }
        if (checkList) {
          h.data.checkList = checkList;
        }
      },
    );
  };

  public getSegments = async (): Promise<
    Array<{ startDay: number; endDay: number }>
  > => {
    const data: Array<{ day: number }> = await this.list();
    data.sort((a, b) => a.day - b.day); // Sort by day
    const segments: Array<{ startDay: number; endDay: number }> = [];

    if (data.length === 0) return segments;

    let startDay = data[0].day;
    let endDay = startDay;

    for (let i = 1; i < data.length; i++) {
      const currentDay = data[i].day;

      // Check if the current day is consecutive to the endDay
      if (moment(currentDay).diff(moment(endDay), 'days') === 1) {
        endDay = currentDay;
      } else {
        segments.push({ startDay, endDay });
        startDay = currentDay;
        endDay = startDay;
      }
    }

    // Push the final segment
    segments.push({ startDay, endDay });

    return segments;
  };

  public getCalendarData = async (
    id?: string,
  ): Promise<Array<{ day: number; status: 0 | 1 | 2 }>> => {
    const data = await this.list();
    const result = [];
    const days = [...new Set(data.map((d) => d.day))];
    await Promise.all(
      days.map(async (kv) => {
        const habits = (await habitRepository.getListByDate(new Date(kv)))
          .filter((h) => id == null || h.id == id)
          .map((h) => h.id);
        const completed = data.filter(
          (d) => d.day == kv && habits.includes(d.hid),
        );
        if (completed.length === 0) {
          result.push({ day: kv, status: 0 });
        } else {
          if (habits.length === completed.length) {
            result.push({ day: kv, status: 2 });
          } else {
            result.push({ day: kv, status: 1 });
          }
        }
      }),
    );
    return result;
  };

  public getStatistic = async (
    id?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Array<{ day: number; status: 0 | 1 | 2 }>> => {
    startDate = startDate
      ? startDate
      : moment(new Date()).add(-10, 'years').toDate();
    endDate = endDate ? endDate : new Date();
    const r = await this.getCalendarData(id);
    return r.filter(
      (d) =>
        dateLesser(new Date(d.day), endDate) &&
        dateGreater(new Date(d.day), startDate),
    );
  };

  /**
   * Ba con số đếm được, không có tỷ lệ và không có khái niệm "ngày hoàn hảo".
   *
   * Bản Batify cũ (`getRecord`) trả thêm `successRate`, `monthlyRate` và
   * `perfect` — số ngày người dùng làm đủ *mọi* thói quen. Cả ba đều là cách nói
   * "bạn đạt bao nhiêu phần trăm", tức là chấm điểm, đúng thứ ràng buộc #3 cấm.
   * Ở đây chỉ còn số lần đã ghi: một sự thật, không kèm mẫu số để so.
   */
  public getTotals = async (
    month: number,
    year: number,
  ): Promise<{ totalMarks: number; daysMarked: number; marksThisMonth: number }> => {
    const trackers = (await this.list()).filter((t) => t.status == 'DONE');
    const inMonth = (day: number) =>
      new Date(day).getMonth() == month && new Date(day).getFullYear() == year;
    return {
      totalMarks: trackers.length,
      daysMarked: new Set(trackers.map((t) => t.day)).size,
      marksThisMonth: trackers.filter((t) => inMonth(t.day)).length,
    };
  };
}

export const habitTrackerRepository = new HabitTrackerRepository(
  'habit_tracker',
);
export const habitRepository = new Repository('habits');
