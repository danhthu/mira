/**
 * Chi phí mỗi lần dùng và cách chọn món để hỏi mỗi tuần. Để ở feature chứ chưa
 * ở `core/` vì phạm vi sửa đổi hiện tại không chạm được `core/` — xem HANDOFF.
 */

interface ReleaseCandidate {
  id: string;
  useCount: number;
}

/**
 * Giá mua ÷ số lần dùng, làm tròn về số nguyên VND. Trả `null` khi chưa có giá
 * hoặc chưa dùng lần nào — không có gì để chia, và một con số bịa ra ở đây sẽ
 * biến thành lời phán xét.
 */
export function costPerUse(price: number | null, useCount: number): number | null {
  if (price === null || useCount <= 0) return null;
  return Math.round(price / useCount);
}

function weekSeed(weekStartYMD: string): number {
  let sum = 0;
  for (let i = 0; i < weekStartYMD.length; i += 1) {
    sum += weekStartYMD.charCodeAt(i);
  }
  return sum;
}

/**
 * Món mang ra hỏi trong tuần. Ưu tiên món ít được dùng nhất, rồi xoay vòng theo
 * tuần để không tuần nào cũng hỏi đúng một món. Cùng một tuần luôn ra cùng một
 * món: câu hỏi đổi mỗi lần mở app thì không còn là câu hỏi, chỉ là tiếng ồn.
 */
export function pickWeeklyRelease<T extends ReleaseCandidate>(
  items: T[],
  weekStartYMD: string,
): T | null {
  if (items.length === 0) return null;
  const ordered = [...items].sort(
    (a, b) => a.useCount - b.useCount || a.id.localeCompare(b.id),
  );
  const picked = ordered[weekSeed(weekStartYMD) % ordered.length];
  return picked ?? null;
}
