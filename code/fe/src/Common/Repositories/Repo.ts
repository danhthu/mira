import { copyJson } from '../../../libs/jsonUtils';
import { base } from '../Entities/base';
import { AsyncStorageProvider } from './AsyncStorageProvider';
import { DbProvider } from './DbProvider';




let DefaultDbProvider = new AsyncStorageProvider();

export function SetDefaultDbProvider(provider: DbProvider) {
  DefaultDbProvider = provider;
}

export class Repository<TEnty extends base> {
  private name: string;
  protected _data?: Array<TEnty>;
  constructor(x: string) {
    this.name = x;
    this._init();
    //load from async
  }

  protected async validate(entity: TEnty): Promise<[boolean, string?]> {
    return [true, ''];
  }

  protected async _init() {
    if (this._data) return;
    try {
      const tmp = await DefaultDbProvider.getItem(this.name);
      if (tmp) {
        this._data = (JSON.parse(tmp, isoStringToDate) as any[]).map((item) =>
          this.convert(item),
        );

        function isoStringToDate(key: string, value: any) {
          const isoFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
          if (typeof value === 'string' && isoFormat.test(value)) {
            return new Date(value);
          }
          return value;
        }
      } else {
        this._data = [];
      }
    } catch {
      this._data = [];
    }
  }
  public async empty() {
    this._data = [];
    await this.save();
  }
  protected convert(json: TEnty): TEnty {
    return json;
  }

  public async findById(id: string): Promise<TEnty> {
    return this.findOne((s) => s.id == id);
  }

  public async findOne(exp: (arg: TEnty) => boolean): Promise<TEnty> {
    await this._init();
    return this._data.filter((s) => exp(s))[0];
  }

  public async getLast(): Promise<TEnty> {
    await this._init();
    return this._data[this._data.length - 1];
  }

  public async filter(
    filter: (arg: TEnty, index: number) => boolean,
  ): Promise<TEnty[]> {
    await this._init();
    return this._data.filter((val, index) => filter(val, index));
  }

  public async list(): Promise<TEnty[]> {
    await this._init();
    return this._data.filter((h) => !h.deleted);
  }

  public async add(entity: TEnty) {
    await this._init();
    const validatorResult = await this.validate(entity);
    if (!validatorResult[0]) {
      throw new Error(
        'Validation failure: ' +
        (validatorResult.length > 1 ? validatorResult[1] : ''),
      );
    }
    return this._data.push(entity);
  }
  public async adds(entities: TEnty[]) {
    await this._init();
    const validatorResult = await Promise.all(
      entities.map(async (e) => await this.validate(e)),
    );
    if (validatorResult.filter((v) => !v[0]).length > 0) {
      throw new Error(
        'Validation failure: ' +
        validatorResult.map((v) => (v.length > 1 ? v[1] : '')).join(';'),
      );
    }
    return this._data.push(...entities);
  }

  public async addOrUpdate(entity: TEnty) {
    try {
      await this._init();
      const exists = await this.findOne((e) => e.id == entity.id);
      if (exists) {
        await this.update(
          (e) => e.id == entity.id,
          (old) => copyJson(old, entity),
        );
      } else {
        await this.add(entity);
      }

      await this.save();
    } catch (ex) {
      console.error(['db_error', ex]);
    }
  }

  public async delete2(exp: (arg?: TEnty) => boolean) {
    await Promise.all(
      (await this.filter(exp)).map(async (item) => await this.delete3(item)),
    );
    await this.save();
  }

  async delete3(entity: TEnty) {
    await this._init();
    const index = this._data.indexOf(entity);
    if (index > -1) {
      // only splice array when item is found
      this._data.splice(index, 1); // 2nd parameter means remove one item only
    }
  }

  public async delete(entity: TEnty) {
    this.delete3(entity);
    await this.save();
  }
  public async update(
    exp: ((arg?: TEnty) => boolean) | string,
    updated: (arg: TEnty) => void,
  ) {

    const old = await this.filter(e => (typeof (exp) === "string" && e.id == exp) || typeof (exp) === 'function' && exp(e));
    if (old.length > 0) {
      old.forEach((o) => {
        updated(o);
        o.modified_date = new Date().getTime();
      });
    }

    await this.save();
  }
  public async updateList(data: Array<TEnty>) {
    data.forEach((d) => {
      const old = this._data.filter((h) => h.id == d.id)[0];
      copyJson(d, old);
    });
    await this.save();
  }
  public async updates(
    exp: (arg?: TEnty) => boolean,
    updated: (arg: TEnty) => void,
  ) {
    const old = await this.filter(exp);
    old.forEach((s) => updated(s));
    ///updated(old)
    await this.save();
  }

  public async save(noFireEvent?: boolean) {
    await this._init();
    await DefaultDbProvider.setItem(this.name, JSON.stringify(this._data));
    if (!noFireEvent) {
      this._events.map((h) => h());
    }
  }

  public registerDataChanged = (handle: () => void) => {
    //   handle()
    this._events.push(handle);
  };
  public unRegisterDataChanged = (handle: () => void) => {
    this._events.splice(this._events.indexOf(handle), 1);
  };

  protected _events: Array<() => void> = [];
}

export function getRepository<TEntity extends base>(
  name: string,
): Repository<TEntity> {
  return new Repository<TEntity>(name);
}
