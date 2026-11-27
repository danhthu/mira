import { useState } from 'react';
import {
  MONEY_CATEGORY_CAP,
  type CategoryColor,
  type CategoryIcon,
  type MoneyCategory,
  type MoneyFlowCell,
} from '@mira/contract';
import { store } from '../../lib/store';
import { IconColorPicker } from '../../ui/IconColorPicker';

/**
 * Chọn danh mục tiền, và tạo mới ngay tại chỗ.
 *
 * Bản sao của `CategoryPicker` bên thời gian, từng luật một:
 *
 *   • "Không chọn" luôn có và đứng đầu — danh mục là TUỲ CHỌN. Bắt phân loại là thêm ma
 *     sát ghi, mà giảm ma sát mới là đòn bẩy +39%.
 *   • Tạo mới nằm ngay trong hàng chọn, không đẩy sang màn khác. Người ta nghĩ ra một
 *     danh mục đúng lúc đang ghi, không phải lúc ngồi dọn cài đặt.
 *
 * Chữ của chip là chữ NGƯỜI DÙNG ĐẶT. Mira không bày sẵn "Ăn uống", "Đi lại" — bày sẵn
 * là áp cách phân loại của người khác lên đời sống của họ, rồi họ ghi vào ô gần đúng
 * nhất và con số thành vô nghĩa.
 */
export function MoneyCategoryPicker({
  categories,
  cell,
  pick,
  onPick,
  onCreated,
}: {
  readonly categories: readonly MoneyCategory[];
  readonly cell: MoneyFlowCell;
  readonly pick: string | null;
  readonly onPick: (id: string | null) => void;
  readonly onCreated: (dm: MoneyCategory) => void;
}) {
  const [moTao, setMoTao] = useState(false);
  const [ten, setTen] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [icon, setIcon] = useState<CategoryIcon | null>(null);
  const [color, setColor] = useState<CategoryColor | null>(null);

  const inCell = categories.filter((d) => d.cell === cell);
  const dayO = inCell.length >= MONEY_CATEGORY_CAP;

  async function tao(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const moi = await store.createMoneyCategory({
        name: ten.trim(),
        cell,
        icon,
        color,
      });
      setTen('');
      setIcon(null);
      setColor(null);
      setMoTao(false);
      onCreated(moi);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Không tạo được danh mục.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div className="pills" style={{ flexWrap: 'wrap' }}>
        <button type="button" aria-pressed={pick === null} onClick={() => onPick(null)}>
          Không chọn
        </button>
        {inCell.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={pick === d.id}
            onClick={() => onPick(d.id)}
          >
            {d.name}
          </button>
        ))}
        {!dayO && !moTao && (
          <button type="button" onClick={() => setMoTao(true)}>
            + Mới
          </button>
        )}
      </div>

      {moTao && (
        <div className="edit__row" style={{ marginTop: 10 }}>
          <input
            value={ten}
            onChange={(e) => setTen(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && ten.trim() !== '') void tao();
            }}
            placeholder="Tên danh mục"
            style={{ flex: 1, minWidth: 0 }}
            aria-label="Tên danh mục tiền"
          />
          <button
            type="button"
            className="edit__save"
            disabled={ten.trim() === '' || busy}
            onClick={() => void tao()}
          >
            Tạo
          </button>
          <button type="button" className="edit__cancel" onClick={() => setMoTao(false)}>
            Thôi
          </button>
        </div>
      )}
      {moTao && (
        <>
          {/* Hình và màu chọn NGAY lúc tạo, như Money Lover. Trước đây phải tạo xong rồi mở
              khay sửa mới gán được: hai bước cho một việc. Bỏ trống vẫn tạo được. */}
          <IconColorPicker icon={icon} color={color} onIcon={setIcon} onColor={setColor} />
        </>
      )}

      {error !== null && (
        <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
          {error}
        </p>
      )}

      {dayO && (
        <p className="empty" style={{ marginTop: 8 }}>
          Ô này đã đủ {MONEY_CATEGORY_CAP} danh mục. Cất bớt một cái ở cuối màn Tài chính.
        </p>
      )}
    </div>
  );
}
