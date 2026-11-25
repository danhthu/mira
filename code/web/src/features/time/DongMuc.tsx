import { useState } from 'react';
import type { TimeEntry } from '@mira/contract';
import { labelDay } from '../../lib/date';
import { minutes as fmtMinutes } from '../../lib/format';
import { nhipCua, type NhomMuc } from '../../lib/gom';

/** Một mục lẻ, không thuộc nếp nào. */
export function Dong({
  e,
  mau,
  dungNhat,
}: {
  readonly e: TimeEntry;
  readonly mau: string;
  readonly dungNhat: number;
}) {
  return (
    <div className="list-row">
      <div className="list-icon" style={{ background: '#edeff3' }}>
        {e.golden ? '🕯️' : '•'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>
          {e.note === null || e.note.trim() === '' ? 'Ghi tay' : e.note}
        </div>
        {/* Thanh tỉ lệ so với mục dài nhất. Lấy từ Focus Tracker (N-219): đọc một danh
            sách toàn số thì mắt so chiều dài nhanh hơn so chữ số. */}
        <div className="bar" style={{ marginTop: 6 }}>
          <i style={{ width: `${Math.round((e.minutes * 100) / dungNhat)}%`, background: mau }} />
        </div>
        <div className="sm" style={{ marginTop: 5 }}>
          {labelDay(e.date)}
        </div>
      </div>
      <div style={{ fontWeight: 700, color: mau }}>{fmtMinutes(e.minutes)}</div>
    </div>
  );
}

/**
 * Một nếp lặp, gom thành một dòng.
 *
 * Dòng này nói ba điều mà hai mươi tám dòng rời không nói được: nhịp, tổng giờ, và **mấy
 * ngày không theo nếp**. Ngày lệch hiện thẳng ra chứ không nằm sau nút mở, vì trong một
 * nếp đều thì đó là phần duy nhất còn tin.
 *
 * Biểu tượng ↻ thay cho dấu chấm: nhìn một cái là biết dòng này gom nhiều ngày, không
 * phải một ngày.
 */
export function NhomDong({
  nhom,
  mau,
  dungNhat,
}: {
  readonly nhom: NhomMuc;
  readonly mau: string;
  readonly dungNhat: number;
}) {
  const [mo, setMo] = useState(false);

  return (
    <div className="list-row" style={{ alignItems: 'flex-start' }}>
      <div className="list-icon" style={{ background: '#edeff3' }}>
        {nhom.golden ? '🕯️' : '↻'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ alignItems: 'baseline' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {nhom.note === '' ? 'Ghi tay' : nhom.note}
          </div>
          <div style={{ fontWeight: 700, color: mau, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            {nhom.deu
              ? fmtMinutes(nhom.phutThuong)
              : `${fmtMinutes(nhom.phutNhoNhat)} – ${fmtMinutes(nhom.phutLonNhat)}`}
          </div>
        </div>

        {/* Nếp cứng vẽ một thanh ở mức thường gặp. Nếp mềm vẽ cả dải: một thanh đơn ở
            đây sẽ ngụ ý một con số chuẩn mà dữ liệu không có. */}
        <div className="bar" style={{ marginTop: 6 }}>
          {nhom.deu ? (
            <i
              style={{
                width: `${Math.round((nhom.phutThuong * 100) / dungNhat)}%`,
                background: mau,
              }}
            />
          ) : (
            <i
              style={{
                marginLeft: `${Math.round((nhom.phutNhoNhat * 100) / dungNhat)}%`,
                width: `${Math.max(2, Math.round(((nhom.phutLonNhat - nhom.phutNhoNhat) * 100) / dungNhat))}%`,
                background: mau,
                opacity: 0.55,
              }}
            />
          )}
        </div>

        <div className="sm" style={{ marginTop: 5 }}>
          {nhipCua(nhom)} · {nhom.soLan} lần
          {nhom.deu ? '' : ` · trung bình ${fmtMinutes(nhom.phutTrungBinh)}`} · tổng{' '}
          {fmtMinutes(nhom.tongPhut)}
        </div>

        {/* Chỉ gọi là "không theo nếp" khi nếp có thật. Nếp mềm thì mọi ngày đều khác
            nhau, và kể tên 17 trên 24 ngày là nói sai. */}
        {nhom.deu && nhom.ngayKhac.length > 0 && (
          <div className="lech">
            {nhom.ngayKhac.length} ngày không theo nếp:{' '}
            {nhom.ngayKhac
              .slice(0, 3)
              .map((e) => `${labelDay(e.date)} ${fmtMinutes(e.minutes)}`)
              .join(' · ')}
            {nhom.ngayKhac.length > 3 ? ' …' : ''}
          </div>
        )}

        <button type="button" className="mo" onClick={() => setMo(!mo)}>
          {mo ? 'Thu lại' : `Xem từng ngày (${nhom.soLan})`}
        </button>

        {mo && (
          <div style={{ marginTop: 4 }}>
            {nhom.muc.map((e) => (
              <div className="ngay" key={e.id}>
                <span>{labelDay(e.date)}</span>
                <b style={{ color: e.minutes === nhom.phutThuong ? 'inherit' : mau }}>
                  {fmtMinutes(e.minutes)}
                </b>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
