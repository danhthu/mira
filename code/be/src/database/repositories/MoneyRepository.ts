import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { UpsertMoneyDto } from '../../shared/dtos/MoneyDto';
import type { MoneyRow } from '../../shared/types/rows';
import type { Money } from '../../entities/Money';
import { MONEY_QUERIES } from '../queries/money';
import { toMoney } from '../mappers/money';
import { newId } from '../id';

export class MoneyRepository {
  constructor(private readonly db: IDatabase) {}

  async findByMonth(userId: string, month: string): Promise<Money | null> {
    const row = await this.db.queryOne<MoneyRow>(MONEY_QUERIES.findByMonth, [month, userId]);
    return row === null ? null : toMoney(row);
  }

  async findRange(userId: string, from: string, to: string): Promise<Money[]> {
    const result = await this.db.query<MoneyRow>(MONEY_QUERIES.findRange, [from, to, userId]);
    return result.rows.map(toMoney);
  }

  /**
   * Ghi năm ô của một tháng. `undefined` giữ nguyên ô đang có, `null` tường minh xoá
   * giá trị về trạng thái chưa nhập. Tháng chưa có bản ghi thì tạo mới với đúng
   * những ô được gửi lên, phần còn lại là null.
   */
  async upsert(userId: string, month: string, dto: UpsertMoneyDto): Promise<Money> {
    const now = new Date().toISOString();
    const current = await this.findByMonth(userId, month);

    if (current === null) {
      const row = await this.db.queryOne<MoneyRow>(MONEY_QUERIES.insert, [
        newId(),
        userId,
        month,
        dto.netIncome ?? null,
        dto.monthlyExpense ?? null,
        dto.debtPayment ?? null,
        dto.debtBalance ?? null,
        dto.netWorth ?? null,
        now,
      ]);
      if (row === null) {
        throw new Error('Insert into money returned no row');
      }
      return toMoney(row);
    }

    const row = await this.db.queryOne<MoneyRow>(MONEY_QUERIES.update, [
      month,
      dto.netIncome === undefined ? current.netIncome : dto.netIncome,
      dto.monthlyExpense === undefined ? current.monthlyExpense : dto.monthlyExpense,
      dto.debtPayment === undefined ? current.debtPayment : dto.debtPayment,
      dto.debtBalance === undefined ? current.debtBalance : dto.debtBalance,
      dto.netWorth === undefined ? current.netWorth : dto.netWorth,
      now,
      userId,
    ]);
    if (row === null) {
      throw new Error(`Update money for ${month} returned no row`);
    }
    return toMoney(row);
  }
}
