import { useEffect, useState } from 'react';
import type { MoneyMonth } from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { monthOf, today } from '../../lib/date';
import { months as fmtMonths, perMille, UNKNOWN, vnd } from '../../lib/format';

type Cell = keyof Omit<MoneyMonth, 'month'>;

const CELLS: ReadonlyArray<{ key: Cell; label: string; hint: string }> = [
  { key: 'netIncome', label: 'Thu nhập ròng', hint: 'Số thật sự về tay tháng này' },
  { key: 'monthlyExpense', label: 'Chi tiêu tháng', hint: 'Tổng đã tiêu, không cần bóc chi tiết' },
  { key: 'debtPayment', label: 'Trả nợ mỗi tháng', hint: 'Gốc cộng lãi' },
  { key: 'debtBalance', label: 'Dư nợ', hint: 'Còn phải trả bao nhiêu' },
  { key: 'netWorth', label: 'Tài sản ròng', hint: 'Đã trừ nợ rồi' },
];

/**
 * Màn Tài chính. Năm ô nhập, ba mươi giây là xong. Ô chưa nhập hiện dấu hỏi xám —
 * app không đoán hộ, và không bôi đỏ tháng âm.
 */
export function MoneyScreen() {
  const month = monthOf(today());
  const state = useAsync(() => store.getMoney(month), [month]);

  const [draft, setDraft] = useState<Record<Cell, string>>({
    netIncome: '',
    monthlyExpense: '',
    debtPayment: '',
    debtBalance: '',
    netWorth: '',
  });

  useEffect(() => {
    if (state.data === null) return;
    const row = state.data.month;
    setDraft({
      netIncome: row.netIncome === null ? '' : String(row.netIncome),
      monthlyExpense: row.monthlyExpense === null ? '' : String(row.monthlyExpense),
      debtPayment: row.debtPayment === null ? '' : String(row.debtPayment),
      debtBalance: row.debtBalance === null ? '' : String(row.debtBalance),
      netWorth: row.netWorth === null ? '' : String(row.netWorth),
    });
  }, [state.data]);

  async function save(key: Cell, raw: string): Promise<void> {
    const trimmed = raw.trim();
    // Ô để trống nghĩa là xoá về trạng thái chưa nhập, không phải ghi số 0.
    const value = trimmed === '' ? null : Number(trimmed.replace(/[^\d-]/g, ''));
    if (value !== null && !Number.isInteger(value)) return;
    await store.saveMoney(month, { [key]: value });
    state.reload();
  }

  const row = state.data?.month ?? null;
  const derived = state.data?.derived ?? null;

  return (
    <div className="screen-body">
      <div className="row">
        <div className="title">Tài chính</div>
        <div className="sm">Tháng {month.slice(5)}</div>
      </div>

      <div className="card">
        <div className="label">Vốn tự do</div>
        <div className="big" style={{ marginTop: 8, color: 'var(--deep)' }}>
          {fmtMonths(derived?.freeCapitalMonths ?? null)}
          <span style={{ fontSize: 15, fontWeight: 400, marginLeft: 6 }}>tháng</span>
        </div>
        <div className="sm" style={{ marginTop: 4 }}>
          Tài sản ròng chia cho chi tiêu tháng
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <span className="sm">Mức dư tháng này</span>
          <span style={{ fontWeight: 700, color: 'var(--green)' }}>
            {perMille(derived?.surplusPerMille ?? null)}
          </span>
        </div>
      </div>

      {row !== null && row.debtBalance !== null && (
        <div className="card">
          <div className="label">Nợ</div>
          <div className="row" style={{ marginTop: 10 }}>
            <div>
              <div className="big" style={{ fontSize: 23 }}>
                {vnd(row.debtBalance)}
              </div>
              <div className="sm">còn lại</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="big" style={{ fontSize: 23, color: 'var(--amber)' }}>
                {vnd(row.debtPayment)}
              </div>
              <div className="sm">mỗi tháng</div>
            </div>
          </div>
          <div className="sm" style={{ marginTop: 10 }}>
            {derived?.monthsHeldByDebt == null
              ? 'Nhập chi tiêu tháng để quy nợ ra số tháng tự do.'
              : `Nợ đang giữ lại ${fmtMonths(derived.monthsHeldByDebt)} tháng tự do.`}
          </div>
        </div>
      )}

      <div className="label" style={{ marginTop: 6 }}>
        Năm ô nhập tháng này
      </div>

      {CELLS.map((cell) => {
        const current = row === null ? null : row[cell.key];
        return (
          <div className="card" key={cell.key} style={{ padding: '14px 18px' }}>
            <div className="row">
              <label htmlFor={`money-${cell.key}`} style={{ fontSize: 16, fontWeight: 600 }}>
                {cell.label}
              </label>
              <span
                style={{
                  fontWeight: 700,
                  color: current === null ? 'var(--fg-faint)' : 'var(--fg)',
                }}
              >
                {current === null ? UNKNOWN : vnd(current)}
              </span>
            </div>
            <div className="sm" style={{ marginTop: 2 }}>
              {cell.hint}
            </div>
            <input
              id={`money-${cell.key}`}
              value={draft[cell.key]}
              onChange={(event) => setDraft({ ...draft, [cell.key]: event.target.value })}
              onBlur={(event) => void save(cell.key, event.target.value)}
              inputMode="numeric"
              placeholder="VND"
              style={{
                marginTop: 10,
                width: '100%',
                background: 'var(--screen)',
                border: '1.5px solid #d7dfe9',
                borderRadius: 12,
                padding: '10px 12px',
                fontSize: 16,
              }}
            />
          </div>
        );
      })}

      <p className="empty">
        Mira không nối API ngân hàng và không bóc hoá đơn. Năm ô này là tất cả những gì nó cần.
      </p>
    </div>
  );
}
