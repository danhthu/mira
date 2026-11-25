import { useState } from 'react';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { addDays, today, weekStartOf } from '../../lib/date';
import { doCauChuyen, type TuanDangKe } from '../../lib/cauChuyen';
import './SauThang.css';

/**
 * Sáu tháng của bạn.
 *
 * Màn mới, dựng theo concept cải tiến sau khi chạy 300 persona. Khuôn trình bày lấy từ
 * Verde Money Wrapped (N-218): mỗi thẻ đúng một sự thật, chữ to, đọc lướt được.
 *
 * KHÁC VERDE MỘT CHỖ, VÀ ĐÂY LÀ CHỖ QUAN TRỌNG NHẤT. Verde chỉ kể tin vui. Dữ liệu Mira
 * lệch ngược lại: bắt tin xấu 68%, tin vui 12%. Bê giọng ăn mừng của Verde vào là nói
 * dối; để nguyên bộ dò thì thành bản cáo trạng. Nên tuần vui tô xanh, tuần nặng tô vàng,
 * và lúc phải cắt bớt thì tuần vui được giữ trước.
 *
 * Mira im lặng ở những tuần nó không chắc, và **nói ra chuyện đó**. Dòng cuối màn không
 * phải lời xin lỗi, nó là điều kiện để tin hai mươi lăm dòng còn lại.
 */
type Khung = 'thang' | 'quy' | 'sauThang';

const SO_TUAN: Record<Khung, number> = { thang: 4, quy: 13, sauThang: 26 };
const NHAN: Record<Khung, string> = { thang: 'Tháng', quy: 'Quý', sauThang: 'Sáu tháng' };

export function SauThangScreen() {
  const [khung, setKhung] = useState<Khung>('sauThang');
  const tuanNay = weekStartOf(today());
  const tu = addDays(tuanNay, -7 * (SO_TUAN[khung] - 1));

  const state = useAsync(async () => {
    const den = addDays(tuanNay, 6);
    const [entries, moments] = await Promise.all([
      store.listTimeEntries(tu, den),
      store.listMoments(tu, den),
    ]);
    return doCauChuyen(entries, moments);
  }, [tu, tuanNay]);

  const chuyen = state.data;

  return (
    <div className="screen-body">
      <div className="row">
        <div className="title">Sáu tháng của bạn</div>
      </div>

      <div className="pills">
        {(['thang', 'quy', 'sauThang'] as const).map((k) => (
          <button key={k} type="button" aria-pressed={khung === k} onClick={() => setKhung(k)}>
            {NHAN[k]}
          </button>
        ))}
      </div>

      {state.loading && <p className="empty">Đang đọc lại {SO_TUAN[khung]} tuần…</p>}

      {chuyen?.mu === true && (
        <div className="card">
          <div style={{ fontSize: 17, fontWeight: 700 }}>Chưa đủ để nói gì</div>
          <p className="sm" style={{ marginTop: 8, lineHeight: 1.55 }}>
            Mira mới nhìn được {chuyen.tuanNhinThay} tuần có ghi từ ba ngày trở lên. Cần ít
            nhất sáu tuần thì mức thường của bạn mới có nghĩa, và không có mức thường thì
            không biết tuần nào là khác thường.
          </p>
        </div>
      )}

      {chuyen !== null && !chuyen.mu && chuyen.tuan.length === 0 && (
        <div className="card">
          <div style={{ fontSize: 17, fontWeight: 700 }}>Không tuần nào khác thường</div>
          <p className="sm" style={{ marginTop: 8, lineHeight: 1.55 }}>
            {chuyen.tuanNhinThay} tuần đều nằm quanh mức thường của bạn. Đó là một kết quả,
            không phải lỗi: không phải quãng đời nào cũng có chuyện để kể.
          </p>
        </div>
      )}

      {chuyen?.tuan.map((t) => (
        <TheTuan key={t.batDau} tuan={t} />
      ))}

      {chuyen !== null && !chuyen.mu && (
        <p className="empty" style={{ marginTop: 14 }}>
          Mira chỉ nói khi khá chắc: {chuyen.tuan.length} tuần trong {chuyen.tuanNhinThay}.
          Những tuần còn lại không có nghĩa là không có gì, chỉ là Mira không dám chắc.
        </p>
      )}
    </div>
  );
}

function TheTuan({ tuan }: { readonly tuan: TuanDangKe }) {
  return (
    <div className={`st ${tuan.tone === 'vui' ? 'is-vui' : 'is-nang'}`}>
      <div className="st__k">TUẦN {tuan.so}</div>
      <p className="st__t">{tuan.cau}</p>
      {(tuan.keo > 0 || tuan.muoi > 0) && (
        <div className="st__hat">
          {tuan.keo > 0 && (
            <span>
              <i className="st__keo" />
              {tuan.keo} viên kẹo
            </span>
          )}
          {tuan.muoi > 0 && (
            <span>
              <i className="st__muoi" />
              {tuan.muoi} hạt muối
            </span>
          )}
        </div>
      )}
    </div>
  );
}
