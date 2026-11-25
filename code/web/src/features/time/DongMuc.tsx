import { useState } from 'react';
import type { TimeEntry } from '@mira/contract';
import { labelDay } from '../../lib/date';
import { minutes as fmtMinutes } from '../../lib/format';
import { nhipCua, type NhomMuc } from '../../lib/gom';
import { store } from '../../lib/store';

/**
 * Một mục lẻ, không thuộc nếp nào.
 *
 * Chạm vào thì mở ra sửa và xoá. Trước đây gõ `15` thay vì `1.5` là con số sai đó nằm
 * trong donut vĩnh viễn: `PATCH` và `DELETE` đã có trên máy chủ, api-client đã có hàm
 * gọi, và không màn nào gọi tới. Đường ống thông cả, chỉ thiếu nút.
 */
export function Dong({
  e,
  mau,
  dungNhat,
  onDoi,
  tenDanhMuc,
}: {
  readonly e: TimeEntry;
  readonly mau: string;
  readonly dungNhat: number;
  readonly onDoi: () => void;
  readonly tenDanhMuc: (id: string | null) => string | null;
}) {
  const [mo, setMo] = useState(false);
  // Danh mục là thứ người dùng đã khai là "việc gì"; ghi chú chỉ là lời riêng cho một
  // ngày. Có danh mục thì nó làm tiêu đề, ghi chú xuống dòng dưới.
  const ten = tenDanhMuc(e.danhMucId) ?? (e.note === null || e.note.trim() === '' ? 'Ghi tay' : e.note);
  const phu = tenDanhMuc(e.danhMucId) !== null && e.note !== null && e.note.trim() !== '' ? e.note : null;

  return (
    <div className="list-row" style={{ alignItems: 'flex-start' }}>
      <div className="list-icon" style={{ background: '#edeff3' }}>
        {e.golden ? '🕯️' : '•'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <button
          type="button"
          className="gom-nut"
          aria-expanded={mo}
          onClick={() => setMo(!mo)}
        >
          <div className="row" style={{ alignItems: 'baseline' }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              {ten}
              <span className={mo ? 'gom-mui is-mo' : 'gom-mui'} aria-hidden>
                ›
              </span>
            </div>
            <div style={{ fontWeight: 700, color: mau, marginLeft: 'auto' }}>
              {fmtMinutes(e.minutes)}
            </div>
          </div>
          {/* Thanh tỉ lệ so với mục dài nhất. Lấy từ Focus Tracker (N-219): đọc một danh
              sách toàn số thì mắt so chiều dài nhanh hơn so chữ số. */}
          <div className="bar" style={{ marginTop: 6 }}>
            <i style={{ width: `${Math.round((e.minutes * 100) / dungNhat)}%`, background: mau }} />
          </div>
          <div className="sm" style={{ marginTop: 5 }}>
            {labelDay(e.date)}
            {phu === null ? '' : ` · ${phu}`}
          </div>
        </button>

        {mo && <SuaMuc e={e} onXong={onDoi} />}
      </div>
    </div>
  );
}

/**
 * Sửa số giờ, hoặc xoá hẳn.
 *
 * Xoá hỏi lại một lần. Không phải vì xoá một mục giờ là chuyện lớn, mà vì nút xoá nằm
 * ngay cạnh nút lưu và ngón tay thì to hơn người ta tưởng.
 */
function SuaMuc({ e, onXong }: { readonly e: TimeEntry; readonly onXong: () => void }) {
  const [gio, setGio] = useState((e.minutes / 60).toFixed(2).replace(/\.?0+$/, ''));
  const [chac, setChac] = useState(false);
  const [dangChay, setDangChay] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  async function chay(viec: () => Promise<unknown>): Promise<void> {
    setDangChay(true);
    setLoi(null);
    try {
      await viec();
      onXong();
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không lưu được.');
      setDangChay(false);
    }
  }

  const phutMoi = Math.round(Number(gio.replace(',', '.')) * 60);
  const hopLe = Number.isInteger(phutMoi) && phutMoi > 0;

  return (
    <div className="sua">
      <div className="sua__hang">
        <input
          value={gio}
          onChange={(event) => setGio(event.target.value)}
          inputMode="decimal"
          aria-label="Số giờ"
        />
        <span className="sm">giờ</span>
        <button
          type="button"
          className="sua__luu"
          disabled={!hopLe || dangChay || phutMoi === e.minutes}
          onClick={() => void chay(() => store.updateTimeEntry(e.id, { minutes: phutMoi }))}
        >
          Lưu
        </button>
      </div>

      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
          {loi}
        </p>
      )}

      {chac ? (
        <div className="sua__hang" style={{ marginTop: 10 }}>
          <span className="sm" style={{ flex: 1 }}>
            Xoá hẳn mục này?
          </span>
          <button type="button" className="sua__huy" onClick={() => setChac(false)}>
            Thôi
          </button>
          <button
            type="button"
            className="sua__xoa"
            disabled={dangChay}
            onClick={() => void chay(() => store.deleteTimeEntry(e.id))}
          >
            Xoá
          </button>
        </div>
      ) : (
        <button type="button" className="sua__moXoa" onClick={() => setChac(true)}>
          Xoá mục này
        </button>
      )}
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
  tenDanhMuc,
}: {
  readonly nhom: NhomMuc;
  readonly mau: string;
  readonly dungNhat: number;
  readonly tenDanhMuc: (id: string | null) => string | null;
}) {
  const [mo, setMo] = useState(false);
  const ten = tenDanhMuc(nhom.danhMucId) ?? (nhom.note === '' ? 'Ghi tay' : nhom.note);

  return (
    <div className="list-row" style={{ alignItems: 'flex-start' }}>
      <div className="list-icon" style={{ background: '#edeff3' }}>
        {nhom.golden ? '🕯️' : '↻'}
      </div>
      {/* Cột nội dung. `.list-row` xếp ngang, nên nút và danh sách từng ngày phải nằm
          chung một cột, không thì mở ra là danh sách nhảy sang cạnh nút. */}
      <div style={{ flex: 1, minWidth: 0 }}>
      {/* Cả thân dòng là nút mở. Trước đây chỉ dòng chữ "Xem từng ngày" bấm được, trong
          khi cả thẻ đều nói về một việc: ngón tay nhắm vào thẻ, không nhắm vào dòng chữ. */}
      <button type="button" className="gom-nut" aria-expanded={mo} onClick={() => setMo(!mo)}>
        <div className="row" style={{ alignItems: 'baseline' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {ten}
            <span className={mo ? 'gom-mui is-mo' : 'gom-mui'} aria-hidden>
              ›
            </span>
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

        {!mo && <div className="mo">{nhom.soLan} ngày, chạm để xem</div>}
      </button>

      {mo && (
        <div style={{ marginTop: 6 }}>
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
