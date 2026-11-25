import { useState } from 'react';
import {
  BUCKET_LABEL_VI,
  NEP_CAP,
  TIME_BUCKETS,
  type Nep,
  type NgayCuaNep,
  type TimeBucket,
} from '@mira/contract';
import { store } from '../../lib/store';
import { minutes as fmtMinutes } from '../../lib/format';

/**
 * Nếp: khai một luật thay vì gõ lại mỗi ngày.
 *
 * MẶC ĐỊNH LÀ ĐÃ LÀM. App thói quen thường bắt tick để xác nhận; ở đây việc đã khai là
 * nếp thì coi như đã làm, người dùng chỉ động tay khi **không** làm. Giảm ma sát ghi là
 * đòn bẩy +39%, và cách giảm mạnh nhất là bỏ hẳn thao tác cho trường hợp thường gặp.
 *
 * Mira chỉ sinh bù tối đa bảy ngày gần nhất. Vắng lâu hơn thì quãng đó để trống, vì để
 * trống là thật còn điền bừa là nói dối.
 */
const THU = [
  { k: '1', n: 'T2' },
  { k: '2', n: 'T3' },
  { k: '3', n: 'T4' },
  { k: '4', n: 'T5' },
  { k: '5', n: 'T6' },
  { k: '6', n: 'T7' },
  { k: '7', n: 'CN' },
] as const;

export function NepSection({
  nep,
  ngay,
  homNay,
  onDoi,
}: {
  readonly nep: readonly Nep[];
  readonly ngay: readonly NgayCuaNep[];
  readonly homNay: string;
  readonly onDoi: () => void;
}) {
  const cuaHomNay = ngay.filter((x) => x.date === homNay);
  const truoc = ngay.filter((x) => x.date !== homNay && x.trangThai === 'da-ghi');

  return (
    <>
      {cuaHomNay.length > 0 && (
        <div className="card">
          <div className="label">Hôm nay, theo nếp</div>
          <p className="sm" style={{ marginTop: 6, lineHeight: 1.5 }}>
            Mira ghi sẵn rồi. Hôm nào không làm thì bỏ ra.
          </p>
          {cuaHomNay.map((x) => (
            <DongNgay key={x.nepId} x={x} onDoi={onDoi} />
          ))}
        </div>
      )}

      {truoc.length > 0 && (
        <p className="empty">
          Mira cũng ghi bù {truoc.length} mục cho mấy ngày trước. Mở nhóm việc ra để bỏ
          những mục không đúng.
        </p>
      )}

      <div className="card">
        <div className="row">
          <div className="label">Nếp đang chạy</div>
          <div className="sm">
            {nep.length}/{NEP_CAP}
          </div>
        </div>

        {nep.length === 0 ? (
          <p className="empty" style={{ marginTop: 8 }}>
            Chưa khai nếp nào. Việc nào ngày nào cũng làm thì khai một lần, khỏi gõ lại.
          </p>
        ) : (
          nep.map((n) => <DongNep key={n.id} n={n} onDoi={onDoi} />)
        )}

        {nep.length < NEP_CAP && <ThemNep onXong={onDoi} />}
      </div>
    </>
  );
}

function DongNgay({ x, onDoi }: { readonly x: NgayCuaNep; readonly onDoi: () => void }) {
  const [dangChay, setDangChay] = useState(false);
  const boQua = x.trangThai === 'bo-qua';

  const bam = (): void => {
    setDangChay(true);
    const viec = boQua
      ? store.nhanLaiNep(x.nepId, x.date)
      : store.tuChoiNep(x.nepId, x.date);
    void viec.finally(() => {
      setDangChay(false);
      onDoi();
    });
  };

  return (
    <div className="nep-ngay">
      <span className={boQua ? 'nep-ngay__t is-bo' : 'nep-ngay__t'}>
        {x.title} · {fmtMinutes(x.minutes)}
      </span>
      <button type="button" disabled={dangChay} onClick={bam}>
        {boQua ? 'Nhận lại' : 'Không làm'}
      </button>
    </div>
  );
}

function DongNep({ n, onDoi }: { readonly n: Nep; readonly onDoi: () => void }) {
  const [chac, setChac] = useState(false);

  return (
    <div className="nep-dong">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{n.title}</div>
        <div className="sm" style={{ marginTop: 2 }}>
          {BUCKET_LABEL_VI[n.bucket]} · {fmtMinutes(n.minutes)} · {tenThu(n.days)}
          {n.golden ? ' · giờ vàng' : ''}
        </div>
      </div>
      {chac ? (
        <>
          <button type="button" className="sua__huy" onClick={() => setChac(false)}>
            Thôi
          </button>
          <button
            type="button"
            className="sua__xoa"
            onClick={() => void store.endNep(n.id).then(onDoi)}
          >
            Dừng
          </button>
        </>
      ) : (
        <button type="button" className="sua__moXoa" onClick={() => setChac(true)}>
          Dừng
        </button>
      )}
    </div>
  );
}

function ThemNep({ onXong }: { readonly onXong: () => void }) {
  const [mo, setMo] = useState(false);
  const [title, setTitle] = useState('');
  const [bucket, setBucket] = useState<TimeBucket>('personal');
  const [gio, setGio] = useState('0.5');
  const [days, setDays] = useState('1234567');
  const [golden, setGolden] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [dangChay, setDangChay] = useState(false);

  const phut = Math.round(Number(gio.replace(',', '.')) * 60);
  const hopLe = title.trim() !== '' && Number.isInteger(phut) && phut > 0 && days !== '';

  async function tao(): Promise<void> {
    setDangChay(true);
    setLoi(null);
    try {
      await store.createNep({ title: title.trim(), bucket, minutes: phut, golden, days });
      setTitle('');
      setMo(false);
      onXong();
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không tạo được nếp.');
    } finally {
      setDangChay(false);
    }
  }

  if (!mo) {
    return (
      <button type="button" className="nep-them" onClick={() => setMo(true)}>
        + Khai một nếp
      </button>
    );
  }

  return (
    <div className="sua" style={{ marginTop: 12 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Việc gì? Ví dụ: Ăn tối"
        style={o}
      />

      <div className="pills" style={{ marginTop: 10, flexWrap: 'wrap' }}>
        {TIME_BUCKETS.map((b) => (
          <button key={b} type="button" aria-pressed={bucket === b} onClick={() => setBucket(b)}>
            {BUCKET_LABEL_VI[b]}
          </button>
        ))}
      </div>

      <div className="nep-thu">
        {THU.map((t) => {
          const on = days.includes(t.k);
          return (
            <button
              key={t.k}
              type="button"
              aria-pressed={on}
              className={on ? 'is-on' : undefined}
              onClick={() =>
                setDays(
                  on
                    ? days.split('').filter((x) => x !== t.k).join('')
                    : [...days.split(''), t.k].sort().join(''),
                )
              }
            >
              {t.n}
            </button>
          );
        })}
      </div>

      <div className="sua__hang" style={{ marginTop: 10 }}>
        <input value={gio} onChange={(e) => setGio(e.target.value)} inputMode="decimal" aria-label="Số giờ" />
        <span className="sm">giờ mỗi lần</span>
        <button type="button" className="sua__luu" disabled={!hopLe || dangChay} onClick={() => void tao()}>
          Khai
        </button>
      </div>

      {bucket === 'family' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 14 }}>
          <input type="checkbox" checked={golden} onChange={(e) => setGolden(e.target.checked)} />
          Giờ vàng: thật sự có mặt
        </label>
      )}

      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
          {loi}
        </p>
      )}

      <button type="button" className="sua__moXoa" onClick={() => setMo(false)}>
        Thôi
      </button>
    </div>
  );
}

const o = {
  width: '100%',
  background: 'var(--surface)',
  border: '1.5px solid #d7dfe9',
  borderRadius: 12,
  padding: '10px 13px',
  fontSize: 16,
} as const;

/** "1234567" → "mỗi ngày", "12345" → "T2–T6", còn lại liệt kê. */
function tenThu(days: string): string {
  if (days === '1234567') return 'mỗi ngày';
  if (days === '12345') return 'T2–T6';
  if (days === '67') return 'cuối tuần';
  return days
    .split('')
    .map((k) => THU.find((t) => t.k === k)?.n ?? k)
    .join(' ');
}
