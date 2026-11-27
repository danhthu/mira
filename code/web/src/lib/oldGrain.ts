/**
 * Hạt cũ nổi lên: đòn bẩy mạnh nhất trong mô phỏng 300 persona, giữ chân tuần 26 từ 27%
 * lên 44%.
 *
 * Nó cũng là đường vòng quanh một xung đột. "Nhắc khi trượt" cho giữ chân cao hơn nữa
 * (53%), nhưng bản chốt tính năng đã hứa *không nhắc, không hỏi vì sao bạn bỏ một tuần*.
 * Thẻ này nhắc mà không trách: nó không nói bạn bỏ mấy ngày, nó chỉ đưa lại một dòng bạn
 * từng viết.
 *
 * Trước 26/11/2026 logic này nằm riêng trong màn /tom-tat, một màn KHÔNG CÓ ĐƯỜNG VÀO.
 * Đòn bẩy mạnh nhất nằm ở chỗ không ai thấy. Tách ra đây để Nhật ký và Hũ cùng dùng.
 */
import type { Moment } from '@mira/contract';
import { addDays, labelDay } from './date';

/** Nhìn lại quãng ba tháng trước. */
export const OLD_GRAIN_DAYS = 90;
/** Lệch mấy ngày quanh mốc đó cũng nhận, không thì gần như hôm nào cũng trống. */
export const OLD_GRAIN_GAP = 4;

/** Khoảng ngày cần tải để tìm hạt cũ cho `day`. */
export function oldGrainRange(day: string): readonly [string, string] {
  const xua = addDays(day, -OLD_GRAIN_DAYS);
  return [addDays(xua, -OLD_GRAIN_GAP), addDays(xua, OLD_GRAIN_GAP)];
}

/** Hạt không có chữ thì bỏ qua: một ô trống đưa lại chẳng gợi được gì. */
export function pickOldGrain(hat: readonly Moment[]): Moment | null {
  const hasText = hat.filter((m) => m.text !== null && m.text.trim() !== '');
  if (hasText.length === 0) return null;
  // Kẹo trước: mở app ra mà bị dúi vào mặt một ngày tệ thì lần sau bớt muốn mở.
  return hasText.find((m) => m.kind === 'candy') ?? hasText[0] ?? null;
}

export function oldGrainCaption(ngayCu: string, homNay: string): string {
  const cach = Math.round(
    (Date.parse(`${homNay}T00:00:00Z`) - Date.parse(`${ngayCu}T00:00:00Z`)) / 86_400_000,
  );
  const thang = Math.round(cach / 30);
  return `${labelDay(ngayCu)}, ${thang} tháng trước, bạn viết`;
}
