import { useState } from 'react';
import {
  MONEY_CELL_LABEL_VI,
  MONEY_FLOW_CELLS,
  type MoneyCategory,
  type MoneyEntry,
  type MoneyFlowCell,
} from '@mira/contract';
import { labelDay } from '../../lib/date';
import { vnd } from '../../lib/format';
import { store } from '../../lib/store';
import { RowActions } from '../../ui/RowActions';
import { MoneyCategoryPicker } from './MoneyCategoryPicker';
import { Icon } from '../../ui/Icon';
import { MONEY_CELL_ICON } from '../../lib/moneyColors';
import { moneyStyle } from '../../lib/categoryStyle';

/** Màu của từng ô tiền, khớp các lát trên vòng dòng tiền. */
const MAU: Record<MoneyFlowCell, string> = {
  netIncome: 'var(--family-ink)',
  monthlyExpense: 'var(--red)',
  wastedMoney: 'var(--waste-ink)',
  investment: 'var(--work-ink)',
  debtPayment: 'var(--navy)',
};

/**
 * Một khoản tiền. Bản sao của `EntryRow` bên thời gian, đến cả cách bày nút.
 *
 * Nút **Sửa** và **Xoá** hiện ra ở chân dòng, không nấp sau một cú chạm. Lý do giống hệt
 * bên thời gian: không có dấu hiệu nào nói rằng chạm được, nên người ta không chạm thử.
 *
 * Thu nhập hiện dấu **+**, bốn ô kia dấu **−**. Dấu nằm ở chỗ ô chứ không nằm trong con
 * số đã lưu — `amount` trong CSDL luôn dương.
 */
export function MoneyEntryRow({
  e,
  categories,
  longest,
  onChanged,
  hideDate = false,
}: {
  readonly e: MoneyEntry;
  readonly categories: readonly MoneyCategory[];
  readonly longest: number;
  readonly onChanged: () => void;
  /**
   * Danh sách đã có đầu ngày ở trên thì dòng thôi nhắc ngày.
   *
   * Mặc định `false` để mọi chỗ gọi cũ vẫn như cũ. Chỗ nào bọc dòng trong nhóm ngày thì
   * truyền `true` — nhắc lại ngày ngay dưới một cái đầu ngày to tướng là thừa.
   */
  readonly hideDate?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dm = categories.find((d) => d.id === e.categoryId);
  const ten = dm?.name ?? MONEY_CELL_LABEL_VI[e.cell];
  const vao = e.cell === 'netIncome';
  // Hình của danh mục, rơi về hình của ô khi chưa chọn. Mũi tên vào/ra chuyển xuống dòng
  // phụ dưới dạng dấu + và −, nên liếc một cái vẫn biết tiền vào hay ra.
  const kieu = moneyStyle(dm, e.cell, MONEY_CELL_ICON[e.cell]);

  return (
    <div className="list-row" style={{ alignItems: 'flex-start' }}>
      {/* Mũi tên nhuộm theo màu ô, nên liếc một cái là biết dòng này thuộc ô nào mà
          không phải đọc chữ. Trước đây là hai ký tự ↓ ↑ màu chữ thường. */}
      <div className="list-icon" style={{ background: '#edeff3', color: kieu.color }}>
        <Icon name={kieu.icon} size={19} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ alignItems: 'baseline' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{ten}</div>
          <div style={{ fontWeight: 700, color: MAU[e.cell], marginLeft: 'auto' }}>
            {vao ? '+' : '−'}
            {vnd(e.amount)}
          </div>
        </div>

        {/* Thanh tỉ lệ so với khoản lớn nhất đang hiện. Đọc một danh sách toàn số thì
            mắt so chiều dài nhanh hơn so chữ số — lấy từ màn Thời gian. */}
        <div className="bar" style={{ marginTop: 6 }}>
          <i style={{ width: `${Math.round((e.amount * 100) / longest)}%`, background: MAU[e.cell] }} />
        </div>

        <div className="dong-chan">
          <div className="sm" style={{ minWidth: 0 }}>
            {hideDate ? '' : labelDay(e.date)}
            {e.categoryId === null ? '' : `${hideDate ? '' : ' · '}${MONEY_CELL_LABEL_VI[e.cell]}`}
            {e.note === null || e.note.trim() === '' ? '' : ` · ${e.note}`}
          </div>
          <RowActions
            onEdit={() => setOpen(!open)}
            editing={open}
            onDelete={async () => {
              await store.deleteMoneyEntry(e.id);
              onChanged();
            }}
            question="Xoá hẳn khoản này?"
          />
        </div>

        {open && (
          <EditMoneyEntry
            e={e}
            categories={categories}
            onDone={() => {
              setOpen(false);
              onChanged();
            }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Sửa một khoản: số tiền, ô, danh mục, ghi chú.
 *
 * Sửa được **cả ô**, không chỉ số tiền — giống bên thời gian và cùng một lý do. Ô là thứ
 * dễ sai nhất khi ghi bằng chat, và một khoản nằm sai ô thì vòng dòng tiền sai mãi.
 *
 * Không sửa ngày: đổi ngày của một khoản đã ghi gần như luôn là muốn ghi một khoản khác.
 */
function EditMoneyEntry({
  e,
  categories,
  onDone,
}: {
  readonly e: MoneyEntry;
  readonly categories: readonly MoneyCategory[];
  readonly onDone: () => void;
}) {
  const [so, setSo] = useState(String(e.amount));
  const [cell, setCell] = useState<MoneyFlowCell>(e.cell);
  const [pick, setPick] = useState<string | null>(e.categoryId);
  const [note, setNote] = useState(e.note ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const soMoi = Number(so.replace(/\D/g, ''));
  const valid = Number.isInteger(soMoi) && soMoi > 0;
  const noteMoi = note.trim() === '' ? null : note.trim();
  const changed = soMoi !== e.amount || cell !== e.cell || pick !== e.categoryId || noteMoi !== e.note;

  async function save(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await store.updateMoneyEntry(e.id, {
        amount: soMoi,
        cell,
        categoryId: pick,
        note: noteMoi,
      });
      onDone();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Không lưu được.');
      setBusy(false);
    }
  }

  return (
    <div className="edit">
      <div className="pills pills--small" style={{ flexWrap: 'wrap' }}>
        {MONEY_FLOW_CELLS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cell === c}
            onClick={() => {
              setCell(c);
              // Danh mục thuộc đúng một ô, nên đổi ô thì bỏ chọn.
              setPick(null);
            }}
          >
            {MONEY_CELL_LABEL_VI[c]}
          </button>
        ))}
      </div>

      <MoneyCategoryPicker
        categories={categories}
        cell={cell}
        pick={pick}
        onPick={setPick}
        onCreated={(dm) => {
          setPick(dm.id);
          onDone();
        }}
      />

      <input
        className="edit__text"
        value={note}
        onChange={(ev) => setNote(ev.target.value)}
        placeholder="Ghi chú (không bắt buộc)"
        aria-label="Ghi chú"
      />

      <div className="edit__row" style={{ marginTop: 10 }}>
        <input
          value={so}
          onChange={(ev) => setSo(ev.target.value.replace(/\D/g, ''))}
          inputMode="numeric"
          aria-label="Số tiền"
        />
        <span className="sm">đồng</span>
        <button
          type="button"
          className="edit__save"
          disabled={!valid || busy || !changed}
          onClick={() => void save()}
        >
          {busy ? 'Đang lưu…' : 'Lưu'}
        </button>
      </div>

      {error !== null && (
        <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}
