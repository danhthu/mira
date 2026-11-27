/**
 * Khai một KHOẢN tiền. Nằm trong khay, mở ra bằng nút cộng.
 *
 * ─────────────────────── TRƯỚC ĐÂY LÀ BẢY Ô GÕ TAY, GIỜ KHÔNG ───────────────────────
 *
 * Bảy con số tháng bắt người dùng tự cộng nhẩm trước khi gõ: "tháng này tiêu bao nhiêu
 * rồi nhỉ". Không ai cộng nổi, nên họ gõ một con số ước, rồi mọi tỉ lệ của màn này dựng
 * trên một con số ước.
 *
 * Giờ ghi từng khoản như ghi một mục giờ, và năm ô dòng chảy là TỔNG tự tính. Đúng khuôn
 * mục Thời gian: số tiền + danh mục + ngày, giống hệt số phút + danh mục + ngày.
 *
 * HAI Ô MỨC VẪN GÕ TAY, ở cuối khay. Dư nợ và tài sản ròng là ảnh chụp tại một thời
 * điểm, không phải tổng của nhiều lần — cộng dồn chúng là nhân đôi tài sản của người ta
 * mỗi lần họ khai lại.
 */
import { useEffect, useState } from 'react';
import {
  MONEY_CELL_LABEL_VI,
  MONEY_FLOW_CELLS,
  MONEY_LEVEL_CELLS,
  type MoneyCategory,
  type MoneyFlowCell,
  type MoneyMonth,
} from '@mira/contract';
import { store } from '../../lib/store';
import { today } from '../../lib/date';
import { MoneyCategoryPicker } from './MoneyCategoryPicker';

/**
 * "3000000" → "3.000.000". Dấu chấm, theo cách viết số của tiếng Việt.
 *
 * Bảy chữ số không dấu phân cách là chỗ dễ nhầm một bậc nhất — 3 triệu với 30 triệu
 * nhìn gần như nhau khi liếc nhanh.
 */
export function groupThousands(s: string): string {
  const so = s.replace(/\D/g, '');
  if (so === '') return '';
  return so.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const GOI_Y: Record<MoneyFlowCell, string> = {
  netIncome: 'Lương, thưởng, tiền về tay',
  monthlyExpense: 'Ăn, đi lại, hoá đơn',
  investment: 'Tiết kiệm, vàng, cổ phiếu',
  wastedMoney: 'Tiêu mà tự thấy không đáng',
  debtPayment: 'Gốc cộng lãi',
};

export function MoneyForm({
  month,
  row,
  categories,
  fixedCell,
  onSaved,
  onDone,
}: {
  readonly month: string;
  readonly row: MoneyMonth | null;
  readonly categories: readonly MoneyCategory[];
  /**
   * Khoá sẵn một ô tiền. Màn chi tiết `/tai-chinh/:cell` đã chọn ô rồi — bày lại năm cái
   * chip ở đó là mời người ta ghi nhầm sang ô khác rồi không hiểu sao con số không nhúc
   * nhích. Khoá rồi thì hai ô MỨC cũng ẩn theo: dư nợ và tài sản ròng là số của cả
   * tháng, không thuộc ô nào.
   */
  readonly fixedCell?: MoneyFlowCell;
  /** Gọi sau mỗi lần ghi thành công, để màn ngoài đọc lại. */
  readonly onSaved: () => void;
  readonly onDone: () => void;
}) {
  const [cell, setCell] = useState<MoneyFlowCell>(fixedCell ?? 'monthlyExpense');
  const [so, setSo] = useState('');
  const [pick, setPick] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const soMoi = Number(so.replace(/\D/g, ''));
  const valid = so.replace(/\D/g, '') !== '' && Number.isInteger(soMoi) && soMoi > 0;

  /**
   * Ngày của khoản là HÔM NAY khi đang xem tháng này, còn xem tháng cũ thì là mùng 1
   * của tháng đó. Ghi một khoản vào tháng 9 mà nó rơi vào hôm nay là ghi sai tháng, và
   * con số tháng 9 không nhúc nhích — người dùng bấm lại lần nữa.
   */
  const ngay = month === today().slice(0, 7) ? today() : `${month}-01`;

  async function them(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await store.createMoneyEntry({
        date: ngay,
        amount: soMoi,
        cell,
        categoryId: pick,
        note: note.trim() === '' ? null : note.trim(),
      });
      setSo('');
      setNote('');
      onSaved();
      onDone();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Không ghi được.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {fixedCell === undefined && (
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
      )}
      <p className="sm" style={{ marginTop: 8 }}>
        {GOI_Y[cell]}
      </p>

      <MoneyCategoryPicker
        categories={categories}
        cell={cell}
        pick={pick}
        onPick={setPick}
        onCreated={(dm) => {
          setPick(dm.id);
          onSaved();
        }}
      />

      <input
        className="edit__text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Thêm một dòng (không bắt buộc)"
        aria-label="Ghi chú"
      />

      <div className="edit__row" style={{ marginTop: 12 }}>
        <input
          value={groupThousands(so)}
          onChange={(e) => setSo(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) void them();
          }}
          inputMode="numeric"
          placeholder="0"
          aria-label="Số tiền"
          style={{ flex: 1, minWidth: 0, textAlign: 'right' }}
        />
        <span className="sm">đồng</span>
        <button
          type="button"
          className="edit__save"
          disabled={!valid || busy}
          onClick={() => void them()}
        >
          {busy ? 'Đang ghi…' : 'Thêm'}
        </button>
      </div>

      {error !== null && (
        <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
          {error}
        </p>
      )}

      {fixedCell === undefined && <LevelCells month={month} row={row} onSaved={onSaved} />}
    </>
  );
}

/**
 * Hai ô MỨC: dư nợ và tài sản ròng.
 *
 * Đây là chỗ duy nhất màn Tài chính còn gõ thẳng một con số, và nó phải ở lại: "tôi đang
 * nợ 240 triệu" không phải tổng của nhiều lần nợ. Tách thành khoản lẻ rồi cộng là nhân
 * đôi tài sản của người ta mỗi lần họ khai lại.
 */
function LevelCells({
  month,
  row,
  onSaved,
}: {
  readonly month: string;
  readonly row: MoneyMonth | null;
  readonly onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({ debtBalance: '', netWorth: '' });
  const [typing, setTyping] = useState<string | null>(null);

  useEffect(() => {
    setDraft({
      debtBalance: row?.debtBalance == null ? '' : String(row.debtBalance),
      netWorth: row?.netWorth == null ? '' : String(row.netWorth),
    });
  }, [row]);

  /** Ô để trống nghĩa là xoá về trạng thái chưa nhập, không phải ghi số 0. */
  const read = (raw: string): number | null => {
    const s = raw.replace(/\D/g, '');
    return s === '' ? null : Number(s);
  };

  async function save(key: string, raw: string): Promise<void> {
    const value = read(raw);
    if (value === ((row?.[key as 'debtBalance' | 'netWorth'] ?? null) as number | null)) return;
    await store.saveMoney(month, { [key]: value });
    onSaved();
  }

  return (
    <div style={{ marginTop: 22 }}>
      <div className="label">Hai ô chụp một lần</div>
      <p className="sm" style={{ marginTop: 6, lineHeight: 1.5 }}>
        Không cộng dồn — con số sau thay con số trước.
      </p>

      <div className="money-table money-table--sheet">
        {MONEY_LEVEL_CELLS.map((key) => (
          <div className="money-row" key={key}>
            <label htmlFor={`money-${key}`}>
              <b>{MONEY_CELL_LABEL_VI[key]}</b>
              <span>{key === 'debtBalance' ? 'Còn phải trả' : 'Đã trừ nợ rồi'}</span>
            </label>
            <input
              id={`money-${key}`}
              value={typing === key ? draft[key] : groupThousands(draft[key] ?? '')}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value.replace(/\D/g, '') })}
              onFocus={() => setTyping(key)}
              onBlur={(e) => {
                setTyping(null);
                void save(key, e.target.value);
              }}
              inputMode="numeric"
              placeholder="—"
              className="money-input"
            />
            <button
              type="button"
              className="money-clear"
              aria-label={`Xoá ô ${MONEY_CELL_LABEL_VI[key]}`}
              title="Xoá ô này"
              style={{ visibility: (draft[key] ?? '') === '' ? 'hidden' : 'visible' }}
              onClick={() => {
                setDraft({ ...draft, [key]: '' });
                void save(key, '');
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
