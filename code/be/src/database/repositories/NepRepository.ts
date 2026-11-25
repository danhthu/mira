import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { TimeBucket } from '../../shared/types/enums';
import { NEP_QUERIES } from '../queries/nep';
import { newId } from '../id';

export interface NepRec {
  readonly id: string;
  readonly title: string;
  readonly bucket: TimeBucket;
  readonly minutes: number;
  readonly golden: boolean;
  /** Thứ trong tuần theo ISO, ví dụ "12345" là thứ hai tới thứ sáu. */
  readonly days: string;
  readonly startedOn: string;
  readonly endedOn: string | null;
}

interface NepRow {
  id: string;
  title: string;
  bucket: string;
  minutes: number;
  golden: boolean;
  days: string;
  started_on: string;
  ended_on: string | null;
}

const toNep = (r: NepRow): NepRec => ({
  id: r.id,
  title: r.title,
  bucket: r.bucket as TimeBucket,
  minutes: r.minutes,
  golden: r.golden,
  days: r.days,
  startedOn: r.started_on,
  endedOn: r.ended_on,
});

export class NepRepository {
  constructor(private readonly db: IDatabase) {}

  async findActive(userId: string): Promise<NepRec[]> {
    const r = await this.db.query<NepRow>(NEP_QUERIES.findActive, [userId]);
    return r.rows.map(toNep);
  }

  async findAll(userId: string): Promise<NepRec[]> {
    const r = await this.db.query<NepRow>(NEP_QUERIES.findAll, [userId]);
    return r.rows.map(toNep);
  }

  async findById(id: string, userId: string): Promise<NepRec | null> {
    const row = await this.db.queryOne<NepRow>(NEP_QUERIES.findById, [id, userId]);
    return row === null ? null : toNep(row);
  }

  async countActive(userId: string): Promise<number> {
    const row = await this.db.queryOne<{ n: number }>(NEP_QUERIES.countActive, [userId]);
    return row === null ? 0 : row.n;
  }

  async create(
    userId: string,
    dto: { title: string; bucket: TimeBucket; minutes: number; golden: boolean; days: string },
  ): Promise<NepRec> {
    const now = new Date().toISOString();
    const row = await this.db.queryOne<NepRow>(NEP_QUERIES.insert, [
      newId(),
      userId,
      dto.title,
      dto.bucket,
      dto.minutes,
      dto.golden,
      dto.days,
      now.slice(0, 10),
      now,
    ]);
    if (row === null) throw new Error('Không tạo được nếp.');
    return toNep(row);
  }

  async end(id: string, userId: string): Promise<NepRec | null> {
    const row = await this.db.queryOne<NepRow>(NEP_QUERIES.end, [
      id,
      userId,
      new Date().toISOString(),
    ]);
    return row === null ? null : toNep(row);
  }

  /** Ngày đã bỏ qua, khoá là `nepId|date`. */
  async boQuaTrongKhoang(userId: string, from: string, to: string): Promise<Set<string>> {
    const r = await this.db.query<{ nep_id: string; date: string }>(
      NEP_QUERIES.boQuaTrongKhoang,
      [userId, from, to],
    );
    return new Set(r.rows.map((x) => `${x.nep_id}|${x.date}`));
  }

  /** Ngày đã sinh hàng giờ, khoá là `nepId|date`. */
  async daSinhTrongKhoang(userId: string, from: string, to: string): Promise<Set<string>> {
    const r = await this.db.query<{ nep_id: string; date: string }>(
      NEP_QUERIES.daSinhTrongKhoang,
      [userId, from, to],
    );
    return new Set(r.rows.map((x) => `${x.nep_id}|${x.date}`));
  }

  async themBoQua(nepId: string, userId: string, date: string): Promise<void> {
    await this.db.execute(NEP_QUERIES.themBoQua, [nepId, userId, date, new Date().toISOString()]);
  }

  async xoaBoQua(nepId: string, userId: string, date: string): Promise<void> {
    await this.db.execute(NEP_QUERIES.xoaBoQua, [nepId, userId, date]);
  }
}
