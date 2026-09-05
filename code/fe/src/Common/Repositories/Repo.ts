import { copyJson } from '../../../libs/jsonUtils';
import { base } from '../Entities/base';
import { AsyncStorageProvider } from './AsyncStorageProvider';
import { emitLocalChange } from './ChangeSink';
import { DbProvider } from './DbProvider';




let DefaultDbProvider: DbProvider = new AsyncStorageProvider();

export function SetDefaultDbProvider(provider: DbProvider) {
  DefaultDbProvider = provider;
}

/** Tầng đồng bộ dùng chung đúng kho lưu trữ với dữ liệu nghiệp vụ. */
export function getDefaultDbProvider(): DbProvider {
  return DefaultDbProvider;
}

/** Cột sổ sách của `base`, không thuộc dữ liệu nghiệp vụ nên không gửi lên server. */
const BOOKKEEPING_FIELDS = new Set<string>([
  'id',
  'created_date',
  'created_by',
  'modified_date',
  'modified_by',
  'deleted',
  'deleted_date',
]);

function businessData<TEnty extends base>(entity: TEnty): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  Object.keys(entity).forEach((key) => {
    if (!BOOKKEEPING_FIELDS.has(key)) {
      out[key] = (entity as unknown as Record<string, unknown>)[key];
    }
  });
  return out;
}

export class Repository<TEnty extends base> {
  private name: string;
  protected _data?: Array<TEnty>;
  /** Id đã đổi kể từ lần `save()` trước, gom lại để một lần ghi chỉ vào hàng đợi một lần. */
  private _dirtyIds = new Set<string>();
  /** Bản ghi bị xoá cứng khỏi mảng — phải giữ lại bản sao để còn gửi bia mộ lên server. */
  private _tombstones = new Map<string, TEnty>();
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
    // Cố ý không sinh bia mộ: `empty()` là xoá sạch kho cục bộ (cài lại app, chạy
    // Setup/clean, dựng lại dữ liệu mẫu), không phải người dùng xoá bản ghi. Nếu
    // đẩy bia mộ lên thì mỗi lần cài lại app sẽ xoá luôn dữ liệu trên server.
    this._dirtyIds.clear();
    this._tombstones.clear();
    await this.save();
  }

  private markDirty(entity: TEnty | undefined) {
    if (entity && entity.id) this._dirtyIds.add(entity.id);
  }

  /**
   * Đẩy các thay đổi vừa ghi sang tầng đồng bộ. Gọi đồng bộ và không await:
   * ghi cục bộ không bao giờ chờ mạng, và lỗi bên hàng đợi không được làm hỏng
   * thao tác ghi đã thành công.
   */
  private flushLocalChanges() {
    if (this._dirtyIds.size === 0 && this._tombstones.size === 0) return;

    const rows = this._data || [];
    this._dirtyIds.forEach((id) => {
      const entity = rows.filter((e) => e.id === id)[0];
      if (!entity) return;
      emitLocalChange({
        table: this.name,
        id,
        updatedAt: entity.modified_date || entity.created_date || Date.now(),
        deletedAt: entity.deleted
          ? entity.deleted_date || entity.modified_date || Date.now()
          : null,
        data: businessData(entity),
      });
    });
    this._dirtyIds.clear();

    this._tombstones.forEach((entity, id) => {
      emitLocalChange({
        table: this.name,
        id,
        updatedAt: Date.now(),
        deletedAt: entity.deleted_date || Date.now(),
        data: businessData(entity),
      });
    });
    this._tombstones.clear();
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
    this.markDirty(entity);
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
    entities.forEach((e) => this.markDirty(e));
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
      // Kho cục bộ xoá cứng, nhưng hợp đồng đồng bộ đòi xoá mềm — giữ lại bản sao
      // để `flushLocalChanges` còn gửi được bia mộ (`deletedAt`) lên server.
      if (entity.id) {
        entity.deleted_date = entity.deleted_date || new Date().getTime();
        this._tombstones.set(entity.id, entity);
        this._dirtyIds.delete(entity.id);
      }
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
        this.markDirty(o);
      });
    }

    await this.save();
  }
  public async updateList(data: Array<TEnty>) {
    data.forEach((d) => {
      const old = this._data.filter((h) => h.id == d.id)[0];
      copyJson(d, old);
      this.markDirty(old);
    });
    await this.save();
  }
  public async updates(
    exp: (arg?: TEnty) => boolean,
    updated: (arg: TEnty) => void,
  ) {
    const old = await this.filter(exp);
    old.forEach((s) => {
      updated(s);
      s.modified_date = new Date().getTime();
      this.markDirty(s);
    });
    ///updated(old)
    await this.save();
  }

  public async save(noFireEvent?: boolean) {
    await this._init();
    await DefaultDbProvider.setItem(this.name, JSON.stringify(this._data));
    this.flushLocalChanges();
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
