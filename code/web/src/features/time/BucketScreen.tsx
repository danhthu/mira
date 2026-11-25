import { Link, useParams } from 'react-router-dom';
import { BUCKET_LABEL_VI, TIME_BUCKETS, type TimeBucket } from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { addDays, labelDay, today, weekStartOf } from '../../lib/date';
import { minutes as fmtMinutes, perMille } from '../../lib/format';

const MAU: Record<TimeBucket, string> = {
  work: 'var(--deep)',
  family: 'var(--green)',
  personal: 'var(--purple)',
  waste: 'var(--amber)',
};

/** Bốn tuần gần nhất đủ để thấy một nếp, chưa đủ dài để thành biểu đồ phải học cách đọc. */
const SO_TUAN = 4;

/**
 * Chi tiết một nhóm việc. Chạm vào lát donut hoặc dòng chú giải thì tới đây.
 *
 * Màn Thời gian trả lời "tuần này tôi tiêu giờ vào đâu". Màn này trả lời câu kế tiếp,
 * câu mà trước đây không có chỗ nào trả lời: "những giờ đó cụ thể là giờ nào".
 */
export function BucketScreen() {
  const { bucket } = useParams<{ bucket: string }>();
  const nhom = TIME_BUCKETS.find((b) => b === bucket) ?? null;

  const tuanNay = weekStartOf(today());
  const tuDau = addDays(tuanNay, -7 * (SO_TUAN - 1));

  const state = useAsync(async () => {
    if (nhom === null) return null;
    const [entries, ...tuan] = await Promise.all([
      store.listTimeEntries(tuDau, addDays(tuanNay, 6)),
      ...Array.from({ length: SO_TUAN }, (_, i) =>
        store.weekSummary(addDays(tuanNay, -7 * (SO_TUAN - 1 - i))),
      ),
    ]);
    return { entries: entries.filter((e) => e.bucket === nhom), tuan };
  }, [nhom, tuanNay]);

  if (nhom === null) {
    return (
      <div className="screen-body">
        <p className="empty">Không có nhóm việc nào tên như vậy.</p>
        <Link to="/thoi-gian" className="sm">
          Về màn Thời gian
        </Link>
      </div>
    );
  }

  const entries = [...(state.data?.entries ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const tuan = state.data?.tuan ?? [];
  const lat = tuan.map((w) => w.slices.find((s) => s.bucket === nhom) ?? null);
  const nayLat = lat[lat.length - 1] ?? null;
  const caoNhat = Math.max(1, ...lat.map((s) => s?.minutes ?? 0));

  const tong = entries.reduce((t, e) => t + e.minutes, 0);
  const vang = entries.filter((e) => e.golden).reduce((t, e) => t + e.minutes, 0);

  return (
    <div className="screen-body">
      <div className="row">
        <div className="title">{BUCKET_LABEL_VI[nhom]}</div>
        <Link to="/thoi-gian" className="sm">
          Về Thời gian
        </Link>
      </div>

      <div className="card">
        <div className="row">
          <div>
            <div className="big" style={{ color: MAU[nhom] }}>
              {nayLat === null ? '—' : fmtMinutes(nayLat.minutes)}
            </div>
            <div className="sm" style={{ marginTop: 4 }}>
              tuần này, {nayLat === null ? '—' : perMille(nayLat.perMille)} số giờ bạn thức
            </div>
          </div>
        </div>

        <div className="cot" style={{ marginTop: 16 }}>
          {lat.map((s, i) => {
            const cuoi = i === lat.length - 1;
            return (
              <div className="cot__i" key={i}>
                <span
                  style={{
                    height: `${Math.round(((s?.minutes ?? 0) * 100) / caoNhat)}%`,
                    background: cuoi ? MAU[nhom] : '#cfd7e2',
                  }}
                />
                <b className={cuoi ? 'is-on' : undefined}>
                  {s === null || s.minutes === 0 ? '—' : fmtMinutes(s.minutes)}
                </b>
                <span className="cot__n">{i === lat.length - 1 ? 'tuần này' : `${SO_TUAN - 1 - i} tuần trước`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {nhom === 'family' && vang > 0 && (
        <div className="card">
          <div className="label">Giờ vàng trong bốn tuần</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 10 }}>
            {fmtMinutes(vang)} trên {fmtMinutes(tong)}
          </div>
          <div className="sm" style={{ marginTop: 6 }}>
            Giờ vàng tính lúc bạn thật sự có mặt. Ngồi cùng nhà mà mỗi người một màn hình thì
            không tính.
          </div>
        </div>
      )}

      <div className="label" style={{ marginTop: 6 }}>
        Từng mục, bốn tuần gần đây
      </div>

      {state.loading && <p className="empty">Đang lấy số…</p>}

      {!state.loading && entries.length === 0 && (
        <p className="empty">Bốn tuần nay chưa ghi giờ nào vào nhóm này.</p>
      )}

      {entries.map((e) => (
        <div className="list-row" key={e.id}>
          <div className="list-icon" style={{ background: '#edeff3' }}>
            {e.golden ? '🕯️' : '•'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              {e.note === null || e.note.trim() === '' ? labelDay(e.date) : e.note}
            </div>
            <div className="sm" style={{ marginTop: 2 }}>
              {e.note === null || e.note.trim() === '' ? e.date : labelDay(e.date)}
            </div>
          </div>
          <div style={{ fontWeight: 700, color: MAU[nhom] }}>{fmtMinutes(e.minutes)}</div>
        </div>
      ))}
    </div>
  );
}
