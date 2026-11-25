import { useState } from 'react';
import { DANH_MUC_CAP, type DanhMuc, type TimeBucket } from '@mira/contract';
import { store } from '../../lib/store';

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
export function DanhMucChon({
  danhMuc,
  bucket,
  chon,
  onChon,
  onTaoXong,
}: {
  readonly danhMuc: readonly DanhMuc[];
  readonly bucket: TimeBucket;
  readonly chon: string | null;
  readonly onChon: (id: string | null) => void;
  readonly onTaoXong: (dm: DanhMuc) => void;
}) {
  const [moTao, setMoTao] = useState(false);
  const [ten, setTen] = useState('');
  const [loi, setLoi] = useState<string | null>(null);
  const [dangChay, setDangChay] = useState(false);

  const trongO = danhMuc.filter((d) => d.bucket === bucket);
  const dayO = trongO.length >= DANH_MUC_CAP;

  async function tao(): Promise<void> {
    setDangChay(true);
    setLoi(null);
    try {
      const moi = await store.createDanhMuc({ name: ten.trim(), bucket });
      setTen('');
      setMoTao(false);
      onTaoXong(moi);
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không tạo được danh mục.');
    } finally {
      setDangChay(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div className="pills" style={{ flexWrap: 'wrap' }}>
        <button type="button" aria-pressed={chon === null} onClick={() => onChon(null)}>
          Không chọn
        </button>
        {trongO.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={chon === d.id}
            onClick={() => onChon(d.id)}
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
        <div className="sua__hang" style={{ marginTop: 10 }}>
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
            className="sua__luu"
            disabled={ten.trim() === '' || dangChay}
            onClick={() => void tao()}
          >
            Tạo
          </button>
          <button type="button" className="sua__huy" onClick={() => setMoTao(false)}>
            Thôi
          </button>
        </div>
      )}

      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
          {loi}
        </p>
      )}

      {dayO && (
        <p className="empty" style={{ marginTop: 8 }}>
          Ô này đã đủ {DANH_MUC_CAP} danh mục. Cất bớt một cái ở màn chi tiết nhóm việc.
        </p>
      )}
    </div>
  );
}
