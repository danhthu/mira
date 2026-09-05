/**
 * Ghi bảng `person`. Mọi thao tác vào máy trước, không chờ mạng (ràng buộc cứng #5)
 * — `Repository.save()` tự đẩy sang hàng đợi đồng bộ.
 */

import { Person } from '../../Common/Entities/person';
import { personRepository } from '../../Common/Repositories';
import { PersonRole } from '../../Core/types';
import { ROLE_DEFAULT_CADENCE, ROLE_RING } from './constants';

export interface PersonDraft {
  readonly name: string;
  readonly role: PersonRole;
  readonly desiredCadence: number;
}

/**
 * Dựng một `Person` từ những gì onboarding và màn Người hỏi. Vòng Dunbar suy từ
 * vai; tuổi và khoảng cách không có ở đây — `05-v1-spec.md` chỉ cho hỏi hai thứ đó
 * sau, khi người dùng chủ động bật Đồng hồ cát. `hourglassEnabled` giữ nguyên mặc
 * định tắt của entity (ràng buộc cứng #4).
 */
export function buildPerson(draft: PersonDraft): Person {
  const person = new Person();
  person.name = draft.name;
  person.role = draft.role;
  person.dunbarRing = ROLE_RING[draft.role];
  person.desiredCadence = draft.desiredCadence;
  return person;
}

export function defaultCadenceFor(role: PersonRole): number {
  return ROLE_DEFAULT_CADENCE[role];
}

export async function addPerson(draft: PersonDraft): Promise<void> {
  await personRepository.add(buildPerson(draft));
  await personRepository.save();
}

export async function updatePerson(id: string, draft: PersonDraft): Promise<void> {
  await personRepository.update(id, (person) => {
    person.name = draft.name;
    person.role = draft.role;
    person.dunbarRing = ROLE_RING[draft.role];
    person.desiredCadence = draft.desiredCadence;
  });
}

/**
 * Xoá mềm: đặt `deleted` thay vì bỏ bản ghi khỏi mảng. `Repository.list()` đã lọc
 * `!deleted` nên người biến khỏi màn hình ngay, còn tầng đồng bộ đọc `deleted` để
 * biết đây là xoá chứ không phải bản ghi chưa từng tồn tại. Bản ghi `time_entry`
 * trỏ vào người này giữ nguyên — giờ đã sống cùng nhau không bị xoá theo.
 */
export async function removePerson(id: string): Promise<void> {
  await personRepository.update(id, (person) => {
    person.deleted = true;
    person.deleted_date = new Date().getTime();
  });
}
