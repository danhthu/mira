import type { BucketSlice, WeekSummary } from '@mira/contract';
import type { TimeBucket } from '../shared/types/enums';
import type { TimeEntryRepository } from '../database/repositories/TimeEntryRepository';
import { DEFAULT_WAKING_MINUTES_PER_WEEK, TIME_BUCKETS } from '../shared/constants';
import { badRequest } from '../shared/errors';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function assertDate(value: string, field: string): string {
  if (!DATE_RE.test(value)) {
    throw badRequest(`${field} phải có dạng YYYY-MM-DD`);
  }
  return value;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Chia giờ theo nhóm việc. Luôn trả đủ bốn lát kể cả nhóm chưa có phút nào, để donut
 * không đổi thứ tự màu giữa các tuần.
 *
 * `perMille` tính trên giờ tỉnh chứ không trên tổng đã ghi: người dùng cần thấy phần
 * mình chưa ghi, không phải một vòng tròn luôn đầy 100%.
 */
function slice(sums: Map<TimeBucket, number>, wakingMinutes: number): BucketSlice[] {
  return TIME_BUCKETS.map((bucket) => {
    const minutes = sums.get(bucket) ?? 0;
    return {
      bucket,
      minutes,
      perMille: wakingMinutes === 0 ? 0 : Math.round((minutes * 1000) / wakingMinutes),
    };
  });
}

export interface TimeDeps {
  readonly timeEntries: TimeEntryRepository;
  /** Giờ tỉnh mỗi tuần của người dùng. Mặc định 16 giờ mỗi ngày. */
  readonly wakingMinutesPerWeek?: number;
}

export async function weekSummary(deps: TimeDeps, userId: string, weekStart: string): Promise<WeekSummary> {
  assertDate(weekStart, 'weekStart');
  const waking = deps.wakingMinutesPerWeek ?? DEFAULT_WAKING_MINUTES_PER_WEEK;

  const read = async (start: string) => {
    const end = addDays(start, 6);
    const rows = await deps.timeEntries.sumByBucket(userId, start, end);
    const sums = new Map<TimeBucket, number>(rows.map((r) => [r.bucket, r.minutes]));
    const slices = slice(sums, waking);
    return {
      slices,
      loggedMinutes: slices.reduce((total, s) => total + s.minutes, 0),
      goldenMinutes: await deps.timeEntries.sumGolden(userId, start, end),
      recordedDays: await deps.timeEntries.countDays(userId, start, end),
    };
  };

  const current = await read(weekStart);
  const prev = await read(addDays(weekStart, -7));

  // Hai lý do không so, và lý do thứ hai mới là cái đã từng nói dối:
  //
  //  1. Tuần trước không có phút nào — chưa dùng app tuần đó, không có gì để so.
  //  2. Tuần này ghi ÍT NGÀY hơn tuần trước. Thứ Ba so với cả tuần thì mọi tổng đều
  //     giảm, và thẻ nhận xét khen "lãng phí giảm 26h" trong khi thật ra bốn ngày
  //     chưa xảy ra. So tổng của hai khoảng dài khác nhau là so sai, không phải so lạc
  //     quan. Thà để trống còn hơn.
  //
  // Muốn có nhận xét ngay từ thứ Ba thì phải đổi thẻ sang số bình quân mỗi ngày — đó là
  // đổi câu chữ trên màn hình, không chỉ đổi phép tính, nên chưa làm ở đây.
  const soDuoc = prev.loggedMinutes > 0 && current.recordedDays >= prev.recordedDays;

  return {
    weekStart,
    wakingMinutes: waking,
    loggedMinutes: current.loggedMinutes,
    slices: current.slices,
    goldenMinutes: current.goldenMinutes,
    recordedDays: current.recordedDays,
    previous: soDuoc ? prev : null,
  };
}
