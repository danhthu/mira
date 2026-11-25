import { useRef, useState } from 'react';
import { store } from '../../lib/store';
import { monthOf, today } from '../../lib/date';

/**
 * Mang dữ liệu vào và ra khỏi tài khoản.
 *
 * Nhập **thay toàn bộ** dữ liệu đang có của tài khoản này. Máy chủ làm việc đó trong một
 * transaction, nên hoặc cả bộ vào được, hoặc không có gì đổi — không có trạng thái nửa vời.
 *
 * File nhập vào có thể mang id cũ; máy chủ bỏ hết và cấp id mới, vì id trong file không
 * quyết định được dữ liệu thuộc về ai.
 */
interface Dem {
  gio: number;
  hat: number;
  thang: number;
  mucTieu: number;
  thoiQuen: number;
}

const moTa = (d: Dem) =>
  `${d.gio} mục giờ · ${d.hat} hạt · ${d.thang} tháng tiền · ${d.mucTieu} mục tiêu · ${d.thoiQuen} thói quen`;

function dem(raw: unknown): Dem | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const s = raw as Record<string, unknown>;
  const co = Array.isArray(s.timeEntries) || Array.isArray(s.moments) || typeof s.money === 'object';
  if (!co) return null;
  const n = (k: string) => (Array.isArray(s[k]) ? (s[k] as unknown[]).length : 0);
  return {
    gio: n('timeEntries'),
    hat: n('moments'),
    thang: typeof s.money === 'object' && s.money !== null ? Object.keys(s.money).length : 0,
    mucTieu: n('goals'),
    thoiQuen: n('habits'),
  };
}

/** Khoảng đủ rộng để gom hết: Mira mới có từ 2026. */
const TU = '2020-01-01';

export function NhapXuat() {
  const [choNhan, setChoNhan] = useState<{ raw: unknown; dem: Dem; ten: string } | null>(null);
  const [loi, setLoi] = useState<string | null>(null);
  const [xong, setXong] = useState<string | null>(null);
  const [dangChay, setDangChay] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function doc(text: string, ten: string): void {
    setXong(null);
    try {
      const raw: unknown = JSON.parse(text);
      const d = dem(raw);
      if (d === null) {
        setLoi('File không phải dữ liệu Mira. Cần một object JSON có timeEntries, moments hoặc money.');
        setChoNhan(null);
        return;
      }
      setLoi(null);
      setChoNhan({ raw, dem: d, ten });
    } catch {
      setLoi('File này không phải JSON, Mira không đọc được.');
      setChoNhan(null);
    }
  }

  async function nhan(): Promise<void> {
    if (choNhan === null) return;
    setDangChay(true);
    setLoi(null);
    try {
      const k = await store.importAll(choNhan.raw);
      setChoNhan(null);
      setXong(
        `Đã nhập ${k.gio} mục giờ, ${k.hat} hạt, ${k.thang} tháng tiền, ` +
          `${k.mucTieu} mục tiêu, ${k.thoiQuen} thói quen và ${k.lanDanhDau} lần đánh dấu.`,
      );
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không nhập được.');
    } finally {
      setDangChay(false);
    }
  }

  /** Gom mọi thứ từ máy chủ về đúng định dạng nhập lại được. */
  async function xuat(): Promise<void> {
    setDangChay(true);
    setLoi(null);
    try {
      const den = today();
      const [timeEntries, moments, goals] = await Promise.all([
        store.listTimeEntries(TU, den),
        store.listMoments(TU, den),
        store.listGoals(undefined, true),
      ]);

      // Tiền lưu theo tháng nên phải hỏi từng tháng; 36 tháng là quá đủ cho mọi tài khoản.
      const money: Record<string, unknown> = {};
      const nay = new Date(`${den}T00:00:00Z`);
      for (let i = 0; i < 36; i += 1) {
        const d = new Date(nay);
        d.setUTCMonth(d.getUTCMonth() - i);
        const thang = monthOf(d.toISOString().slice(0, 10));
        const { month } = await store.getMoney(thang);
        const coSo = [month.netIncome, month.monthlyExpense, month.debtPayment, month.debtBalance, month.netWorth]
          .some((x) => x !== null);
        if (coSo) money[thang] = month;
      }

      const tuan = await store.habitWeek(den);
      const habits = tuan.map((t) => t.habit);
      const habitChecks = tuan.flatMap((t) => t.dates.map((date) => ({ habitId: t.habit.id, date })));

      const bo = { timeEntries, moments, money, goals, habits, habitChecks };
      const url = URL.createObjectURL(new Blob([JSON.stringify(bo)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `mira-${den}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setXong(`Đã tải về ${moTa(dem(bo) ?? { gio: 0, hat: 0, thang: 0, mucTieu: 0, thoiQuen: 0 })}.`);
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không xuất được.');
    } finally {
      setDangChay(false);
    }
  }

  const nut = {
    flex: 1,
    borderRadius: 12,
    padding: '11px 14px',
    fontWeight: 600,
    opacity: dangChay ? 0.6 : 1,
  } as const;

  return (
    <>
      <div className="label" style={{ marginTop: 6 }}>
        Mang dữ liệu vào và ra
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            disabled={dangChay}
            onClick={() => inputRef.current?.click()}
            style={{ ...nut, background: 'var(--navy)', color: '#fff' }}
          >
            Nhập từ file
          </button>
          <button
            type="button"
            disabled={dangChay}
            onClick={() => void xuat()}
            style={{ ...nut, background: 'var(--surface)', border: '1.5px solid #E2E8F0' }}
          >
            Xuất ra file
          </button>
        </div>

        <input
          ref={inputRef}
          id="nhap-file"
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file === undefined) return;
            void file.text().then((t) => doc(t, file.name));
            event.target.value = '';
          }}
        />

        <p className="empty" style={{ marginTop: 12 }}>
          Nhập sẽ <b>thay toàn bộ</b> dữ liệu đang có của tài khoản này. Xuất ra file trước
          nếu còn cần.
        </p>
      </div>

      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)' }}>
          {loi}
        </p>
      )}
      {xong !== null && <p className="empty">{xong}</p>}

      {choNhan !== null && (
        <div className="card" style={{ border: '1.5px solid var(--amber)' }}>
          <div className="label" style={{ color: 'var(--amber)' }}>
            Xác nhận trước khi thay
          </div>
          <div className="sm" style={{ marginTop: 8 }}>
            {choNhan.ten}
          </div>
          <div style={{ fontSize: 15, marginTop: 6, lineHeight: 1.5 }}>{moTa(choNhan.dem)}</div>
          <p className="empty" style={{ marginTop: 10 }}>
            Toàn bộ dữ liệu đang có của tài khoản này sẽ bị thay. Không lấy lại được.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button
              type="button"
              disabled={dangChay}
              onClick={() => void nhan()}
              style={{ ...nut, background: 'var(--navy)', color: '#fff' }}
            >
              {dangChay ? 'Đang nhập…' : 'Thay và mở'}
            </button>
            <button
              type="button"
              disabled={dangChay}
              onClick={() => setChoNhan(null)}
              style={{ ...nut, background: 'var(--surface)', border: '1.5px solid #E2E8F0' }}
            >
              Thôi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
