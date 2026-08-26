import moment from "moment";
import { SetDefaultDbProvider } from "../../src/Common/Repositories/Repo";
import { Work } from "../../src/Work/Entities";
import { workRepository } from "../../src/Work/Entities/Repository";
import { JsProvider } from "../utils/JsProvider";

describe('done', () => {
    beforeAll(async () => {
        SetDefaultDbProvider(new JsProvider);
        await workRepository.empty();
    });
    beforeEach(async () => {
        await workRepository.empty();
    });
    it('done', async () => {
        //tao data
        const data = [...Array.from({ length: 10 }, (_, i) => i + 1)
            .map(i => ({
                ...new Work, name: 'work' + i, startDate: new Date(2023, 1, 1), repeatOption: {
                    enable: true,
                    repeat: 1,
                    kind: 'daily'
                }
            } as Work)),
        ...Array.from({ length: 10 }, (_, i) => i + 1)
            .map(i => ({
                ...new Work,
                id: 'work_' + (i + 11),
                name: 'work' + (i + 11), startDate: new Date,
            } as Work))
        ];
        await workRepository.adds(data);
        const doingDate = moment(new Date).add(3, 'days').toDate();
        doingDate.setHours(0, 0, 0, 0);
        await workRepository.setDayWillDo(await workRepository.findById('work_13'), doingDate);
        const result = await workRepository.findById('work_13');

        expect(result.startDate.getTime()).toEqual(doingDate.getTime());
    });
});