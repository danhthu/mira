import { CATEGORY_ICONS, type CategoryColor, type CategoryIcon } from '@mira/contract';
import { Icon, type IconName } from './Icon';
import { CATEGORY_COLOR_LABEL, CATEGORY_COLOR_VAR, COLOR_KEYS } from '../lib/categoryStyle';

/**
 * Chọn hình và màu cho một danh mục. Dùng chung cho danh mục tiền và danh mục giờ.
 *
 * ─────────────────────── LẤY TỪ MONEY LOVER, CÓ CẮT ───────────────────────
 *
 * Money Lover cho mỗi danh mục một hình và một màu riêng — đó là lý do danh sách của họ
 * quét được bằng mắt thay vì phải đọc chữ từng dòng.
 *
 * Mira lấy đúng ý đó nhưng **cắt bớt số lựa chọn**. Money Lover có hàng trăm hình; ở đây
 * có 28, vì trần danh mục mỗi ô là 6. Cho chọn trong hàng trăm cái để rồi chỉ dùng sáu là
 * biến một thao tác một giây thành một phút lướt tìm.
 *
 * **Bỏ trống vẫn được.** Không chọn gì thì dòng rơi về hình và màu của ô, y như trước.
 * Bắt chọn là thêm một bước vào đúng chỗ Mira đang cố giảm ma sát.
 */
export function IconColorPicker({
  icon,
  color,
  onIcon,
  onColor,
}: {
  readonly icon: CategoryIcon | null;
  readonly color: CategoryColor | null;
  readonly onIcon: (v: CategoryIcon | null) => void;
  readonly onColor: (v: CategoryColor | null) => void;
}) {
  // Màu để tô hình đang chọn: chọn màu rồi thì xem trước luôn, chưa chọn thì màu chữ.
  const toMau = color === null ? 'var(--fg-dim)' : CATEGORY_COLOR_VAR[color];

  return (
    <>
      <div className="label" style={{ marginTop: 12 }}>
        Màu
      </div>
      <div className="swatches">
        {COLOR_KEYS.map((c) => (
          <button
            key={c}
            type="button"
            className={c === color ? 'swatch is-on' : 'swatch'}
            style={{ background: CATEGORY_COLOR_VAR[c] }}
            aria-pressed={c === color}
            aria-label={CATEGORY_COLOR_LABEL[c]}
            onClick={() => onColor(c === color ? null : c)}
          />
        ))}
      </div>

      <div className="label" style={{ marginTop: 12 }}>
        Hình
      </div>
      <div className="iconsgrid">
        {CATEGORY_ICONS.map((n) => (
          <button
            key={n}
            type="button"
            className={n === icon ? 'iconpick is-on' : 'iconpick'}
            style={{ color: n === icon ? toMau : 'var(--fg-dim)' }}
            aria-pressed={n === icon}
            aria-label={n}
            // Bấm lại cái đang chọn là bỏ chọn. Không có đường bỏ chọn thì người ta chọn
            // nhầm một lần là kẹt với nó mãi.
            onClick={() => onIcon(n === icon ? null : (n as CategoryIcon))}
          >
            <Icon name={n as IconName} size={19} />
          </button>
        ))}
      </div>
    </>
  );
}
