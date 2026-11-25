/**
 * Gom toàn bộ dữ liệu của một người thành đúng định dạng mà `nhapBo` nhập lại được.
 *
 * TẠI SAO Ở MÁY CHỦ CHỨ KHÔNG Ở TRÌNH DUYỆT
 *
 * Bản cũ gom ở phía web, và nó **làm mất dữ liệu**. Nó lấy thói quen qua `habitWeek`,
 * mà hàm đó chỉ trả thói quen đang chạy và đúng bảy ngày của tuần đang xem. Xuất rồi
 * nhập lại là mất sạch mọi lần đánh dấu trước thứ Hai và mọi thói quen đã dừng. Im lặng,
 * không báo gì.
 *
 * Lỗi đó không phải bất cẩn: `habitWeek` cố tình chỉ nhìn một tuần, để trong app không
 * có cách nào tính ra chuỗi ngày. Luật đó đúng cho màn hình. Nhưng để nó vắt sang cả
 * đường sao lưu thì thành chặn người dùng mang dữ liệu của chính họ đi. Hai việc khác
 * nhau phải đi hai đường khác nhau.
 *
 * Bản cũ còn gọi `getMoney` **36 lần tuần tự**, mỗi lần một vòng mạng. Qua tunnel là hơn
 * mười giây đứng im. Ở đây là một câu truy vấn khoảng.
 *
 * Xuất lấy **tất cả**, kể cả mục tiêu đã kết thúc và thói quen đã dừng: đây là bản sao
 * lưu, không phải một màn hình.
 */
import type { IDatabase } from '../shared/interfaces/IDatabase';
import { TimeEntryRepository } from '../database/repositories/TimeEntryRepository';
import { MomentRepository } from '../database/repositories/MomentRepository';
import { GoalRepository } from '../database/repositories/GoalRepository';
import { MoneyRepository } from '../database/repositories/MoneyRepository';
import { HabitRepository } from '../database/repositories/HabitRepository';

export async function xuatBo(db: IDatabase, userId: string): Promise<Record<string, unknown>> {
  const [timeEntries, moments, goals, thang, thoiQuen] = await Promise.all([
    new TimeEntryRepository(db).findAll(userId),
    new MomentRepository(db).findAll(userId),
    new GoalRepository(db).findAll(userId),
    // Khoảng rộng hết mức: Mira mới có từ 2026, và lấy thừa thì không mất gì.
    new MoneyRepository(db).findRange(userId, '2000-01', '2099-12'),
    new HabitRepository(db).findAllForExport(userId),
  ]);

  // `money` là object khoá theo tháng, đúng hình dạng `nhapBo` chờ nhận.
  const money: Record<string, unknown> = {};
  for (const m of thang) money[m.month] = m;

  return {
    timeEntries,
    moments,
    money,
    goals,
    habits: thoiQuen.habits,
    habitChecks: thoiQuen.checks,
  };
}
