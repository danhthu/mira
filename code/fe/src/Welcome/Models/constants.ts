/**
 * Hằng số của onboarding.
 *
 * Ba bảng đầu là bản sao của `src/Person/Models/constants.ts`. Luật import 2 cấm
 * feature gọi feature, và chỗ đúng của chúng là `Common/` — đợt này không được sửa
 * `Common/`. Xem HANDOFF.md §"Câu hỏi còn mở".
 */

import { DunbarRing, PersonRole } from '../../Core/types';

/** Đúng thứ tự gợi ý của `05-v1-spec.md` §Onboarding bước 1. */
export const ONBOARDING_ROLES: readonly PersonRole[] = [
  'child',
  'parent',
  'partner',
  'friend',
  'self',
];

export const ROLE_RING: Readonly<Record<PersonRole, DunbarRing>> = {
  child: 5,
  parent: 5,
  partner: 5,
  self: 5,
  friend: 15,
  other: 50,
};

/** Nhịp gặp mặc định, số lần một tháng. Bước 3 chốt: con hằng ngày, bố mẹ 2 lần/tháng. */
export const ROLE_DEFAULT_CADENCE: Readonly<Record<PersonRole, number>> = {
  child: 30,
  partner: 30,
  self: 30,
  parent: 2,
  friend: 2,
  other: 2,
};

/** Năm nấc của thanh nhịp gặp, xếp từ dày tới thưa. */
export const CADENCE_STOPS: readonly number[] = [30, 8, 4, 2, 1];

export const CADENCE_DAILY = 30;

/** Bốn bước của `05-v1-spec.md` §Onboarding, cộng bước xong. */
export const FIRST_STEP = 1;
export const LAST_STEP = 4;
