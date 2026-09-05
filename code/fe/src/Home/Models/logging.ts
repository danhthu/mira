/**
 * Ghi dữ liệu từ màn hình chính. Mọi thao tác ghi vào máy trước, không chờ mạng
 * (ràng buộc cứng #5) — `Repository.save()` tự đẩy sang hàng đợi đồng bộ.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Person } from '../../Common/Entities/person';
import { TimeEntry } from '../../Common/Entities/timeEntry';
import { personRepository, timeEntryRepository } from '../../Common/Repositories';
import { MomentNote, momentRepository } from '../Entities';
import {
  MILLISECONDS_PER_MINUTE,
  MIN_LOGGED_MINUTES,
  RUNNING_SESSION_KEY,
} from './constants';
import { toIsoDate } from './week';

async function addTimeEntry(entry: TimeEntry): Promise<void> {
  await timeEntryRepository.add(entry);
  await timeEntryRepository.save();
}

/** Giờ ý nghĩa với một người: khoang `people`, có `personId`. */
export async function logPeopleMinutes(
  personId: string,
  minutes: number,
  when: Date,
): Promise<void> {
  const entry = new TimeEntry();
  entry.date = toIsoDate(when);
  entry.minutes = minutes;
  entry.bucket = 'people';
  entry.personId = personId;
  entry.source = 'manual';
  await addTimeEntry(entry);
}

/** Lãng phí: khoang `waste`, nhãn đi vào `note` để đợt sau còn truy nguồn mục tiêu. */
export async function logWasteMinutes(
  label: string,
  minutes: number,
  when: Date,
): Promise<void> {
  const entry = new TimeEntry();
  entry.date = toIsoDate(when);
  entry.minutes = minutes;
  entry.bucket = 'waste';
  entry.note = label;
  entry.source = 'manual';
  await addTimeEntry(entry);
}

/**
 * Thêm người ngay tại màn hình chính. Chỉ hỏi tên: vai, vòng Dunbar và nhịp gặp
 * thuộc màn Người, chưa có ở đợt này. `hourglassEnabled` giữ mặc định tắt của
 * entity (ràng buộc cứng #4).
 */
export async function addPerson(name: string): Promise<void> {
  const person = new Person();
  person.name = name;
  person.role = 'other';
  person.dunbarRing = 5;
  await personRepository.add(person);
  await personRepository.save();
}

export async function saveMoment(text: string, when: Date): Promise<void> {
  const note = new MomentNote();
  note.occurredAt = when.getTime();
  note.text = text;
  await momentRepository.add(note);
  await momentRepository.save();
}

/** Phiên đếm giờ đang chạy. Không phải bảng nghiệp vụ nên không đồng bộ. */
export interface RunningSession {
  readonly personId: string;
  readonly startedAt: number;
}

function parseSession(raw: string): RunningSession | null {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null) return null;
  const candidate = parsed as Partial<RunningSession>;
  if (typeof candidate.personId !== 'string') return null;
  if (typeof candidate.startedAt !== 'number') return null;
  return { personId: candidate.personId, startedAt: candidate.startedAt };
}

export async function loadRunningSession(): Promise<RunningSession | null> {
  const raw = await AsyncStorage.getItem(RUNNING_SESSION_KEY);
  if (!raw) return null;
  return parseSession(raw);
}

export async function startRunningSession(
  personId: string,
  now: Date,
): Promise<RunningSession> {
  const session: RunningSession = { personId, startedAt: now.getTime() };
  await AsyncStorage.setItem(RUNNING_SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function clearRunningSession(): Promise<void> {
  await AsyncStorage.removeItem(RUNNING_SESSION_KEY);
}

/** Bấm dừng ngay sau khi bắt đầu vẫn ra một phút, không ra bản ghi 0 phút. */
export function elapsedMinutes(session: RunningSession, now: Date): number {
  const minutes = Math.round(
    (now.getTime() - session.startedAt) / MILLISECONDS_PER_MINUTE,
  );
  return Math.max(MIN_LOGGED_MINUTES, minutes);
}

/** Dừng phiên đang chạy và ghi thành một bản ghi giờ ý nghĩa. */
export async function stopRunningSession(
  session: RunningSession,
  now: Date,
): Promise<void> {
  await logPeopleMinutes(session.personId, elapsedMinutes(session, now), now);
  await clearRunningSession();
}
