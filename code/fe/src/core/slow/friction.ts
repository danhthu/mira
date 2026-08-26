import { MORNING_HOUR } from './constants';

/** Mốc `MORNING_HOUR` gần nhất nằm sau `at`. */
export function nextMorningAfter(at: Date): Date {
  const morning = new Date(at);
  morning.setHours(MORNING_HOUR, 0, 0, 0);
  if (morning.getTime() <= at.getTime()) {
    morning.setDate(morning.getDate() + 1);
  }
  return morning;
}

/**
 * Ma sát cố ý: thêm một mục tiêu rồi thì mục tiêu kế tiếp mở vào sáng hôm sau.
 * Một đêm ngủ giữa hai quyết định lọc ra được phần lớn thứ chỉ là hứng lên.
 *
 * M3 gọi hàm này trước khi cho tạo mục tiêu mới.
 */
export function canAddGoalAt(lastGoalAddedAt: Date | null, now: Date): boolean {
  if (lastGoalAddedAt === null) return true;
  return now.getTime() >= nextMorningAfter(lastGoalAddedAt).getTime();
}
