import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { CreateGoalDto, EndGoalDto, UpdateGoalDto } from '../../shared/dtos/GoalDto';
import type { GoalRow } from '../../shared/types/rows';
import type { GoalTier, TimeBucket } from '../../shared/types/enums';
import type { Goal } from '../../entities/Goal';
import { DEFAULT_GOAL_SOURCE_BUCKET, QUARTER_GOAL_DAYS } from '../../shared/constants';
import { GOAL_QUERIES } from '../queries/goal';
import { toGoal } from '../mappers/goal';
import { newId } from '../id';

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export class GoalRepository {
  constructor(private readonly db: IDatabase) {}

  /**
   * Cho tầng quý hết hạn trước khi đọc. Chạy ở đây thay vì bằng cron: app mở lên là
   * danh sách đã đúng, và một mục tiêu hết hạn không cần ai bấm gì để biến mất.
   */
  async expireDue(userId: string): Promise<Goal[]> {
    const result = await this.db.query<GoalRow>(GOAL_QUERIES.expireDueQuarterGoals, [today(), userId]);
    return result.rows.map(toGoal);
  }

  async findById(userId: string, id: string): Promise<Goal | null> {
    const row = await this.db.queryOne<GoalRow>(GOAL_QUERIES.findById, [id, userId]);
    return row === null ? null : toGoal(row);
  }

  async findActive(userId: string, tier?: GoalTier): Promise<Goal[]> {
    await this.expireDue(userId);
    const result =
      tier === undefined
        ? await this.db.query<GoalRow>(GOAL_QUERIES.findActive, [userId])
        : await this.db.query<GoalRow>(GOAL_QUERIES.findActiveByTier, [tier, userId]);
    return result.rows.map(toGoal);
  }

  async findAll(userId: string, tier?: GoalTier): Promise<Goal[]> {
    await this.expireDue(userId);
    const result =
      tier === undefined
        ? await this.db.query<GoalRow>(GOAL_QUERIES.findAll, [userId])
        : await this.db.query<GoalRow>(GOAL_QUERIES.findAllByTier, [tier, userId]);
    return result.rows.map(toGoal);
  }

  async countActiveByTier(userId: string, tier: GoalTier): Promise<number> {
    const row = await this.db.queryOne<{ n: number }>(GOAL_QUERIES.countActiveByTier, [tier, userId]);
    return row === null ? 0 : row.n;
  }

  /** Tổng phút mỗi tuần mà các mục tiêu đang chạy đòi từ một nhóm việc. */
  async sumWeeklyMinutesFrom(userId: string, bucket: TimeBucket): Promise<number> {
    const row = await this.db.queryOne<{ minutes: number }>(
      GOAL_QUERIES.sumWeeklyMinutesBySource,
      [bucket, userId],
    );
    return row === null ? 0 : row.minutes;
  }

  // Chỉ tầng quý có hạn. Dài hạn và nhịp tuần chạy tới khi người dùng tự kết thúc.
  async create(userId: string, dto: CreateGoalDto): Promise<Goal> {
    const now = new Date().toISOString();
    const startedOn = today();
    const row = await this.db.queryOne<GoalRow>(GOAL_QUERIES.insert, [
      newId(),
      userId,
      dto.tier,
      dto.title,
      dto.weeklyMinutes,
      dto.sourceBucket ?? DEFAULT_GOAL_SOURCE_BUCKET,
      startedOn,
      dto.tier === 'quarter' ? addDays(startedOn, QUARTER_GOAL_DAYS) : null,
      now,
    ]);
    if (row === null) {
      throw new Error('Insert into goal returned no row');
    }
    return toGoal(row);
  }

  async update(userId: string, id: string, dto: UpdateGoalDto): Promise<Goal | null> {
    const current = await this.findById(userId, id);
    if (current === null) {
      return null;
    }
    const row = await this.db.queryOne<GoalRow>(GOAL_QUERIES.update, [
      id,
      dto.title ?? current.title,
      dto.weeklyMinutes ?? current.weeklyMinutes,
      new Date().toISOString(),
      userId,
    ]);
    return row === null ? null : toGoal(row);
  }

  async end(userId: string, id: string, dto: EndGoalDto): Promise<Goal | null> {
    const row = await this.db.queryOne<GoalRow>(GOAL_QUERIES.end, [
      id,
      new Date().toISOString(),
      dto.handOverTo ?? null,
      userId,
    ]);
    return row === null ? null : toGoal(row);
  }

  async softDelete(userId: string, id: string): Promise<Goal | null> {
    const row = await this.db.queryOne<GoalRow>(GOAL_QUERIES.softDelete, [
      id,
      new Date().toISOString(),
      userId,
    ]);
    return row === null ? null : toGoal(row);
  }
}
