import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { MoneyFlowCell } from '../../shared/types/enums';
import { newId } from '../id';

/**
 * Danh mục tiền. Bản sao từng dòng của `CategoryRepository`, cố ý.
 *
 * Hai thứ làm cùng một việc thì nên đọc giống nhau: người sửa mã chỉ phải hiểu một lần,
 * và lúc sửa một bên thì nhìn sang bên kia là biết phải sửa gì.
 */
export interface MoneyCategoryRec {
  readonly id: string;
  readonly name: string;
  readonly cell: MoneyFlowCell;
  readonly archivedAt: string | null;
  /** Dạng rộng có chủ ý — tầng dịch vụ mới là chỗ kiểm khoá, xem `CategoryRepository`. */
  readonly icon: string | null;
  readonly color: string | null;
}

interface Row {
  id: string;
  name: string;
  cell: string;
  archived_at: string | null;
  icon: string | null;
  color: string | null;
}

const toRec = (r: Row): MoneyCategoryRec => ({
  id: r.id,
  name: r.name,
  cell: r.cell as MoneyFlowCell,
  archivedAt: r.archived_at,
  icon: r.icon,
  color: r.color,
});

const COT = 'id, name, cell, archived_at, icon, color';

const Q = {
  findActive: `
    SELECT ${COT} FROM money_category
    WHERE user_id = $1 AND archived_at IS NULL AND deleted_at IS NULL
    ORDER BY cell ASC, lower(name) ASC
  `,
  findAll: `
    SELECT ${COT} FROM money_category
    WHERE user_id = $1 AND deleted_at IS NULL
    ORDER BY cell ASC, lower(name) ASC
  `,
  findById: `
    SELECT ${COT} FROM money_category WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
  `,
  countInCell: `
    SELECT COUNT(*)::INTEGER AS n FROM money_category
    WHERE user_id = $1 AND cell = $2 AND archived_at IS NULL AND deleted_at IS NULL
  `,
  insert: `
    INSERT INTO money_category (id, user_id, name, cell, icon, color, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $6, $7, $5, $5)
    RETURNING ${COT}
  `,
  rename: `
    UPDATE money_category SET name = $3, icon = $5, color = $6, updated_at = $4
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    RETURNING ${COT}
  `,
  archive: `
    UPDATE money_category SET archived_at = $3, updated_at = $3
    WHERE id = $1 AND user_id = $2 AND archived_at IS NULL AND deleted_at IS NULL
    RETURNING ${COT}
  `,
} as const;

/** 23505 là vi phạm chỉ mục duy nhất của Postgres. */
const duplicateNames = (e: unknown): boolean =>
  typeof e === 'object' && e !== null && (e as { code?: string }).code === '23505';

export class MoneyCategoryRepository {
  constructor(private readonly db: IDatabase) {}

  async findActive(userId: string): Promise<MoneyCategoryRec[]> {
    const r = await this.db.query<Row>(Q.findActive, [userId]);
    return r.rows.map(toRec);
  }

  async findAll(userId: string): Promise<MoneyCategoryRec[]> {
    const r = await this.db.query<Row>(Q.findAll, [userId]);
    return r.rows.map(toRec);
  }

  async findById(id: string, userId: string): Promise<MoneyCategoryRec | null> {
    const row = await this.db.queryOne<Row>(Q.findById, [id, userId]);
    return row === null ? null : toRec(row);
  }

  async countInCell(userId: string, cell: MoneyFlowCell): Promise<number> {
    const row = await this.db.queryOne<{ n: number }>(Q.countInCell, [userId, cell]);
    return row === null ? 0 : row.n;
  }

  /** Trả null khi trùng tên trong cùng một ô. */
  async create(
    userId: string,
    dto: { name: string; cell: MoneyFlowCell; icon: string | null; color: string | null },
  ): Promise<MoneyCategoryRec | null> {
    try {
      const row = await this.db.queryOne<Row>(Q.insert, [
        newId(),
        userId,
        dto.name,
        dto.cell,
        new Date().toISOString(),
        dto.icon,
        dto.color,
      ]);
      return row === null ? null : toRec(row);
    } catch (e) {
      if (duplicateNames(e)) return null;
      throw e;
    }
  }

  /** Trả null khi trùng tên; undefined khi không có danh mục nào như vậy. */
  async rename(
    id: string,
    userId: string,
    name: string,
    icon: string | null,
    color: string | null,
  ): Promise<MoneyCategoryRec | null | undefined> {
    try {
      const row = await this.db.queryOne<Row>(Q.rename, [
        id,
        userId,
        name,
        new Date().toISOString(),
        icon,
        color,
      ]);
      return row === null ? undefined : toRec(row);
    } catch (e) {
      if (duplicateNames(e)) return null;
      throw e;
    }
  }

  async archive(id: string, userId: string): Promise<MoneyCategoryRec | null> {
    const row = await this.db.queryOne<Row>(Q.archive, [id, userId, new Date().toISOString()]);
    return row === null ? null : toRec(row);
  }
}
