import { base } from '../../Common/Entities';

/**
 * Liên kết chỉ nói *gắn với cái gì*, không mang theo một hạn mức số.
 *
 * Bản cũ có thêm `type: 'Target'|'Times'|'DONE'|'ONTIME'` và `value: number`
 * (mặc định bằng số ngày của thử thách, chọn qua một hộp thoại gợi ý 50%–100%).
 * Không màn nào đọc lại hai trường đó, nên chúng chỉ là một hạn mức chấm điểm
 * ghi vào máy rồi bỏ đó — ràng buộc cứng #3. Khoá thừa trong bản ghi cũ đọc lên
 * bị bỏ qua, không cần đường chuyển đổi.
 */
export interface ChallengeOption {
  link: 'Work' | 'Habit';
}

export class ChallengeAssociate extends base {
  public challengeId: string;
  public table: string;
  public tableId: string;
  public option: ChallengeOption;
}
