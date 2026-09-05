import { SetDefaultDbProvider } from "../../src/Common/Repositories/Repo";
import { Work } from "../../src/Work/Entities";
import { workRepository } from "../../src/Work/Entities/Repository";
import { JsProvider } from "../utils/JsProvider";

const dailyRepeat = { enable: true, repeat: 1, kind: 'daily' as const };

describe('getListByDate', () => {
    beforeAll(async () => {
        SetDefaultDbProvider(new JsProvider);
    });
    beforeEach(async () => {
        await workRepository.empty();
    });

    it('doc danh sach khong ghi them ban ghi nao vao kho', async () => {
        await workRepository.adds([
            { ...new Work, name: 'lap', startDate: new Date(2023, 1, 1), repeatOption: dailyRepeat },
            { ...new Work, name: 'hom nay', startDate: new Date },
        ] as Work[]);

        const before = (await workRepository.list()).length;
        await workRepository.getListByDate(new Date);
        await workRepository.getListByDate(new Date);
        await workRepository.getListByDate(new Date);

        expect((await workRepository.list()).length).toEqual(before);
    });

    it('viec da xoa khong con trong danh sach cua ngay', async () => {
        await workRepository.adds([
            { ...new Work, id: 'con_lai', name: 'con lai', startDate: new Date },
            { ...new Work, id: 'da_xoa', name: 'da xoa', startDate: new Date },
        ] as Work[]);
        // Bản ghi bị xoá ở máy khác về qua đồng bộ mang cờ `deleted` chứ không biến khỏi mảng.
        await workRepository.update('da_xoa', (w) => {
            w.deleted = true;
            w.deleted_date = new Date().getTime();
        });

        const result = await workRepository.getListByDate(new Date);

        expect(result.map((w) => w.id)).toEqual(['con_lai']);
    });

    it('viec chua co ngay khong hien o ngay nao', async () => {
        await workRepository.adds([
            { ...new Work, id: 'chua_xep', name: 'chua xep' },
        ] as Work[]);

        expect(await workRepository.getListByDate(new Date)).toEqual([]);
        expect((await workRepository.getUnscheduled()).map((w) => w.id)).toEqual(['chua_xep']);
    });
});
