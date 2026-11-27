import type { IDatabase } from '../../shared/interfaces/IDatabase';
import { REMINDER_QUERIES } from '../queries/reminder';
import { newId } from '../id';

export interface ReminderRec {
  readonly id: string;
  /** HH:MM theo đồng hồ người dùng. Máy chủ không diễn giải, chỉ giữ. */
  readonly at: string;
  /** Thứ trong tuần theo ISO, giống `nep.days`: "12345" là thứ hai tới thứ sáu. */
  readonly days: string;
  readonly text: string | null;
  readonly enabled: boolean;
}

interface ReminderRow {
  id: string;
  at: string;
  days: string;
  text: string | null;
  enabled: boolean;
}

const toReminder = (r: ReminderRow): ReminderRec => ({
  id: r.id,
  at: r.at,
  days: r.days,
  text: r.text,
  enabled: r.enabled,
});

export interface SkipRec {
  readonly reminderId: string;
  readonly date: string;
}

export class ReminderRepository {
  constructor(private readonly db: IDatabase) {}

  async findAll(userId: string): Promise<ReminderRec[]> {
    const r = await this.db.query<ReminderRow>(REMINDER_QUERIES.findAll, [userId]);
    return r.rows.map(toReminder);
  }

  async findById(id: string, userId: string): Promise<ReminderRec | null> {
    const row = await this.db.queryOne<ReminderRow>(REMINDER_QUERIES.findById, [id, userId]);
    return row === null ? null : toReminder(row);
  }

  async count(userId: string): Promise<number> {
    const row = await this.db.queryOne<{ n: number }>(REMINDER_QUERIES.count, [userId]);
    return row?.n ?? 0;
  }

  async create(
    userId: string,
    dto: { at: string; days: string; text: string | null },
  ): Promise<ReminderRec> {
    const row = await this.db.queryOne<ReminderRow>(REMINDER_QUERIES.insert, [
      newId(),
      userId,
      dto.at,
      dto.days,
      dto.text,
      new Date().toISOString(),
    ]);
    if (row === null) throw new Error('Insert into reminder returned no row');
    return toReminder(row);
  }

  /** `undefined` ở trường nào thì trường đó giữ nguyên (xem `COALESCE` trong câu lệnh). */
  async update(
    id: string,
    userId: string,
    dto: { at?: string; days?: string; text?: string | null; enabled?: boolean },
  ): Promise<ReminderRec | null> {
    const row = await this.db.queryOne<ReminderRow>(REMINDER_QUERIES.update, [
      id,
      userId,
      dto.at ?? null,
      dto.days ?? null,
      dto.text ?? null,
      dto.enabled ?? null,
      new Date().toISOString(),
    ]);
    return row === null ? null : toReminder(row);
  }

  async softDelete(id: string, userId: string): Promise<ReminderRec | null> {
    const row = await this.db.queryOne<ReminderRow>(REMINDER_QUERIES.softDelete, [
      id,
      userId,
      new Date().toISOString(),
    ]);
    return row === null ? null : toReminder(row);
  }

  async skipsInRange(userId: string, from: string, to: string): Promise<SkipRec[]> {
    const r = await this.db.query<{ reminder_id: string; date: string }>(
      REMINDER_QUERIES.skipsInRange,
      [userId, from, to],
    );
    return r.rows.map((x) => ({ reminderId: x.reminder_id, date: x.date }));
  }

  async addSkip(id: string, userId: string, date: string): Promise<void> {
    await this.db.query(REMINDER_QUERIES.addSkip, [id, userId, date, new Date().toISOString()]);
  }
}
