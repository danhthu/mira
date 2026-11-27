import { Link, useParams } from 'react-router-dom';
import { BUCKET_LABEL_VI, TIME_BUCKETS, type Category } from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { addDays, today, weekStartOf } from '../../lib/date';
import { minutes as fmtMinutes, perMille } from '../../lib/format';
import { groupEntries, isGroup } from '../../lib/group';
import { CategoryManager } from './CategoryManager';
import { Dong, GroupRow } from './EntryRow';
import { BUCKET_FILL } from '../../lib/bucketColors';
import { GOLDEN_HOURS } from '../../lib/features';

const MAU = BUCKET_FILL;

/** Bốn tuần gần nhất đủ để thấy một nếp, chưa đủ dài để thành biểu đồ phải học cách đọc. */
const WEEK_COUNT = 4;

/**
 * Chi tiết một nhóm việc. Chạm vào lát donut hoặc dòng chú giải thì tới đây.
 *
 * Màn Thời gian trả lời "tuần này tôi tiêu giờ vào đâu". Màn này trả lời câu kế tiếp,
 * câu mà trước đây không có chỗ nào trả lời: "những giờ đó cụ thể là giờ nào".
 */
export function BucketScreen() {
  const { bucket } = useParams<{ bucket: string }>();
  const group = TIME_BUCKETS.find((b) => b === bucket) ?? null;

  const tuanNay = weekStartOf(today());
  const tuDau = addDays(tuanNay, -7 * (WEEK_COUNT - 1));

  const state = useAsync(async () => {
    if (group === null) return null;
    const categories = await store.listCategories();
    const [entries, ...tuan] = await Promise.all([
      store.listTimeEntries(tuDau, addDays(tuanNay, 6)),
      ...Array.from({ length: WEEK_COUNT }, (_, i) =>
        store.weekSummary(addDays(tuanNay, -7 * (WEEK_COUNT - 1 - i))),
      ),
    ]);
    return { entries: entries.filter((e) => e.bucket === group), tuan, categories };
  }, [group, tuanNay]);

  if (group === null) {
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
  const slice = tuan.map((w) => w.slices.find((s) => s.bucket === group) ?? null);
  const nayLat = slice[slice.length - 1] ?? null;
  const caoNhat = Math.max(1, ...slice.map((s) => s?.minutes ?? 0));

  const total = entries.reduce((t, e) => t + e.minutes, 0);
  const vang = entries.filter((e) => e.golden).reduce((t, e) => t + e.minutes, 0);
  const dungNhat = Math.max(1, ...entries.map((e) => e.minutes));
  const gom = groupEntries(entries);
  // Tra tên danh mục một lần cho cả danh sách, kể cả danh mục đã cất: mục giờ cũ vẫn
  // trỏ về nó và vẫn phải đọc được tên.
  const theoId = new Map((state.data?.categories ?? []).map((d) => [d.id, d]));
  const categoryOf = (id: string | null): Category | null =>
    id === null ? null : (theoId.get(id) ?? null);

  return (
    <div className="screen-body">
      <div className="row">
        <div className="title">{BUCKET_LABEL_VI[group]}</div>
        <Link to="/thoi-gian" className="sm">
          Về Thời gian
        </Link>
      </div>

      <div className="card">
        <div className="row">
          <div>
            <div className="big" style={{ color: MAU[group] }}>
              {nayLat === null ? '—' : fmtMinutes(nayLat.minutes)}
            </div>
            <div className="sm" style={{ marginTop: 4 }}>
              tuần này, {nayLat === null ? '—' : perMille(nayLat.perMille)} số giờ bạn thức
            </div>
          </div>
        </div>

        <div className="bars" style={{ marginTop: 16 }}>
          {slice.map((s, i) => {
            const last = i === slice.length - 1;
            return (
              <div className="bars__i" key={i}>
                <span
                  style={{
                    height: `${Math.round(((s?.minutes ?? 0) * 100) / caoNhat)}%`,
                    background: last ? MAU[group] : '#cfd7e2',
                  }}
                />
                <b className={last ? 'is-on' : undefined}>
                  {s === null || s.minutes === 0 ? '—' : fmtMinutes(s.minutes)}
                </b>
                <span className="bars__label">{i === slice.length - 1 ? 'tuần này' : `${WEEK_COUNT - 1 - i} tuần trước`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {GOLDEN_HOURS && group === 'family' && vang > 0 && (
        <div className="card">
          <div className="label">Giờ vàng trong bốn tuần</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 10 }}>
            {fmtMinutes(vang)} trên {fmtMinutes(total)}
          </div>
          <div className="sm" style={{ marginTop: 6 }}>
            Giờ vàng tính lúc bạn thật sự có mặt. Ngồi cùng nhà mà mỗi người một màn hình thì
            không tính.
          </div>
        </div>
      )}

      <CategoryManager
        bucket={group}
        categories={(state.data?.categories ?? []).filter((d) => d.bucket === group)}
        onChanged={state.reload}
      />

      <div className="row" style={{ marginTop: 6 }}>
        <div className="label">Từng mục, bốn tuần gần đây</div>
        {gom.length < entries.length && (
          <div className="sm">
            {entries.length} mục, gom còn {gom.length}
          </div>
        )}
      </div>

      {state.loading && <p className="empty">Đang lấy số…</p>}

      {!state.loading && entries.length === 0 && (
        <p className="empty">Bốn tuần nay chưa ghi giờ nào vào nhóm này.</p>
      )}

      {gom.length > 0 && (
        <div className="list">
          {gom.map((x) =>
            isGroup(x) ? (
              <GroupRow
                key={`${x.bucket}|${x.categoryId ?? x.note}|${x.golden}`}
                group={x}
                color={MAU[group]}
                dungNhat={dungNhat}
                onChanged={state.reload}
                categoryOf={categoryOf}
              />
            ) : (
              <Dong
                key={x.id}
                e={x}
                color={MAU[group]}
                dungNhat={dungNhat}
                onChanged={state.reload}
                categoryOf={categoryOf}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}
