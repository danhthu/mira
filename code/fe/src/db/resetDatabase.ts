import { db } from './client';
import * as schema from './schema';

/**
 * Xoá sạch dữ liệu cục bộ — R-013/R-045, "xoá toàn bộ" nghĩa là toàn bộ.
 *
 * Danh sách bảng suy thẳng từ `schema.ts` chứ không liệt tay: trước đây nút xoá
 * chỉ đụng ba bảng (person, timeEntry, moment) trong khi lược đồ có mười ba, nên
 * người dùng bấm "xoá tất cả" mà tiền, mục tiêu, cảm xúc vẫn nằm nguyên trong máy.
 * Viết kiểu này thì thêm bảng mới là tự động được xoá theo, không phụ thuộc trí nhớ.
 */
const ALL_TABLES = [
  schema.person,
  schema.timeEntry,
  schema.workLoad,
  schema.money,
  schema.expense,
  schema.goal,
  schema.moment,
  schema.health,
  schema.mood,
  schema.weightOnMind,
  schema.item,
  schema.space,
  schema.letter,
] as const;

export async function deleteAllLocalData(): Promise<void> {
  for (const table of ALL_TABLES) {
    await db.delete(table);
  }
}
