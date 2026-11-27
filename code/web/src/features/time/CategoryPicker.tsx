import { useState } from 'react';
import {
  CATEGORY_CAP,
  type Category,
  type CategoryColor,
  type CategoryIcon,
  type TimeBucket,
} from '@mira/contract';
import { store } from '../../lib/store';
import { IconColorPicker } from '../../ui/IconColorPicker';

/**
 * Chọn danh mục, và tạo mới ngay tại chỗ.
 *
 * Danh mục là **tuỳ chọn**: "Không chọn" luôn là một lựa chọn, và nó đứng đầu. Bắt phân
 * loại là thêm ma sát ghi, mà giảm ma sát mới là đòn bẩy +39%.
 *
 * Tạo mới nằm ngay trong hàng chọn chứ không đẩy sang màn khác. Người ta nghĩ ra một
 * danh mục đúng lúc đang ghi, không phải lúc ngồi dọn cài đặt; bắt đi màn khác rồi quay
 * lại là chỗ người ta bỏ cuộc.
 */
export function CategoryPicker({
  categories,
  bucket,
  pick,
  onPick,
  onCreated,
}: {
  readonly categories: readonly Category[];
  readonly bucket: TimeBucket;
  readonly pick: string | null;
  readonly onPick: (id: string | null) => void;
  readonly onCreated: (dm: Category) => void;
}) {
  const [moTao, setMoTao] = useState(false);
  const [ten, setTen] = useState('');
  const [loi, setLoi] = useState<string | null>(null);
  const [busy, setDangChay] = useState(false);
  const [icon, setIcon] = useState<CategoryIcon | null>(null);
  const [color, setColor] = useState<CategoryColor | null>(null);

  const inBucket = categories.filter((d) => d.bucket === bucket);
  const dayO = inBucket.length >= CATEGORY_CAP;

  async function tao(): Promise<void> {
    setDangChay(true);
    setLoi(null);
    try {
      const moi = await store.createCategory({
        name: ten.trim(),
        bucket,
        icon,
        color,
      });
      setTen('');
      setIcon(null);
      setColor(null);
      setMoTao(false);
      onCreated(moi);
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không tạo được danh mục.');
    } finally {
      setDangChay(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div className="pills" style={{ flexWrap: 'wrap' }}>
        <button type="button" aria-pressed={pick === null} onClick={() => onPick(null)}>
          Không chọn
        </button>
        {inBucket.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={pick === d.id}
            onClick={() => onPick(d.id)}
          >
            {d.name}
            {d.golden ? ' 🕯️' : ''}
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
            aria-label="Tên danh mục"
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

      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
          {loi}
        </p>
      )}

      {dayO && (
        <p className="empty" style={{ marginTop: 8 }}>
          Ô này đã đủ {CATEGORY_CAP} danh mục. Cất bớt một cái ở màn chi tiết nhóm việc.
        </p>
      )}
    </div>
  );
}
