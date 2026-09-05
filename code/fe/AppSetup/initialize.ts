import { initialize as challenge_init } from '../src/Challenger/Setup/initialize';
import { initialize as common_init } from '../src/Common/Setup/initialize';
import { wishRepository } from '../src/Emotion/Entities';
import { initialize as emotion_init } from '../src/Emotion/Setup/initialize';
import { initialize as goal_init } from '../src/Goal/Setup/initialize';
import { habitTemplateRepository } from '../src/HabitTracker/Entities';
import { initialize as habit_init } from '../src/HabitTracker/Setup/initialize';
import { dailyActivityRepository, timeCatRepository } from '../src/TimeTracker/Entities/repositories';
import { initialize as time_init } from '../src/TimeTracker/Setup/initialize';
import { initialize as work_init } from '../src/Work/Setup/initialize';

/**
 * Hàm seed của các module không idempotent: `TimeTracker` và `Emotion` gọi `empty()`
 * rồi `adds()`, `HabitTracker` gọi `add()` không kiểm trùng. Gọi vô điều kiện mỗi lần
 * mở app thì danh mục người dùng tự sửa bị ghi đè, còn kho template phình thêm 50 dòng
 * mỗi lần. Nên chặn ở đây thay vì sửa trong từng module: `initialize` là nơi duy nhất
 * biết "đã cài xong hay chưa", còn module chỉ biết cách dựng hạt giống.
 *
 * Kho còn trống là dấu hiệu duy nhất đáng tin cho "chưa gieo lần nào" — không cần cờ
 * mới, và người dùng đã cài từ bản cũ cũng không bị gieo đè.
 */
async function isEmpty(repo: { list: () => Promise<unknown[]> }): Promise<boolean> {
  return (await repo.list()).length === 0;
}

export async function initialize() {
  // `time_init` gieo cả hai kho trong một lượt và mở đầu bằng `empty()`, nên chỉ chạy
  // khi cả hai còn trống; một kho đã có dữ liệu nghĩa là người dùng đã dùng qua.
  if ((await isEmpty(timeCatRepository)) && (await isEmpty(dailyActivityRepository))) {
    await time_init();
  }
  if (await isEmpty(habitTemplateRepository)) {
    await habit_init();
  }
  if (await isEmpty(wishRepository)) {
    await emotion_init();
  }
  await work_init();
  await goal_init();
  await challenge_init();
  await common_init();
}
