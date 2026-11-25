import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { TimeBucket } from '../../shared/types/enums';
import { newId } from '../id';

export interface DanhMucRec {
  readonly id: string;
  readonly name: string;
  readonly bucket: TimeBucket;
  readonly golden: boolean;
  readonly archivedAt: string | null;
}

interface Row {
  id: string;
  name: string;
  bucket: string;
  golden: boolean;
  archived_at: string | null;
}

const toRec = (r: Row): DanhMucRec => ({
  id: r.id,
  name: r.name,
  bucket: r.bucket as TimeBucket,
  golden: r.golden,
  archivedAt: r.archived_at,
});

const COT = 'id, name, bucket, golden, archived_at';

const Q = {
  findActive: `
    SELECT ${COT} FROM danh_muc
    WHERE user_id = $1 AND archived_at IS NULL AND deleted_at IS NULL
    ORDER BY bucket ASC, lower(name) ASC
  `,
  findAll: `
    SELECT ${COT} FROM danh_muc
    WHERE user_id = $1 AND deleted_at IS NULL
    ORDER BY bucket ASC, lower(name) ASC
  `,
  findById: `
    SELECT ${COT} FROM danh_muc WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
  `,
  countInBucket: `
    SELECT COUNT(*)::INTEGER AS n FROM danh_muc
    WHERE user_id = $1 AND bucket = $2 AND archived_at IS NULL AND deleted_at IS NULL
  `,
  insert: `
    INSERT INTO danh_muc (id, user_id, name, bucket, golden, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $6)
    RETURNING ${COT}
  `,
  rename: `
    UPDATE danh_muc SET name = $3, golden = $4, updated_at = $5
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    RETURNING ${COT}
  `,
  archive: `
    UPDATE danh_muc SET archived_at = $3, updated_at = $3
    WHERE id = $1 AND user_id = $2 AND archived_at IS NULL AND deleted_at IS NULL
    RETURNING ${COT}
  `,
} as const;

/** 23505 là vi phạm chỉ mục duy nhất của Postgres. */
const trungTen = (e: unknown): boolean =>
  typeof e === 'object' && e !== null && (e as { code?: string }).code === '23505';

export class DanhMucRepository {
  constructor(private readonly db: IDatabase) {}

  async findActive(userId: string): Promise<DanhMucRec[]> {
    const r = await this.db.query<Row>(Q.findActive, [userId]);
    return r.rows.map(toRec);
  }

  async findAll(userId: string): Promise<DanhMucRec[]> {
    const r = await this.db.query<Row>(Q.findAll, [userId]);
    return r.rows.map(toRec);
  }

  async findById(id: string, userId: string): Promise<DanhMucRec | null> {
    const row = await this.db.queryOne<Row>(Q.findById, [id, userId]);
    return row === null ? null : toRec(row);
  }

  async countInBucket(userId: string, bucket: TimeBucket): Promise<number> {
    const row = await this.db.queryOne<{ n: number }>(Q.countInBucket, [userId, bucket]);
    return row === null ? 0 : row.n;
  }

  /** Trả null khi trùng tên trong cùng một ô. */
  async create(
    userId: string,
    dto: { name: string; bucket: TimeBucket; golden: boolean },
  ): Promise<DanhMucRec | null> {
    try {
      const row = await this.db.queryOne<Row>(Q.insert, [
        newId(),
        userId,
        dto.name,
        dto.bucket,
        dto.golden,
        new Date().toISOString(),
      ]);
      return row === null ? null : toRec(row);
    } catch (e) {
      if (trungTen(e)) return null;
      throw e;
    }
  }

  /** Trả null khi trùng tên; undefined khi không có danh mục nào như vậy. */
  async rename(
    id: string,
    userId: string,
    name: string,
    golden: boolean,
  ): Promise<DanhMucRec | null | undefined> {
    try {
      const row = await this.db.queryOne<Row>(Q.rename, [
        id,
        userId,
        name,
        golden,
        new Date().toISOString(),
      ]);
      return row === null ? undefined : toRec(row);
    } catch (e) {
      if (trungTen(e)) return null;
      throw e;
    }
  }

  async archive(id: string, userId: string): Promise<DanhMucRec | null> {
    const row = await this.db.queryOne<Row>(Q.archive, [id, userId, new Date().toISOString()]);
    return row === null ? null : toRec(row);
  }
}
