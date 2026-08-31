import moment from "moment";
import { repeatOption } from "../../src/Common/Interfaces";
import { SetDefaultDbProvider } from "../../src/Common/Repositories/Repo";
import { habitRepository, habitTrackerRepository } from "../../src/HabitTracker/Entities";
import { JsProvider } from "../utils/JsProvider";

describe('trackerStatusByDate', () => {
    beforeAll(() => {
        SetDefaultDbProvider(new JsProvider());
    });
    beforeEach(async () => {
        // Dọn dẹp hoặc reset trạng thái sau mỗi test
        await habitRepository.empty();
        await habitTrackerRepository.empty();
    });
    it('Check Calendar Data', async () => {
        // created_date phải TRƯỚC startDate — getListByDate loại habit ra khỏi
        // những ngày trước khi nó được tạo, nên tạo hôm nay mà đánh dấu hoàn
        // thành cho ngày 2024 sẽ luôn bị lọc ra (đây là bug từng có ở fixture).
        const createdDate = new Date(2024, 0, 1).getTime();
        const habits = [
            {
                created_date: createdDate,
                id: '1', tags: ['tag1', 'tag2'], name: 'test', repeatOption: {
                    enable: true,
                    kind: 'daily',
                    repeat: 1,
                } as repeatOption
            },
            {
                created_date: createdDate,
                id: '2', tags: ['tag2', 'tag3'], name: 'test 2', repeatOption: {
                    enable: true,
                    kind: 'daily',
                    repeat: 1,
                } as repeatOption,
            },
        ];
        await habitRepository.adds(habits);
        //done
        const startDate = new Date(2024, 5, 1);
        await Promise.all([...new Set(Array.from({ length: 3 }, (_, i) => i + 1))].map(async i => {
            await habitTrackerRepository.doneTracker("1", moment(startDate).add(i, 'days').toDate());
            if (i % 2 === 0) {
                await habitTrackerRepository.doneTracker("2", moment(startDate).add(i, 'days').toDate());
            }
        }));
        const result = await habitTrackerRepository.getCalendarData();
        expect(result.length).toEqual(3);
        expect(result[0].status).toEqual(1);
        expect(result[1].status).toEqual(2);
        expect(result[2].status).toEqual(1);
    });

});