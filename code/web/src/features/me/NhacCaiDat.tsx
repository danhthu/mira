/**
 * Thiết lập nhắc.
 *
 * MỘT CÂU PHẢI NÓI THẲNG TRÊN MÀN HÌNH: MIRA KHÔNG GỬI THÔNG BÁO ĐẨY.
 *
 * Người dùng thấy chữ "nhắc" thì mặc định hiểu là điện thoại sẽ rung lên. Đẩy thật đòi
 * service worker, Push API, khoá VAPID và một máy chủ luôn bật — mà máy chủ Mira đang
 * nằm trên laptop. Để họ tưởng có rồi tối không thấy gì là hỏng niềm tin vào mọi con số
 * khác trong app, chứ không chỉ hỏng tính năng này.
 *
 * Nên dòng chữ ở đây nói đúng cái đang có: lời nhắc nằm trong khung chat, mở Mira là
 * thấy. Một việc, làm được thật.
 */
import { useState } from 'react';
import { NHAC_CAP, type Nhac } from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { today } from '../../lib/date';
import { doiThu } from '../../lib/nhac';

const THU = [
  { so: '1', ten: 'T2' },
  { so: '2', ten: 'T3' },
  { so: '3', ten: 'T4' },
  { so: '4', ten: 'T5' },
  { so: '5', ten: 'T6' },
  { so: '6', ten: 'T7' },
  { so: '7', ten: 'CN' },
];

export function NhacCaiDat() {
  const day = today();
  const state = useAsync(() => store.listNhac(day, day), [day]);
  const ds = state.data?.nhac ?? [];

  const [moGo, setMoGo] = useState(false);
  const [gio, setGio] = useState('21:00');
  const [days, setDays] = useState('1234567');
  const [loi, setLoi] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const [loi_, setLoiNen] = useState<string | null>(null);

  const doiNgay = (so: string) =>
    setDays((d) => (d.includes(so) ? d.replace(so, '') : [...d.split(''), so].sort().join('')));

  async function them(): Promise<void> {
    if (days === '' || dangLuu) return;
    setDangLuu(true);
    setLoiNen(null);
    try {
      await store.createNhac({ gio, days, loi: loi.trim() === '' ? null : loi.trim() });
      setMoGo(false);
      setLoi('');
      state.reload();
    } catch (e: unknown) {
      setLoiNen(e instanceof Error ? e.message : 'Không lưu được lời nhắc.');
    } finally {
      setDangLuu(false);
    }
  }

  async function bat(n: Nhac): Promise<void> {
    await store.updateNhac(n.id, { bat: !n.bat });
    state.reload();
  }

  async function xoa(n: Nhac): Promise<void> {
    await store.deleteNhac(n.id);
    state.reload();
  }

  return (
    <section className="card" style={{ marginTop: 14 }}>
      <div className="label">NHẮC GHI</div>

      <p className="sm" style={{ marginTop: 8, lineHeight: 1.5 }}>
        Lời nhắc hiện <b>trong khung Nhật ký</b> khi bạn mở Mira, không phải thông báo đẩy
        về điện thoại. Ghi được một mục trong ngày thì hôm đó Mira thôi nhắc.
      </p>

      {ds.length === 0 && !moGo && (
        <p className="sm faint" style={{ marginTop: 12 }}>
          Chưa có lời nhắc nào.
        </p>
      )}

      {ds.map((n) => (
        <div key={n.id} className="row" style={{ marginTop: 14 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17, opacity: n.bat ? 1 : 0.45 }}>{n.gio}</div>
            <div className="sm" style={{ marginTop: 2 }}>
              {doiThu(n.days)}
              {n.bat ? '' : ' · đang tắt'}
            </div>
            {n.loi !== null && (
              <div className="sm" style={{ marginTop: 3, fontStyle: 'italic' }}>
                “{n.loi}”
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 14, flex: 'none' }}>
            <button type="button" className="nhac__lien" onClick={() => void bat(n)}>
              {n.bat ? 'Tắt' : 'Bật'}
            </button>
            <button type="button" className="nhac__lien" onClick={() => void xoa(n)}>
              Xoá
            </button>
          </div>
        </div>
      ))}

      {moGo ? (
        <div style={{ marginTop: 16 }}>
          <div className="row" style={{ gap: 10 }}>
            <input
              type="time"
              value={gio}
              onChange={(e) => setGio(e.target.value)}
              aria-label="Giờ nhắc"
              className="nhac__gio"
            />
            <input
              value={loi}
              onChange={(e) => setLoi(e.target.value)}
              placeholder="Lời nhắc (không bắt buộc)"
              aria-label="Lời nhắc"
              className="nhac__loi"
            />
          </div>

          <div className="nhac-thu">
            {THU.map((t) => (
              <button
                key={t.so}
                type="button"
                className={days.includes(t.so) ? 'is-on' : ''}
                aria-pressed={days.includes(t.so)}
                onClick={() => doiNgay(t.so)}
              >
                {t.ten}
              </button>
            ))}
          </div>

          {days === '' && (
            <p className="sm" style={{ marginTop: 8 }}>
              Chọn ít nhất một thứ.
            </p>
          )}
          {loi_ !== null && (
            <p className="sm" style={{ marginTop: 8, color: 'var(--amber)' }}>
              {loi_}
            </p>
          )}

          <div className="row" style={{ marginTop: 14 }}>
            <button type="button" className="nhac__lien" onClick={() => setMoGo(false)}>
              Thôi
            </button>
            <button
              type="button"
              className="sua__luu"
              disabled={days === '' || dangLuu}
              onClick={() => void them()}
            >
              {dangLuu ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </div>
      ) : (
        ds.length < NHAC_CAP && (
          <button
            type="button"
            className="nhac__them"
            onClick={() => setMoGo(true)}
            style={{ marginTop: 14 }}
          >
            + Thêm lời nhắc
          </button>
        )
      )}

      {ds.length >= NHAC_CAP && !moGo && (
        <p className="sm faint" style={{ marginTop: 12 }}>
          Tối đa {NHAC_CAP} lời nhắc. Nhiều hơn thì nó thành tiếng ồn.
        </p>
      )}
    </section>
  );
}
