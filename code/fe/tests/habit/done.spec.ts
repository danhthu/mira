import moment from "moment";
import { getDay } from "../../libs/dateUtils";
import { copyJson } from "../../libs/jsonUtils";
import { SetDefaultDbProvider } from "../../src/Common/Repositories/Repo";
import { Habit, habitRepository, HabitTracker, habitTrackerRepository } from "../../src/HabitTracker/Entities";
import { JsProvider } from "../utils/JsProvider";

describe('tracker.done', () => {
    beforeAll(() => {
        SetDefaultDbProvider(new JsProvider());
    });
    beforeEach(async () => {
        await habitRepository.empty();
        await habitTrackerRepository.empty();
        const habits = [
            { id: '1', tags: ['tag1', 'tag2'], name: 'test' },
            { id: '2', tags: ['tag2', 'tag3'], name: 'test 2' },
            { id: '3', tags: ['tag1', 'tag4'], name: 'test 3' },
        ].map(h => copyJson(new Habit, h));;
        await habitRepository.adds(habits);
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
    it('done', async () => {
        await habitTrackerRepository.doneTracker('1', new Date());
        const result = await habitTrackerRepository.findOne(
            (h) => h.hid == '1' && h.day == getDay(new Date()).getTime(),
        );
        expect(result.hid).toEqual('1');
        expect(result.status).toEqual('DONE');
    });

    it('undone', async () => {
        await habitTrackerRepository.doneTracker('1', new Date());
        await habitTrackerRepository.unDoneTracker('1', new Date());
        const result = await habitTrackerRepository.findOne(
            (h) => h.hid == '1' && h.day == getDay(new Date()).getTime(),
        );
        expect(result).toBeUndefined();
    });
});
