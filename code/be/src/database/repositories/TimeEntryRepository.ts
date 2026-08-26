import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { CreateTimeEntryDto, UpdateTimeEntryDto } from '../../shared/dtos/TimeEntryDto';
import type { TimeEntryRow } from '../../shared/types/rows';
import type { TimeEntry } from '../../entities/TimeEntry';
import { DEFAULT_TIME_ENTRY_SOURCE } from '../../shared/constants';
import { TIME_ENTRY_QUERIES } from '../queries/timeEntry';
import { toTimeEntry } from '../mappers/timeEntry';
import { newId } from '../id';

export class TimeEntryRepository {
  constructor(private readonly db: IDatabase) {}

  async findAll(): Promise<TimeEntry[]> {
    const result = await this.db.query<TimeEntryRow>(TIME_ENTRY_QUERIES.findAll);
    return result.rows.map(toTimeEntry);
  }

  async findById(id: string): Promise<TimeEntry | null> {
    const row = await this.db.queryOne<TimeEntryRow>(TIME_ENTRY_QUERIES.findById, [id]);
    return row === null ? null : toTimeEntry(row);
  }

  async findByDate(date: string): Promise<TimeEntry[]> {
    const result = await this.db.query<TimeEntryRow>(TIME_ENTRY_QUERIES.findByDate, [date]);
    return result.rows.map(toTimeEntry);
  }

  async findByPersonId(personId: string): Promise<TimeEntry[]> {
    const result = await this.db.query<TimeEntryRow>(TIME_ENTRY_QUERIES.findByPersonId, [personId]);
    return result.rows.map(toTimeEntry);
  }

  async findByDateRange(from: string, to: string): Promise<TimeEntry[]> {
    const result = await this.db.query<TimeEntryRow>(TIME_ENTRY_QUERIES.findByDateRange, [from, to]);
    return result.rows.map(toTimeEntry);
  }

  async create(dto: CreateTimeEntryDto): Promise<TimeEntry> {
    const now = new Date().toISOString();
    const row = await this.db.queryOne<TimeEntryRow>(TIME_ENTRY_QUERIES.insert, [
      newId(),
      dto.date,
      dto.minutes,
      dto.bucket,
      dto.personId ?? null,
      dto.note ?? null,
      dto.source ?? DEFAULT_TIME_ENTRY_SOURCE,
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
  async update(id: string, dto: UpdateTimeEntryDto): Promise<TimeEntry | null> {
    const current = await this.findById(id);
    if (current === null) {
      return null;
    }
    const row = await this.db.queryOne<TimeEntryRow>(TIME_ENTRY_QUERIES.update, [
      id,
      current.date,
      dto.minutes ?? current.minutes,
      dto.bucket ?? current.bucket,
      dto.personId === undefined ? current.personId : dto.personId,
      dto.note === undefined ? current.note : dto.note,
      new Date().toISOString(),
    ]);
    return row === null ? null : toTimeEntry(row);
  }

  async softDelete(id: string): Promise<TimeEntry | null> {
    const row = await this.db.queryOne<TimeEntryRow>(TIME_ENTRY_QUERIES.softDelete, [
      id,
      new Date().toISOString(),
    ]);
    return row === null ? null : toTimeEntry(row);
  }
}
