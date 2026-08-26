import moment from "moment";
import { SetDefaultDbProvider } from "../../src/Common/Repositories/Repo";
import { Habit, habitRepository, HabitTracker, habitTrackerRepository } from "../../src/HabitTracker/Entities";
import { JsProvider } from "../utils/JsProvider";

describe('habit.clean', () => {
    beforeAll(() => {
        SetDefaultDbProvider(new JsProvider());
    });
    beforeEach(async () => {
        // Dọn dẹp hoặc reset trạng thái sau mỗi test
        await habitRepository.empty();
        await habitTrackerRepository.empty();
        const habits = [
            { id: '1', tags: ['tag1', 'tag2'], name: 'test' },
            // { id: '2', tags: ['tag2', 'tag3'], name: 'test 2' },
            // { id: '3', tags: ['tag1', 'tag4'], name: 'test 3' },
        ];
        await habitRepository.adds(habits.map(h => ({ ...new Habit, ...h })));
        await habitTrackerRepository.adds(
            habits
                .map((h) =>
                    [...new Set(Array.from({ length: 10 }, (_, index) => index + 1))].map(
                        (d) =>
                            new HabitTracker(
                                h.id,
                                moment(new Date()).add(-d, 'days').toDate().getTime(),
                            ),
                    ),
                )
                .flat(),
        );
    });
    it('deleted and skip histories', async () => {
        await habitRepository.clean('1', false);
        const result = await habitTrackerRepository.filter((h) => h.hid == '1');
        expect(result.length).toEqual(10);
        //exist >deleted
        const habitExists = await habitRepository.getListByDate(
            moment(new Date()).add(3, 'days').toDate(),
        );
        expect(habitExists.length).toEqual(0);
    });
    it('deleted and clean histories', async () => {
        await habitRepository.clean('1', true);
        const result = await habitTrackerRepository.filter((h) => h.hid == '1');
        expect(result.length).toEqual(0);
    });
});