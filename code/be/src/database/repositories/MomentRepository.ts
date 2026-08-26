import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { CreateMomentDto, UpdateMomentDto } from '../../shared/dtos/MomentDto';
import type { MomentRow } from '../../shared/types/rows';
import type { TimeBucket } from '../../shared/types/enums';
import type { Moment } from '../../entities/Moment';
import { MOMENT_QUERIES } from '../queries/moment';
import { toMoment, serializePersonIds } from '../mappers/moment';
import { newId } from '../id';

export class MomentRepository {
  constructor(private readonly db: IDatabase) {}

  async findAll(): Promise<Moment[]> {
    const result = await this.db.query<MomentRow>(MOMENT_QUERIES.findAll);
    return result.rows.map(toMoment);
  }

  async findById(id: string): Promise<Moment | null> {
    const row = await this.db.queryOne<MomentRow>(MOMENT_QUERIES.findById, [id]);
    return row === null ? null : toMoment(row);
  }

  async findByDateRange(from: string, to: string): Promise<Moment[]> {
    const result = await this.db.query<MomentRow>(MOMENT_QUERIES.findByDateRange, [from, to]);
    return result.rows.map(toMoment);
  }

  async findByBucket(bucket: TimeBucket): Promise<Moment[]> {
    const result = await this.db.query<MomentRow>(MOMENT_QUERIES.findByBucket, [bucket]);
    return result.rows.map(toMoment);
  }

  async create(dto: CreateMomentDto): Promise<Moment> {
    const now = new Date().toISOString();
    const row = await this.db.queryOne<MomentRow>(MOMENT_QUERIES.insert, [
      newId(),
      dto.occurredAt,
      dto.text ?? null,
      dto.mediaUri ?? null,
      dto.mediaType ?? null,
      serializePersonIds(dto.personIds ?? []),
      dto.bucket ?? null,
      now,
      now,
    ]);
    if (row === null) {
      throw new Error('Insert into moment returned no row');
    }
    return toMoment(row);
  }

  // UpdateMomentDto không cho sửa occurredAt nhưng câu UPDATE ghi cả cột đó,
  // nên phải đọc bản ghi hiện tại rồi ghi đè phần DTO gửi lên.
  async update(id: string, dto: UpdateMomentDto): Promise<Moment | null> {
    const current = await this.findById(id);
    if (current === null) {
      return null;
    }
    const row = await this.db.queryOne<MomentRow>(MOMENT_QUERIES.update, [
      id,
      current.occurredAt,
      dto.text === undefined ? current.text : dto.text,
      dto.mediaUri === undefined ? current.mediaUri : dto.mediaUri,
      dto.mediaType === undefined ? current.mediaType : dto.mediaType,
      serializePersonIds(dto.personIds ?? current.personIds),
      dto.bucket === undefined ? current.bucket : dto.bucket,
      new Date().toISOString(),
    ]);
    return row === null ? null : toMoment(row);
  }

  async softDelete(id: string): Promise<Moment | null> {
    const row = await this.db.queryOne<MomentRow>(MOMENT_QUERIES.softDelete, [
      id,
      new Date().toISOString(),
    ]);
    return row === null ? null : toMoment(row);
  }
}
