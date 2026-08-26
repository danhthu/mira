import { SetDefaultDbProvider } from "../../src/Common/Repositories/Repo";
import { workRepository } from "../../src/Work/Entities/Repository";
import { JsProvider } from "../utils/JsProvider";

describe('statistic', () => {
    beforeAll(async () => {
        SetDefaultDbProvider(new JsProvider);
        await workRepository.empty();
    });
    beforeEach(async () => {
        await workRepository.empty();
    });
    it('get_list', async () => {

    });
});