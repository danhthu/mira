import { useState } from 'react';
import { DANH_MUC_CAP, type DanhMuc, type TimeBucket } from '@mira/contract';
import { store } from '../../lib/store';

/**
 * Sửa tên và cất danh mục, đặt ngay trong màn chi tiết của ô.
 *
 * Để ở đây chứ không gom vào một màn "Cài đặt" chung: người ta muốn đổi tên một danh mục
 * đúng lúc đang nhìn số của nó, không phải lúc ngồi dọn cài đặt.
 *
 * CẤT ĐI, KHÔNG XOÁ. Danh mục đã dùng thì mục giờ cũ còn trỏ về nó. Xoá là sửa lịch sử;
 * cất thì nó biến khỏi danh sách chọn mà số cũ vẫn đọc được.
 */
export function DanhMucQuanLy({
  bucket,
  danhMuc,
  onDoi,
}: {
  readonly bucket: TimeBucket;
  readonly danhMuc: readonly DanhMuc[];
  readonly onDoi: () => void;
}) {
  const [mo, setMo] = useState(false);

  if (danhMuc.length === 0 && !mo) {
    return (
      <p className="empty" style={{ marginTop: 10 }}>
        Ô này chưa có danh mục nào. Khai ở ô ghi giờ bên màn Thời gian, hoặc{' '}
        <button type="button" className="mo" style={{ padding: 0 }} onClick={() => setMo(true)}>
          thêm ngay tại đây
        </button>
        .
      </p>
    );
  }

  return (
    <div className="card">
      <div className="row">
        <div className="label">Danh mục của ô này</div>
        <div className="sm">
          {danhMuc.length}/{DANH_MUC_CAP}
        </div>
      </div>

      {danhMuc.map((d) => (
        <DongDanhMuc key={d.id} d={d} onDoi={onDoi} />
      ))}

      {danhMuc.length < DANH_MUC_CAP && <ThemNhanh bucket={bucket} onXong={onDoi} />}
    </div>
  );
}

function DongDanhMuc({ d, onDoi }: { readonly d: DanhMuc; readonly onDoi: () => void }) {
  const [sua, setSua] = useState(false);
  const [ten, setTen] = useState(d.name);
  const [vang, setVang] = useState(d.golden);
  const [chac, setChac] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  async function luu(): Promise<void> {
    setLoi(null);
    try {
      await store.renameDanhMuc(d.id, { name: ten.trim(), golden: vang });
      setSua(false);
      onDoi();
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không lưu được.');
    }
  }

  if (!sua) {
    return (
      <div className="nep-dong">
        <button
          type="button"
          className="gom-nut"
          style={{ flex: 1, minWidth: 0 }}
          onClick={() => setSua(true)}
        >
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {d.name}
            {d.golden ? ' 🕯️' : ''}
          </span>
          <span className="gom-mui" aria-hidden>
            ›
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="sua" style={{ marginTop: 10 }}>
      <div className="sua__hang">
        <input
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          style={{ flex: 1, minWidth: 0 }}
          aria-label="Tên danh mục"
        />
        <button
          type="button"
          className="sua__luu"
          disabled={ten.trim() === ''}
          onClick={() => void luu()}
        >
          Lưu
        </button>
      </div>

      {d.bucket === 'family' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 14 }}>
          <input type="checkbox" checked={vang} onChange={(e) => setVang(e.target.checked)} />
          Mặc định là giờ vàng
        </label>
      )}

      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
          {loi}
        </p>
      )}

      {chac ? (
        <div className="sua__hang" style={{ marginTop: 10 }}>
          <span className="sm" style={{ flex: 1 }}>
            Cất danh mục này? Số cũ vẫn giữ nguyên.
          </span>
          <button type="button" className="sua__huy" onClick={() => setChac(false)}>
            Thôi
          </button>
          <button
            type="button"
            className="sua__xoa"
            onClick={() => void store.catDanhMuc(d.id).then(onDoi)}
          >
            Cất
          </button>
        </div>
      ) : (
        <div className="sua__hang" style={{ marginTop: 4 }}>
          <button type="button" className="sua__moXoa" onClick={() => setChac(true)}>
            Cất đi
          </button>
          <button
            type="button"
            className="sua__moXoa"
            style={{ marginLeft: 'auto' }}
            onClick={() => setSua(false)}
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}

function ThemNhanh({
  bucket,
  onXong,
}: {
  readonly bucket: TimeBucket;
  readonly onXong: () => void;
}) {
  const [mo, setMo] = useState(false);
  const [ten, setTen] = useState('');
  const [loi, setLoi] = useState<string | null>(null);

  async function tao(): Promise<void> {
    setLoi(null);
    try {
      await store.createDanhMuc({ name: ten.trim(), bucket });
      setTen('');
      setMo(false);
      onXong();
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không tạo được.');
    }
  }

  if (!mo) {
    return (
      <button type="button" className="nep-them" onClick={() => setMo(true)}>
        + Thêm danh mục
      </button>
    );
  }

  return (
    <div className="sua__hang" style={{ marginTop: 12 }}>
      <input
        value={ten}
        onChange={(e) => setTen(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && ten.trim() !== '') void tao();
        }}
        placeholder="Tên danh mục"
        style={{ flex: 1, minWidth: 0 }}
        aria-label="Tên danh mục mới"
      />
      <button type="button" className="sua__luu" disabled={ten.trim() === ''} onClick={() => void tao()}>
        Tạo
      </button>
      {loi !== null && <span className="sm" style={{ color: 'var(--amber)' }}>{loi}</span>}
    </div>
  );
}
