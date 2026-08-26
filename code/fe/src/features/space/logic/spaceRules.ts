import { vi } from '@/i18n/vi';

export type SpaceType = 'pair' | 'circle';

export const PAIR_MEMBER_COUNT = 2;
export const MAX_CIRCLE_MEMBERS = 6;

export interface SharedModuleOption {
  key: string;
  label: string;
}

/**
 * Bốn thứ M7 nói là chia chung được: ngân sách giờ, ví, mục tiêu đồng hành, hũ
 * khoảnh khắc. Nhãn mượn tên tab của chính các module đó — i18n chưa có bộ tên
 * riêng cho danh sách này.
 */
export const SHARED_MODULE_OPTIONS: readonly SharedModuleOption[] = [
  { key: 'time', label: vi.nav.today },
  { key: 'money', label: vi.money.tabLabel },
  { key: 'goals', label: vi.goals.tabLabel },
  { key: 'moments', label: vi.nav.moments },
];

export function maxMembers(type: SpaceType): number {
  return type === 'pair' ? PAIR_MEMBER_COUNT : MAX_CIRCLE_MEMBERS;
}

export function canAddMember(type: SpaceType, currentCount: number): boolean {
  return currentCount < maxMembers(type);
}

export function isMemberCountValid(type: SpaceType, count: number): boolean {
  if (type === 'pair') return count === PAIR_MEMBER_COUNT;
  return count >= PAIR_MEMBER_COUNT && count <= MAX_CIRCLE_MEMBERS;
}

export function findSharedModuleLabels(keys: string[]): string[] {
  return SHARED_MODULE_OPTIONS.filter((option) =>
    keys.includes(option.key),
  ).map((option) => option.label);
}
