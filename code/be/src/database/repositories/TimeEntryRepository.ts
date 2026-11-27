import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { CreateTimeEntryDto, UpdateTimeEntryDto } from '../../shared/dtos/TimeEntryDto';
import type { TimeEntryRow } from '../../shared/types/rows';
import type { TimeBucket } from '../../shared/types/enums';
import type { TimeEntry } from '../../entities/TimeEntry';
import { DEFAULT_TIME_ENTRY_SOURCE } from '../../shared/constants';
import { TIME_ENTRY_QUERIES } from '../queries/timeEntry';
import { toTimeEntry } from '../mappers/timeEntry';
import { newId } from '../id';

export interface BucketSum {
  bucket: TimeBucket;
  minutes: number;
}

/**
 * `userId` là tham số đầu của mọi phương thức, không phải tuỳ chọn. Mỗi câu SQL bên dưới
 * đều có `user_id = $n` — quên một chỗ là người này đọc được dữ liệu của người kia.
 */
export class TimeEntryRepository {
  constructor(private readonly db: IDatabase) {}

  async findAll(userId: string): Promise<TimeEntry[]> {
    const result = await this.db.query<TimeEntryRow>(TIME_ENTRY_QUERIES.findAll, [userId]);
    return result.rows.map(toTimeEntry);
  }

  async findById(userId: string, id: string): Promise<TimeEntry | null> {
    const row = await this.db.queryOne<TimeEntryRow>(TIME_ENTRY_QUERIES.findById, [id, userId]);
    return row === null ? null : toTimeEntry(row);
  }

  async findByDate(userId: string, date: string): Promise<TimeEntry[]> {
    const result = await this.db.query<TimeEntryRow>(TIME_ENTRY_QUERIES.findByDate, [date, userId]);
    return result.rows.map(toTimeEntry);
  }

  async findByDateRange(userId: string, from: string, to: string): Promise<TimeEntry[]> {
    const result = await this.db.query<TimeEntryRow>(TIME_ENTRY_QUERIES.findByDateRange, [from, to, userId]);
    return result.rows.map(toTimeEntry);
  }

  /** Tổng phút theo nhóm việc. Chỉ trả về nhóm có dữ liệu. */
  async sumByBucket(userId: string, from: string, to: string): Promise<BucketSum[]> {
    const result = await this.db.query<{ bucket: string; minutes: number }>(
      TIME_ENTRY_QUERIES.sumByBucket,
      [from, to, userId],
    );
    return result.rows.map((row) => ({ bucket: row.bucket as TimeBucket, minutes: row.minutes }));
  }

  async sumGolden(userId: string, from: string, to: string): Promise<number> {
    const row = await this.db.queryOne<{ minutes: number }>(TIME_ENTRY_QUERIES.sumGolden, [from, to, userId]);
    return row === null ? 0 : row.minutes;
  }

  /** Số ngày khác nhau có ghi trong khoảng. Dùng để biết hai tuần có so được không. */
  async countDays(userId: string, from: string, to: string): Promise<number> {
    const row = await this.db.queryOne<{ days: number }>(TIME_ENTRY_QUERIES.countDays, [from, to, userId]);
    return row === null ? 0 : row.days;
  }

  async create(userId: string, dto: CreateTimeEntryDto): Promise<TimeEntry> {
    const now = new Date().toISOString();
    const row = await this.db.queryOne<TimeEntryRow>(TIME_ENTRY_QUERIES.insert, [
      newId(),
      userId,
      dto.date,
      dto.minutes,
      dto.bucket,
      dto.golden ?? false,
      dto.note ?? null,
      dto.source ?? DEFAULT_TIME_ENTRY_SOURCE,
      dto.routineId ?? null,
      dto.categoryId ?? null,
      now,
      now,
    ]);
    if (row === null) {
      throw new Error('Insert into time_entry returned no row');
    }
    return toTimeEntry(row);
  }

  // UpdateTimeEntryDto không cho sửa date và source, nhưng câu UPDATE ghi cả cột date
  // nên phải lấy lại giá trị hiện tại để không ghi đè bằng null.
  async update(userId: string, id: string, dto: UpdateTimeEntryDto): Promise<TimeEntry | null> {
    const current = await this.findById(userId, id);
    if (current === null) {
      return null;
    }
    const row = await this.db.queryOne<TimeEntryRow>(TIME_ENTRY_QUERIES.update, [
      id,
      current.date,
      dto.minutes ?? current.minutes,
      dto.bucket ?? current.bucket,
      dto.golden ?? current.golden,
      dto.note === undefined ? current.note : dto.note,
      dto.categoryId === undefined ? current.categoryId : dto.categoryId,
      new Date().toISOString(),
      userId,
    ]);
    return row === null ? null : toTimeEntry(row);
  }

  async softDelete(userId: string, id: string): Promise<TimeEntry | null> {
    const row = await this.db.queryOne<TimeEntryRow>(TIME_ENTRY_QUERIES.softDelete, [
      id,
      new Date().toISOString(),
      userId,
    ]);
    return row === null ? null : toTimeEntry(row);
  }
}
