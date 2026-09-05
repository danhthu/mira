/**
 * Ghi dữ liệu từ màn hình chính. Mọi thao tác ghi vào máy trước, không chờ mạng
 * (ràng buộc cứng #5) — `Repository.save()` tự đẩy sang hàng đợi đồng bộ.
 */

import { MomentNote, momentRepository } from '../Entities';

export async function saveMoment(text: string, when: Date): Promise<void> {
  const note = new MomentNote();
  note.occurredAt = when.getTime();
  note.text = text;
  await momentRepository.add(note);
  await momentRepository.save();
}
