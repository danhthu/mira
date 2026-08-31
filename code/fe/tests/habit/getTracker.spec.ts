import moment from "moment";
import { getDay } from "../../libs/dateUtils";
import { copyJson } from "../../libs/jsonUtils";
import { SetDefaultDbProvider } from "../../src/Common/Repositories/Repo";
import { Habit, habitRepository, HabitTracker, habitTrackerRepository } from "../../src/HabitTracker/Entities";
import { JsProvider } from "../utils/JsProvider";

describe('getTracker', () => {
    beforeAll(() => {
        SetDefaultDbProvider(new JsProvider());
    });
    beforeEach(async () => {
        // Dọn dẹp hoặc reset trạng thái sau mỗi test
        await habitRepository.empty();
        await habitTrackerRepository.empty();
    });
    it('returns null if habit not exists', async () => {
        const result = await habitTrackerRepository.getTracker('a', new Date());
        expect(result).toBeNull();
    });

    it('returns undone if habit exists', async () => {
        const habits = [
            { id: '1', tags: ['tag1', 'tag2'], name: 'test' },
            { id: '2', tags: ['tag2', 'tag3'], name: 'test 2' },
            { id: '3', tags: ['tag1', 'tag4'], name: 'test 3' },
        ].map(h => copyJson(new Habit, h));;
        await habitRepository.adds(habits);
        const result = await habitTrackerRepository.getTracker('1', new Date());
        expect(result.hid).toEqual('1');
        // 'NOT_WORK' không tồn tại trong type STATUS — getTracker trả 'CREATED'
        // cho habit chưa làm hôm nay (xem habitRepository.ts:216).
        expect(result.status).toEqual('CREATED');
    });
    it('returns tracker if exists', async () => {
        const habits = [
            { id: '1', tags: ['tag1', 'tag2'], name: 'test' },
            { id: '2', tags: ['tag2', 'tag3'], name: 'test 2' },
            { id: '3', tags: ['tag1', 'tag4'], name: 'test 3' },
        ].map(h => copyJson(new Habit, h));;
        await habitRepository.adds(habits);
        const tracker = new HabitTracker('1', getDay(new Date()).getTime());
        tracker.status = 'DONE';
        await habitTrackerRepository.add(tracker);
        const result = await habitTrackerRepository.getTracker('1', new Date());
        expect(result.hid).toEqual('1');
        expect(result.status).toEqual('DONE');
    });

    it('tracker segments', async () => {
        const habits = [
            { id: '1', tags: ['tag1', 'tag2'], name: 'test' },
            { id: '2', tags: ['tag2', 'tag3'], name: 'test 2' },
            { id: '3', tags: ['tag1', 'tag4'], name: 'test 3' },
        ].map(h => copyJson(new Habit, h));;
        await habitRepository.adds(habits);
        //done
        const startDate = new Date(2024, 5, 1);
        await Promise.all([...new Set(Array.from({ length: 5 }, (_, i) => i + 1))].map(async i => {
            await habitTrackerRepository.doneTracker("1", moment(startDate).add(i, 'days').toDate());
        }));
        await Promise.all([...new Set(Array.from({ length: 3 }, (_, i) => i + 10))].map(async i => {

            await habitTrackerRepository.doneTracker("1", moment(startDate).add(i, 'days').toDate());
        }));
        await Promise.all([35].map(async i => {
            await habitTrackerRepository.doneTracker("1", moment(startDate).add(i, 'days').toDate());
        }));
        const segments = await habitTrackerRepository.getSegments();

        expect(segments.length).toEqual(3);
        expect(moment(new Date(segments[0].startDay)).toISOString()).toEqual(moment(startDate).add(1, 'days').toISOString());
        expect(moment(new Date(segments[0].endDay)).toISOString()).toEqual(moment(startDate).add(5, 'days').toISOString());

        expect(segments[2].endDay).toEqual(segments[2].startDay);
        //get daylist

    });
});

