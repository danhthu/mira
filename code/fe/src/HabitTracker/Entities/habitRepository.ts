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

  public getRecord = async (
    habits: Array<Habit>,
    month: number,
    year: number,
  ) => {
    const logger = getLogger('getRecord');
    const dayToMiliseconds = 24 * 60 * 60 * 1000;
    const chkDayInMonth = (d) =>
      new Date(d).getMonth() == month && new Date(d).getFullYear() == year;
    //lấy record, group by date
    const _trackers = await this.list();
    const _habits = await habitRepository.list();
    const records = groupBy(_trackers, (tr) => tr.day).map((d) => ({
      ...d,
      status:
        d.data.length ==
          _getListHabitByDate(_trackers, _habits, new Date(d.key)).length &&
          d.data.filter((h) => h.status != 'DONE').length == 0
          ? 'COMPLETED'
          : 'MAKE',
    }));
    records.sort(sortBy('day'));

    const firstDayMonth = new Date(getCurrentDay().getFullYear(), month, 1);
    const endDayMonth = moment(
      new Date(getCurrentDay().getFullYear(), month + 1, 1),
    ).add(-1, 'day');
    //best
    let best = 0;
    let current = 0;
    const dayList = [...new Set(records.map((h) => h.key))] as Array<number>;
    for (let i = 0; i < dayList.length - 1; i++) {
      if (dayList[i + 1] - dayList[i] == dayToMiliseconds) {
        current++;
        best = best < current ? current : best;
      } else {
        current = 0;
      }
    }
    const dayInSecond = 24 * 3600 * 1000;
    const totalDays = (dayList[dayList.length - 1] - dayList[0]) / dayInSecond;
    const bestStreak = best;
    const totalDoneMonth = [
      ...new Set(
        records
          .filter(
            (h) =>
              chkDayInMonth(h.key) && new Date(h.key).getFullYear() == year,
          )
          .map((d) => d.key),
      ),
    ].length;
    return {
      currentStreak: 10,
      perfect: records.filter((d) => d.status == 'COMPLETED').length,
      bestStreak: bestStreak,
      total: dayList.length,
      totalDoneMonth,
      overallRate: dayList.length / totalDays,
      monthlyRate:
        totalDoneMonth / endDayMonth.diff(moment(firstDayMonth), 'days'),
      successRate: dayList.length / totalDays,
      completedHabits: dayList.length,
    };
  };
}

export const habitTrackerRepository = new HabitTrackerRepository(
  'habit_tracker',
);
export const habitRepository = new Repository('habits');

interface WeekScore {
  weekStart: Date;
  weekEnd: Date;
  score: number;
  maxScore: number; // Số lượng ngôi sao (1 - 3)
}
// Hàm tính điểm theo từng tuần trong khoảng thời gian từ startDate đến endDate

const weekScoreCache: { [key: string]: WeekScore } = {}; // Store older week scores

const dailyCache: { [key: string]: { date: Date; totalScore: number, maxScore: number, data: Array<Habit> } } = {}; // Store older week scores




// Hàm lazy load để lấy điểm theo tuần, duyệt ngược từ hiện tại về quá khứ
export async function getWeeklyScores(
  page: number = 1,       // Trang hiện tại (mặc định là trang 1)
  pageSize: number = 3    // Số tuần sẽ tải mỗi lần (mặc định là 3 tuần)
): Promise<Array<WeekScore>> {
  const result: Array<WeekScore> = [];
  const trackers = await habitTrackerRepository.list();

  // Nếu không có trackers, trả về mảng rỗng
  if (trackers.length === 0) return result;

  // Sắp xếp lại trackers theo ngày
  trackers.sort((a, b) => a.day - b.day);

  // Lấy thời điểm hiện tại làm mốc
  const endDate = new Date(trackers[0].day);  // Ngày cuối cùng trong trackers
  const currentDate = moment().endOf('isoWeek').toDate();       // Kết thúc của tuần hiện tại

  // Tính toán thời điểm tuần đầu tiên cần tính toán trong trang hiện tại
  const startWeekOffset = (page - 1) * pageSize;
  const startWeekDate = moment(currentDate).subtract(startWeekOffset, 'weeks').startOf('isoWeek').toDate();

  // Duyệt ngược từ `startWeekDate` qua các tuần trước đó
  let currentWeekNumber = moment(startWeekDate).isoWeek();
  let weekStart = startWeekDate;
  let weeklyScore = 0;
  let weeklyMaxScore = 0;

  for (let weekIndex = 0; weekIndex < pageSize; weekIndex++) {
    // Nếu `weekStart` đã lùi về trước thời điểm `endDate` (quá khứ xa nhất), dừng vòng lặp
    if (weekStart.getTime() < endDate.getTime()) break;

    // Lấy các ngày trong tuần hiện tại
    for (let i = 0; i < 7; i++) {
      const dateKey = moment(weekStart).add(i, 'days').format('YYYY-MM-DD');


      if (dailyCache[dateKey] !== undefined) {
        const { totalScore: dailyScore, maxScore: dailyMaxScore } = dailyCache[dateKey];
        weeklyScore += dailyScore;
        weeklyMaxScore += dailyMaxScore;
      } else {
        const trackersForDay = await habitTrackerRepository.filter(h => moment(weekStart).add(i, 'days').diff(moment(new Date(h.day)), 'day') === 0);
        const habitsForDay = await habitRepository.getListByDate(moment(weekStart).add(i, 'days').toDate());

        const { totalScore: dailyScore, maxScore: dailyMaxScore } = getDailyScore(trackersForDay, habitsForDay, moment(weekStart).add(i, 'days').toDate());
        weeklyScore += dailyScore;
        weeklyMaxScore += dailyMaxScore;
      }
    }

    // Đẩy tuần hiện tại vào `result`
    result.push({
      weekStart: new Date(weekStart),
      weekEnd: moment(weekStart).endOf('isoWeek').toDate(),
      score: weeklyScore,
      maxScore: weeklyMaxScore,
    });

    // Reset điểm số cho tuần mới
    weeklyScore = 0;
    weeklyMaxScore = 0;

    // Cập nhật tuần tiếp theo (lùi ngược lại)
    weekStart = moment(weekStart).subtract(1, 'weeks').startOf('isoWeek').toDate();
    currentWeekNumber = moment(weekStart).isoWeek();
  }

  return result;
}




export function getDailyScore(
  trackers: HabitTracker[],
  habits: Habit[],
  date: Date
): { date: Date; totalScore: number, maxScore: number, data: Habit[] } {
  const results: { date: Date; totalScore: number, maxScore: number, data: Habit[] }[] = [];
  const dateKey = moment(date).format('YYYY-MM-DD');
  if (dailyCache[dateKey] !== undefined) return dailyCache[dateKey];
  let currentDay = moment(date);
  const finalDay = moment(date);

  while (currentDay.isSameOrBefore(finalDay)) {
    let totalScore = 0;

    // Duyệt qua các trackers và tính điểm cho ngày hiện tại
    trackers.forEach((tracker) => {
      const trackerDate = moment(new Date(tracker.day));
      if (trackerDate.isSame(currentDay, 'day') && tracker.status) {
        const habit = habits.find((h) => h.id === tracker.hid);
        if (habit) {
          totalScore += habit.score || 20;
        }
      }
    });

    // Lưu kết quả cho ngày vào mảng
    results.push({
      date: currentDay.toDate(),
      totalScore: totalScore,
      maxScore: habits.map(h => h.score || 20).reduce((h1, h2) => h1 + h2, 0),
      data: habits
    });

    // Chuyển sang ngày tiếp theo
    currentDay = currentDay.add(1, 'day');
  }
  dailyCache[dateKey] = results.length == 0 ? { date: currentDay.toDate(), totalScore: 0, maxScore: 0, data: [] } : results[0];
  return dailyCache[dateKey];
}

export function getMonthlyScore(
  trackers: HabitTracker[],
  habits: Habit[],
  startMonth: string,
  endMonth: string,
): { month: string; totalScore: number }[] {
  const results: { month: string; totalScore: number }[] = [];
  let currentMonth = moment(startMonth).startOf('month');
  const finalMonth = moment(endMonth).endOf('month');

  while (currentMonth.isSameOrBefore(finalMonth)) {
    let totalScore = 0;

    // Duyệt qua các trackers và tính điểm cho tháng hiện tại
    trackers.forEach((tracker) => {
      const trackerMonth = moment(new Date(tracker.day));
      if (trackerMonth.isSame(currentMonth, 'month') && tracker.status) {
        const habit = habits.find((h) => h.id === tracker.hid);
        if (habit) {
          totalScore += habit.score;
        }
      }
    });

    // Lưu kết quả tháng vào mảng
    results.push({
      month: currentMonth.format('YYYY-MM'),
      totalScore: totalScore,
    });

    // Chuyển sang tháng tiếp theo
    currentMonth = currentMonth.add(1, 'month').startOf('month');
  }

  return results;
}

