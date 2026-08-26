import moment from "moment";
import { repeatOption } from "../../src/Common/Interfaces";
import { SetDefaultDbProvider } from "../../src/Common/Repositories/Repo";
import { dateLesser } from "../../src/Common/Utils/common";
import { habitRepository, habitTrackerRepository } from "../../src/HabitTracker/Entities";
import { JsProvider } from "../utils/JsProvider";

describe('trackerStatistic', () => {
    beforeAll(() => {
        SetDefaultDbProvider(new JsProvider());
    });
    beforeEach(async () => {
        // Dọn dẹp hoặc reset trạng thái sau mỗi test
        await habitRepository.empty();
        await habitTrackerRepository.empty();
    });
    it('Statisc on tracker', async () => {
        let startDate = new Date(2023, 0, 1);
        const dailyHabit = {
            id: '1',
            created_date: startDate.getTime(),
            name: 'Daily habit',
            repeatOption: {
                enable: true,
                kind: 'daily',
                repeat: 1,
            } as repeatOption,
        };
        await habitRepository.add(dailyHabit);
        while (dateLesser(startDate, new Date)) {
            await habitTrackerRepository.doneTracker('1', startDate);
            startDate = moment(startDate).add(1, 'days').toDate();
        }
        const data = await habitTrackerRepository.getStatistic('1');
        expect(data.length).toEqual(-moment(new Date(2023, 0, 1)).diff(new Date, 'days'));

    });

    it('Statisc on all tracker', async () => {

    });

});