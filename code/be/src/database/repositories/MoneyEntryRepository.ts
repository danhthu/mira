import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { MoneyFlowCell } from '../../shared/types/enums';
import { newId } from '../id';

/** Một khoản tiền lẻ. Bản sao của `TimeEntryRepository`, khác mỗi đơn vị đo. */
export interface MoneyEntryRec {
  readonly id: string;
  readonly date: string;
  readonly amount: number;
  readonly cell: MoneyFlowCell;
  readonly categoryId: string | null;
  readonly note: string | null;
}

interface Row {
  id: string;
  date: string;
  amount: number;
  cell: string;
  category_id: string | null;
  note: string | null;
}

const toRec = (r: Row): MoneyEntryRec => ({
  id: r.id,
  date: r.date,
  amount: r.amount,
  cell: r.cell as MoneyFlowCell,
  categoryId: r.category_id,
  note: r.note,
});

const COT = 'id, date, amount, cell, category_id, note';

const Q = {
  findByDateRange: `
    SELECT ${COT} FROM money_entry
    WHERE date >= $1 AND date <= $2 AND user_id = $3 AND deleted_at IS NULL
    ORDER BY date DESC, created_at DESC
  `,
  findById: `
    SELECT ${COT} FROM money_entry WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
  `,
  /**
   * Tổng theo ô cho MỘT THÁNG. Đây là chỗ năm ô dòng chảy của màn Tài chính sinh ra —
   * không còn cột nào trong bảng `money` giữ mấy con số ấy nữa.
   *
   * So khớp tháng bằng `LIKE 'YYYY-MM%'` thay vì `substr(date,1,7) = $1`: dạng này dùng
   * được chỉ mục trên `date`, còn gọi hàm lên cột thì không.
   */
  sumByCellForMonth: `
    SELECT cell, SUM(amount)::INTEGER AS amount
    FROM money_entry
    WHERE user_id = $1 AND date LIKE $2 AND deleted_at IS NULL
    GROUP BY cell
  `,
  /** Lần cuối tháng này có khoản nào được ghi hoặc sửa. Dùng cho "Đã nhập · 25/11". */
  lastTouchedInMonth: `
    SELECT MAX(updated_at) AS at
    FROM money_entry
    WHERE user_id = $1 AND date LIKE $2 AND deleted_at IS NULL
  `,
  insert: `
    INSERT INTO money_entry
      (id, user_id, date, amount, cell, category_id, note, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
    RETURNING ${COT}
  `,
  update: `
    UPDATE money_entry
    SET date = $3, amount = $4, cell = $5, category_id = $6, note = $7, updated_at = $8
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    RETURNING ${COT}
  `,
  softDelete: `
    UPDATE money_entry SET deleted_at = $3, updated_at = $3
    WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    RETURNING ${COT}
  `,
} as const;

export interface CellSum {
  readonly cell: MoneyFlowCell;
  readonly amount: number;
}

export class MoneyEntryRepository {
  constructor(private readonly db: IDatabase) {}

  async findByDateRange(userId: string, from: string, to: string): Promise<MoneyEntryRec[]> {
    const r = await this.db.query<Row>(Q.findByDateRange, [from, to, userId]);
    return r.rows.map(toRec);
  }

  async findById(userId: string, id: string): Promise<MoneyEntryRec | null> {
    const row = await this.db.queryOne<Row>(Q.findById, [id, userId]);
    return row === null ? null : toRec(row);
  }

  /** `month` là YYYY-MM. */
  async sumByCell(userId: string, month: string): Promise<CellSum[]> {
    const r = await this.db.query<{ cell: string; amount: number }>(Q.sumByCellForMonth, [
      userId,
      `${month}%`,
    ]);
    return r.rows.map((x) => ({ cell: x.cell as MoneyFlowCell, amount: x.amount }));
  }

  async lastTouched(userId: string, month: string): Promise<string | null> {
    const row = await this.db.queryOne<{ at: string | null }>(Q.lastTouchedInMonth, [
      userId,
      `${month}%`,
    ]);
    return row?.at ?? null;
  }

  async create(
    userId: string,
    dto: {
      date: string;
      amount: number;
      cell: MoneyFlowCell;
      categoryId: string | null;
      note: string | null;
    },
  ): Promise<MoneyEntryRec> {
    const row = await this.db.queryOne<Row>(Q.insert, [
      newId(),
      userId,
      dto.date,
      dto.amount,
      dto.cell,
      dto.categoryId,
      dto.note,
      new Date().toISOString(),
    ]);
    if (row === null) throw new Error('Insert into money_entry returned no row');
    return toRec(row);
  }

  /** Đọc trước rồi ghi đè cả hàng, giống `TimeEntryRepository.update`. */
  async update(
    userId: string,
    id: string,
    dto: {
      date?: string;
      amount?: number;
      cell?: MoneyFlowCell;
      categoryId?: string | null;
      note?: string | null;
    },
  ): Promise<MoneyEntryRec | null> {
    const cu = await this.findById(userId, id);
    if (cu === null) return null;
    const row = await this.db.queryOne<Row>(Q.update, [
      id,
      userId,
      dto.date ?? cu.date,
      dto.amount ?? cu.amount,
      dto.cell ?? cu.cell,
      dto.categoryId === undefined ? cu.categoryId : dto.categoryId,
      dto.note === undefined ? cu.note : dto.note,
      new Date().toISOString(),
    ]);
    return row === null ? null : toRec(row);
  }

  async softDelete(userId: string, id: string): Promise<MoneyEntryRec | null> {
    const row = await this.db.queryOne<Row>(Q.softDelete, [id, userId, new Date().toISOString()]);
    return row === null ? null : toRec(row);
  }
}
