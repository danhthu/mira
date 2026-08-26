// Đường dẫn tương đối chứ không phải alias '@/': vitest không phân giải được
// alias trên Windows, các module logic thuần khác trong features/ cũng vậy.
import { DAYS_IN_MONTH } from '../../../core/constants';
import type { Person, TimeEntry } from '@/db/schema';
import type { DunbarRing } from '@/shared/types';

const MS_PER_DAY = 86_400_000;

export interface RelationshipStatus {
  person: Person;
  /** null nghĩa là chưa ghi lần gặp nào — khác hẳn với 0 ngày. */
  daysSinceLastMet: number | null;
  /** desiredCadence lưu theo lần/tháng, đổi ra số ngày giữa hai lần gặp. */
  expectedIntervalDays: number | null;
}

export interface RingGroup {
  ring: DunbarRing;
  members: RelationshipStatus[];
}

export const DUNBAR_RINGS: readonly DunbarRing[] = [5, 15, 50];

export function findLastMetDate(entries: TimeEntry[]): string | null {
  let latest: string | null = null;
  for (const entry of entries) {
    if (entry.bucket !== 'people') continue;
    if (latest === null || entry.date > latest) latest = entry.date;
  }
  return latest;
}

export function daysBetween(fromYMD: string, toYMD: string): number {
  const from = new Date(`${fromYMD}T00:00:00Z`).getTime();
  const to = new Date(`${toYMD}T00:00:00Z`).getTime();
  return Math.round((to - from) / MS_PER_DAY);
}

export function toExpectedIntervalDays(
  desiredCadence: number | null,
): number | null {
  if (desiredCadence === null || desiredCadence <= 0) return null;
  return DAYS_IN_MONTH / desiredCadence;
}

/**
 * Một cái tên cho câu hỏi "tuần này gặp ai", không phải bảng xếp hạng: chỉ trả
 * về người có khoảng cách vượt nhịp mong muốn nhiều nhất, và chỉ khi có số liệu
 * thật. Chưa gặp lần nào thì không suy ra được khoảng cách nào, nên không đoán.
 */
export function pickMeetingSuggestion(
  statuses: RelationshipStatus[],
): RelationshipStatus | null {
  let best: RelationshipStatus | null = null;
  let bestGap = 0;
  for (const status of statuses) {
    const { daysSinceLastMet, expectedIntervalDays } = status;
    if (daysSinceLastMet === null || expectedIntervalDays === null) continue;
    const gap = daysSinceLastMet - expectedIntervalDays;
    if (gap > bestGap) {
      bestGap = gap;
      best = status;
    }
  }
  return best;
}

function normalizeRing(value: number): DunbarRing {
  if (value === 5) return 5;
  if (value === 15) return 15;
  return 50;
}

/**
 * Giữ nguyên thứ tự đầu vào bên trong mỗi vòng. Sắp lại theo số ngày chưa gặp
 * sẽ biến danh sách thành bảng xếp hạng ai thân hơn ai — đúng thứ M6 cấm.
 */
export function groupByRing(statuses: RelationshipStatus[]): RingGroup[] {
  return DUNBAR_RINGS.map((ring) => ({
    ring,
    members: statuses.filter(
      (status) => normalizeRing(status.person.dunbarRing) === ring,
    ),
  })).filter((group) => group.members.length > 0);
}
