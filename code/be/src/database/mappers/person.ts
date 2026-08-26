import type { PersonRow } from '../../shared/types/rows';
import type { PersonRole, DunbarRing } from '../../shared/types/enums';
import type { Person } from '../../entities/Person';

export function toPerson(row: PersonRow): Person {
  return {
    id: row.id,
    name: row.name,
    // CHECK constraint của cột role và dunbar_ring đã giới hạn đúng tập giá trị này,
    // Postgres chỉ trả về kiểu rộng hơn (text, integer) nên phải thu hẹp lại.
    role: row.role as PersonRole,
    birthYear: row.birth_year,
    distanceKm: row.distance_km,
    dunbarRing: row.dunbar_ring as DunbarRing,
    desiredCadence: row.desired_cadence,
    hourglassEnabled: row.hourglass_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}
