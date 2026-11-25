import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { Habit } from '../../entities/Habit';
import type { HabitRow } from '../../shared/types/rows';
import { HABIT_QUERIES } from '../queries/habit';
import { newId } from '../id';

function toHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    title: row.title,
    targetPerWeek: row.target_per_week,
    startedOn: row.started_on,
    endedOn: row.ended_on,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export class HabitRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(userId: string, id: string): Promise<Habit | null> {
    const row = await this.db.queryOne<HabitRow>(HABIT_QUERIES.findById, [id, userId]);
    return row === null ? null : toHabit(row);
  }

  async findActive(userId: string): Promise<Habit[]> {
    const result = await this.db.query<HabitRow>(HABIT_QUERIES.findActive, [userId]);
    return result.rows.map(toHabit);
  }

  /** Mọi thói quen kể cả đã dừng, kèm mọi lần đánh dấu. Chỉ dùng cho xuất file. */
  async findAllForExport(userId: string): Promise<{ habits: Habit[]; checks: { habitId: string; date: string }[] }> {
    const [h, c] = await Promise.all([
      this.db.query<HabitRow>(HABIT_QUERIES.findAll, [userId]),
      this.db.query<{ habit_id: string; date: string }>(HABIT_QUERIES.allChecks, [userId]),
    ]);
    return {
      habits: h.rows.map(toHabit),
      checks: c.rows.map((r) => ({ habitId: r.habit_id, date: r.date })),
    };
  }

  async countActive(userId: string): Promise<number> {
    const row = await this.db.queryOne<{ n: number }>(HABIT_QUERIES.countActive, [userId]);
    return row === null ? 0 : row.n;
  }

  async create(userId: string, title: string, targetPerWeek: number): Promise<Habit> {
    const now = new Date().toISOString();
    const row = await this.db.queryOne<HabitRow>(HABIT_QUERIES.insert, [
      newId(),
      userId,
      title,
      targetPerWeek,
      today(),
      now,
    ]);
    if (row === null) {
      throw new Error('Insert into habit returned no row');
    }
    return toHabit(row);
  }

  async update(userId: string, id: string, title: string, targetPerWeek: number): Promise<Habit | null> {
    const row = await this.db.queryOne<HabitRow>(HABIT_QUERIES.update, [
      id,
      title,
      targetPerWeek,
      new Date().toISOString(),
      userId,
    ]);
    return row === null ? null : toHabit(row);
  }

  async end(userId: string, id: string): Promise<Habit | null> {
    const row = await this.db.queryOne<HabitRow>(HABIT_QUERIES.end, [id, today(), userId]);
    return row === null ? null : toHabit(row);
  }

  /** Những lần đã làm trong khoảng ngày, nhóm theo thói quen. */
  async checksInRange(userId: string, from: string, to: string): Promise<Map<string, string[]>> {
    const result = await this.db.query<{ habit_id: string; date: string }>(
      HABIT_QUERIES.checksInRange,
      [from, to, userId],
    );
    const byHabit = new Map<string, string[]>();
    for (const row of result.rows) {
      const dates = byHabit.get(row.habit_id) ?? [];
      dates.push(row.date);
      byHabit.set(row.habit_id, dates);
    }
    return byHabit;
  }

  /** Đánh dấu đã làm. Bấm lại trong cùng ngày không tạo bản ghi thứ hai. */
  async check(userId: string, habitId: string, date: string): Promise<void> {
    await this.db.execute(HABIT_QUERIES.check, [
      newId(),
      habitId,
      userId,
      date,
      new Date().toISOString(),
    ]);
  }

  async uncheck(userId: string, habitId: string, date: string): Promise<void> {
    await this.db.execute(HABIT_QUERIES.uncheck, [habitId, date, userId]);
  }
}
