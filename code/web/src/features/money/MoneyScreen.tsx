import { useState } from 'react';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { topWaste, wasteName, wasteTrend } from '../../lib/waste';
import { WasteBand } from '../../ui/WasteBand';
import { monthOf, today } from '../../lib/date';
import { CashFlow } from './CashFlow';
import { MoneyForm } from './MoneyForm';
import { MoneyEntryRow } from './MoneyEntryRow';
import { MoneyCatalog } from './MoneyCatalog';
import { groupByDay } from '../../lib/byDay';
import { DayHead } from '../../ui/DayHead';
import { Icon } from '../../ui/Icon';
import { Sheet } from '../../ui/Sheet';
import { AddButton } from '../../ui/AddButton';
import { months as fmtMonths, perMille, vnd } from '../../lib/format';

/**
 * Màn Tài chính. **Chỉ còn phần đọc** — ô nhập nằm sau nút cộng ở góc dưới.
 *
 * TỪ 26/11/2026 TIỀN GHI THEO TỪNG KHOẢN, đúng khuôn mục Thời gian: số tiền + danh mục
 * + ngày. Năm ô dòng chảy của tháng là TỔNG các khoản, không gõ tay được nữa. Hai ô mức
 * — dư nợ, tài sản ròng — vẫn gõ một con số, vì chúng là ảnh chụp chứ không phải tổng.
 *
 * Trước đây thẻ nhập nằm lẫn giữa các thẻ đọc, và nó đẩy vòng dòng tiền cùng vốn tự do
 * xuống dưới màn hình thứ hai. Hai việc khác hẳn nhau: người mở app để NGÓ phải cuộn qua
 * ô nhập, người mở app để GHI phải cuộn tìm ô nhập. Tách ra thì cả hai đều đỡ.
 *
 * NHỊP Ở ĐÂY LÀ THÁNG, KHÔNG PHẢI TUẦN. Mọi số của Mira nói "bạn là ai" nhiều hơn "tuần
 * này khác gì" (tỉ số ≥ 2,7), nhưng số tiền là rõ nhất. Nên tách: số tuần ở màn Thời
 * gian, số tháng ở đây, và chọn mốc là Tháng · Quý · Năm.
 *
 * Không có viên "Tuần" dù concept có vẽ: tiền lưu theo tháng, không có số tuần nào để
 * hiện. Một viên bấm vào rồi chẳng đổi gì là một lời hứa hão.
 */
type Moc = 'thang' | 'quy' | 'nam';

const MOC: Record<Moc, { label: string; lui: number }> = {
  thang: { label: 'Tháng', lui: 1 },
  quy: { label: 'Quý', lui: 3 },
  nam: { label: 'Năm', lui: 12 },
};

/** YYYY-MM lùi `n` tháng. */
function monthsBack(thang: string, n: number): string {
  const [y, m] = thang.split('-').map(Number);
  const d = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1 - n, 1));
  return d.toISOString().slice(0, 7);
}

/**
 * Ngày cuối của một tháng YYYY-MM.
 *
 * `${month}-31` cho tháng 30 ngày là một ngày KHÔNG TỒN TẠI. Hiện vẫn ra đúng kết quả
 * vì máy chủ so chuỗi chứ không so ngày — nhưng đó là may. Đổi sang so kiểu ngày một
 * cái là mất sạch khoản ngày 30.
 */
function ngayCuoiThang(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y ?? 2026, m ?? 1, 0)).toISOString().slice(0, 10);
}

const monthLabel = (thang: string): string => {
  const [y, m] = thang.split('-');
  return `Tháng ${Number(m)}/${y}`;
};

export function MoneyScreen() {
  const [mark, setMoc] = useState<Moc>('thang');
  // Lùi bao nhiêu bước, mỗi bước dài bằng mốc đang chọn.
  const [lui, setLui] = useState(0);
  const month = monthsBack(monthOf(today()), lui * MOC[mark].lui);
  const state = useAsync(async () => {
    const truoc = monthsBack(month, 1);
    // Tháng đang chạy: so tới đúng ngày này của tháng trước. Tháng đã qua: so trọn tháng.
    const denNgay = lui === 0 ? `${truoc}-${today().slice(8, 10)}` : ngayCuoiThang(truoc);
    const [tien, khoan, danhMuc, khoanTruoc] = await Promise.all([
      store.getMoney(month),
      // Cả tháng: từ mùng 1 tới ngày 31. Ngày 31 không có thật ở tháng ngắn, nhưng so
      // chuỗi thì "2026-02-28" vẫn nhỏ hơn "2026-02-31", nên khoảng này luôn phủ đủ.
      store.listMoneyEntries(`${month}-01`, ngayCuoiThang(month)),
      store.listMoneyCategories(),
      store.listMoneyEntries(`${truoc}-01`, denNgay),
    ]);
    return { tien, khoan, danhMuc, khoanTruoc };
  }, [month]);

  const [sheetOpen, setMoKhay] = useState(false);

  const row = state.data?.tien.month ?? null;
  const derived = state.data?.tien.derived ?? null;
  const khoan = state.data?.khoan ?? [];
  const danhMuc = state.data?.danhMuc ?? [];
  // Sáu khoản mới nhất, mới trước cũ sau. Bản đầy đủ nằm ở /tai-chinh/:cell.
  const ganDay = [...khoan].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  // Mốc cho thanh tỉ lệ lấy từ ĐÚNG sáu dòng đang hiện, không lấy từ cả tháng: lấy mốc
  // từ cả tháng thì sáu thanh này teo lại vì một khoản lương 15 triệu nằm ngoài danh sách.
  const lonNhatGanDay = Math.max(1, ...ganDay.map((e) => e.amount));

  return (
    <div className="screen-body">
      <div className="row">
        <div className="title">Tài chính</div>
        <div className="sm">{monthLabel(month)}</div>
      </div>

      <div className="pills">
        {(['thang', 'quy', 'nam'] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={mark === k}
            onClick={() => {
              setMoc(k);
              setLui(0);
            }}
          >
            {MOC[k].label}
          </button>
        ))}
      </div>

      {/* Lùi lại được. Trước đây màn này đóng cứng ở tháng hiện tại, mà một con số vốn
          tự do đứng một mình không nói được nó đang lên hay xuống. */}
      <div className="lui">
        <button type="button" onClick={() => setLui(lui + 1)}>
          ‹ {MOC[mark].label} trước
        </button>
        <span>{lui === 0 ? 'Mới nhất' : `Lùi ${lui} ${MOC[mark].label.toLowerCase()}`}</span>
        <button type="button" disabled={lui === 0} onClick={() => setLui(Math.max(0, lui - 1))}>
          {MOC[mark].label} sau ›
        </button>
      </div>

      {/* Vòng dòng tiền đứng trước: "tháng này tiền vào đi đâu" là câu người ta hỏi
          đầu tiên khi mở màn Tài chính. Vốn tự do là câu hỏi dài hạn, đứng sau. */}
      <CashFlow row={row} />

      {/* Mức dư ra một dải riêng, theo concept. Trước đây nó là một dòng phụ nấp trong
          thẻ Vốn tự do — mà đây là con số người ta liếc mỗi tháng, không phải chú thích. */}
      <MucDu perMille={derived?.surplusPerMille ?? null} coDauTu={(row?.investment ?? 0) > 0} />

      {/* Lãng phí ra một nút riêng (27/11/2026): đây là khoản người ta bớt được. */}
      <WasteBand
        to="/tai-chinh/wastedMoney"
        title={lui === 0 ? 'Lãng phí tháng này' : `Lãng phí ${monthLabel(month).toLowerCase()}`}
        value={row?.wastedMoney == null || row.wastedMoney === 0 ? null : vnd(row.wastedMoney)}
        share={
          row?.wastedMoney == null || row.netIncome == null || row.netIncome <= 0
            ? null
            : `≈ ${Math.round((row.wastedMoney * 100) / row.netIncome)}% thu nhập`
        }
        top={topWaste(
          khoan
            .filter((e) => e.cell === 'wastedMoney')
            .map((e) => ({
              name: wasteName(danhMuc.find((d) => d.id === e.categoryId)?.name, e.note),
              amount: e.amount,
            })),
        ).map((t) => ({ name: t.name, value: vnd(t.amount) }))}
        trend={
          state.data === null || state.data === undefined
            ? null
            : wasteTrend(
                // Cả hai phía đều cộng từ từng khoản, để so táo với táo.
                khoan.filter((e) => e.cell === 'wastedMoney').reduce((t, e) => t + e.amount, 0),
                state.data.khoanTruoc
                  .filter((e) => e.cell === 'wastedMoney')
                  .reduce((t, e) => t + e.amount, 0),
                vnd,
                lui === 0 ? 'cùng kỳ tháng trước' : 'tháng trước',
                10_000,
              )
        }
        empty="Chưa ghi khoản lãng phí nào. Mua thứ không cần thì gõ “lãng phí 200k” bên Nhật ký."
      />

      <div className="card">
        <div className="label">Vốn tự do</div>
        <div className="big" style={{ marginTop: 8, color: 'var(--deep)' }}>
          {fmtMonths(derived?.freeCapitalMonths ?? null)}
          <span style={{ fontSize: 15, fontWeight: 400, marginLeft: 6 }}>tháng</span>
        </div>
        <div className="sm" style={{ marginTop: 4 }}>
          {derived?.thinExpense === true
            ? 'Tháng này mới ghi vài khoản chi. Ghi thêm vài ngày nữa thì Mira mới chia được.'
            : 'Tài sản ròng chia cho chi tiêu tháng'}
        </div>
      </div>

      {/* Nợ nói bằng MỘT CÂU trước, rồi mới tới ba con số. Số tháng tự do bị giữ lại là
          số phân biệt mạnh nhất trong mười một số đã đo, nên nó đứng đầu câu. */}
      {row !== null && row.debtBalance !== null && row.debtBalance > 0 && (
        <div className="card">
          <div className="label">Nợ</div>
          <p className="debt">
            {derived?.monthsHeldByDebt == null ? (
              <>
                Còn <b>{vnd(row.debtBalance)}</b>.{' '}
                {derived?.thinExpense === true
                  ? 'Ghi chi tiêu thêm vài ngày thì Mira quy được nó ra bao nhiêu tháng tự do.'
                  : 'Nhập chi tiêu tháng thì Mira quy được nó ra bao nhiêu tháng tự do.'}
              </>
            ) : (
              <>
                Đang giữ lại <b>{fmtMonths(derived.monthsHeldByDebt)} tháng</b> tự do của bạn.
              </>
            )}
          </p>
          <div className="debt__figures">
            <div>
              <b>{vnd(row.debtBalance)}</b>
              <span>còn lại</span>
            </div>
            <div>
              <b className="debt__monthly">
                {row.debtPayment !== null && row.debtPayment > 0 ? vnd(row.debtPayment) : '—'}
              </b>
              <span>mỗi tháng</span>
            </div>
            <div>
              <b>
                {row.debtPayment !== null && row.debtPayment > 0
                  ? payoffMonth(row.debtBalance, row.debtPayment)
                  : '—'}
              </b>
              <span>trả xong</span>
            </div>
          </div>

          {/* Thanh tiến độ: đã trả bao nhiêu phần. Mẫu số là dư nợ CỘNG phần đã trả
              trong tháng — Mira không lưu tổng khoản vay ban đầu, nên đây là phần trăm
              của một tháng, không phải của cả khoản vay. Câu dưới nói rõ điều đó. */}
          {row.debtPayment !== null && row.debtPayment > 0 && (
            <div className="bar" style={{ marginTop: 12, height: 10 }}>
              <i
                style={{
                  width: `${Math.min(100, Math.round((row.debtPayment * 100) / (row.debtBalance + row.debtPayment)))}%`,
                  background: 'var(--waste)',
                }}
              />
            </div>
          )}

          <div className="sm" style={{ marginTop: 10, lineHeight: 1.55 }}>
            {row.debtPayment !== null && row.debtPayment > 0
              ? `Trả ${vnd(row.debtPayment)} mỗi tháng · ${payoffSentence(row.debtBalance, row.debtPayment)}`
              : 'Nhập khoản trả mỗi tháng để biết bao giờ xong.'}
          </div>
        </div>
      )}

      {/* TẦNG CATALOG — chỗ bản đầu bỏ sót, và bỏ sót nó thì cả màn vô dụng.
          Vòng dòng tiền nói "chi tiêu 900k"; danh sách phẳng nói "60k, 55k, 40k…" ba
          mươi lần. Câu người ta thật sự hỏi nằm ở giữa: ăn trưa hết bao nhiêu. */}
      <MoneyCatalog entries={khoan} categories={danhMuc} />

      {/* Sáu khoản gần nhất thôi. Bản đầy đủ nằm trong màn chi tiết từng ô — giống hệt
          "Ghi gần đây" bên Thời gian, nơi danh sách dài nằm ở /thoi-gian/:bucket. */}
      <div className="row" style={{ marginTop: 6 }}>
        <div className="label">Ghi gần đây</div>
        {khoan.length > 0 && <div className="sm">{khoan.length} khoản trong tháng</div>}
      </div>

      {state.loading && <p className="empty">Đang lấy số…</p>}

      {!state.loading && khoan.length === 0 && (
        <p className="empty">
          Tháng này chưa ghi khoản nào. Bấm dấu <b>+</b> ở góc dưới, hoặc gõ thẳng bên Nhật ký — "ăn
          trưa 60k".
        </p>
      )}

      {ganDay.length > 0 && (
        <div className="list">
          {/* Nhóm theo ngày, kèm tổng ngày — khuôn Money Lover. Tổng mang dấu của ô, nên
              một ngày toàn chi hiện số âm, ngày có lương hiện số dương. */}
          {groupByDay(ganDay, (e) => (e.cell === 'netIncome' ? e.amount : -e.amount)).map((ng) => (
            <div key={ng.date}>
              <DayHead
                date={ng.date}
                total={`${ng.total > 0 ? '+' : ng.total < 0 ? '−' : ''}${vnd(Math.abs(ng.total))}`}
              />
              {ng.items.map((e) => (
                <MoneyEntryRow
                  key={e.id}
                  e={e}
                  categories={danhMuc}
                  longest={lonNhatGanDay}
                  onChanged={state.reload}
                  hideDate
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <p className="empty">
        Mira không nối API ngân hàng và không bóc hoá đơn. Mấy khoản bạn tự gõ là tất cả những gì nó
        cần.
      </p>

      <AddButton label="Ghi một khoản tiền" onPress={() => setMoKhay(true)} />

      <Sheet
        open={sheetOpen}
        headline={`Ghi một khoản · ${monthLabel(month)}`}
        onClose={() => {
          setMoKhay(false);
          state.reload();
        }}
      >
        <MoneyForm
          month={month}
          row={row}
          categories={danhMuc}
          onSaved={state.reload}
          onDone={() => setMoKhay(false)}
        />
      </Sheet>
    </div>
  );
}

/**
 * Dải "mức dư tháng này".
 *
 * Mấy cột nhỏ bên phải KHÔNG phải dữ liệu — chúng là một thước, vẽ đúng mức đang đạt
 * trên năm nấc. Concept vẽ chúng như một biểu đồ; vẽ một biểu đồ từ một con số duy nhất
 * là nói dối, nên ở đây chúng là thước và chỉ có thế.
 */
function MucDu({
  perMille: pm,
  coDauTu,
}: {
  readonly perMille: number | null;
  readonly coDauTu: boolean;
}) {
  // Năm nấc: 0, 10%, 20%, 30%, 40% trở lên.
  const nac = pm === null ? -1 : Math.min(4, Math.floor(pm / 100));

  return (
    <div className={pm !== null && pm < 0 ? 'mucdu is-am' : 'mucdu'}>
      <div className="mucdu__dau">
        {/* Chồng xu, không phải cái túi tiền: túi tiền là icon của tab Tài chính, dùng
            lại ở đây thì hai thứ khác nhau mang cùng một dấu. */}
        <Icon name="coins" size={19} />
        <span>Mức dư tháng này</span>
      </div>
      <div className="mucdu__thuoc" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <i
            key={i}
            className={i <= nac ? 'is-on' : undefined}
            style={{ height: `${(i + 1) * 20}%` }}
          />
        ))}
      </div>
      <b>{perMille(pm)}</b>
      {coDauTu && (
        <div className="mucdu__chu">
          Sau chi tiêu, lãng phí và trả nợ. Đầu tư không trừ vào đây.
        </div>
      )}
    </div>
  );
}

/**
 * Mốc "trả xong" dạng ngắn: "8/2029". Dùng cho ba con số trên thẻ Nợ.
 *
 * Cũng KHÔNG tính lãi, giống `xongVao` bên dưới — Mira không hỏi lãi suất, nên tính lãi
 * là bịa một tham số. Câu dài bên dưới nói rõ điều đó; con số ngắn này không có chỗ, nên
 * nó phải luôn đi kèm câu ấy.
 */
function payoffMonth(duNo: number, traMoiThang: number): string {
  const monthCount = Math.ceil(duNo / traMoiThang);
  if (monthCount > 12 * 60) return 'rất lâu';
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + monthCount);
  return `${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
}

/**
 * Bao giờ trả xong, nếu giữ nguyên mức trả hiện tại.
 *
 * Cố tình **không tính lãi**. Mira không hỏi lãi suất, nên tính lãi là bịa một tham số.
 * Con số này là mốc lạc quan nhất có thể, và câu chữ phải nói đúng như vậy.
 */
function payoffSentence(duNo: number, traMoiThang: number): string {
  const monthCount = Math.ceil(duNo / traMoiThang);
  if (monthCount > 12 * 60) return 'hơn sáu mươi năm nếu giữ mức trả này';
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + monthCount);
  const mark = `${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
  return monthCount >= 12
    ? `xong khoảng ${mark} nếu giữ mức trả này, chưa tính lãi`
    : `xong khoảng ${mark}, chưa tính lãi`;
}
