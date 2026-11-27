import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { AnswerRevisitDto, CreateMomentDto, UpdateMomentDto } from '../../shared/dtos/MomentDto';
import type { MomentRow } from '../../shared/types/rows';
import type { MomentKind } from '../../shared/types/enums';
import type { Moment } from '../../entities/Moment';
import { SALT_REVISIT_DAYS } from '../../shared/constants';
import { MOMENT_QUERIES } from '../queries/moment';
import { toMoment } from '../mappers/moment';
import { newId } from '../id';

/** Cộng ngày vào một chuỗi YYYY-MM-DD, trả về cùng định dạng. */
function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export class MomentRepository {
  constructor(private readonly db: IDatabase) {}

  async findAll(userId: string): Promise<Moment[]> {
    const result = await this.db.query<MomentRow>(MOMENT_QUERIES.findAll, [userId]);
    return result.rows.map(toMoment);
  }

  async findById(userId: string, id: string): Promise<Moment | null> {
    const row = await this.db.queryOne<MomentRow>(MOMENT_QUERIES.findById, [id, userId]);
    return row === null ? null : toMoment(row);
  }

  async findByDateRange(userId: string, from: string, to: string): Promise<Moment[]> {
    const result = await this.db.query<MomentRow>(MOMENT_QUERIES.findByDateRange, [from, to, userId]);
    return result.rows.map(toMoment);
  }

  async findByKind(userId: string, kind: MomentKind): Promise<Moment[]> {
    const result = await this.db.query<MomentRow>(MOMENT_QUERIES.findByKind, [kind, userId]);
    return result.rows.map(toMoment);
  }

  /** Hạt muối đã tới hạn hỏi lại và chưa từng trả lời. */
  async findDueForRevisit(userId: string, on: string): Promise<Moment[]> {
    const result = await this.db.query<MomentRow>(MOMENT_QUERIES.findDueForRevisit, [on, userId]);
    return result.rows.map(toMoment);
  }

  // Ngày hỏi lại được tính ngay lúc ghi, không tính lại khi đọc: nếu sau này đổi
  // SALT_REVISIT_DAYS thì những hạt cũ vẫn giữ đúng hẹn đã hứa với người dùng.
  async create(userId: string, dto: CreateMomentDto): Promise<Moment> {
    const now = new Date().toISOString();
    const revisitAt = dto.kind === 'salt' ? addDays(dto.date, SALT_REVISIT_DAYS) : null;
    const row = await this.db.queryOne<MomentRow>(MOMENT_QUERIES.insert, [
      newId(),
      userId,
      dto.date,
      dto.kind,
      dto.text ?? null,
      revisitAt,
      now,
    ]);
    if (row === null) {
      throw new Error('Insert into moment returned no row');
    }
    return toMoment(row);
  }

  /**
   * Sửa chữ, và đổi kẹo ↔ muối.
   *
   * Đổi loại thì **tính lại hẹn hỏi lại**, theo đúng luật lúc ghi mới: muối có hẹn sau
   * 42 ngày kể từ NGÀY CỦA HẠT (không phải hôm nay), kẹo không có hẹn. Giữ nguyên
   * `revisit_at` cũ khi đổi sang kẹo sẽ để lại một cái hẹn mồ côi, và Mira sẽ hỏi lại
   * một ngày vui như thể nó là một ngày nặng.
   */
  async update(userId: string, id: string, dto: UpdateMomentDto): Promise<Moment | null> {
    const current = await this.findById(userId, id);
    if (current === null) {
      return null;
    }
    const kind = dto.kind ?? current.kind;
    const revisitAt =
      kind === current.kind
        ? current.revisitAt
        : kind === 'salt'
          ? addDays(current.date, SALT_REVISIT_DAYS)
          : null;

    const row = await this.db.queryOne<MomentRow>(MOMENT_QUERIES.update, [
      id,
      dto.text === undefined ? current.text : dto.text,
      kind,
      revisitAt,
      new Date().toISOString(),
      userId,
    ]);
    return row === null ? null : toMoment(row);
  }

  /**
   * Trả `null` khi hạt không tồn tại, không phải muối, hoặc đã trả lời rồi — câu
   * UPDATE tự lọc cả ba. Tầng trên phân biệt bằng cách đọc lại hạt.
   */
  async answerRevisit(userId: string, id: string, dto: AnswerRevisitDto): Promise<Moment | null> {
    const row = await this.db.queryOne<MomentRow>(MOMENT_QUERIES.answerRevisit, [
      id,
      dto.answer,
      new Date().toISOString(),
      userId,
    ]);
    return row === null ? null : toMoment(row);
  }

  async softDelete(userId: string, id: string): Promise<Moment | null> {
    const row = await this.db.queryOne<MomentRow>(MOMENT_QUERIES.softDelete, [
      id,
      new Date().toISOString(),
      userId,
    ]);
    return row === null ? null : toMoment(row);
  }
}
