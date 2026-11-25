import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BUCKET_LABEL_VI, TIME_BUCKETS, type TimeBucket } from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { addDays, labelDay, today, weekStartOf } from '../../lib/date';
import { minutes as fmtMinutes, perMille } from '../../lib/format';
import { Donut, Legend } from '../../ui/Donut';
import { GoiY, timNep } from './GoiY';
import { NepSection } from './NepSection';
import { DanhMucChon } from './DanhMucChon';

const COLOR: Record<TimeBucket, string> = {
  work: 'var(--deep)',
  family: 'var(--green)',
  personal: 'var(--purple)',
  waste: 'var(--amber)',
};

/**
 * Màn Thời gian. Donut là catalog nhóm việc — không có chỉ số nào gộp bốn nhóm thành
 * một con số, vì một con số duy nhất không nói được "tuần rồi tôi đã sống thế nào".
 */
export function TimeScreen() {
  const day = today();
  const week = weekStartOf(day);
  const state = useAsync(async () => {
    // Chạy nếp TRƯỚC khi đọc: hàng do nếp sinh phải có mặt trong tổng tuần ngay lần
    // mở đầu tiên, không phải chờ lần mở sau.
    const ngayNep = await store.chayNep(day);
    const [summary, entries, truoc, nep, danhMuc] = await Promise.all([
      store.weekSummary(week),
      store.listTimeEntries(week, addDays(week, 6)),
      // Bốn tuần trước, chỉ để tìm nếp cho gợi ý một chạm.
      store.listTimeEntries(addDays(week, -28), addDays(week, -1)),
      store.listNep(),
      store.listDanhMuc(),
    ]);
    return { summary, entries, truoc, nep, ngayNep, danhMuc };
  }, [week]);

  const [bucket, setBucket] = useState<TimeBucket>('family');
  const [hours, setHours] = useState('1');
  const [note, setNote] = useState('');
  const [danhMucId, setDanhMucId] = useState<string | null>(null);
  const [golden, setGolden] = useState(false);
  const [boGoiY, setBoGoiY] = useState(false);

  async function add(): Promise<void> {
    const value = Math.round(Number(hours.replace(',', '.')) * 60);
    if (!Number.isInteger(value) || value <= 0) return;
    await store.createTimeEntry({
      date: today(),
      minutes: value,
      bucket,
      golden: bucket === 'family' && golden,
      note: note.trim() === '' ? null : note.trim(),
      danhMucId,
    });
    setNote('');
    state.reload();
  }

  const summary = state.data?.summary ?? null;
  const entries = state.data?.entries ?? [];
  // Hôm nay đã ghi rồi thì không gợi ý nữa: gợi ý lúc đó chỉ mời ghi trùng.
  const daGhiHomNay = entries.some((e) => e.date === day);
  const nep =
    daGhiHomNay || boGoiY ? null : timNep([...(state.data?.truoc ?? []), ...entries], day);
  const family = summary?.slices.find((s) => s.bucket === 'family') ?? null;
  const prevFamily = summary?.previous?.slices.find((s) => s.bucket === 'family') ?? null;
  const prevWaste = summary?.previous?.slices.find((s) => s.bucket === 'waste') ?? null;
  const waste = summary?.slices.find((s) => s.bucket === 'waste') ?? null;

  const familyDiff =
    family !== null && prevFamily !== null ? family.minutes - prevFamily.minutes : null;
  const wasteDiff = waste !== null && prevWaste !== null ? waste.minutes - prevWaste.minutes : null;
  const goldenShare =
    summary !== null && family !== null && family.minutes > 0
      ? Math.round((summary.goldenMinutes * 100) / family.minutes)
      : 0;

  return (
    <div className="screen-body">
      <div className="row">
        <div className="title">Thời gian</div>
        <div className="sm">{labelDay(day)}</div>
      </div>

      {nep !== null && (
        <GoiY
          nep={nep}
          onGhi={async (entry) => {
            await store.createTimeEntry(entry);
            state.reload();
          }}
          onKhac={() => setBoGoiY(true)}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
        <Donut
          parts={(summary?.slices ?? []).map((s) => ({
            color: COLOR[s.bucket],
            value: s.perMille / 10,
          }))}
        >
          <div style={{ fontSize: 23, fontWeight: 700 }}>
            {summary === null ? '—' : fmtMinutes(summary.wakingMinutes)}
          </div>
          <div className="sm" style={{ marginTop: 2 }}>
            giờ tỉnh
          </div>
        </Donut>
        <Legend
          rows={TIME_BUCKETS.map((b) => {
            const slice = summary?.slices.find((s) => s.bucket === b) ?? null;
            return {
              color: COLOR[b],
              label: BUCKET_LABEL_VI[b],
              value: slice === null ? '—' : perMille(slice.perMille),
              to: `/thoi-gian/${b}`,
            };
          })}
        />
      </div>

      <div className="card">
        <div className="label">Trong giờ gia đình</div>
        <div className="split">
          <i style={{ width: `${goldenShare}%`, background: 'var(--green)' }} />
          <i style={{ width: `${100 - goldenShare}%`, background: '#cbe2d8' }} />
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            Giờ vàng {summary === null ? '—' : fmtMinutes(summary.goldenMinutes)}
          </div>
          <div style={{ fontSize: 15, color: 'var(--fg-dim)' }}>
            Còn lại{' '}
            {summary === null || family === null
              ? '—'
              : fmtMinutes(Math.max(0, family.minutes - summary.goldenMinutes))}
          </div>
        </div>
        <div className="sm" style={{ marginTop: 9 }}>
          Giờ vàng tính lúc bạn thật sự có mặt. Ngồi cùng nhà mà mỗi người một màn hình thì
          không tính.
        </div>
      </div>

      {summary?.previous != null && (
        <div className="card">
          <span className="flag ok">So với tuần trước</span>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 12 }}>
            {familyDiff === null || familyDiff === 0
              ? 'Giờ gia đình gần như không đổi'
              : familyDiff > 0
                ? `Giờ gia đình nhiều hơn ${fmtMinutes(familyDiff)}`
                : `Giờ gia đình ít hơn ${fmtMinutes(-familyDiff)}`}
          </div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8, lineHeight: 1.5 }}>
            {wasteDiff === null || wasteDiff === 0
              ? 'Lãng phí gần như không đổi.'
              : wasteDiff < 0
                ? `Lãng phí giảm ${fmtMinutes(-wasteDiff)}.`
                : `Lãng phí tăng ${fmtMinutes(wasteDiff)}.`}
          </div>
          <div className="statrow">
            <div>
              <div className="n">{fmtMinutes(summary.loggedMinutes)}</div>
              <div className="sm">Đã ghi</div>
            </div>
            <div>
              <div className="n" style={{ color: 'var(--green)' }}>
                {family === null ? '—' : fmtMinutes(family.minutes)}
              </div>
              <div className="sm">Gia đình</div>
            </div>
            <div>
              <div className="n" style={{ color: 'var(--amber)' }}>
                {waste === null ? '—' : fmtMinutes(waste.minutes)}
              </div>
              <div className="sm">Lãng phí</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="label">Ghi hôm nay</div>
        <div className="pills" style={{ marginTop: 10, flexWrap: 'wrap' }}>
          {TIME_BUCKETS.map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={bucket === b}
              onClick={() => {
                setBucket(b);
                // Danh mục thuộc về đúng một ô, nên đổi ô thì bỏ chọn.
                setDanhMucId(null);
              }}
            >
              {BUCKET_LABEL_VI[b]}
            </button>
          ))}
        </div>
        <DanhMucChon
          danhMuc={state.data?.danhMuc ?? []}
          bucket={bucket}
          chon={danhMucId}
          onChon={setDanhMucId}
          onTaoXong={(dm) => {
            setDanhMucId(dm.id);
            state.reload();
          }}
        />

        {/* Ghi chú. Danh mục nói việc gì; ghi chú nói riêng hôm nay thế nào. */}
        <input
          id="time-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void add();
          }}
          placeholder="Thêm một dòng cho hôm nay (không bắt buộc)"
          style={{
            width: '100%',
            marginTop: 12,
            background: 'var(--surface)',
            border: '1.5px solid #d7dfe9',
            borderRadius: 12,
            padding: '10px 13px',
            fontSize: 16,
          }}
        />

        <div className="row" style={{ marginTop: 12 }}>
          <input
            id="time-hours"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            inputMode="decimal"
            style={{
              width: 90,
              background: 'var(--surface)',
              border: '1.5px solid #d7dfe9',
              borderRadius: 12,
              padding: '10px 12px',
              fontSize: 16,
            }}
          />
          <span className="sm">giờ</span>
          <button
            type="button"
            onClick={() => void add()}
            style={{
              marginLeft: 'auto',
              background: 'var(--navy)',
              color: '#fff',
              borderRadius: 12,
              padding: '10px 18px',
              fontWeight: 600,
            }}
          >
            Thêm
          </button>
        </div>
        {bucket === 'family' && (
          <label
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 14 }}
          >
            <input
              id="time-golden"
              type="checkbox"
              checked={golden}
              onChange={(event) => setGolden(event.target.checked)}
            />
            Giờ vàng: thật sự có mặt
          </label>
        )}
      </div>

      <NepSection
        nep={state.data?.nep ?? []}
        ngay={state.data?.ngayNep ?? []}
        homNay={day}
        onDoi={state.reload}
      />

      <div className="row" style={{ marginTop: 6 }}>
        <div className="label">Ghi gần đây</div>
        <Link to={`/thoi-gian/${bucket}`} className="sm">
          Xem {BUCKET_LABEL_VI[bucket].toLowerCase()} ›
        </Link>
      </div>
      {entries.length === 0 ? (
        <p className="empty">Tuần này chưa ghi giờ nào.</p>
      ) : (
        entries.slice(0, 6).map((entry) => (
          <div className="list-row" key={entry.id}>
            <div className="list-icon" style={{ background: '#edeff3' }}>
              {entry.golden ? '🕯️' : '•'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{BUCKET_LABEL_VI[entry.bucket]}</div>
              <div className="sm">{entry.date}</div>
            </div>
            <div style={{ fontWeight: 700, color: COLOR[entry.bucket] }}>
              {fmtMinutes(entry.minutes)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
