/**
 * Vòng dòng tiền tháng: thu nhập vào, bốn khoản ra, còn lại ở giữa.
 *
 * ──────────────────────── KHÁC CONCEPT MỘT CHỖ QUAN TRỌNG ────────────────────────
 *
 * Concept vẽ thu nhập thành một lát NGANG HÀNG với chi tiêu, đầu tư, lãng phí. Nhưng thu
 * nhập không phải một lát — nó là **cái bánh**, còn ba khoản kia là phần bị cắt đi. Xếp
 * chúng cạnh nhau trong một vòng thì tổng vòng không có nghĩa gì, và một người tiêu hết
 * sạch lại nhìn giống một người tiêu một nửa.
 *
 * Nên ở đây: **vòng là thu nhập**, các lát là chỗ nó đi — chi tiêu, đầu tư, lãng phí,
 * trả nợ — và phần xanh còn lại là tiền ở lại với bạn. Giữa vòng là con số đó.
 *
 * Tiêu quá thu thì vòng kín hết và giữa vòng là số âm. Không bôi đỏ cảnh cáo, không thêm
 * dấu than: con số tự nói.
 *
 * ─────────────────── ĐẦU TƯ NẰM TRONG VÒNG MÀ KHÔNG PHẢI MỘT KHOẢN MẤT ───────────────────
 *
 * Đầu tư rời tay nhưng không rời người: nó chuyển sang tài sản ròng. Vẫn phải vẽ, vì
 * không vẽ thì "còn lại" nói sai — tiền ấy không còn trong túi tháng này. Nhưng phải nói
 * rõ nó khác lãng phí, nếu không hai lát cạnh nhau sẽ đọc như hai lỗi giống nhau.
 *
 * Đó cũng là chỗ con số giữa vòng KHÁC "mức dư" ở thẻ dưới: mức dư không trừ đầu tư. Hai
 * số khác nhau cạnh nhau mà không giải thích là chỗ người ta tưởng app tính sai.
 */
import type { MoneyFlowCell, MoneyMonth } from '@mira/contract';
import { Link } from 'react-router-dom';
import { vnd } from '../../lib/format';

/** Một lát của vòng. */
interface Lat {
  readonly ten: string;
  readonly so: number;
  readonly color: string;
  /** Ô tiền để bấm xuống. `null` với "Còn lại" — nó là phần dư, không phải một ô. */
  readonly cell: MoneyFlowCell | null;
}

/** "2026-11-25T…" → "25/11". Mốc ngày, không có giờ: nhịp của màn này là tháng. */
function shortDate(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function CashFlow({ row }: { readonly row: MoneyMonth | null }) {
  const thu = row?.netIncome ?? null;
  const chi = row?.monthlyExpense ?? 0;
  const invest = row?.investment ?? 0;
  const wasted = row?.wastedMoney ?? 0;
  const debt = row?.debtPayment ?? 0;

  const enteredOn = row?.updatedAt == null ? null : shortDate(row.updatedAt);

  // Chưa nhập thu nhập thì KHÔNG vẽ. Vẽ một vòng không có mẫu số là vẽ một tỷ lệ bịa.
  if (thu === null || thu <= 0) {
    return (
      <div className="card">
        <div className="label">Dòng tiền tháng</div>
        <p className="empty" style={{ marginTop: 10 }}>
          Nhập <b>thu nhập ròng</b> thì Mira vẽ được tháng này: tiền vào bao nhiêu, đi đâu,
          còn lại bao nhiêu. Bấm dấu <b>+</b> ở góc dưới.
        </p>
      </div>
    );
  }

  const ra = chi + invest + wasted + debt;
  const left = thu - ra;

  /**
   * THỨ TỰ NÀY LÀ MỘT RÀNG BUỘC MÀU, KHÔNG PHẢI SỞ THÍCH.
   *
   * Hai lát kề nhau trên vòng phải phân biệt được bằng độ sáng. Thứ tự tự nhiên của
   * concept — chi tiêu, đầu tư, lãng phí, trả nợ — đặt đỏ cạnh xanh đậm, tỉ lệ 1,24:
   * dưới ngưỡng, và trên điện thoại ngoài nắng hai lát ấy dính thành một mảng.
   *
   * Thứ tự dưới đây đạt cả năm cặp kề nhau, kể cả cặp đầu-cuối vì vòng thì khép kín.
   * `npm run check-colors` canh chỗ này — đổi thứ tự thì phải đổi cả `VONG_TIEN` bên đó.
   */
  const slice: readonly Lat[] = ([
    { ten: 'Chi tiêu', so: chi, color: 'var(--red)', cell: 'monthlyExpense' },
    { ten: 'Lãng phí', so: wasted, color: 'var(--waste)', cell: 'wastedMoney' },
    { ten: 'Đầu tư', so: invest, color: 'var(--work)', cell: 'investment' },
    { ten: 'Trả nợ', so: debt, color: 'var(--navy)', cell: 'debtPayment' },
    { ten: 'Còn lại', so: Math.max(0, left), color: 'var(--family)', cell: null },
  ] as const satisfies readonly Lat[]).filter((x) => x.so > 0);

  // Tiêu quá thu: mẫu số là TỔNG ĐÃ RA, không phải thu nhập. Lấy thu nhập làm mẫu số thì
  // các lát cộng lại vượt quá vòng và hình vẽ vô nghĩa.
  const denominator = Math.max(thu, ra);

  const R = 52;
  const CHU_VI = 2 * Math.PI * R;
  let passed = 0;

  return (
    <div className="card">
      <div className="row">
        <div className="label">Dòng tiền tháng</div>
        {/* "Đã nhập · 25/11": nhịp nhập của màn này là THÁNG, mà nhịp gõ chat là NGÀY.
            Người mở giữa tháng cần biết mấy con số đang nhìn là của hôm nào. */}
        {enteredOn !== null && <div className="sm">Đã nhập · {enteredOn}</div>}
      </div>

      <div className="cf">
        <svg className="cf__ring" viewBox="0 0 130 130" role="img" aria-label="Dòng tiền tháng">
          {/* Xoay −90° để lát đầu bắt đầu từ đỉnh vòng, chỗ mắt nhìn vào trước. */}
          <g transform="translate(65,65) rotate(-90)">
            <circle r={R} className="cf__track" />
            {slice.map((l) => {
              const phan = (l.so / denominator) * CHU_VI;
              const el = (
                <circle
                  key={l.ten}
                  r={R}
                  className="cf__slice"
                  stroke={l.color}
                  strokeDasharray={`${phan} ${CHU_VI}`}
                  strokeDashoffset={-passed}
                />
              );
              passed += phan;
              return el;
            })}
          </g>
          <text x="65" y="62" textAnchor="middle" className="cf__amount">
            {left >= 0 ? `+${vnd(left)}` : vnd(left)}
          </text>
          <text x="65" y="78" textAnchor="middle" className="cf__caption">
            {left >= 0 ? 'còn lại' : 'thiếu'}
          </text>
        </svg>

        <div className="cf__list">
          <Link className="cf__row" to="/tai-chinh/netIncome">
            <i style={{ background: 'var(--family-ink)' }} />
            <span>Thu nhập</span>
            <b style={{ color: 'var(--green)' }}>+{vnd(thu)}</b>
          </Link>
          {slice
            .filter((l) => l.ten !== 'Còn lại')
            .map((l) => (
              <Link className="cf__row" to={`/tai-chinh/${l.cell ?? ''}`} key={l.ten}>
                <i style={{ background: l.color }} />
                <span>{l.ten}</span>
                <b>−{vnd(l.so)}</b>
              </Link>
            ))}
        </div>
      </div>

      {/* Nói thẳng những gì KHÔNG nằm trong vòng. Một biểu đồ dòng tiền mà thiếu một
          khoản chi lớn thì nó không sai một chút — nó sai hẳn, và người đọc không biết. */}
      {chi === 0 && (
        <p className="sm" style={{ marginTop: 10 }}>
          Chưa nhập chi tiêu tháng, nên vòng này mới chỉ có tiền vào.
        </p>
      )}

      {invest > 0 && (
        <p className="sm" style={{ marginTop: 10, lineHeight: 1.55 }}>
          {vnd(invest)} đầu tư không mất đi — nó rời túi tháng này và chuyển sang tài sản
          ròng. Vì vậy mức dư ở thẻ dưới không trừ nó.
        </p>
      )}
    </div>
  );
}
