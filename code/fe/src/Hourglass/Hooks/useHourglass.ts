/**
 * Trạng thái của module Đồng hồ cát: ai đã bật, card nào đang hiện, và các thao
 * tác ghi (bật/tắt, nhập năm sinh, đặt lịch, ẩn card).
 *
 * Ràng buộc cứng #4 nằm ở `visibleCards`: chỉ người có `hourglassEnabled = true`
 * mới có card. Hook không có đường nào bật hộ người dùng.
 */

import { useCallback, useEffect, useState } from 'react';
import { personRepository, timeEntryRepository } from '../../Common/Repositories';
import { DEFAULT_MONTHLY_CADENCE, usesChildHourglass } from '../../Core/hourglass';
import { DEFAULT_DAYS_PER_VISIT } from '../constants';
import { nextContactDate, postponeOneWeek } from '../Models/calendar';
import { BuildCardInput, HourglassCard, visibleCards } from '../Models/cards';
import {
  PersonRow,
  loadPeople,
  setBirthYear,
  setDesiredCadence,
  setHourglassEnabled,
  weeklyHoursByPerson,
} from '../Models/people';
import { quietReasonAt } from '../Models/quietTime';
import {
  HourglassStoreState,
  PersonHourglassConfig,
  loadHourglassState,
  onHourglassStoreChanged,
  updatePersonConfig,
} from '../Models/store';

/** Cấu hình người dùng xác nhận lúc bật đồng hồ cát cho một người. */
export interface EnableDraft {
  readonly birthYear: number;
  readonly monthlyCadence: number;
  readonly daysPerVisit: number;
  readonly targetWeeklyHours: number;
}

export interface HourglassView {
  readonly people: readonly PersonRow[];
  readonly cards: readonly HourglassCard[];
  readonly loading: boolean;
  readonly enable: (personId: string, draft: EnableDraft) => Promise<void>;
  readonly disable: (personId: string) => Promise<void>;
  readonly saveBirthYear: (personId: string, birthYear: number) => Promise<void>;
  readonly planContact: (personId: string) => Promise<void>;
  readonly postponeContact: (personId: string) => Promise<void>;
  readonly hideCard: (personId: string) => Promise<void>;
  /** Giá trị điền sẵn cho ô nhập lúc bật — người dùng nhìn thấy và sửa được. */
  readonly draftFor: (person: PersonRow) => Omit<EnableDraft, 'birthYear'>;
}

function configFor(
  state: HourglassStoreState,
  person: PersonRow,
): PersonHourglassConfig {
  const stored = state.people[person.id];
  if (stored) return stored;
  return {
    monthlyCadence: 0,
    daysPerVisit: 0,
    targetWeeklyHours: 0,
    hidden: false,
  };
}

export function useHourglass(): HourglassView {
  const [people, setPeople] = useState<readonly PersonRow[]>([]);
  const [cards, setCards] = useState<readonly HourglassCard[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    const now = new Date();
    return Promise.all([
      loadPeople(),
      loadHourglassState(),
      weeklyHoursByPerson(now),
    ]).then(([rows, state, hoursByPerson]) => {
      const quietReason = quietReasonAt(state.quietTime, now);
      const inputs: BuildCardInput[] = rows.map((person) => ({
        person,
        config: configFor(state, person),
        currentWeeklyHours: hoursByPerson[person.id] || 0,
        currentYear: now.getFullYear(),
        quietReason,
      }));
      setPeople(rows);
      setCards(visibleCards(inputs));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let alive = true;
    const refresh = () => {
      if (alive) reload();
    };
    refresh();
    const stopListening = onHourglassStoreChanged(refresh);
    personRepository.registerDataChanged(refresh);
    timeEntryRepository.registerDataChanged(refresh);
    return () => {
      alive = false;
      stopListening();
      personRepository.unRegisterDataChanged(refresh);
      timeEntryRepository.unRegisterDataChanged(refresh);
    };
  }, [reload]);

  const draftFor = useCallback((person: PersonRow) => {
    const monthlyCadence =
      person.desiredCadence && person.desiredCadence > 0
        ? person.desiredCadence
        : DEFAULT_MONTHLY_CADENCE[person.role];
    return {
      monthlyCadence,
      daysPerVisit: DEFAULT_DAYS_PER_VISIT,
      // Vai con dùng quỹ giờ: nhịp mong muốn suy từ số lần gặp mỗi tháng, mỗi lần
      // một giờ, chia đều bốn tuần. Người dùng sửa lại ngay trên cùng màn.
      targetWeeklyHours: usesChildHourglass(person.role)
        ? Math.max(1, Math.round(monthlyCadence / 4))
        : 0,
    };
  }, []);

  const enable = useCallback(
    async (personId: string, draft: EnableDraft) => {
      await setBirthYear(personId, draft.birthYear);
      await setDesiredCadence(personId, draft.monthlyCadence);
      await updatePersonConfig(personId, {
        monthlyCadence: draft.monthlyCadence,
        daysPerVisit: draft.daysPerVisit,
        targetWeeklyHours: draft.targetWeeklyHours,
        hidden: false,
      });
      await setHourglassEnabled(personId, true);
      await reload();
    },
    [reload],
  );

  const disable = useCallback(
    async (personId: string) => {
      await setHourglassEnabled(personId, false);
      await reload();
    },
    [reload],
  );

  const saveBirthYearFor = useCallback(
    async (personId: string, birthYear: number) => {
      await setBirthYear(personId, birthYear);
      await reload();
    },
    [reload],
  );

  const planContact = useCallback(async (personId: string) => {
    const state = await loadHourglassState();
    const config = state.people[personId];
    await updatePersonConfig(personId, {
      plannedContactDate: nextContactDate(
        config ? config.monthlyCadence : 0,
        new Date(),
      ),
    });
  }, []);

  const postponeContact = useCallback(async (personId: string) => {
    const state = await loadHourglassState();
    const config = state.people[personId];
    const current = config && config.plannedContactDate;
    await updatePersonConfig(personId, {
      plannedContactDate: current
        ? postponeOneWeek(current)
        : nextContactDate(config ? config.monthlyCadence : 0, new Date()),
    });
  }, []);

  const hideCard = useCallback(async (personId: string) => {
    await updatePersonConfig(personId, { hidden: true });
  }, []);

  return {
    people,
    cards,
    loading,
    enable,
    disable,
    saveBirthYear: saveBirthYearFor,
    planContact,
    postponeContact,
    hideCard,
    draftFor,
  };
}
