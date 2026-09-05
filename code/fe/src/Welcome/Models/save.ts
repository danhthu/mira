/**
 * Ghi danh sách vừa dựng vào bảng `person`. Ghi vào máy trước, không chờ mạng
 * (ràng buộc cứng #5) — `Repository.save()` tự đẩy sang hàng đợi đồng bộ.
 */

import { Person } from '../../Common/Entities/person';
import { personRepository } from '../../Common/Repositories';
import { ROLE_RING } from './constants';
import { PersonDraft, namedDrafts } from './draft';

/**
 * Onboarding không hỏi tuổi và không hỏi khoảng cách (`05-v1-spec.md` §Onboarding
 * bước 4), nên `birthYear` và `distanceKm` để trống — chúng chỉ được hỏi sau, khi
 * người dùng chủ động bật Đồng hồ cát. `hourglassEnabled` giữ mặc định tắt của
 * entity (ràng buộc cứng #4). Vòng Dunbar suy từ vai, không thêm câu hỏi nào.
 */
export function toPerson(draft: PersonDraft): Person {
  const person = new Person();
  person.name = draft.name;
  person.role = draft.role;
  person.dunbarRing = ROLE_RING[draft.role];
  person.desiredCadence = draft.cadence;
  return person;
}

export async function saveDrafts(drafts: readonly PersonDraft[]): Promise<number> {
  const keep = namedDrafts(drafts);
  if (keep.length === 0) return 0;
  await personRepository.adds(keep.map(toPerson));
  await personRepository.save();
  return keep.length;
}
