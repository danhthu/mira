import {
  CATEGORY_COLORS,
  type CategoryColor,
  type CategoryIcon,
  type MoneyFlowCell,
  type TimeBucket,
} from '@mira/contract';
import type { IconName } from '../ui/Icon';
import { MONEY_CELL_COLOR } from './moneyColors';
import { BUCKET_FILL } from './bucketColors';

/**
 * Hình và màu của một danh mục, và **cái rơi về khi danh mục chưa chọn gì.**
 *
 * ─────────────────────── VÌ SAO CÓ FILE NÀY ───────────────────────
 *
 * Trước đây biểu tượng gắn vào Ô: mọi dòng chi tiêu mang cùng một cái hoá đơn. Money
 * Lover gắn vào DANH MỤC, và đó là lý do danh sách của họ quét được bằng mắt. Giờ Mira
 * cũng vậy — nhưng danh mục cũ không có hình, nên phải có đường rơi về.
 *
 * Rơi về **hình của ô** chứ không phải một hình chung chung: danh mục "Số cũ" của ô chi
 * tiêu vẫn nên trông như một khoản chi, chỉ là không riêng biệt. Đó đúng bằng những gì
 * Mira biết về nó.
 */

/** Khoá màu → biến CSS. Giá trị lấy từ bảng màu đã có, không thêm màu mới. */
export const CATEGORY_COLOR_VAR: Record<CategoryColor, string> = {
  work: 'var(--work-ink)',
  family: 'var(--family-ink)',
  personal: 'var(--personal-ink)',
  waste: 'var(--waste-ink)',
  red: 'var(--red)',
  navy: 'var(--navy)',
  candy: 'var(--candy)',
  salt: 'var(--salt)',
};

/**
 * Tên tiếng Việt của từng màu, cho nhãn trợ năng.
 *
 * Người dùng trình đọc màn hình không thấy ô màu, nên nút chọn màu mà chỉ có màu thì với
 * họ là tám cái nút giống hệt nhau.
 */
export const CATEGORY_COLOR_LABEL: Record<CategoryColor, string> = {
  work: 'Xanh dương',
  family: 'Xanh lá',
  personal: 'Tím',
  waste: 'Vàng',
  red: 'Đỏ',
  navy: 'Than',
  candy: 'Nâu vàng',
  salt: 'Xanh xám',
};

export const COLOR_KEYS: readonly CategoryColor[] = CATEGORY_COLORS;

/** Chỉ cần đúng hai trường này để vẽ một dòng — không cần cả bản ghi danh mục. */
interface CoHinh {
  readonly icon: CategoryIcon | null;
  readonly color: CategoryColor | null;
}

/** Hình và màu để vẽ một dòng thuộc một ô tiền. */
export function moneyStyle(
  dm: CoHinh | null | undefined,
  cell: MoneyFlowCell,
  duPhong: IconName,
): { icon: IconName; color: string } {
  return {
    icon: (dm?.icon as IconName | undefined) ?? duPhong,
    color: dm?.color == null ? MONEY_CELL_COLOR[cell] : CATEGORY_COLOR_VAR[dm.color],
  };
}

/** Hình và màu để vẽ một dòng thuộc một nhóm việc. */
export function timeStyle(
  dm: CoHinh | null | undefined,
  bucket: TimeBucket,
  duPhong: IconName,
): { icon: IconName; color: string } {
  return {
    icon: (dm?.icon as IconName | undefined) ?? duPhong,
    color: dm?.color == null ? BUCKET_FILL[bucket] : CATEGORY_COLOR_VAR[dm.color],
  };
}
