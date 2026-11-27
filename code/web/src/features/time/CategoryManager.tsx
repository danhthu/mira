import { useState } from 'react';
import {
  CATEGORY_CAP,
  type Category,
  type CategoryColor,
  type CategoryIcon,
  type TimeBucket,
} from '@mira/contract';
import { Icon } from '../../ui/Icon';
import { IconColorPicker } from '../../ui/IconColorPicker';
import { BUCKET_ICON } from '../../lib/bucketColors';
import { timeStyle } from '../../lib/categoryStyle';
import { store } from '../../lib/store';
import { GOLDEN_HOURS } from '../../lib/features';

/**
 * Sửa tên và cất danh mục, đặt ngay trong màn chi tiết của ô.
 *
 * Để ở đây chứ không gom vào một màn "Cài đặt" chung: người ta muốn đổi tên một danh mục
 * đúng lúc đang nhìn số của nó, không phải lúc ngồi dọn cài đặt.
 *
 * CẤT ĐI, KHÔNG XOÁ. Danh mục đã dùng thì mục giờ cũ còn trỏ về nó. Xoá là sửa lịch sử;
 * cất thì nó biến khỏi danh sách chọn mà số cũ vẫn đọc được.
 */
export function CategoryManager({
  bucket,
  categories,
  onChanged,
}: {
  readonly bucket: TimeBucket;
  readonly categories: readonly Category[];
  readonly onChanged: () => void;
}) {
  const [open, setMo] = useState(false);

  if (categories.length === 0 && !open) {
    return (
      <p className="empty" style={{ marginTop: 10 }}>
        Ô này chưa có danh mục nào. Khai ở ô ghi giờ bên màn Thời gian, hoặc{' '}
        <button
          type="button"
          className="expand-hint"
          style={{ padding: 0 }}
          onClick={() => setMo(true)}
        >
          thêm ngay tại đây
        </button>
        .
      </p>
    );
  }

  return (
    <div className="card">
      <div className="row">
        <div className="label">Danh mục của ô này</div>
        <div className="sm">
          {categories.length}/{CATEGORY_CAP}
        </div>
      </div>

      {categories.map((d) => (
        <CategoryRow2 key={d.id} d={d} onChanged={onChanged} />
      ))}

      {categories.length < CATEGORY_CAP && <QuickAdd bucket={bucket} onDone={onChanged} />}
    </div>
  );
}

function CategoryRow2({ d, onChanged }: { readonly d: Category; readonly onChanged: () => void }) {
  const kieu = timeStyle(d, d.bucket, BUCKET_ICON[d.bucket]);
  const [sua, setSua] = useState(false);
  const [ten, setTen] = useState(d.name);
  const [vang, setVang] = useState(d.golden);
  const [icon, setIcon] = useState<CategoryIcon | null>(d.icon);
  const [color, setColor] = useState<CategoryColor | null>(d.color);
  const [confirming, setChac] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  async function save(): Promise<void> {
    setLoi(null);
    try {
      await store.renameCategory(d.id, {
        name: ten.trim(),
        golden: vang,
        icon,
        color,
      });
      setSua(false);
      onChanged();
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không lưu được.');
    }
  }

  if (!sua) {
    return (
      <div className="nep-dong">
        <button
          type="button"
          className="group-button"
          style={{ flex: 1, minWidth: 0 }}
          onClick={() => setSua(true)}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              minWidth: 0,
            }}
          >
            <span style={{ color: kieu.color, display: 'flex' }}>
              <Icon name={kieu.icon} size={18} />
            </span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{d.name}</span>
            {d.golden && <Icon name="flame" size={14} />}
          </span>
          <span className="group-arrow" aria-hidden>
            ›
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="edit" style={{ marginTop: 10 }}>
      <div className="edit__row">
        <input
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          style={{ flex: 1, minWidth: 0 }}
          aria-label="Tên danh mục"
        />
        <button
          type="button"
          className="edit__save"
          disabled={
            ten.trim() === '' ||
            (ten.trim() === d.name && vang === d.golden && icon === d.icon && color === d.color)
          }
          onClick={() => void save()}
        >
          Lưu
        </button>
      </div>

      <IconColorPicker icon={icon} color={color} onIcon={setIcon} onColor={setColor} />

      {GOLDEN_HOURS && d.bucket === 'family' && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 10,
            fontSize: 14,
          }}
        >
          <input type="checkbox" checked={vang} onChange={(e) => setVang(e.target.checked)} />
          Mặc định là giờ vàng
        </label>
      )}

      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
          {loi}
        </p>
      )}

      {confirming ? (
        <div className="edit__row" style={{ marginTop: 10 }}>
          <span className="sm" style={{ flex: 1 }}>
            Cất danh mục này? Số cũ vẫn giữ nguyên.
          </span>
          <button type="button" className="edit__cancel" onClick={() => setChac(false)}>
            Thôi
          </button>
          <button
            type="button"
            className="edit__delete"
            onClick={() => void store.archiveCategory(d.id).then(onChanged)}
          >
            Cất
          </button>
        </div>
      ) : (
        <div className="edit__row" style={{ marginTop: 4 }}>
          <button type="button" className="edit__openDelete" onClick={() => setChac(true)}>
            Cất đi
          </button>
          <button
            type="button"
            className="edit__openDelete"
            style={{ marginLeft: 'auto' }}
            onClick={() => setSua(false)}
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}

function QuickAdd({
  bucket,
  onDone,
}: {
  readonly bucket: TimeBucket;
  readonly onDone: () => void;
}) {
  const [open, setMo] = useState(false);
  const [ten, setTen] = useState('');
  const [loi, setLoi] = useState<string | null>(null);
  const [icon, setIcon] = useState<CategoryIcon | null>(null);
  const [color, setColor] = useState<CategoryColor | null>(null);

  async function tao(): Promise<void> {
    setLoi(null);
    try {
      await store.createCategory({ name: ten.trim(), bucket, icon, color });
      setTen('');
      setIcon(null);
      setColor(null);
      setMo(false);
      onDone();
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không tạo được.');
    }
  }

  if (!open) {
    return (
      <button type="button" className="nep-them" onClick={() => setMo(true)}>
        + Thêm danh mục
      </button>
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div className="edit__row">
        <input
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && ten.trim() !== '') void tao();
          }}
          placeholder="Tên danh mục"
          style={{ flex: 1, minWidth: 0 }}
          aria-label="Tên danh mục mới"
        />
        <button
          type="button"
          className="edit__save"
          disabled={ten.trim() === ''}
          onClick={() => void tao()}
        >
          Tạo
        </button>
        {loi !== null && (
          <span className="sm" style={{ color: 'var(--amber)' }}>
            {loi}
          </span>
        )}
      </div>
      {/* Hình và màu chọn NGAY lúc tạo, như Money Lover. Trước đây phải tạo xong rồi mở
        khay sửa mới gán được: hai bước cho một việc. Bỏ trống vẫn tạo được. */}
      <IconColorPicker icon={icon} color={color} onIcon={setIcon} onColor={setColor} />
    </div>
  );
}
