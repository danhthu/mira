/**
 * Đọc dữ liệu của các module để màn chính nói được một câu thật cho từng ô.
 *
 * `Home/` là composition root nên được phép gọi thẳng repository của feature
 * (`docs/structure.md` luật 3). Chỉ đọc, không ghi: một màn tổng quan không được
 * sinh bản ghi thay người dùng.
 */

import { challengeRepository } from '../../Challenger/Entities/Repositories';
import { getDay } from '../../Common/Utils/common';
import { emotionTrackerRepository } from '../../Emotion/Entities/emotionTrackerRepository';
import { goalRepository } from '../../Goal/Entities/Repositories';
import {
  habitRepository,
  habitTrackerRepository,
} from '../../HabitTracker/Entities/habitRepository';
import { timeDataRepository } from '../../TimeTracker/Entities/repositories';
import { workRepository } from '../../Work/Entities/Repository';
import { HomeSummary, countState, progressState } from './summary';

/** Thử thách và mục tiêu đã đóng sổ thì không còn là việc của hôm nay. */
const CLOSED_STATUSES: readonly string[] = ['SUCCESS', 'FAILURE'];

/** `getDay` đặt lại giờ ngay trên đối tượng nhận vào, nên luôn đưa nó một bản sao. */
function startOfDay(date: Date): number {
  return getDay(new Date(date.getTime())).getTime();
}

export async function loadHomeSummary(now: Date): Promise<HomeSummary> {
  const dayStart = startOfDay(now);

  const works = (await workRepository.list()).filter(
    (work) => work.kind !== 'group' && work.startDate != null,
  );
  const worksToday = works.filter(
    (work) => startOfDay(new Date(work.startDate)) === dayStart,
  );

  const habitsToday = await habitRepository.getListByDate(new Date(now.getTime()));
  const habitIdsToday = habitsToday.map((habit) => habit.id);
  const habitsDone = await habitTrackerRepository.filter(
    (tracker) =>
      tracker.day === dayStart &&
      tracker.status === 'DONE' &&
      habitIdsToday.indexOf(tracker.hid) > -1,
  );

  const challenges = await challengeRepository.list();
  const goals = await goalRepository.list();
  const emotionsToday = await emotionTrackerRepository.getEmotionsByDate(now);

  const timeToday = (await timeDataRepository.list()).filter(
    (entry) => entry.day != null && startOfDay(new Date(entry.day)) === dayStart,
  );

  return {
    work: progressState(
      worksToday.filter((work) => work.status === 'DONE').length,
      worksToday.length,
    ),
    habit: progressState(habitsDone.length, habitsToday.length),
    challenge: countState(
      challenges.filter(
        (challenge) => CLOSED_STATUSES.indexOf(challenge.status) === -1,
      ).length,
    ),
    goal: countState(
      goals.filter((goal) => CLOSED_STATUSES.indexOf(goal.status) === -1).length,
    ),
    emotion: countState(emotionsToday.length),
    timeMinutes: countState(
      timeToday.reduce((total, entry) => total + (entry.minut || 0), 0),
    ),
  };
}
