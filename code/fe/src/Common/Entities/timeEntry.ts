import { TimeBucket, TimeEntrySource } from '../../Core/types';
import { base } from './base';

/** Bảng `time_entry` theo `02-data-model.md`. Một khoảng thời gian đã dùng. */
export class TimeEntry extends base {
  /** `YYYY-MM-DD`. */
  public date: string;
  /** Phút nguyên — quy ước `02-data-model.md`, không giờ thập phân. */
  public minutes: number;
  public bucket: TimeBucket;
  /** Null khi không với ai. */
  public personId?: string;
  public note?: string;
  public source: TimeEntrySource;
}
