import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MONEY_CELL_LABEL_VI,
  MONEY_FLOW_CELLS,
} from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { monthOf, today } from '../../lib/date';
import { vnd } from '../../lib/format';
import { catalogOf, longestIn } from '../../lib/moneyCatalog';
import { MONEY_CELL_COLOR } from '../../lib/moneyColors';
import { MoneyEntryRow } from './MoneyEntryRow';
import { MoneyCategoryManager } from './MoneyCategoryManager';
import { groupByDay } from '../../lib/byDay';
import { DayHead } from '../../ui/DayHead';
import { MoneyForm } from './MoneyForm';
import { AddButton } from '../../ui/AddButton';
import { Sheet } from '../../ui/Sheet';

/** Bốn tháng gần nhất: đủ thấy một nếp tiêu, chưa đủ dài để thành biểu đồ phải học cách đọc. */
const SO_THANG = 4;

/** YYYY-MM lùi `n` tháng. */
function monthsBack(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1 - n, 1)).toISOString().slice(0, 7);
}

/** Ngày đầu và ngày cuối của một tháng YYYY-MM. */
function khoangThang(month: string): readonly [string, string] {
  const [y, m] = month.split('-').map(Number);
  const cuoi = new Date(Date.UTC(y ?? 2026, m ?? 1, 0)).toISOString().slice(0, 10);
  return [`${month}-01`, cuoi];
}

const tenThang = (month: string): string => {
  const [y, m] = month.split('-');
  return `Tháng ${Number(m)}/${y}`;
};

/** Nhãn ngắn dưới mỗi cột: "T9". Sang tháng 1 thì kèm năm, không thì hai năm lẫn nhau. */
const nhanCot = (month: string): string => {
  const [y, m] = month.split('-');
  return Number(m) === 1 ? `T1/${(y ?? '').slice(2)}` : `T${Number(m)}`;
};

/**
 * Chi tiết một ô tiền. Bấm vào một dòng catalog hoặc một lát vòng dòng tiền thì tới đây.
 *
 * Bản sao của `BucketScreen` bên thời gian, và cố ý giống tới từng tầng:
 *
 *   bốn tháng dạng cột  →  danh mục kèm tổng  →  từng khoản, sửa và xoá được
 *
 * Màn Tài chính trả lời "tháng này tiền vào đi đâu". Màn này trả lời câu kế tiếp, câu mà
 * danh sách phẳng không trả lời nổi: **"số tiền đó cụ thể là những khoản nào"**.
 */
export function MoneyCellScreen() {
  const { cell } = useParams<{ cell: string }>();
  const o = MONEY_FLOW_CELLS.find((c) => c === cell) ?? null;

  /**
   * Lùi bao nhiêu tháng. Màn ngoài đã lùi được từ lâu; màn này thì đóng cứng ở tháng
   * hiện tại, nên bốn cột lịch sử chỉ để NHÌN chứ không mở ra được. Thấy tháng 9 cao
   * gấp đôi mà không bấm vào xem tháng 9 gồm những khoản nào thì cột ấy vô dụng.
   */
  const [lui, setLui] = useState(0);
  const month = monthsBack(monthOf(today()), lui);
  const tuDau = monthsBack(month, SO_THANG - 1);

  const [sheetOpen, setMoKhay] = useState(false);

  const state = useAsync(async () => {
    if (o === null) return null;
    const [entries, categories] = await Promise.all([
      store.listMoneyEntries(khoangThang(tuDau)[0], khoangThang(month)[1]),
      store.listMoneyCategories(),
    ]);
    return { entries: entries.filter((e) => e.cell === o), categories };
  }, [o, month]);

  if (o === null) {
    return (
      <div className="screen-body">
        <p className="empty">Không có ô tiền nào tên như vậy.</p>
        <Link to="/tai-chinh" className="sm">
          Về màn Tài chính
        </Link>
      </div>
    );
  }

  const color = MONEY_CELL_COLOR[o];
  const tatCa = state.data?.entries ?? [];
  const categories = (state.data?.categories ?? []).filter((c) => c.cell === o);

  // Bốn tháng, cũ trước mới sau. Tháng cuối là tháng ĐANG XEM, không phải tháng hiện tại.
  const thang = Array.from({ length: SO_THANG }, (_, i) => monthsBack(month, SO_THANG - 1 - i));
  const tongThang = thang.map((t) => tatCa.filter((e) => e.date.startsWith(t)).reduce((s, e) => s + e.amount, 0));
  const caoNhat = Math.max(1, ...tongThang);

  // Catalog và danh sách khoản chỉ của THÁNG ĐANG XEM. Bốn cột ở trên đã nói phần lịch
  // sử; trộn bốn tháng vào một catalog thì con số "ăn trưa" to gấp bốn mà không ai để ý.
  const cuaThangNay = tatCa.filter((e) => e.date.startsWith(month));
  const catalog = catalogOf(cuaThangNay, state.data?.categories ?? []);
  const rows = catalog[0]?.rows ?? [];
  const longest = longestIn(rows);
  const daiNhat = Math.max(1, ...cuaThangNay.map((e) => e.amount));

  return (
    <div className="screen-body">
      <div className="row">
        <div className="title">{MONEY_CELL_LABEL_VI[o]}</div>
        <Link to="/tai-chinh" className="sm">
          Về Tài chính
        </Link>
      </div>

      {/* Cùng khung lùi tháng với màn ngoài, cố ý giống từng chữ: hai màn nói về cùng
          một tháng thì phải đổi tháng bằng cùng một thao tác. */}
      <div className="lui">
        <button type="button" onClick={() => setLui(lui + 1)}>
          ‹ Tháng trước
        </button>
        <span>{lui === 0 ? 'Mới nhất' : `Lùi ${lui} tháng`}</span>
        <button type="button" disabled={lui === 0} onClick={() => setLui(Math.max(0, lui - 1))}>
          Tháng sau ›
        </button>
      </div>

      <div className="card">
        <div className="big" style={{ color }}>
          {vnd(tongThang[tongThang.length - 1] ?? 0)}
        </div>
        <div className="sm" style={{ marginTop: 4 }}>
          {tenThang(month)}
        </div>

        <div className="bars" style={{ marginTop: 16 }}>
          {tongThang.map((t, i) => {
            const cuoi = i === tongThang.length - 1;
            const cuaCot = thang[i] ?? month;
            return (
              <div className="bars__i" key={cuaCot}>
                <span
                  style={{
                    height: `${Math.round((t * 100) / caoNhat)}%`,
                    background: cuoi ? color : '#cfd7e2',
                  }}
                />
                <b className={cuoi ? 'is-on' : undefined}>{t === 0 ? '—' : vnd(t)}</b>
                {/* Nhãn là số tháng thật, không phải "2 tháng trước": khi đã lùi được
                    thì "trước" tính từ đâu là một câu hỏi, còn T9 thì không. */}
                <span className="bars__label">{nhanCot(cuaCot)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chỉ danh mục của ô này — lọc trước khi đưa vào, vì ô quản lý không biết ô nào. */}
      <MoneyCategoryManager categories={categories} onChanged={state.reload} />

      {/* Catalog của riêng ô này. Cùng cách bày với thẻ ngoài màn Tài chính, nhưng ở đây
          nó là phần chính chứ không phải một lát. */}
      {rows.length > 0 && (
        <div className="card">
          <div className="label">Danh mục trong tháng</div>
          {rows.map((r) => (
            <div className="cat-row" key={r.categoryId ?? ''}>
              <div className="cat-row__giua">
                <div className="row" style={{ alignItems: 'baseline' }}>
                  <div className="cat-row__name">{r.name}</div>
                  <b style={{ color, marginLeft: 'auto' }}>{vnd(r.total)}</b>
                </div>
                {/* Thanh tỉ lệ CHỈ có ở màn này, không có ở catalog ngoài kia. Ở đây
                    người ta đã chọn một ô và đang so các danh mục BÊN TRONG nó — lúc ấy
                    chiều dài thanh mới có nghĩa. */}
                <div className="bar" style={{ marginTop: 6 }}>
                  <i
                    style={{ width: `${Math.round((r.total * 100) / longest)}%`, background: color }}
                  />
                </div>
                <div className="sm" style={{ marginTop: 5 }}>
                  {r.count} lần · trung bình {vnd(Math.round(r.total / r.count))} · đã nhập{' '}
                  {r.lastDate.slice(8)}/{r.lastDate.slice(5, 7)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="row" style={{ marginTop: 6 }}>
        <div className="label">Từng khoản, {tenThang(month).toLowerCase()}</div>
        {cuaThangNay.length > 0 && <div className="sm">{cuaThangNay.length} khoản</div>}
      </div>

      {state.loading && <p className="empty">Đang lấy số…</p>}

      {!state.loading && cuaThangNay.length === 0 && (
        <p className="empty">Tháng này chưa ghi khoản nào vào ô này.</p>
      )}

      {cuaThangNay.length > 0 && (
        <div className="list">
          {/* Cả màn này chỉ có một ô, nên tổng ngày không cần dấu — mọi dòng cùng chiều. */}
          {groupByDay(
            [...cuaThangNay].sort((a, b) => b.date.localeCompare(a.date)),
            (e) => e.amount,
          ).map((ng) => (
            <div key={ng.date}>
              <DayHead date={ng.date} total={vnd(ng.total)} />
              {ng.items.map((e) => (
                <MoneyEntryRow
                  key={e.id}
                  e={e}
                  categories={state.data?.categories ?? []}
                  longest={daiNhat}
                  onChanged={state.reload}
                  hideDate
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Ghi thẳng từ đây, khoá sẵn ô tiền. Trước đây phải về màn ngoài rồi chọn lại ô —
          mà người đang xem chi tiết "Chi tiêu" thì rõ ràng muốn ghi một khoản chi tiêu. */}
      <AddButton label={`Ghi một khoản ${MONEY_CELL_LABEL_VI[o].toLowerCase()}`} onPress={() => setMoKhay(true)} />

      <Sheet
        open={sheetOpen}
        headline={`${MONEY_CELL_LABEL_VI[o]} · ${tenThang(month)}`}
        onClose={() => {
          setMoKhay(false);
          state.reload();
        }}
      >
        <MoneyForm
          month={month}
          row={null}
          categories={state.data?.categories ?? []}
          fixedCell={o}
          onSaved={state.reload}
          onDone={() => setMoKhay(false)}
        />
      </Sheet>
    </div>
  );
}
