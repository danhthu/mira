/**
 * Chọn dữ liệu cho màn Người quan trọng. Hàm thuần: nhận mảng, trả mảng — không
 * đọc kho lưu trữ, không biết React. Công thức nằm ở `Core/`, ở đây chỉ có lọc và gom.
 *
 * Không hàm nào trong file này xếp hạng, chấm điểm hay so sánh người với người
 * (ràng buộc cứng #3): chỉ gom theo vai, cộng phút, và tìm ngày gần nhất.
 */

import { MIN_DAYS_FOR_WEEKLY_METRIC } from '../../Core/constants';
import { MetricState, emptyMetric, metricByCoverage } from '../../Core/dataState';
import { TimeEntryLike, daysCovered, sumMinutes } from '../../Core/time';
import { PersonRole } from '../../Core/types';
import { MILLISECONDS_PER_DAY, ROLE_ORDER } from './constants';

/** Phần của `Person` mà màn hình cần. */
export interface PersonLike {
  readonly id?: string;
  readonly name: string;
  readonly role: PersonRole;
  readonly desiredCadence?: number;
}

/** Phần của `TimeEntry` mà màn hình cần. */
export interface PeopleEntryLike extends TimeEntryLike {
  readonly personId?: string;
}

/** Bản ghi khoang `people` gắn với đúng một người. */
export function entriesOfPerson<TEntry extends PeopleEntryLike>(
  entries: readonly TEntry[],
  personId: string,
): TEntry[] {
  return entries.filter((entry) => entry.bucket === 'people' && entry.personId === personId);
}

/**
 * Giờ ở cùng trong tuần. Chưa có bản ghi nào thì trả `empty` chứ không trả 0 —
 * tuần đầu mà hiện "0 giờ" thì màn hình đang nói người dùng làm chưa đủ
 * (`00-vision.md` rủi ro #3 và #4).
 *
 * `weekDaysCovered` là số ngày cả tuần đã có bản ghi, không phải số ngày riêng của
 * người này: ngưỡng "đủ 7 ngày" của `03-formulas.md` §1 nói về độ phủ của tuần.
 */
export function weeklyMinutesOf(
  personWeekEntries: readonly PeopleEntryLike[],
  weekDaysCovered: number,
): MetricState<number> {
  if (personWeekEntries.length === 0) return emptyMetric<number>('no_data');
  return metricByCoverage(
    sumMinutes(personWeekEntries, 'meaningful'),
    weekDaysCovered,
    MIN_DAYS_FOR_WEEKLY_METRIC,
  );
}

/** Ngày `YYYY-MM-DD` gần nhất có bản ghi với người này. `null` khi chưa có lần nào. */
export function lastMetDate(personEntries: readonly PeopleEntryLike[]): string | null {
  return personEntries.reduce<string | null>(
    (latest, entry) => (latest === null || entry.date > latest ? entry.date : latest),
    null,
  );
}

function isoToUtcMs(iso: string): number {
  const parts = iso.split('-');
  return Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

/** Số ngày giữa hai chuỗi `YYYY-MM-DD`. Đi qua UTC để múi giờ hè không lệch một ngày. */
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((isoToUtcMs(toIso) - isoToUtcMs(fromIso)) / MILLISECONDS_PER_DAY);
}

export interface RoleGroup<TPerson extends PersonLike> {
  readonly role: PersonRole;
  readonly people: readonly TPerson[];
}

/**
 * Gom theo vai, giữ nguyên thứ tự người trong từng nhóm. Nhóm rỗng biến mất — màn
 * hình không có tiêu đề trống, và thứ tự nhóm cố định nên không ai bị xếp hạng.
 */
export function groupByRole<TPerson extends PersonLike>(
  people: readonly TPerson[],
): RoleGroup<TPerson>[] {
  return ROLE_ORDER.map((role) => ({
    role,
    people: people.filter((person) => person.role === role),
  })).filter((group) => group.people.length > 0);
}

/** Độ phủ của tuần: số ngày khác nhau đã có bản ghi, dùng chung ngưỡng của `Core/`. */
export function weekCoverage(weekEntries: readonly PeopleEntryLike[]): number {
  return daysCovered(weekEntries);
}
