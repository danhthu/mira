/** Cầu nối giữa kho `person` / `time_entry` và các hàm thuần của module. */

import { personRepository, timeEntryRepository } from '../../Common/Repositories';
import { MINUTES_PER_HOUR } from '../../Core/constants';
import { PersonRole } from '../../Core/types';
import { RECENT_WINDOW_DAYS } from '../constants';
import { addDays, isoDate } from './calendar';

/** Phần của `Person` mà module này cần. */
export interface PersonRow {
  readonly id: string;
  readonly name: string;
  readonly role: PersonRole;
  readonly birthYear?: number;
  readonly desiredCadence?: number;
  readonly hourglassEnabled: boolean;
}

export async function loadPeople(): Promise<PersonRow[]> {
  const rows = await personRepository.list();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    birthYear: row.birthYear,
    desiredCadence: row.desiredCadence,
    // Ràng buộc cứng #4: bản ghi cũ chưa có trường này vẫn phải hiểu là tắt.
    hourglassEnabled: row.hourglassEnabled === true,
  }));
}

export async function setHourglassEnabled(
  personId: string,
  enabled: boolean,
): Promise<void> {
  await personRepository.update(personId, (row) => {
    row.hourglassEnabled = enabled;
  });
}

export async function setBirthYear(
  personId: string,
  birthYear: number,
): Promise<void> {
  await personRepository.update(personId, (row) => {
    row.birthYear = birthYear;
  });
}

export async function setDesiredCadence(
  personId: string,
  cadencePerMonth: number,
): Promise<void> {
  await personRepository.update(personId, (row) => {
    row.desiredCadence = cadencePerMonth;
  });
}

/**
 * Nhịp giờ hiện tại với một người: tổng phút đã ghi cùng họ trong 7 ngày gần nhất.
 * Đây là đầu vào `currentWeeklyHours` của công thức quỹ giờ với con.
 */
export async function weeklyHoursByPerson(
  today: Date,
): Promise<Readonly<Record<string, number>>> {
  const from = isoDate(addDays(today, -RECENT_WINDOW_DAYS));
  const to = isoDate(today);
  const rows = await timeEntryRepository.filter(
    (row) => !!row.personId && row.date > from && row.date <= to,
  );
  const minutes: Record<string, number> = {};
  rows.forEach((row) => {
    minutes[row.personId] = (minutes[row.personId] || 0) + row.minutes;
  });
  const hours: Record<string, number> = {};
  Object.keys(minutes).forEach((personId) => {
    hours[personId] = minutes[personId] / MINUTES_PER_HOUR;
  });
  return hours;
}
