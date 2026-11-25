import type { IDatabase } from '../../shared/interfaces/IDatabase';
import { NHAC_QUERIES } from '../queries/nhac';
import { newId } from '../id';

export interface NhacRec {
  readonly id: string;
  /** HH:MM theo đồng hồ người dùng. Máy chủ không diễn giải, chỉ giữ. */
  readonly gio: string;
  /** Thứ trong tuần theo ISO, giống `nep.days`: "12345" là thứ hai tới thứ sáu. */
  readonly days: string;
  readonly loi: string | null;
  readonly bat: boolean;
}

interface NhacRow {
  id: string;
  gio: string;
  days: string;
  loi: string | null;
  bat: boolean;
}

const toNhac = (r: NhacRow): NhacRec => ({
  id: r.id,
  gio: r.gio,
  days: r.days,
  loi: r.loi,
  bat: r.bat,
});

export interface BoQuaRec {
  readonly nhacId: string;
  readonly date: string;
}

export class NhacRepository {
  constructor(private readonly db: IDatabase) {}

  async findAll(userId: string): Promise<NhacRec[]> {
    const r = await this.db.query<NhacRow>(NHAC_QUERIES.findAll, [userId]);
    return r.rows.map(toNhac);
  }

  async findById(id: string, userId: string): Promise<NhacRec | null> {
    const row = await this.db.queryOne<NhacRow>(NHAC_QUERIES.findById, [id, userId]);
    return row === null ? null : toNhac(row);
  }

  async count(userId: string): Promise<number> {
    const row = await this.db.queryOne<{ n: number }>(NHAC_QUERIES.count, [userId]);
    return row?.n ?? 0;
  }

  async create(
    userId: string,
    dto: { gio: string; days: string; loi: string | null },
  ): Promise<NhacRec> {
    const row = await this.db.queryOne<NhacRow>(NHAC_QUERIES.insert, [
      newId(),
      userId,
      dto.gio,
      dto.days,
      dto.loi,
      new Date().toISOString(),
    ]);
    if (row === null) throw new Error('Insert into nhac returned no row');
    return toNhac(row);
  }

  /** `undefined` ở trường nào thì trường đó giữ nguyên (xem `COALESCE` trong câu lệnh). */
  async update(
    id: string,
    userId: string,
    dto: { gio?: string; days?: string; loi?: string | null; bat?: boolean },
  ): Promise<NhacRec | null> {
    const row = await this.db.queryOne<NhacRow>(NHAC_QUERIES.update, [
      id,
      userId,
      dto.gio ?? null,
      dto.days ?? null,
      dto.loi ?? null,
      dto.bat ?? null,
      new Date().toISOString(),
    ]);
    return row === null ? null : toNhac(row);
  }

  async softDelete(id: string, userId: string): Promise<NhacRec | null> {
    const row = await this.db.queryOne<NhacRow>(NHAC_QUERIES.softDelete, [
      id,
      userId,
      new Date().toISOString(),
    ]);
    return row === null ? null : toNhac(row);
  }

  async boQuaTrongKhoang(userId: string, from: string, to: string): Promise<BoQuaRec[]> {
    const r = await this.db.query<{ nhac_id: string; date: string }>(
      NHAC_QUERIES.boQuaTrongKhoang,
      [userId, from, to],
    );
    return r.rows.map((x) => ({ nhacId: x.nhac_id, date: x.date }));
  }

  async themBoQua(id: string, userId: string, date: string): Promise<void> {
    await this.db.query(NHAC_QUERIES.themBoQua, [id, userId, date, new Date().toISOString()]);
  }
}
