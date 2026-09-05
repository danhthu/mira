import { base } from '../../Common/Entities';

export class Challenge extends base {
  public name: string;
  public cat: string;
  public icon?: string;
  public start?: Date;
  public end?: Date;
  /** Phần thưởng người dùng tự đặt cho mình khi thử thách trọn vẹn. */
  public gif?: string;
  /**
   * Chỉ có ba giá trị, và **không có `FAILURE`**: ràng buộc cứng #3 cấm nói
   * người dùng làm chưa đủ, nên app không có chỗ nào ghi lại một "thất bại".
   * Hết hạn mà chưa `SUCCESS` là trạng thái suy ra (`challengeState` →
   * `closed`), không lưu vào kho.
   *
   * Bản ghi cũ có thể còn khoá `gif_icon` hoặc `status: 'FAILURE'` trong JSON;
   * `Repository<T>` lưu nguyên khối nên khoá thừa đọc lên bị bỏ qua, và
   * `challengeState` xử lý mọi giá trị không phải `SUCCESS` như nhau.
   */
  public status?: 'CREATED' | 'DOING' | 'SUCCESS';
  public group?: string;
}
