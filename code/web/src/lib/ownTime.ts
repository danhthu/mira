/**
 * Phần giờ dành cho MÌNH VÀ GIA ĐÌNH trong số giờ đã ghi, tính bằng phần nghìn.
 *
 * Chia cho giờ ĐÃ GHI, không chia cho giờ tỉnh: người mới ghi được nửa tuần mà chia cho
 * 112 giờ tỉnh thì con số luôn thấp, và nó thấp vì chưa ghi chứ không phải vì sống lệch.
 * Chưa ghi giờ nào thì trả null — không có gì để chia.
 */
import type { TimeBucket } from '@mira/contract';

export const OWN_BUCKETS: readonly TimeBucket[] = ['family', 'personal'];

export function ownTimeMinutes(
  slices: readonly { readonly bucket: TimeBucket; readonly minutes: number }[],
): number {
  return slices.filter((s) => OWN_BUCKETS.includes(s.bucket)).reduce((t, s) => t + s.minutes, 0);
}

export function ownTimePerMille(
  slices: readonly { readonly bucket: TimeBucket; readonly minutes: number }[],
  loggedMinutes: number,
): number | null {
  if (loggedMinutes <= 0) return null;
  return Math.min(1000, Math.round((ownTimeMinutes(slices) * 1000) / loggedMinutes));
}
