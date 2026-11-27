/**
 * Nhắc: hẹn giờ gợi người dùng quay lại ghi.
 *
 * MÁY CHỦ KHÔNG BIẾT MẤY GIỜ, VÀ KHÔNG CẦN BIẾT.
 *
 * Nó chỉ giữ chuỗi "21:00" cùng những thứ trong tuần. Việc so với bây giờ là việc của
 * client — nơi duy nhất biết người dùng đang ở múi giờ nào. Vì thế ở đây **không có**
 * hàm "lời nhắc nào tới hạn": viết được hàm đó nghĩa là đã đoán múi giờ, và đoán sai thì
 * lời nhắc 21:00 nhảy ra lúc 14:00.
 *
 * TRẦN BA LỜI NHẮC.
 * Nhắc nhiều hơn ba lần một ngày thì nó hết là lời nhắc và thành tiếng ồn, mà thứ người
 * ta làm với tiếng ồn là tắt hẳn — mất luôn cả lời nhắc đáng giá.
 */
import type { ReminderRepository, ReminderRec } from '../database/repositories/ReminderRepository';
import { badRequest, notFound, tierFull } from '../shared/errors';

export interface ReminderDeps {
  readonly reminders: ReminderRepository;
}

export const REMINDER_CAP = 3;

const TIME_RE = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const DAYS_RE = /^[1-7]{1,7}$/;

function checkTime(raw: unknown): string {
  const gio = String(raw ?? '').trim();
  if (!TIME_RE.test(gio)) throw badRequest('Giờ phải có dạng HH:MM, ví dụ 21:00.');
  return gio;
}

/**
 * Thứ trong tuần. Bỏ trùng và sắp lại, vì "1131" và "13" là cùng một ý định — để nguyên
 * thì hai hàng trông khác nhau mà chạy giống nhau.
 */
function checkDays(raw: unknown): string {
  const days = String(raw ?? '').trim();
  if (!DAYS_RE.test(days)) throw badRequest('Thứ phải là các số 1–7, ví dụ "12345".');
  return [...new Set(days.split(''))].sort().join('');
}

function checkText(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null;
  const text = String(raw).trim().replace(/\s+/g, ' ');
  if (text === '') return null;
  if (text.length > 120) throw badRequest('Lời nhắc dài quá 120 ký tự.');
  return text;
}

export async function createReminder(
  deps: ReminderDeps,
  userId: string,
  dto: { at: unknown; days: unknown; text: unknown },
): Promise<ReminderRec> {
  const present = await deps.reminders.count(userId);
  if (present >= REMINDER_CAP) {
    throw tierFull(`Đã có ${present} lời nhắc, tối đa ${REMINDER_CAP}. Xoá bớt một cái trước.`);
  }
  return deps.reminders.create(userId, {
    at: checkTime(dto.at),
    days: checkDays(dto.days),
    text: checkText(dto.text),
  });
}

export async function updateReminder(
  deps: ReminderDeps,
  userId: string,
  id: string,
  dto: { at?: unknown; days?: unknown; text?: unknown; enabled?: unknown },
): Promise<ReminderRec> {
  const ra = await deps.reminders.update(id, userId, {
    at: dto.at === undefined ? undefined : checkTime(dto.at),
    days: dto.days === undefined ? undefined : checkDays(dto.days),
    text: dto.text === undefined ? undefined : checkText(dto.text),
    enabled: dto.enabled === undefined ? undefined : dto.enabled === true,
  });
  if (ra === null) throw notFound('Không có lời nhắc nào như vậy.');
  return ra;
}

export async function deleteReminder(deps: ReminderDeps, userId: string, id: string): Promise<ReminderRec> {
  const ra = await deps.reminders.softDelete(id, userId);
  if (ra === null) throw notFound('Không có lời nhắc nào như vậy.');
  return ra;
}

/**
 * Bỏ qua một lời nhắc cho **đúng một ngày**.
 *
 * Tách khỏi việc tắt hẳn là có chủ ý: hôm nay bận không phải lý do để bỏ một thói quen
 * đang xây. Giống hệt `routine_skip`, và cố ý giống — hai cơ chế "hôm nay không" khác nhau
 * trong cùng một sản phẩm là thứ người dùng phải học hai lần.
 */
export async function skipReminder(
  deps: ReminderDeps,
  userId: string,
  id: string,
  date: string,
): Promise<void> {
  const co = await deps.reminders.findById(id, userId);
  if (co === null) throw notFound('Không có lời nhắc nào như vậy.');
  await deps.reminders.addSkip(id, userId, date);
}
