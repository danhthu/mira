import { DunbarRing, PersonRole } from '../../Core/types';
import { base } from './base';

/** Bảng `person` theo `02-data-model.md`. Tên bảng `person` nằm trong allowlist đồng bộ. */
export class Person extends base {
  public name: string;
  public role: PersonRole;
  public birthYear?: number;
  public distanceKm?: number;
  public dunbarRing: DunbarRing;
  /** Số lần gặp/liên lạc mong muốn mỗi tháng. */
  public desiredCadence?: number;
  /** Ràng buộc cứng #4: đồng hồ cát mặc định TẮT, chỉ bật khi người dùng chủ động chọn. */
  public hourglassEnabled: boolean = false;
}
