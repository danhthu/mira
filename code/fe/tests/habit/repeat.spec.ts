import moment from "moment";
import { repeatOption } from "../../common/interface";
import { getDay } from "../../libs/dateUtils";
import { copyJson } from "../../libs/jsonUtils";
import { SetDefaultDbProvider } from "../../src/Common/Repositories/Repo";
import { Habit, habitRepository, habitTrackerRepository } from "../../src/HabitTracker/Entities";
import { JsProvider } from "../utils/JsProvider";

describe('habit.repeat', () => {
    beforeAll(() => {
        SetDefaultDbProvider(new JsProvider());
    });
    beforeEach(async () => {
        // Dọn dẹp hoặc reset trạng thái sau mỗi test
        await habitRepository.empty();
        await habitTrackerRepository.empty();
    });
    it('repeat daily', async () => {
        const startDate = moment(new Date()).add(-365, 'days').toDate();
        const dailyHabit = copyJson(new Habit, {
            id: '1',
            created_date: startDate.getTime(),
            name: 'Daily habit',
            repeatOption: {
                enable: true,
                kind: 'daily',
                repeat: 1,
            } as repeatOption,
        });
        await habitRepository.add(dailyHabit);
        const result = await habitRepository.getListByDate(
            moment(startDate).add(5, 'days').toDate(),
        );
        expect(result.length).toEqual(1);
    });
    it('repeat daily repeat 5', async () => {
        const startDate = getDay(moment(new Date()).add(-365, 'days').toDate());
        const dailyHabit = copyJson(new Habit, {
            id: '1',
            created_date: startDate.getTime(),
            name: 'Daily habit',
            repeatOption: {
                enable: true,
                kind: 'daily',
                repeat: 5,
            } as repeatOption,
        });
        await habitRepository.add(dailyHabit);
        const result = await habitRepository.getListByDate(
            moment(startDate).add(2, 'days').toDate(),
        );
        expect(result.length).toEqual(0);
    });
    it('repeat weekly', async () => {
        const today = moment(new Date()).add(-365, 'days');
        const weekHabit = copyJson(new Habit, {
            id: '1',
            created_date: today.toDate().getTime(),
            name: 'Weekly habit',
            repeatOption: {
                enable: true,
                kind: 'weekly',
                dayOfWeek: [1, 2, 3],
                repeat: 1,
            } as repeatOption,
        });
        await habitRepository.add(weekHabit);
        const nextTuesday =
            today.isoWeekday() <= 2
                ? today.isoWeekday(2)
                : today.add(1, 'week').isoWeekday(2);

        let result = await habitRepository.getListByDate(nextTuesday.toDate());
        expect(result.length).toEqual(1);

        const nextFriday =
            today.isoWeekday() <= 6 ? today.isoWeekday(6) : today.add(1, 'week');

        result = await habitRepository.getListByDate(nextFriday.toDate());
        expect(result.length).toEqual(0);
    });
    it('repeat monthly', async () => {
        const today = moment(new Date()).add(-365, 'days');
        const monthHabit = copyJson(new Habit, {
            id: '1',
            created_date: today.toDate().getTime(),
            name: 'Weekly habit',
            repeatOption: {
                enable: true,
                kind: 'monthly',
                days: [1, 2, 3],
                repeat: 1,
            } as repeatOption,
        });
        await habitRepository.add(monthHabit);
        const nextDay = new Date(today.toDate().getFullYear(), today.month() + 1, 1);
        const result = await habitRepository.getListByDate(nextDay);
        expect(result.length).toEqual(1);

        const nextErrDay = new Date(
            today.toDate().getFullYear(),
            today.month() + 1,
            5,
        );

        const resultErr = await habitRepository.getListByDate(nextErrDay);
        expect(resultErr.length).toEqual(0);
    });
});