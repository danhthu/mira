import { vi } from '@/i18n/vi';
import { getSolarTermAt, type SolarTermId } from '@/core/slow/solarTerm';

export interface SeasonRhythm {
  termId: SolarTermId;
  /** Tên tiết khí đang tới, ví dụ "Xử thử". */
  title: string;
  /** Lời mời làm một việc ngoài trời — tiết khí nào cũng đi kèm câu riêng. */
  outdoorPrompt: string;
}

export function useSeasonRhythm(now: Date = new Date()): SeasonRhythm {
  const termId = getSolarTermAt(now);
  return {
    termId,
    title: vi.slow.seasonNames[termId],
    outdoorPrompt: vi.slow.seasonActions[termId],
  };
}
