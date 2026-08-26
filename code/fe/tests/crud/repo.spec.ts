import { plainToClass } from 'class-transformer';
import { IsInt, Min, validate } from "class-validator";
import { copyJson } from "../../libs/jsonUtils";
import { base } from "../../src/Common/Entities";
import { Repository } from "../../src/Common/Repositories";
import { SetDefaultDbProvider } from "../../src/Common/Repositories/Repo";
import { JsProvider } from "../utils/JsProvider";
class EntityTest extends base {
    @IsInt()
    @Min(100)
    public intVar: number;
}
class Repo extends Repository<EntityTest> {
    protected override async validate(entity: EntityTest): Promise<[boolean, string?]> {
        const enty = plainToClass(EntityTest, entity);
        const validatorResult = await validate(enty);
        if (validatorResult.length > 0) {
            return [false, validatorResult.map((error) => {
                return Object.entries(error.constraints)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
            })
                .join('; ')];
        }
        return [true, ''];
    }
}
const repoTest = new Repo("EntityTest");
describe('repoo', () => {
    beforeAll(() => {
        SetDefaultDbProvider(new JsProvider);
    });
    beforeEach(async () => {
        await repoTest.empty();
    });
    it('findById', async () => {
        await repoTest.add(copyJson(new EntityTest, { intVar: 150, id: '1' }));
        const result = await repoTest.findById('1');
        expect(result.id).toEqual('1');
    });
    it('list', async () => {
        await repoTest.add(copyJson(new EntityTest, { intVar: 150, id: '1' }));
        const result = await repoTest.list();
        expect(result.length).toEqual(1);
    });
    it('add', async () => {
        expect(repoTest.add(new EntityTest))
            .rejects.toThrow();
    });
    it('deleted', async () => {
        await repoTest.add(copyJson(new EntityTest, { intVar: 150, id: '1' }));
        await repoTest.delete2(e => e.id == '1');
        const result = await repoTest.findById('1');
        expect(result).toBeUndefined();
    });
    it('edit', async () => {
        await repoTest.add(copyJson(new EntityTest, { intVar: 150, id: '1' }));
        await repoTest.update(e => e.id == '1', e => { e.intVar = 5; });
        const result = await repoTest.findById('1');
        expect(result.intVar).toEqual(5);
    });
});

