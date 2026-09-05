import moment from "moment";
import { SetDefaultDbProvider } from "../../src/Common/Repositories/Repo";
import { Work } from "../../src/Work/Entities";
import { workRepository } from "../../src/Work/Entities/Repository";
import { JsProvider } from "../utils/JsProvider";

describe('trang thai cua mot viec', () => {
    beforeAll(async () => {
        SetDefaultDbProvider(new JsProvider);
    });
    beforeEach(async () => {
        await workRepository.empty();
        await workRepository.adds([
            { ...new Work, id: 'w1', name: 'viec mot', startDate: new Date, status: 'PLAN' },
        ] as Work[]);
    });

    it('danh dau xong roi mo lai bang mot buoc moi chieu', async () => {
        await workRepository.done(await workRepository.findById('w1'));
        expect((await workRepository.findById('w1')).status).toEqual('DONE');

        await workRepository.unDone(await workRepository.findById('w1'));
        expect((await workRepository.findById('w1')).status).toEqual('PLAN');
    });

    it('viec da xong khong con nam trong nhom chua co ngay', async () => {
        await workRepository.update('w1', (w) => (w.startDate = undefined));
        expect((await workRepository.getUnscheduled()).length).toEqual(1);

        await workRepository.done(await workRepository.findById('w1'));
        expect(await workRepository.getUnscheduled()).toEqual([]);
    });

    it('ban ghi nhom cu khong lot vao danh sach ngay', async () => {
        await workRepository.adds([
            { ...new Work, id: 'g1', name: 'nhom cu', kind: 'group', startDate: new Date },
        ] as Work[]);

        const result = await workRepository.getListByDate(new Date);

        expect(result.map((w) => w.id)).toEqual(['w1']);
    });

    it('doi ngay lam ghi ve dau ngay', async () => {
        const target = moment(new Date).add(2, 'days').toDate();
        await workRepository.setDayWillDo(await workRepository.findById('w1'), target);

        const saved = (await workRepository.findById('w1')).startDate;
        expect(saved.getHours()).toEqual(0);
        expect(saved.getMinutes()).toEqual(0);
    });
});
