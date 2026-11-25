import { Link } from 'react-router-dom';
import type { Moment } from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { addDays, labelDay, today } from '../../lib/date';
import { Grain } from '../../ui/Grain';

/**
 * Chi tiết hũ. Trang chủ chỉ hiện cái hũ và hai con số; chỗ đọc lại từng hạt là đây.
 *
 * Xếp mới nhất lên trên, gom theo tháng. Không có nút xoá: hạt đã bỏ vào hũ thì ở đó,
 * vì một cuốn nhật ký sửa được là một cuốn nhật ký không tin được.
 */
const SO_NGAY = 365;

export function HuScreen() {
  const day = today();
  const state = useAsync(
    async () => store.listMoments(addDays(day, -SO_NGAY), day),
    [day],
  );

  const hat = [...(state.data ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const keo = hat.filter((m) => m.kind === 'candy').length;
  const muoi = hat.length - keo;

  return (
    <div className="screen-body">
      <div className="row">
        <div className="title">Hũ</div>
        <Link to="/" className="sm">
          Về trang chủ
        </Link>
      </div>

      <div className="card">
        <div className="row">
          <div>
            <div className="big">{hat.length}</div>
            <div className="sm" style={{ marginTop: 4 }}>
              hạt trong một năm
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--candy)' }}>{keo} kẹo</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--salt)', marginTop: 4 }}>
              {muoi} muối
            </div>
          </div>
        </div>
      </div>

      {state.loading && <p className="empty">Đang mở hũ…</p>}

      {!state.loading && hat.length === 0 && (
        <p className="empty">Hũ còn trống. Ghi một dòng ở trang chủ là có hạt đầu tiên.</p>
      )}

      {Object.entries(gomTheoThang(hat)).map(([thang, trongThang]) => (
        <div key={thang}>
          <div className="label" style={{ marginTop: 14 }}>
            {tenThang(thang)}
          </div>
          {trongThang.map((m) => (
            <div className="list-row" key={m.id}>
              <div className="list-icon" style={{ background: '#edeff3' }}>
                <Grain kind={m.kind} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, lineHeight: 1.45 }}>
                  {m.text === null || m.text.trim() === '' ? (
                    <span className="sm">Không ghi chữ nào</span>
                  ) : (
                    m.text
                  )}
                </div>
                <div className="sm" style={{ marginTop: 3 }}>
                  {labelDay(m.date)}
                  {m.revisitAnswer !== null && m.revisitAnswer !== undefined
                    ? ` · ${LOI_DAP[m.revisitAnswer]}`
                    : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const LOI_DAP: Record<string, string> = {
  same: 'vẫn vậy',
  lighter: 'nhẹ hơn rồi',
  gone: 'qua rồi',
};

function gomTheoThang(hat: readonly Moment[]): Record<string, Moment[]> {
  const ra: Record<string, Moment[]> = {};
  for (const m of hat) {
    const thang = m.date.slice(0, 7);
    (ra[thang] ??= []).push(m);
  }
  return ra;
}

function tenThang(thang: string): string {
  const [nam, thg] = thang.split('-');
  return `Tháng ${Number(thg)}/${nam}`;
}
