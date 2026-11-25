import type { HabitWeek } from '@mira/contract';
import type { HabitRepository } from '../database/repositories/HabitRepository';
import { HABIT_CAP } from '../shared/constants';
import { badRequest, notFound, tierFull } from '../shared/errors';
import { assertDate } from './time';

export interface HabitDeps {
  readonly habits: HabitRepository;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function createHabit(deps: HabitDeps, userId: string, title: string, targetPerWeek: number) {
  if (title.trim() === '') {
    throw badRequest('Thói quen phải có tên');
  }
  if (!Number.isInteger(targetPerWeek) || targetPerWeek < 1 || targetPerWeek > 7) {
    throw badRequest('Số lần mỗi tuần phải là số nguyên từ 1 đến 7');
  }

  const running = await deps.habits.countActive(userId);
  if (running >= HABIT_CAP) {
    throw tierFull(
      `Đang có ${running} thói quen, tối đa ${HABIT_CAP}. Bỏ bớt một cái trước.`,
    );
  }

  return deps.habits.create(userId, title.trim(), targetPerWeek);
}

/**
 * Tình hình tuần cho từng thói quen: tuần này đã làm mấy lần trên mấy.
 *
 * Chỉ đọc đúng bảy ngày của tuần đang xem. Không có hàm nào ở đây nhìn ra ngoài tuần đó,
 * nên không có cách nào tính được chuỗi ngày — đó là chủ ý, không phải thiếu sót.
 */
export async function habitWeek(deps: HabitDeps, userId: string, weekStart: string): Promise<HabitWeek[]> {
  assertDate(weekStart, 'weekStart');
  const habits = await deps.habits.findActive(userId);
  const checks = await deps.habits.checksInRange(userId, weekStart, addDays(weekStart, 6));

  return habits.map((habit) => {
    const dates = checks.get(habit.id) ?? [];
    return {
      habit: {
        id: habit.id,
        title: habit.title,
        targetPerWeek: habit.targetPerWeek,
        startedOn: habit.startedOn,
        endedOn: habit.endedOn,
      },
      weekStart,
      done: dates.length,
      dates,
    };
  });
}

/** Đánh dấu hoặc bỏ đánh dấu một ngày. Bấm lại trong cùng ngày không cộng thêm lần nào. */
export async function toggleCheck(
  deps: HabitDeps,
  userId: string,
  habitId: string,
  date: string,
  done: boolean,
): Promise<void> {
  assertDate(date, 'date');
  const habit = await deps.habits.findById(userId, habitId);
  if (habit === null || habit.endedOn !== null) {
    throw notFound('Không có thói quen đang chạy với id này');
  }
  if (done) {
    await deps.habits.check(userId, habitId, date);
  } else {
    await deps.habits.uncheck(userId, habitId, date);
  }
}
