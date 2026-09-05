import { reminderOption, repeatOption, STATUS } from '../../Common/Interfaces/interface';
import { Entity } from '../../Common';

export class Work extends Entity.base {
  public name: string;

  /** Ngày dự định làm. Không có ngày nghĩa là việc chưa được xếp vào ngày nào. */
  public startDate?: Date;
  /**
   * Hạn chót và ngày đánh dấu xong. Không còn control nhập nào trong Work — một
   * ô "hạn" không kèm hành động nào chỉ sinh ra ô "quá hạn" đã gỡ ở màn nhìn lại.
   * `TimeTracker/Models/index.ts` và `ActivityDetailCom.tsx` vẫn đọc hai trường.
   */
  public endDate?: Date;
  public finishDate?: Date;

  public repeatOption?: repeatOption;
  public reminderOption?: reminderOption;

  /** Bản do lịch lặp sinh ra trỏ về id của bản gốc. */
  public ref?: string;

  public status?: STATUS;

  /**
   * Di sản: Batify cho gộp việc vào "nhóm" (`kind: 'group'` + `workRef`). Màn tạo
   * nhóm đã gỡ ở đợt này, nhưng bản ghi nhóm cũ vẫn nằm trên máy người dùng và
   * `Home/Models/load.ts` lọc theo `kind !== 'group'` để không đếm nhầm chúng.
   * Giữ trường lại để lọc được, không có gì trong Work ghi vào nó nữa.
   */
  public kind?: 'todo' | 'group';

  /**
   * Ba trường dưới đây không có control nhập nào trong module Work và Work cũng
   * không ghi vào chúng. Chúng còn lại vì `TimeTracker/Models/index.ts` đọc
   * (`w.timeCatId`, `w.did || w.estimated`) khi dựng dòng thời gian; bỏ đi thì
   * module đó không biên dịch được, mà `TimeTracker/` ngoài phạm vi đợt này.
   */
  public estimated?: number;
  public did?: number;
  public timeCatId?: string;
}
