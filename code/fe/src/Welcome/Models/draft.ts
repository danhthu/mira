/**
 * Bản nháp danh sách người trong lúc đi qua bốn bước. Hàm thuần: nhận mảng, trả
 * mảng mới — không đọc kho lưu trữ, không biết React, nên test được không cần app.
 */

import { PersonRole } from '../../Core/types';
import { ROLE_DEFAULT_CADENCE } from './constants';

export interface PersonDraft {
  /** Khoá tạm trong lúc dựng danh sách; id thật do entity sinh lúc lưu. */
  readonly key: string;
  readonly role: PersonRole;
  readonly name: string;
  /** Số lần gặp mong muốn mỗi tháng. */
  readonly cadence: number;
}

export function draftFor(role: PersonRole, key: string): PersonDraft {
  return { key, role, name: '', cadence: ROLE_DEFAULT_CADENCE[role] };
}

export function hasRole(drafts: readonly PersonDraft[], role: PersonRole): boolean {
  return drafts.some((draft) => draft.role === role);
}

/**
 * Bước 1 chọn nhiều vai. Chọn một vai là thêm một chỗ trống cho vai đó; bỏ chọn là
 * bỏ mọi chỗ trống của vai đó, kể cả những chỗ vừa thêm thêm ở bước 2.
 */
export function toggleRole(
  drafts: readonly PersonDraft[],
  role: PersonRole,
  key: string,
): PersonDraft[] {
  if (hasRole(drafts, role)) return drafts.filter((draft) => draft.role !== role);
  return [...drafts, draftFor(role, key)];
}

export function addDraft(
  drafts: readonly PersonDraft[],
  role: PersonRole,
  key: string,
): PersonDraft[] {
  return [...drafts, draftFor(role, key)];
}

export function removeDraft(
  drafts: readonly PersonDraft[],
  key: string,
): PersonDraft[] {
  return drafts.filter((draft) => draft.key !== key);
}

function replace(
  drafts: readonly PersonDraft[],
  key: string,
  change: (draft: PersonDraft) => PersonDraft,
): PersonDraft[] {
  return drafts.map((draft) => (draft.key === key ? change(draft) : draft));
}

export function renameDraft(
  drafts: readonly PersonDraft[],
  key: string,
  name: string,
): PersonDraft[] {
  return replace(drafts, key, (draft) => ({ ...draft, name }));
}

export function setCadence(
  drafts: readonly PersonDraft[],
  key: string,
  cadence: number,
): PersonDraft[] {
  return replace(drafts, key, (draft) => ({ ...draft, cadence }));
}

/**
 * Chỉ giữ người đã có tên. Bỏ qua được hết (`05-v1-spec.md` §Onboarding), nên chọn
 * vai rồi bỏ qua bước tên là không lưu ai — một người không tên trong danh sách thì
 * màn Hôm nay không có gì để chạm vào.
 */
export function namedDrafts(drafts: readonly PersonDraft[]): PersonDraft[] {
  return drafts
    .map((draft) => ({ ...draft, name: draft.name.trim() }))
    .filter((draft) => draft.name.length > 0);
}
