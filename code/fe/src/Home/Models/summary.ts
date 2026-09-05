/**
 * Trạng thái dữ liệu của từng module, dạng thuần — không React, không repository.
 *
 * Mỗi ô đi qua `MetricState` của `src/Core/dataState.ts` thay vì trả thẳng số:
 * "chưa có gì" và "có nhưng bằng 0" là hai chuyện khác nhau, và màn hình chỉ được
 * hiện chữ ở trường hợp đầu (`00-vision.md` rủi ro #3).
 */

import { MetricState, emptyMetric, readyMetric } from '../../Core/dataState';

/** Đã xong bao nhiêu trên tổng số mục của hôm nay. */
export interface DailyProgress {
  readonly done: number;
  readonly total: number;
}

export interface HomeSummary {
  readonly work: MetricState<DailyProgress>;
  readonly habit: MetricState<DailyProgress>;
  readonly challenge: MetricState<number>;
  readonly goal: MetricState<number>;
  readonly emotion: MetricState<number>;
  readonly timeMinutes: MetricState<number>;
}

/** Không có mục nào trong ngày thì là `empty` — ô sẽ hiện câu mời, không hiện "0". */
export function progressState(done: number, total: number): MetricState<DailyProgress> {
  if (total <= 0) return emptyMetric<DailyProgress>('no_data');
  return readyMetric<DailyProgress>({ done, total });
}

/** Dùng chung cho mọi ô chỉ có một con số đếm được (thử thách, mục tiêu, lần ghi, phút). */
export function countState(count: number): MetricState<number> {
  if (count <= 0) return emptyMetric<number>('no_data');
  return readyMetric(count);
}

/** Trạng thái lúc chưa nạp xong: mọi ô đều trống, không ô nào nhấp nháy số. */
export const EMPTY_SUMMARY: HomeSummary = {
  work: emptyMetric<DailyProgress>('no_data'),
  habit: emptyMetric<DailyProgress>('no_data'),
  challenge: emptyMetric<number>('no_data'),
  goal: emptyMetric<number>('no_data'),
  emotion: emptyMetric<number>('no_data'),
  timeMinutes: emptyMetric<number>('no_data'),
};
