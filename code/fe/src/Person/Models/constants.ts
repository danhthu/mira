/** Hằng số của module Người. Không số ma thuật trong màn hình (`code/CLAUDE.md` §Quy ước code). */

import { DunbarRing, PersonRole } from '../../Core/types';

/**
 * Thứ tự nhóm trên màn hình. Theo đúng thứ tự gợi ý của `05-v1-spec.md` §Onboarding
 * bước 1 (Con · Bố mẹ · Bạn đời · Bạn thân · Bản thân); `other` xếp cuối vì là nhóm
 * gom, không phải một vai người dùng chọn.
 */
export const ROLE_ORDER: readonly PersonRole[] = [
  'child',
  'parent',
  'partner',
  'friend',
  'self',
  'other',
];

/**
 * Vòng Dunbar theo vai. `02-data-model.md` để `dunbarRing` là cột bắt buộc nhưng
 * onboarding không hỏi — suy từ vai là cách duy nhất không thêm câu hỏi nào.
 */
export const ROLE_RING: Readonly<Record<PersonRole, DunbarRing>> = {
  child: 5,
  parent: 5,
  partner: 5,
  self: 5,
  friend: 15,
  other: 50,
};

/**
 * Nhịp gặp mặc định, số lần một tháng. `05-v1-spec.md` §Onboarding bước 3 chốt hai
 * vai: con hằng ngày, bố mẹ 2 lần/tháng. Bạn đời và bản thân xếp cùng nhịp với con
 * vì sống cùng nhà; bạn thân và nhóm gom lấy nhịp của bố mẹ.
 */
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

/** Nhịp dày nhất — hiện thành chữ "hằng ngày" thay vì "30 lần một tháng". */
export const CADENCE_DAILY = 30;

export const MILLISECONDS_PER_DAY = 86400000;
