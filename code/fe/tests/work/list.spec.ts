import { SetDefaultDbProvider } from "../../src/Common/Repositories/Repo";
import { Work } from "../../src/Work/Entities";
import { workRepository } from "../../src/Work/Entities/Repository";
import { JsProvider } from "../utils/JsProvider";

describe('list', () => {
    beforeAll(async () => {
        SetDefaultDbProvider(new JsProvider);
        await workRepository.empty();
    });
    beforeEach(async () => {
        await workRepository.empty();
    });
    it('get_list', async () => {
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
                ...new Work, name: 'work' + i + 11, startDate: new Date,
            } as Work))
        ];
        await workRepository.adds(data);
        const result = await workRepository.getListByDate(new Date);
        expect(result.length).toEqual(20);
    });
});