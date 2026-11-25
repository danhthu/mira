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
 * Màn Tài chính. Năm ô nhập, ba mươi giây là xong. Ô chưa nhập hiện dấu hỏi xám: app
 * không đoán hộ, và không bôi đỏ tháng âm.
 *
 * NHỊP Ở ĐÂY LÀ THÁNG, KHÔNG PHẢI TUẦN. Mọi số của Mira nói "bạn là ai" nhiều hơn "tuần
 * này khác gì" (tỉ số ≥ 2,7), nhưng số tiền là rõ nhất. Nên tách: số tuần ở màn Thời
 * gian, số tháng ở đây, và chọn mốc là Tháng · Quý · Năm.
 *
 * Nợ nói bằng **một câu**, không bằng ba con số rời. Quy nợ ra số tháng tự do có hệ số
 * biến thiên 1,40, phân biệt mạnh nhất trong mười một số đã đo. Ba con số rời bắt người
 * đọc tự nhân chia; một câu thì không.
 */
type Moc = 'thang' | 'quy' | 'nam';

const MOC: Record<Moc, { nhan: string; lui: number }> = {
  thang: { nhan: 'Tháng', lui: 1 },
  quy: { nhan: 'Quý', lui: 3 },
  nam: { nhan: 'Năm', lui: 12 },
};

/** YYYY-MM lùi `n` tháng. */
function luiThang(thang: string, n: number): string {
  const [y, m] = thang.split('-').map(Number);
  const d = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1 - n, 1));
  return d.toISOString().slice(0, 7);
}

const tenThang = (thang: string): string => {
  const [y, m] = thang.split('-');
  return `Tháng ${Number(m)}/${y}`;
};

export function MoneyScreen() {
  const [moc, setMoc] = useState<Moc>('thang');
  // Lùi bao nhiêu bước, mỗi bước dài bằng mốc đang chọn.
  const [lui, setLui] = useState(0);
  const month = luiThang(monthOf(today()), lui * MOC[moc].lui);
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
        <div className="sm">{tenThang(month)}</div>
      </div>

      <div className="pills">
        {(['thang', 'quy', 'nam'] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={moc === k}
            onClick={() => {
              setMoc(k);
              setLui(0);
            }}
          >
            {MOC[k].nhan}
          </button>
        ))}
      </div>

      {/* Lùi lại được. Trước đây màn này đóng cứng ở tháng hiện tại, mà một con số vốn
          tự do đứng một mình không nói được nó đang lên hay xuống. */}
      <div className="lui">
        <button type="button" onClick={() => setLui(lui + 1)}>
          ‹ {MOC[moc].nhan} trước
        </button>
        <span>{lui === 0 ? 'Mới nhất' : `Lùi ${lui} ${MOC[moc].nhan.toLowerCase()}`}</span>
        <button type="button" disabled={lui === 0} onClick={() => setLui(Math.max(0, lui - 1))}>
          {MOC[moc].nhan} sau ›
        </button>
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

      {/* Nợ nói bằng MỘT CÂU. Ba con số rời (dư nợ, trả mỗi tháng, bao lâu xong) bắt
          người đọc tự nhân chia mới hiểu nó nặng tới đâu. Số tháng tự do bị giữ lại là
          số phân biệt mạnh nhất trong mười một số đã đo, nên nó đứng đầu câu. */}
      {row !== null && row.debtBalance !== null && row.debtBalance > 0 && (
        <div className="card">
          <div className="label">Nợ</div>
          <p className="no">
            {derived?.monthsHeldByDebt == null ? (
              <>
                Còn <b>{vnd(row.debtBalance)}</b>. Nhập chi tiêu tháng thì Mira quy được nó ra
                bao nhiêu tháng tự do.
              </>
            ) : (
              <>
                Đang giữ lại <b>{fmtMonths(derived.monthsHeldByDebt)} tháng</b> tự do của bạn.
              </>
            )}
          </p>
          <div className="sm" style={{ marginTop: 10, lineHeight: 1.55 }}>
            Còn {vnd(row.debtBalance)}
            {row.debtPayment !== null && row.debtPayment > 0 ? (
              <>
                , trả {vnd(row.debtPayment)} mỗi tháng
                {` · ${xongVao(row.debtBalance, row.debtPayment)}`}
              </>
            ) : (
              '. Nhập khoản trả mỗi tháng để biết bao giờ xong.'
            )}
          </div>
        </div>
      )}

      <div className="label" style={{ marginTop: 6 }}>
        Năm ô, mỗi tháng một lần
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

/**
 * Bao giờ trả xong, nếu giữ nguyên mức trả hiện tại.
 *
 * Cố tình **không tính lãi**. Mira không hỏi lãi suất, nên tính lãi là bịa một tham số.
 * Con số này là mốc lạc quan nhất có thể, và câu chữ phải nói đúng như vậy.
 */
function xongVao(duNo: number, traMoiThang: number): string {
  const soThang = Math.ceil(duNo / traMoiThang);
  if (soThang > 12 * 60) return 'hơn sáu mươi năm nếu giữ mức trả này';
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + soThang);
  const moc = `${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
  return soThang >= 12
    ? `xong khoảng ${moc} nếu giữ mức trả này, chưa tính lãi`
    : `xong khoảng ${moc}, chưa tính lãi`;
}
