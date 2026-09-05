import { base } from '../../src/Common/Entities/base';
import { Repository, SetDefaultDbProvider } from '../../src/Common/Repositories/Repo';
import { Outbox } from '../../src/Common/Sync/Outbox';
import { SyncEngine } from '../../src/Common/Sync/SyncEngine';
import {
  clearSyncedRepositories,
  registerSyncedRepository,
} from '../../src/Common/Sync/SyncRegistry';
import { FakeSyncServer } from '../utils/FakeSyncServer';
import { JsProvider } from '../utils/JsProvider';

class Person extends base {
  public name?: string;
}

const TABLE = 'person';

/** Không hẹn giờ thật trong test — vòng đồng bộ do test tự gọi `runNow()`. */
const noSchedule = () => 0;
const noCancel = () => undefined;

let repo: Repository<Person>;
let server: FakeSyncServer;
let engine: SyncEngine;

async function freshEngine(enabled: boolean): Promise<SyncEngine> {
  const next = new SyncEngine({
    fetchImpl: server.fetch,
    schedule: noSchedule,
    cancel: noCancel,
  });
  await next.start();
  await next.updateSettings({ enabled, serverUrl: 'http://127.0.0.1:3000' });
  return next;
}

beforeEach(async () => {
  SetDefaultDbProvider(new JsProvider());
  clearSyncedRepositories();
  server = new FakeSyncServer();
  repo = new Repository<Person>(TABLE);
  await repo.empty();
  registerSyncedRepository(TABLE, repo);
  engine = await freshEngine(true);
});

afterEach(() => {
  engine.stop();
});

describe('đồng bộ khi mất mạng', () => {
  it('mạng hỏng thì ghi cục bộ vẫn thành công và mục vào hàng đợi', async () => {
    server.online = false;

    const person = new Person();
    person.id = 'p1';
    person.name = 'Mẹ';
    await repo.addOrUpdate(person);

    const rows = await repo.list();
    expect(rows.length).toEqual(1);
    expect(rows[0].name).toEqual('Mẹ');

    expect(await engine.pendingCount()).toEqual(1);
  });

  it('mạng hỏng thì một vòng đồng bộ kết thúc êm và giữ nguyên hàng đợi', async () => {
    server.online = false;

    const person = new Person();
    person.id = 'p1';
    person.name = 'Mẹ';
    await repo.addOrUpdate(person);

    const result = await engine.runNow();
    expect(result.completed).toEqual(false);
    expect(result.pending).toEqual(1);
    expect(await engine.pendingCount()).toEqual(1);
  });

  it('mạng có lại thì hàng đợi được đẩy đi và dọn sạch', async () => {
    server.online = false;

    const person = new Person();
    person.id = 'p1';
    person.name = 'Mẹ';
    await repo.addOrUpdate(person);
    await engine.runNow();
    expect(await engine.pendingCount()).toEqual(1);

    server.online = true;
    const result = await engine.runNow();

    expect(result.completed).toEqual(true);
    expect(result.pushed).toEqual(1);
    expect(await engine.pendingCount()).toEqual(0);
    expect(server.get(TABLE, 'p1').data.name).toEqual('Mẹ');
  });

  it('nhiều lần ghi cùng một bản ghi chỉ tốn một mục trong hàng đợi', async () => {
    server.online = false;

    const person = new Person();
    person.id = 'p1';
    person.name = 'Mẹ';
    await repo.addOrUpdate(person);
    await repo.update('p1', (p) => {
      p.name = 'Mẹ Hoa';
    });

    expect(await engine.pendingCount()).toEqual(1);

    server.online = true;
    await engine.runNow();
    expect(server.get(TABLE, 'p1').data.name).toEqual('Mẹ Hoa');
  });

  it('xoá cục bộ khi mất mạng vẫn gửi được bia mộ khi mạng có lại', async () => {
    const person = new Person();
    person.id = 'p1';
    person.name = 'Mẹ';
    await repo.addOrUpdate(person);
    await engine.runNow();

    server.online = false;
    await repo.delete2((p) => p.id === 'p1');
    expect((await repo.list()).length).toEqual(0);
    expect(await engine.pendingCount()).toEqual(1);

    server.online = true;
    await engine.runNow();
    expect(server.get(TABLE, 'p1').deletedAt).not.toBeNull();
    expect(await engine.pendingCount()).toEqual(0);
  });
});

describe('tắt đồng bộ', () => {
  it('hàng đợi vẫn tích lại, không gọi mạng, bật lên đẩy tiếp', async () => {
    engine.stop();
    engine = await freshEngine(false);

    const person = new Person();
    person.id = 'p1';
    person.name = 'Mẹ';
    await repo.addOrUpdate(person);

    const off = await engine.runNow();
    expect(off.completed).toEqual(false);
    expect(server.pushCalls).toEqual(0);
    expect(await engine.pendingCount()).toEqual(1);

    await engine.updateSettings({ enabled: true });
    const on = await engine.runNow();
    expect(on.completed).toEqual(true);
    expect(await engine.pendingCount()).toEqual(0);
    expect(server.get(TABLE, 'p1').data.name).toEqual('Mẹ');
  });
});

describe('áp thay đổi từ server', () => {
  it('bản server mới hơn thì đè bản cục bộ', async () => {
    const person = new Person();
    person.id = 'p1';
    person.name = 'Mẹ';
    person.modified_date = Date.parse('2026-09-01T00:00:00.000Z');
    await repo.addOrUpdate(person);
    await engine.runNow();

    server.seed({
      table: TABLE,
      id: 'p1',
      updatedAt: '2026-09-04T00:00:00.000Z',
      deletedAt: null,
      data: { name: 'Mẹ Hoa' },
    });

    await engine.runNow();

    const stored = await repo.findById('p1');
    expect(stored.name).toEqual('Mẹ Hoa');
    expect(stored.modified_date).toEqual(Date.parse('2026-09-04T00:00:00.000Z'));
  });

  it('bản server cũ hơn thì không đè bản cục bộ', async () => {
    const person = new Person();
    person.id = 'p1';
    person.name = 'Mẹ Hoa';
    await repo.addOrUpdate(person);
    await engine.runNow();

    // Máy khác đẩy lên một bản cũ hơn hẳn bản đang có trên máy này.
    server.seed({
      table: TABLE,
      id: 'p1',
      updatedAt: '2020-01-01T00:00:00.000Z',
      deletedAt: null,
      data: { name: 'Tên cũ' },
    });

    await engine.runNow();

    expect((await repo.findById('p1')).name).toEqual('Mẹ Hoa');
  });

  it('bản ghi mới từ server được thêm vào kho cục bộ', async () => {
    server.seed({
      table: TABLE,
      id: 'p2',
      updatedAt: '2026-09-04T00:00:00.000Z',
      deletedAt: null,
      data: { name: 'Bố' },
    });

    await engine.runNow();

    const rows = await repo.list();
    expect(rows.length).toEqual(1);
    expect(rows[0].name).toEqual('Bố');
  });

  it('bản có deletedAt thì xoá mềm theo ở cục bộ', async () => {
    const person = new Person();
    person.id = 'p1';
    person.name = 'Mẹ';
    person.modified_date = Date.parse('2026-09-01T00:00:00.000Z');
    await repo.addOrUpdate(person);
    await engine.runNow();

    server.seed({
      table: TABLE,
      id: 'p1',
      updatedAt: '2026-09-04T00:00:00.000Z',
      deletedAt: '2026-09-04T00:00:00.000Z',
      data: { name: 'Mẹ' },
    });

    await engine.runNow();

    expect((await repo.list()).length).toEqual(0);
    const soft = await repo.findById('p1');
    expect(soft.deleted).toEqual(true);
    expect(soft.deleted_date).toEqual(Date.parse('2026-09-04T00:00:00.000Z'));
  });

  it('áp bản từ server không sinh mục mới trong hàng đợi gửi đi', async () => {
    server.seed({
      table: TABLE,
      id: 'p2',
      updatedAt: '2026-09-04T00:00:00.000Z',
      deletedAt: null,
      data: { name: 'Bố' },
    });

    await engine.runNow();
    expect(await engine.pendingCount()).toEqual(0);
  });
});

describe('hàng đợi bền', () => {
  it('mục đã xếp hàng còn nguyên sau khi app khởi động lại', async () => {
    server.online = false;

    const person = new Person();
    person.id = 'p1';
    person.name = 'Mẹ';
    await repo.addOrUpdate(person);

    // Engine mới trên cùng kho lưu trữ = mở lại app.
    engine.stop();
    engine = await freshEngine(true);

    expect(await new Outbox().count()).toEqual(1);

    server.online = true;
    await engine.runNow();
    expect(await engine.pendingCount()).toEqual(0);
  });
});

describe('bảng ngoài hợp đồng', () => {
  it('repository không thuộc 13 bảng thì không có gì rời khỏi máy', async () => {
    const localOnly = new Repository<Person>('habit_tracker');
    await localOnly.empty();

    const row = new Person();
    row.id = 'h1';
    row.name = 'Chạy bộ';
    await localOnly.addOrUpdate(row);

    expect(await engine.pendingCount()).toEqual(0);
  });
});
