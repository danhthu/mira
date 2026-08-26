import type { IDatabase } from '../../shared/interfaces/IDatabase';
import type { CreatePersonDto, UpdatePersonDto } from '../../shared/dtos/PersonDto';
import type { PersonRow } from '../../shared/types/rows';
import type { Person } from '../../entities/Person';
import { DEFAULT_DUNBAR_RING, DEFAULT_HOURGLASS_ENABLED } from '../../shared/constants';
import { PERSON_QUERIES } from '../queries/person';
import { toPerson } from '../mappers/person';
import { newId } from '../id';

export class PersonRepository {
  constructor(private readonly db: IDatabase) {}

  async findAll(): Promise<Person[]> {
    const result = await this.db.query<PersonRow>(PERSON_QUERIES.findAll);
    return result.rows.map(toPerson);
  }

  async findById(id: string): Promise<Person | null> {
    const row = await this.db.queryOne<PersonRow>(PERSON_QUERIES.findById, [id]);
    return row === null ? null : toPerson(row);
  }

  async create(dto: CreatePersonDto): Promise<Person> {
    const now = new Date().toISOString();
    const row = await this.db.queryOne<PersonRow>(PERSON_QUERIES.insert, [
      newId(),
      dto.name,
      dto.role,
      dto.birthYear ?? null,
      dto.distanceKm ?? null,
      dto.dunbarRing ?? DEFAULT_DUNBAR_RING,
      dto.desiredCadence ?? null,
      dto.hourglassEnabled ?? DEFAULT_HOURGLASS_ENABLED,
      now,
      now,
    ]);
    if (row === null) {
      throw new Error('Insert into person returned no row');
    }
    return toPerson(row);
  }

  // UPDATE dùng danh sách cột cố định nên phải đọc bản ghi hiện tại rồi ghi đè
  // phần DTO gửi lên — tránh sinh SQL động ghép chuỗi.
  async update(id: string, dto: UpdatePersonDto): Promise<Person | null> {
    const current = await this.findById(id);
    if (current === null) {
      return null;
    }
    const row = await this.db.queryOne<PersonRow>(PERSON_QUERIES.update, [
      id,
      dto.name ?? current.name,
      dto.role ?? current.role,
      dto.birthYear === undefined ? current.birthYear : dto.birthYear,
      dto.distanceKm === undefined ? current.distanceKm : dto.distanceKm,
      dto.dunbarRing ?? current.dunbarRing,
      dto.desiredCadence === undefined ? current.desiredCadence : dto.desiredCadence,
      dto.hourglassEnabled ?? current.hourglassEnabled,
      new Date().toISOString(),
    ]);
    return row === null ? null : toPerson(row);
  }

  async softDelete(id: string): Promise<Person | null> {
    const row = await this.db.queryOne<PersonRow>(PERSON_QUERIES.softDelete, [
      id,
      new Date().toISOString(),
    ]);
    return row === null ? null : toPerson(row);
  }
}
