
import { copyJson } from '../../libs/jsonUtils';
import {
    SetDefaultDbProvider
} from '../../src/Common/Repositories/Repo';
import { Habit } from '../../src/HabitTracker/Entities';
import {
    habitRepository
} from '../../src/HabitTracker/Entities/habitRepository';
import { JsProvider } from "../utils/JsProvider";


describe('habit.getTags', () => {
    beforeAll(() => {
        SetDefaultDbProvider(new JsProvider());
    });
    beforeEach(async () => {
        // Dọn dẹp hoặc reset trạng thái sau mỗi test
        await habitRepository.empty();
    });
    it('returns an array of unique tags', async () => {
        const habits = [
            { id: '1', tags: ['tag1', 'tag2'], name: 'test' },
            { id: '2', tags: ['tag2', 'tag3'], name: 'test 2' },
            { id: '3', tags: ['tag1', 'tag4'], name: 'test 3' },
        ].map(h => copyJson(new Habit, h));;
        await habitRepository.adds(habits);
        const result = await habitRepository.getTags();
        expect(result).toEqual(['tag1', 'tag2', 'tag3', 'tag4']);
    });
    it('returns an empty array if no habits have tags', async () => {
        const result = await habitRepository.getTags();
        expect(result).toEqual([]);
    });
});
