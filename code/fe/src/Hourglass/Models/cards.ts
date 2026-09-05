/**
 * Dựng dữ liệu cho từng card đồng hồ cát. Hàm thuần — nhận người, cấu hình và mốc
 * thời gian, trả về trạng thái card. Không chữ nào ở đây; chữ nằm trong `Text/`.
 *
 * Mỗi nhánh trạng thái đều có một hành động đi kèm (`action`). Không có nhánh nào
 * chỉ đưa con số rồi thôi — đó là ràng buộc cứng #4 và rủi ro #1 của `00-vision.md`.
 */

import { MetricEmptyReason, MetricState } from '../../Core/dataState';
import {
  Hourglass,
  ageFromBirthYear,
  childHourglass,
  companionshipHourglass,
  usesChildHourglass,
  visitsPerYearFromMonthlyCadence,
} from '../../Core/hourglass';
import { PersonRole } from '../../Core/types';
import { PersonRow } from './people';
import { QuietReason } from './quietTime';
import { PersonHourglassConfig } from './store';

export type HourglassCardState =
  /** Giới nghiêm hoặc ngày trắng: con số nghỉ, card vẫn còn hành động. */
  | { readonly status: 'quiet'; readonly reason: QuietReason }
  /** Chưa có năm sinh — không đoán, không hiện 0, chỉ mở lối nhập. */
  | { readonly status: 'needs_birth_year' }
  | { readonly status: 'unavailable'; readonly reason: MetricEmptyReason }
  | { readonly status: 'ready'; readonly value: Hourglass };

/** Hành động duy nhất của card, ngoài nút ẩn. */
export type HourglassCardAction =
  | 'enter_birth_year'
  | 'plan_contact'
  | 'postpone_contact';

export interface HourglassCard {
  readonly personId: string;
  readonly name: string;
  readonly role: PersonRole;
  /** Dòng nhịp gặp, chỉ có với vai không phải con. */
  readonly cadence: { readonly visitsPerYear: number; readonly daysPerVisit: number } | null;
  readonly state: HourglassCardState;
  readonly action: HourglassCardAction;
  readonly plannedContactDate?: string;
}

export interface BuildCardInput {
  readonly person: PersonRow;
  readonly config: PersonHourglassConfig;
  /** Giờ mỗi tuần đang thật sự ở cùng người này. Chỉ dùng cho vai `child`. */
  readonly currentWeeklyHours: number;
  readonly currentYear: number;
  readonly quietReason: QuietReason | null;
}

function toCardState(result: MetricState<Hourglass>): HourglassCardState {
  if (result.status === 'empty') {
    return { status: 'unavailable', reason: result.reason };
  }
  return { status: 'ready', value: result.value };
}

/**
 * Nhịp gặp lấy từ cấu hình riêng của Đồng hồ cát, và nếu chưa chỉnh thì lấy
 * `person.desiredCadence` — onboarding đã hỏi đúng câu đó rồi, hỏi lại là thừa và
 * card sẽ hiện "gặp 0 lần/năm" cho người vừa khai nhịp xong.
 *
 * KHÔNG lùi tiếp về mặc định theo vai. Không biết nhịp thì để `visitsPerYear = 0`
 * và card tự rơi vào trạng thái chưa tính được — với tính năng mà `00-vision.md`
 * cảnh báo là có thể gây tê liệt, đưa ra "còn 288 lần gặp" từ một phỏng đoán còn
 * tệ hơn là không đưa con số nào.
 */
function resolveCadence(input: BuildCardInput): {
  visitsPerYear: number;
  daysPerVisit: number;
} {
  const { person, config } = input;
  const monthly =
    config.monthlyCadence > 0 ? config.monthlyCadence : (person.desiredCadence ?? 0);
  return {
    visitsPerYear: visitsPerYearFromMonthlyCadence(monthly),
    // Một lần gặp ít nhất là một ngày. Con số này chưa được hỏi ở đâu, nên khi có
    // nhịp mà thiếu nó thì lấy mức thấp nhất trung thực — "0 ngày bên nhau" là câu
    // không có nghĩa, còn 1 ngày là điều chắc chắn đúng với mọi lần gặp.
    daysPerVisit: config.daysPerVisit > 0 ? config.daysPerVisit : 1,
  };
}

function computeState(input: BuildCardInput, age: number): HourglassCardState {
  const { person, config, currentWeeklyHours } = input;

  if (usesChildHourglass(person.role)) {
    return toCardState(
      childHourglass({
        childAge: age,
        currentWeeklyHours,
        targetWeeklyHours: config.targetWeeklyHours,
      }),
    );
  }

  return toCardState(companionshipHourglass({ age, ...resolveCadence(input) }));
}

export function buildCard(input: BuildCardInput): HourglassCard {
  const { person, config, quietReason } = input;

  const cadence = usesChildHourglass(person.role) ? null : resolveCadence(input);

  const age = ageFromBirthYear(person.birthYear, input.currentYear);

  const state: HourglassCardState = (() => {
    if (age.status === 'empty' && age.reason === 'no_data') {
      return { status: 'needs_birth_year' } as const;
    }
    if (age.status === 'empty') {
      return { status: 'unavailable', reason: age.reason } as const;
    }
    if (quietReason) return { status: 'quiet', reason: quietReason } as const;
    return computeState(input, age.value);
  })();

  const action: HourglassCardAction =
    state.status === 'needs_birth_year'
      ? 'enter_birth_year'
      : config.plannedContactDate
        ? 'postpone_contact'
        : 'plan_contact';

  return {
    personId: person.id,
    name: person.name,
    role: person.role,
    cadence,
    state,
    action,
    plannedContactDate: config.plannedContactDate,
  };
}

/**
 * Card của người đã bật đồng hồ cát và chưa ẩn. Người chưa bật không bao giờ lọt
 * vào danh sách này — ràng buộc cứng #4 cưỡng chế ở đúng một chỗ.
 */
export function visibleCards(inputs: readonly BuildCardInput[]): HourglassCard[] {
  return inputs
    .filter((input) => input.person.hourglassEnabled && !input.config.hidden)
    .map(buildCard);
}
