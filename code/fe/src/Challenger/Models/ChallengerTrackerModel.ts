import { useAsyncAction, useDectectDataChanged } from '../../Common/Hooks';
import { challengeRepository } from '../Entities';
import { coversDay, isReached } from './challengeState';

/**
 * Số ngày lịch nhìn lại. Đủ để thấy một quãng thử thách thường gặp (30 ngày)
 * cùng phần trước đó, không kéo dài tới mức phải quét cả kho.
 */
const CALENDAR_WINDOW_DAYS = 90;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 1 = ngày có thử thách đang chạy, 2 = ngày thuộc một thử thách đã đạt. */
export type CalendarDay = { date: Date; status: 0 | 1 | 2 };

export const ChallengerTrackerModel = {
  /**
   * Những ngày thực sự nằm trong một quãng thử thách. Ngày không có thử thách
   * nào thì không trả về — lịch để trống chứ không tô một dấu "trống rỗng".
   */
  useCalendarData: (): CalendarDay[] => {
    return useAsyncAction<CalendarDay[]>(
      async () => {
        const challenges = await challengeRepository.list();
        if (challenges.length === 0) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days: CalendarDay[] = [];
        for (let back = CALENDAR_WINDOW_DAYS - 1; back >= 0; back--) {
          const date = new Date(today.getTime() - back * MS_PER_DAY);
          const covering = challenges.filter((c) => coversDay(c, date));
          if (covering.length === 0) continue;
          days.push({ date, status: covering.some(isReached) ? 2 : 1 });
        }
        return days;
      },
      [useDectectDataChanged(challengeRepository)],
      [],
    );
  },
};
