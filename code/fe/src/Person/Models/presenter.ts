/**
 * Đổi dữ liệu thành chữ. Tách khỏi JSX để mọi nhánh thiếu dữ liệu đều test được,
 * và để không chuỗi nào nằm trong màn hình (`code/CLAUDE.md` §Ngôn ngữ).
 *
 * Luật xuyên suốt: chưa có giờ nào thì `hours` là `null` — thẻ hiện dấu gạch kèm
 * một câu trung tính và một lối đi, không bao giờ hiện "0 giờ".
 */

import { MINUTES_PER_HOUR } from '../../Core/constants';
import { MetricState } from '../../Core/dataState';
import { PersonRole } from '../../Core/types';
import { PersonText } from '../Text';
import { CADENCE_DAILY } from './constants';

export function roleName(role: PersonRole, text: PersonText): string {
  if (role === 'child') return text.roleChild;
  if (role === 'parent') return text.roleParent;
  if (role === 'partner') return text.rolePartner;
  if (role === 'friend') return text.roleFriend;
  if (role === 'self') return text.roleSelf;
  return text.roleOther;
}

export function cadenceName(cadence: number, text: PersonText): string {
  if (cadence >= CADENCE_DAILY) return text.cadenceDaily;
  return `${cadence} ${text.cadenceTimesSuffix}`;
}

function formatDecimal(value: number, digits: number): string {
  return value.toFixed(digits).replace('.', ',');
}

export interface PersonCardView {
  readonly name: string;
  /** `null` khi chưa ghi giờ nào tuần này. */
  readonly hours: string | null;
  readonly hoursUnit: string | null;
  /** Dòng phụ: lý do chưa có số, lối đi, lần ở cùng gần nhất, nhịp gặp mong muốn. */
  readonly notes: readonly string[];
}

function hoursNotes(minutes: MetricState<number>, text: PersonText): string[] {
  if (minutes.status === 'empty') return [text.hoursEmpty, text.hoursEmptyPath];
  if (minutes.status === 'learning') {
    return [
      `${text.learningPrefix} ${minutes.samplesHave}${text.learningSeparator}${minutes.samplesNeed} ${text.learningSuffix}`,
    ];
  }
  return [];
}

function lastMetNote(
  lastMet: string | null,
  daysAgo: number | null,
  text: PersonText,
): string {
  if (lastMet === null || daysAgo === null) return text.lastMetNever;
  if (daysAgo <= 0) return text.lastMetToday;
  if (daysAgo === 1) return text.lastMetYesterday;
  return `${text.lastMetDaysPrefix} ${daysAgo} ${text.lastMetDaysSuffix}`;
}

export interface PersonCardInput {
  readonly name: string;
  readonly weekMinutes: MetricState<number>;
  readonly lastMet: string | null;
  /** Số ngày kể từ lần ở cùng gần nhất. `null` khi chưa có lần nào. */
  readonly daysSinceLastMet: number | null;
  readonly desiredCadence?: number;
}

export function personCardView(input: PersonCardInput, text: PersonText): PersonCardView {
  const notes = [
    ...hoursNotes(input.weekMinutes, text),
    lastMetNote(input.lastMet, input.daysSinceLastMet, text),
  ];
  if (input.desiredCadence !== undefined) {
    notes.push(`${text.cadencePrefix} ${cadenceName(input.desiredCadence, text)}`);
  }

  if (input.weekMinutes.status === 'empty') {
    return { name: input.name, hours: null, hoursUnit: null, notes };
  }

  // Dưới một giờ thì đổi sang phút: "0,0 h" cho 15 phút vừa ghi trông như chưa ghi gì.
  const minutes = input.weekMinutes.value;
  const underAnHour = minutes < MINUTES_PER_HOUR;
  return {
    name: input.name,
    hours: underAnHour
      ? `${Math.round(minutes)}`
      : formatDecimal(minutes / MINUTES_PER_HOUR, 1),
    hoursUnit: underAnHour ? text.minuteUnit : text.hourUnit,
    notes,
  };
}
