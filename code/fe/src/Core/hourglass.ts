/**
 * Đồng hồ cát — `03-formulas.md` §5. Hàm thuần: nhận số, trả số.
 *
 * Rủi ro #1 của `00-vision.md` ("con số gây tê liệt") được chống ngay ở tầng này,
 * không đợi tới màn hình: mọi hàm trả `MetricState`, và không nhánh nào trả về số 0
 * như thể đó là kết quả thật. Thiếu dữ liệu thì trả `empty` kèm lý do, để UI buộc
 * phải hiện lối nhập thay vì hiện "còn 0 lần gặp".
 *
 * Hằng số của tầng Core theo quy ước nằm ở `constants.ts`; ba hằng dưới đây khai tại
 * chỗ vì chúng chỉ thuộc công thức này và file kia đang do đợt khác giữ.
 */

import { MONTHS_PER_YEAR, WEEKS_PER_YEAR } from './constants';
import { MetricState, emptyMetric, readyMetric } from './dataState';
import { PersonRole } from './types';

/** `03-formulas.md` §5: "lifeExpectancy mặc định 78, cho sửa". */
export const DEFAULT_LIFE_EXPECTANCY_YEARS = 78;

/** `03-formulas.md` §5: quỹ giờ với con tính tới mốc 18 tuổi. */
export const CHILD_INDEPENDENCE_AGE = 18;

/** Chặn năm sinh gõ nhầm (1099, 20255) trước khi nó thành một con số vô nghĩa trên card. */
export const EARLIEST_PLAUSIBLE_BIRTH_YEAR = 1900;
export const OLDEST_PLAUSIBLE_AGE = 130;

/**
 * Nhịp gặp mặc định theo vai, đơn vị lần/tháng — `05-v1-spec.md` §Onboarding bước 3
 * ("con: hằng ngày, bố mẹ: 2 lần/tháng"). Đây là giá trị điền sẵn cho ô nhập, người
 * dùng nhìn thấy và sửa được; không hàm nào ở đây tự lấy nó khi người dùng bỏ trống.
 */
export const DEFAULT_MONTHLY_CADENCE: Readonly<Record<PersonRole, number>> = {
  child: 30,
  parent: 2,
  partner: 30,
  friend: 2,
  self: 30,
  other: 2,
};

/** Vai `child` dùng công thức quỹ giờ tới 18 tuổi; các vai còn lại dùng công thức lần gặp. */
export function usesChildHourglass(role: PersonRole): boolean {
  return role === 'child';
}

export function visitsPerYearFromMonthlyCadence(cadencePerMonth: number): number {
  return cadencePerMonth * MONTHS_PER_YEAR;
}

/**
 * Tuổi tính theo năm sinh. Trả `empty('no_data')` khi chưa có năm sinh — đúng ràng
 * buộc "thiếu năm sinh thì không hiện con số, không đoán, không hiện 0".
 */
export function ageFromBirthYear(
  birthYear: number | undefined,
  currentYear: number,
): MetricState<number> {
  if (birthYear === undefined) return emptyMetric<number>('no_data');
  if (!Number.isInteger(birthYear)) return emptyMetric<number>('inconsistent');
  if (birthYear < EARLIEST_PLAUSIBLE_BIRTH_YEAR || birthYear > currentYear) {
    return emptyMetric<number>('inconsistent');
  }
  return readyMetric(currentYear - birthYear);
}

export interface ChildHourglass {
  readonly kind: 'child';
  readonly yearsLeft: number;
  /** Giờ còn lại theo nhịp hiện tại, làm tròn về giờ nguyên. */
  readonly hoursLeft: number;
  /** Giờ còn lại nếu giữ được nhịp mong muốn — phần "nếu đổi được" của cùng con số. */
  readonly hoursIfMore: number;
  readonly targetWeeklyHours: number;
}

export interface ChildHourglassInput {
  readonly childAge: number;
  readonly currentWeeklyHours: number;
  readonly targetWeeklyHours: number;
}

export function childHourglass(
  input: ChildHourglassInput,
): MetricState<ChildHourglass> {
  const { childAge, currentWeeklyHours, targetWeeklyHours } = input;

  if (childAge < 0 || childAge > OLDEST_PLAUSIBLE_AGE) {
    return emptyMetric<ChildHourglass>('inconsistent');
  }
  if (currentWeeklyHours < 0 || targetWeeklyHours < 0) {
    return emptyMetric<ChildHourglass>('inconsistent');
  }

  const yearsLeft = CHILD_INDEPENDENCE_AGE - childAge;
  // Qua 18 tuổi thì công thức không còn nói gì đúng. Trả `not_applicable` chứ không
  // kẹp về 0 — "còn 0 giờ bên con" là đúng cái câu rủi ro #1 cấm.
  if (yearsLeft <= 0) return emptyMetric<ChildHourglass>('not_applicable');

  if (currentWeeklyHours === 0) return emptyMetric<ChildHourglass>('no_data');

  return readyMetric<ChildHourglass>({
    kind: 'child',
    yearsLeft,
    hoursLeft: Math.round(currentWeeklyHours * WEEKS_PER_YEAR * yearsLeft),
    hoursIfMore: Math.round(targetWeeklyHours * WEEKS_PER_YEAR * yearsLeft),
    targetWeeklyHours,
  });
}

export interface CompanionshipHourglass {
  readonly kind: 'companionship';
  readonly yearsLeft: number;
  readonly visitsPerYear: number;
  readonly daysPerVisit: number;
  readonly visitsLeft: number;
  readonly daysTogether: number;
}

export interface CompanionshipHourglassInput {
  readonly age: number;
  readonly visitsPerYear: number;
  readonly daysPerVisit: number;
  /** Bỏ trống thì dùng 78 — `03-formulas.md` §5. */
  readonly lifeExpectancy?: number;
}

export function companionshipHourglass(
  input: CompanionshipHourglassInput,
): MetricState<CompanionshipHourglass> {
  const { age, visitsPerYear, daysPerVisit } = input;
  const lifeExpectancy =
    input.lifeExpectancy === undefined
      ? DEFAULT_LIFE_EXPECTANCY_YEARS
      : input.lifeExpectancy;

  if (age < 0 || age > OLDEST_PLAUSIBLE_AGE) {
    return emptyMetric<CompanionshipHourglass>('inconsistent');
  }
  if (lifeExpectancy <= 0 || lifeExpectancy > OLDEST_PLAUSIBLE_AGE) {
    return emptyMetric<CompanionshipHourglass>('inconsistent');
  }

  const yearsLeft = Math.max(0, lifeExpectancy - age);
  // Người đã qua tuổi thọ trung bình: con số không còn nghĩa gì, và hiện "còn 0 lần
  // gặp" là lời trách chứ không phải sự thật. Card sẽ chuyển sang lời mời gặp.
  if (yearsLeft === 0) return emptyMetric<CompanionshipHourglass>('not_applicable');

  if (visitsPerYear <= 0 || daysPerVisit <= 0) {
    return emptyMetric<CompanionshipHourglass>('no_data');
  }

  const visitsLeft = Math.round(visitsPerYear * yearsLeft);
  return readyMetric<CompanionshipHourglass>({
    kind: 'companionship',
    yearsLeft,
    visitsPerYear,
    daysPerVisit,
    visitsLeft,
    daysTogether: Math.round(visitsLeft * daysPerVisit),
  });
}

export type Hourglass = ChildHourglass | CompanionshipHourglass;
