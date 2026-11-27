import { useState } from 'react';
import {
  BUCKET_LABEL_VI,
  MONEY_CELL_LABEL_VI,
  MONEY_FLOW_CELLS,
  TIME_BUCKETS,
  type Intent,
  type MoneyFlowCell,
  type TimeBucket,
} from '@mira/contract';
import { store } from '../../lib/store';
import { shiftWeekday } from '../../lib/reminder';
import { Sheet } from '../../ui/Sheet';

/**
 * Khay sửa / xoá một mục Mira vừa ghi từ câu chat.
 *
 * Trước 27/11/2026 thẻ kết quả chỉ có Hoàn tác — gỡ CẢ câu. Đọc đúng việc mà sai số
 * ("họp 2 tiếng" thật ra 1 tiếng rưỡi) thì phải gỡ rồi gõ lại, hoặc sang tab Thời gian
 * tìm đúng dòng. Giờ chạm thẻ là mở khay này, sửa và xoá cùng một chỗ.
 *
 * Trả về ý ĐÃ SỬA để thẻ trong khung chat vẽ lại đúng số mới, hoặc `null` khi đã xoá.
 */
export function EditWritten({
  y,
  id,
  onClose,
  onDone,
}: {
  readonly y: Intent | null;
  readonly id: string | null;
  readonly onClose: () => void;
  readonly onDone: (moi: Intent | null) => void;
}) {
  const open = y !== null && id !== null;
  return (
    <Sheet open={open} headline={y === null ? '' : tieuDe(y)} onClose={onClose}>
      {/* key: đổi mục là dựng lại ô nhập, không mang số của mục trước sang. */}
      {open && <Body key={id} y={y} id={id} onDone={onDone} />}
    </Sheet>
  );
}

function tieuDe(y: Intent): string {
  if (y.kind === 'time') return 'Sửa mục giờ';
  if (y.kind === 'money') return 'Sửa khoản tiền';
  if (y.kind === 'grain') return 'Sửa hạt';
  if (y.kind === 'reminder') return 'Lời nhắc';
  return '';
}

/** "60.000", "60k", "1tr2", "1,5 triệu" → số đồng. Không đọc được thì NaN. */
export function docTien(s: string): number {
  const t = s.trim().toLowerCase().replace(/\s+/g, '');
  const tr = /^(\d+)(?:[.,](\d+))?(?:tr|triệu|trieu)(\d*)$/.exec(t);
  if (tr !== null) {
    const nguyen = Number(tr[1]);
    const le = tr[2] ?? tr[3] ?? '';
    return Math.round((nguyen + (le === '' ? 0 : Number(`0.${le}`))) * 1_000_000);
  }
  const k = /^(\d+(?:[.,]\d+)?)(?:k|nghìn|nghin|ng)$/.exec(t);
  if (k !== null) return Math.round(Number(k[1]!.replace(',', '.')) * 1000);
  const tron = t.replace(/[.,]/g, '');
  return /^\d+$/.test(tron) ? Number(tron) : NaN;
}

const nhom = (n: number): string => n.toLocaleString('vi-VN');

function Body({
  y,
  id,
  onDone,
}: {
  readonly y: Intent;
  readonly id: string;
  readonly onDone: (moi: Intent | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [hoiXoa, setHoiXoa] = useState(false);

  // Giờ
  const [gio, setGio] = useState(
    y.kind === 'time' ? (y.minutes / 60).toFixed(2).replace(/\.?0+$/, '') : '',
  );
  const [bucket, setBucket] = useState<TimeBucket>(y.kind === 'time' ? y.bucket : 'personal');
  const [ten, setTen] = useState(y.kind === 'time' ? y.name : '');
  // Tiền
  const [tien, setTien] = useState(y.kind === 'money' ? nhom(y.vnd) : '');
  const [cell, setCell] = useState<MoneyFlowCell>(
    y.kind === 'money' && (MONEY_FLOW_CELLS as readonly string[]).includes(y.cell)
      ? (y.cell as MoneyFlowCell)
      : 'monthlyExpense',
  );
  // Hạt
  const [chu, setChu] = useState(y.kind === 'grain' ? (y.text ?? '') : '');
  const [loaiHat, setLoaiHat] = useState(y.kind === 'grain' ? y.grain : 'candy');

  const phut = Math.round(Number(gio.replace(',', '.')) * 60);
  const vnd = docTien(tien);

  let hopLe = true;
  let moi: Intent = y;
  if (y.kind === 'time') {
    hopLe = Number.isInteger(phut) && phut > 0 && phut <= 1440;
    moi = { ...y, minutes: phut, bucket, name: ten.trim() || y.name, bucketGuessed: false };
  } else if (y.kind === 'money') {
    hopLe = Number.isFinite(vnd) && vnd > 0;
    moi = { ...y, vnd, cell };
  } else if (y.kind === 'grain') {
    moi = { ...y, text: chu.trim(), grain: loaiHat };
  }

  async function chay(viec: () => Promise<void>, ketQua: Intent | null): Promise<void> {
    setBusy(true);
    setLoi(null);
    try {
      await viec();
      onDone(ketQua);
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không lưu được.');
      setBusy(false);
    }
  }

  function luu(): void {
    if (y.kind === 'time' && moi.kind === 'time') {
      void chay(
        () =>
          store
            .updateTimeEntry(id, {
              minutes: moi.minutes,
              bucket: moi.bucket,
              // Có danh mục thì tên là tên danh mục, ghi chú để trống như lúc ghi.
              ...(y.categoryId === null ? { note: moi.name } : {}),
            })
            .then(() => undefined),
        moi,
      );
    } else if (y.kind === 'money' && moi.kind === 'money') {
      void chay(
        () =>
          store
            .updateMoneyEntry(id, {
              amount: moi.vnd,
              cell: moi.cell as MoneyFlowCell,
              // Đổi ô thì danh mục cũ (thuộc ô cũ) không còn đúng nữa.
              ...(moi.cell !== y.cell ? { categoryId: null } : {}),
            })
            .then(() => undefined),
        moi,
      );
    } else if (y.kind === 'grain' && moi.kind === 'grain') {
      void chay(
        () =>
          store
            .updateMoment(id, { text: moi.text === '' ? null : moi.text, kind: moi.grain })
            .then(() => undefined),
        moi,
      );
    }
  }

  function xoa(): void {
    void chay(async () => {
      if (y.kind === 'time') await store.deleteTimeEntry(id);
      else if (y.kind === 'money') await store.deleteMoneyEntry(id);
      else if (y.kind === 'grain') await store.deleteMoment(id);
      else if (y.kind === 'reminder') await store.deleteReminder(id);
    }, null);
  }

  return (
    <div className="suaghi">
      {y.kind === 'time' && (
        <>
          <div className="pills pills--small" style={{ flexWrap: 'wrap' }}>
            {TIME_BUCKETS.map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={bucket === b}
                onClick={() => setBucket(b)}
              >
                {BUCKET_LABEL_VI[b]}
              </button>
            ))}
          </div>
          {y.categoryId === null && (
            <input
              className="edit__text"
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              aria-label="Tên việc"
            />
          )}
          <div className="edit__row" style={{ marginTop: 10 }}>
            <input
              value={gio}
              onChange={(e) => setGio(e.target.value)}
              inputMode="decimal"
              aria-label="Số giờ"
            />
            <span className="sm">giờ</span>
          </div>
          {!hopLe && <p className="empty">Số giờ phải lớn hơn 0 và không quá 24.</p>}
        </>
      )}

      {y.kind === 'money' && (
        <>
          <div className="pills pills--small" style={{ flexWrap: 'wrap' }}>
            {MONEY_FLOW_CELLS.map((c) => (
              <button key={c} type="button" aria-pressed={cell === c} onClick={() => setCell(c)}>
                {MONEY_CELL_LABEL_VI[c]}
              </button>
            ))}
          </div>
          <div className="edit__row" style={{ marginTop: 10 }}>
            <input
              value={tien}
              onChange={(e) => setTien(e.target.value)}
              inputMode="text"
              aria-label="Số tiền"
              style={{ width: 160 }}
            />
            <span className="sm">đồng · gõ 60k, 1tr2 cũng được</span>
          </div>
          {!hopLe && <p className="empty">Chưa đọc được số tiền.</p>}
        </>
      )}

      {y.kind === 'grain' && (
        <>
          <div className="pills pills--small">
            <button
              type="button"
              aria-pressed={loaiHat === 'candy'}
              onClick={() => setLoaiHat('candy')}
            >
              Viên kẹo
            </button>
            <button
              type="button"
              aria-pressed={loaiHat === 'salt'}
              onClick={() => setLoaiHat('salt')}
            >
              Hạt muối
            </button>
          </div>
          <input
            className="edit__text"
            value={chu}
            onChange={(e) => setChu(e.target.value)}
            aria-label="Chữ của hạt"
          />
        </>
      )}

      {y.kind === 'reminder' && (
        <p className="sm" style={{ lineHeight: 1.55 }}>
          Nhắc lúc {y.at} · {shiftWeekday(y.days)}
          {y.text === null ? '' : ` · “${y.text}”`}. Muốn đổi giờ thì xoá rồi gõ lại một câu.
        </p>
      )}

      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)' }}>
          {loi}
        </p>
      )}

      <div className="suaghi__chan">
        {hoiXoa ? (
          <>
            <button type="button" className="edit__delete" disabled={busy} onClick={xoa}>
              {busy ? 'Đang xoá…' : 'Xoá hẳn'}
            </button>
            <button type="button" className="edit__cancel" onClick={() => setHoiXoa(false)}>
              Thôi
            </button>
          </>
        ) : (
          <button type="button" className="edit__openDelete" onClick={() => setHoiXoa(true)}>
            Xoá mục này
          </button>
        )}
        {y.kind !== 'reminder' && !hoiXoa && (
          <button type="button" className="edit__save" disabled={!hopLe || busy} onClick={luu}>
            {busy ? 'Đang lưu…' : 'Lưu'}
          </button>
        )}
      </div>
    </div>
  );
}
