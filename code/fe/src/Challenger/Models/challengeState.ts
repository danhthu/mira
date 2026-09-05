import { Challenge } from '../Entities';

/**
 * Trạng thái của một thử thách — hàm thuần, không React, có test.
 *
 * Chỉ có bốn trạng thái và **không trạng thái nào là thất bại**. Hết hạn mà
 * người dùng chưa đánh dấu thì thử thách `closed`: quãng thời gian đã qua, thế
 * thôi. Đó là ràng buộc cứng #3 và mục "Giọng của sản phẩm" trong
 * `docs/00-vision.md` — không bao giờ nói người dùng làm chưa đủ.
 *
 * `reached` là thứ duy nhất người dùng tự đặt (`status === 'SUCCESS'`). App
 * không tự suy ra "đạt" hay "không đạt" từ dữ liệu thói quen/công việc: suy ra
 * là chấm điểm, và chấm điểm là thứ Mira không làm.
 */
export type ChallengeState = 'upcoming' | 'doing' | 'reached' | 'closed';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(value: Date | number): number {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayDiff(from: Date | number, to: Date | number): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);
}

export function isReached(challenge: Pick<Challenge, 'status'>): boolean {
  return challenge.status === 'SUCCESS';
}

export function challengeState(
  challenge: Pick<Challenge, 'status' | 'start' | 'end'>,
  now: Date,
): ChallengeState {
  if (isReached(challenge)) return 'reached';
  if (challenge.start && dayDiff(now, challenge.start) > 0) return 'upcoming';
  if (challenge.end && dayDiff(challenge.end, now) > 0) return 'closed';
  return 'doing';
}

/** Độ dài quãng thời gian, tính cả ngày bắt đầu. Thiếu mốc thì trả 0. */
export function totalDays(
  challenge: Pick<Challenge, 'start' | 'end'>,
): number {
  if (!challenge.start || !challenge.end) return 0;
  return Math.max(dayDiff(challenge.start, challenge.end) + 1, 0);
}

/** Số ngày đã trôi qua trong quãng, kẹp trong [0, totalDays]. */
export function daysPassed(
  challenge: Pick<Challenge, 'start' | 'end'>,
  now: Date,
): number {
  if (!challenge.start) return 0;
  const passed = dayDiff(challenge.start, now) + 1;
  return Math.min(Math.max(passed, 0), totalDays(challenge));
}

export function daysLeft(
  challenge: Pick<Challenge, 'start' | 'end'>,
  now: Date,
): number {
  return Math.max(totalDays(challenge) - daysPassed(challenge, now), 0);
}

export function daysUntilStart(
  challenge: Pick<Challenge, 'start'>,
  now: Date,
): number {
  if (!challenge.start) return 0;
  return Math.max(dayDiff(now, challenge.start), 0);
}

/**
 * Thời gian đã trôi qua, 0..1. Đây là **thời gian**, không phải thành tích:
 * nó chạy đều bất kể người dùng làm gì, nên không mã hoá "đủ" hay "chưa đủ".
 */
export function elapsedRatio(
  challenge: Pick<Challenge, 'start' | 'end'>,
  now: Date,
): number {
  const total = totalDays(challenge);
  if (total === 0) return 0;
  return daysPassed(challenge, now) / total;
}

export function coversDay(
  challenge: Pick<Challenge, 'start' | 'end'>,
  day: Date | number,
): boolean {
  if (!challenge.start || !challenge.end) return false;
  const d = startOfDay(day);
  return d >= startOfDay(challenge.start) && d <= startOfDay(challenge.end);
}
