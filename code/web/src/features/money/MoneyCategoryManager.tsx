import { useState } from 'react';
import {
  MONEY_CELL_LABEL_VI,
  type CategoryColor,
  type CategoryIcon,
  type MoneyCategory,
} from '@mira/contract';
import { store } from '../../lib/store';
import { RowActions } from '../../ui/RowActions';
import { Icon } from '../../ui/Icon';
import { IconColorPicker } from '../../ui/IconColorPicker';
import { moneyStyle } from '../../lib/categoryStyle';
import { MONEY_CELL_ICON } from '../../lib/moneyColors';

/**
 * Đổi tên và cất danh mục tiền. Bản sao của `CategoryManager` bên thời gian.
 *
 * CẤT ĐI, KHÔNG XOÁ. Danh mục đã dùng thì khoản cũ còn trỏ về nó. Xoá là sửa lịch sử;
 * cất đi thì nó biến khỏi danh sách chọn mà số cũ vẫn đọc được. Vì vậy nút ở đây ghi
 * **Cất**, không ghi Xoá — chữ phải nói đúng việc nó làm.
 */
export function MoneyCategoryManager({
  categories,
  onChanged,
}: {
  readonly categories: readonly MoneyCategory[];
  readonly onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (categories.length === 0) return null;

  return (
    <div className="card" style={{ marginTop: 6 }}>
      <button
        type="button"
        className="group-button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <div className="row" style={{ alignItems: 'baseline' }}>
          <div className="label">Danh mục tiền</div>
          <div className="sm" style={{ marginLeft: 'auto' }}>
            {categories.length} cái
            <span className={open ? 'group-arrow is-mo' : 'group-arrow'} aria-hidden>
              ›
            </span>
          </div>
        </div>
      </button>

      {open &&
        categories.map((d) => <ManagerRow key={d.id} d={d} onChanged={onChanged} />)}
    </div>
  );
}

function ManagerRow({
  d,
  onChanged,
}: {
  readonly d: MoneyCategory;
  readonly onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(d.name);
  const [icon, setIcon] = useState<CategoryIcon | null>(d.icon);
  const [color, setColor] = useState<CategoryColor | null>(d.color);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await store.renameMoneyCategory(d.id, { name: name.trim(), icon, color });
      setEditing(false);
      onChanged();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Không đổi tên được.');
    } finally {
      setBusy(false);
    }
  }

  const kieu = moneyStyle(d, d.cell, MONEY_CELL_ICON[d.cell]);

  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, marginTop: 10 }}>
      <div className="dong-chan">
        <div className="sm" style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
          {/* Hình hiện ngay cạnh tên, để đổi xong là thấy kết quả không phải đóng khay. */}
          <span style={{ color: kieu.color }}>
            <Icon name={kieu.icon} size={18} />
          </span>
          <span>
            <b style={{ fontSize: 15, color: 'var(--fg)' }}>{d.name}</b> ·{' '}
            {MONEY_CELL_LABEL_VI[d.cell]}
          </span>
        </div>
        <RowActions
          onEdit={() => setEditing(!editing)}
          editing={editing}
          editLabel="Đổi tên"
          onDelete={async () => {
            await store.archiveMoneyCategory(d.id);
            onChanged();
          }}
          question="Cất danh mục này? Số cũ vẫn giữ nguyên."
        />
      </div>

      {editing && (
        <div className="edit">
          <div className="edit__row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim() !== '') void save();
              }}
              style={{ flex: 1, minWidth: 0 }}
              aria-label="Tên danh mục"
            />
            <button
              type="button"
              className="edit__save"
              disabled={
              name.trim() === '' ||
              busy ||
              (name.trim() === d.name && icon === d.icon && color === d.color)
            }
              onClick={() => void save()}
            >
              Lưu
            </button>
          </div>

          <IconColorPicker icon={icon} color={color} onIcon={setIcon} onColor={setColor} />
          {error !== null && (
            <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
