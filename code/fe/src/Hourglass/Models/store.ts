/**
 * Kho cấu hình của module: giới nghiêm, ngày trắng, và cấu hình đồng hồ cát của
 * từng người (nhịp gặp, số ngày mỗi lần, card đã ẩn, lịch liên lạc đã đặt).
 *
 * Ghi thẳng vào `DbProvider` mặc định — cùng kho với `Repository`, nên "xoá toàn bộ
 * dữ liệu" quét được. Không dùng `Repository` vì đây là một bản ghi cấu hình đơn lẻ
 * chứ không phải bảng, và nó không nằm trong allowlist đồng bộ.
 */

import { getDefaultDbProvider } from '../../Common/Repositories/Repo';
import { STORAGE_KEY_HOURGLASS } from '../constants';
import {
  DEFAULT_QUIET_TIME,
  QuietTimeSettings,
  readQuietTime,
} from './quietTime';

export interface PersonHourglassConfig {
  /** Số lần gặp mong muốn mỗi tháng. */
  readonly monthlyCadence: number;
  readonly daysPerVisit: number;
  /** Nhịp giờ mỗi tuần mong muốn — chỉ dùng cho vai `child`. */
  readonly targetWeeklyHours: number;
  /** Ẩn vĩnh viễn card này. Lựa chọn bền qua khởi động lại. */
  readonly hidden: boolean;
  /** `YYYY-MM-DD` của lần liên lạc đã hẹn, nếu có. */
  readonly plannedContactDate?: string;
}

export interface HourglassStoreState {
  readonly quietTime: QuietTimeSettings;
  readonly people: Readonly<Record<string, PersonHourglassConfig>>;
}

const EMPTY_STATE: HourglassStoreState = {
  quietTime: DEFAULT_QUIET_TIME,
  people: {},
};

function readPersonConfig(raw: Record<string, unknown>): PersonHourglassConfig {
  const monthlyCadence = raw.monthlyCadence;
  const daysPerVisit = raw.daysPerVisit;
  const targetWeeklyHours = raw.targetWeeklyHours;
  const plannedContactDate = raw.plannedContactDate;
  return {
    monthlyCadence: typeof monthlyCadence === 'number' ? monthlyCadence : 0,
    daysPerVisit: typeof daysPerVisit === 'number' ? daysPerVisit : 0,
    targetWeeklyHours: typeof targetWeeklyHours === 'number' ? targetWeeklyHours : 0,
    hidden: raw.hidden === true,
    plannedContactDate:
      typeof plannedContactDate === 'string' ? plannedContactDate : undefined,
  };
}

export function readState(raw: string | null): HourglassStoreState {
  if (!raw) return EMPTY_STATE;
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) return EMPTY_STATE;
  const stored = parsed as Record<string, unknown>;

  const quietRaw = stored.quietTime;
  const quietTime =
    typeof quietRaw === 'object' && quietRaw !== null
      ? readQuietTime(quietRaw as Record<string, unknown>)
      : DEFAULT_QUIET_TIME;

  const peopleRaw = stored.people;
  const people: Record<string, PersonHourglassConfig> = {};
  if (typeof peopleRaw === 'object' && peopleRaw !== null) {
    const entries = peopleRaw as Record<string, unknown>;
    Object.keys(entries).forEach((personId) => {
      const value = entries[personId];
      if (typeof value === 'object' && value !== null) {
        people[personId] = readPersonConfig(value as Record<string, unknown>);
      }
    });
  }

  return { quietTime, people };
}

let cached: HourglassStoreState | null = null;
const listeners: Array<() => void> = [];

function notify() {
  listeners.slice().forEach((listener) => listener());
}

export function onHourglassStoreChanged(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index >= 0) listeners.splice(index, 1);
  };
}

export async function loadHourglassState(): Promise<HourglassStoreState> {
  if (cached) return cached;
  cached = readState(await getDefaultDbProvider().getItem(STORAGE_KEY_HOURGLASS));
  return cached;
}

async function writeState(next: HourglassStoreState): Promise<void> {
  cached = next;
  await getDefaultDbProvider().setItem(STORAGE_KEY_HOURGLASS, JSON.stringify(next));
  notify();
}

/** Sau khi xoá toàn bộ dữ liệu, bộ nhớ đệm phải quên theo, không thì lần ghi sau dựng lại. */
export function resetHourglassCache(): void {
  cached = null;
  notify();
}

export async function updateQuietTime(
  patch: Partial<QuietTimeSettings>,
): Promise<void> {
  const current = await loadHourglassState();
  await writeState({
    quietTime: { ...current.quietTime, ...patch },
    people: current.people,
  });
}

export async function updatePersonConfig(
  personId: string,
  patch: Partial<PersonHourglassConfig>,
): Promise<void> {
  const current = await loadHourglassState();
  const existing = current.people[personId];
  const base: PersonHourglassConfig = existing || {
    monthlyCadence: 0,
    daysPerVisit: 0,
    targetWeeklyHours: 0,
    hidden: false,
  };
  await writeState({
    quietTime: current.quietTime,
    people: { ...current.people, [personId]: { ...base, ...patch } },
  });
}
