import { base } from '../../Common/Entities/base';
import { getRepository } from '../../Common/Repositories';

/**
 * Bảng `moment` theo `02-data-model.md`. Đặt tạm ở đây vì đợt này chỉ được sửa
 * `src/Home/**`; chỗ đúng của nó là `src/Common/Entities/` cạnh `person` và
 * `time_entry`. Tên bảng `moment` đã nằm sẵn trong allowlist đồng bộ
 * (`Common/Sync/constants.ts`) nên tầng đồng bộ nhận ngay, không phải sửa gì.
 *
 * V1 chỉ ghi chữ: `05-v1-spec.md` đòi "gõ và enter là xong" dưới 15 giây. Ảnh và
 * âm thanh của `02-data-model.md` để đợt sau, không dựng cột rỗng trước.
 */
export class MomentNote extends base {
  public occurredAt: number;
  public text: string;
}

export const momentRepository = getRepository<MomentNote>('moment');
