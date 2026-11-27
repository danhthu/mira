import { useState } from 'react';
import { BUCKET_LABEL_VI, TIME_BUCKETS, type TimeBucket } from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { addDays, labelDay, today, weekStartOf } from '../../lib/date';
import { minutes as fmtMinutes, perMille } from '../../lib/format';
import { Donut, Legend, type LegendRow } from '../../ui/Donut';
import { Suggestion, findRoutine } from './Suggestion';
import { RoutineSection } from './RoutineSection';
import { CategoryPicker } from './CategoryPicker';
import { BUCKET_FILL } from '../../lib/bucketColors';
import { GOLDEN_HOURS } from '../../lib/features';
import { Sheet } from '../../ui/Sheet';
import { AddButton } from '../../ui/AddButton';
import { TimeCatalog } from './TimeCatalog';
import { Icon } from '../../ui/Icon';
import { ownTimeMinutes, ownTimePerMille } from '../../lib/ownTime';
import { topWaste, wasteName, wasteTrend } from '../../lib/waste';
import { WasteBand } from '../../ui/WasteBand';

const COLOR = BUCKET_FILL;

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
    const ngayNep = await store.runRoutines(day);
    const [summary, entries, previous, nep, categories] = await Promise.all([
      store.weekSummary(week),
      store.listTimeEntries(week, addDays(week, 6)),
      // Bốn tuần trước, chỉ để tìm nếp cho gợi ý một chạm.
      store.listTimeEntries(addDays(week, -28), addDays(week, -1)),
      store.listRoutines(),
      store.listCategories(),
    ]);
    return { summary, entries, previous, nep, ngayNep, categories };
  }, [week]);

  const [bucket, setBucket] = useState<TimeBucket>('family');
  const [hours, setHours] = useState('1');
  const [note, setNote] = useState('');
  const [categoryId, setDanhMucId] = useState<string | null>(null);
  const [golden, setGolden] = useState(false);
  const [dismissSuggestion, setBoGoiY] = useState(false);
  // Thẻ "Ghi hôm nay" chuyển vào khay sau nút cộng, giống màn Tài chính: màn hình là chỗ
  // ĐỌC, khay là chỗ GHI. Trộn hai việc vào một dòng cuộn thì cả hai đều phải cuộn.
  const [sheetOpen, setMoKhay] = useState(false);

  async function add(): Promise<void> {
    const value = Math.round(Number(hours.replace(',', '.')) * 60);
    if (!Number.isInteger(value) || value <= 0) return;
    await store.createTimeEntry({
      date: today(),
      minutes: value,
      bucket,
      golden: bucket === 'family' && golden,
      note: note.trim() === '' ? null : note.trim(),
      categoryId,
    });
    setNote('');
    setMoKhay(false);
    state.reload();
  }

  const summary = state.data?.summary ?? null;
  const entries = state.data?.entries ?? [];
  // Hôm nay đã ghi rồi thì không gợi ý nữa: gợi ý lúc đó chỉ mời ghi trùng.
  const loggedToday = entries.some((e) => e.date === day);
  const nep =
    loggedToday || dismissSuggestion
      ? null
      : findRoutine([...(state.data?.previous ?? []), ...entries], day);
  const family = summary?.slices.find((s) => s.bucket === 'family') ?? null;
  const prevFamily = summary?.previous?.slices.find((s) => s.bucket === 'family') ?? null;
  const waste = summary?.slices.find((s) => s.bucket === 'waste') ?? null;

  const familyDiff =
    family !== null && prevFamily !== null ? family.minutes - prevFamily.minutes : null;
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
        <Suggestion
          nep={nep}
          onSave={async (entry) => {
            await store.createTimeEntry(entry);
            state.reload();
          }}
          onDismiss={() => setBoGoiY(true)}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
        <Donut
          parts={(summary?.slices ?? []).map((s) => ({
            color: COLOR[s.bucket],
            value: s.perMille / 10,
          }))}
        >
          {/* Tâm vòng nói ĐÃ GHI bao nhiêu trên bao nhiêu giờ tỉnh. Trước đây chỉ có "119h
              giờ tỉnh", nên nửa vòng xám không ai biết là gì và mọi phần trăm bên cạnh
              trông nhỏ đi một nửa. */}
          <div style={{ fontSize: 23, fontWeight: 700 }}>
            {summary === null ? '—' : fmtMinutes(summary.loggedMinutes)}
          </div>
          <div className="sm" style={{ marginTop: 2 }}>
            {summary === null ? 'giờ tỉnh' : `đã ghi / ${fmtMinutes(summary.wakingMinutes)}`}
          </div>
        </Donut>
        <Legend
          rows={TIME_BUCKETS.map((b): LegendRow => {
            const slice = summary?.slices.find((s) => s.bucket === b) ?? null;
            return {
              color: COLOR[b],
              label: BUCKET_LABEL_VI[b],
              value: slice === null ? '—' : perMille(slice.perMille),
              to: `/thoi-gian/${b}`,
            };
          }).concat(
            // Phần xám của vòng phải có tên. Không có dòng này thì cột phần trăm cộng lại
            // chỉ được một nửa mà không ai giải thích vì sao.
            summary === null
              ? []
              : [
                  {
                    color: 'var(--line)',
                    label: 'Chưa ghi',
                    value: perMille(
                      Math.max(0, 1000 - summary.slices.reduce((t, s) => t + s.perMille, 0)),
                    ),
                    valueColor: 'var(--fg-dim)',
                  },
                ],
          )}
        />
      </div>

      {/* Dải giữa màn, y khuôn "Mức dư tháng này" bên Tài chính: một con số liếc là biết. */}
      <ChoMinh
        perMille={summary === null ? null : ownTimePerMille(summary.slices, summary.loggedMinutes)}
        phut={summary === null ? 0 : ownTimeMinutes(summary.slices)}
        daGhi={summary?.loggedMinutes ?? 0}
      />

      <WasteBand
        to="/thoi-gian/waste"
        title="Lãng phí tuần này"
        value={waste === null || waste.minutes === 0 ? null : fmtMinutes(waste.minutes)}
        // Không ghi phần trăm: vòng tròn ngay trên đã có "Lãng phí x%" (chia giờ tỉnh). Ghi thêm
        // một phần trăm khác mẫu số ở đây thì hai con số cãi nhau trên cùng một màn.
        share={null}
        top={topWaste(
          entries
            .filter((e) => e.bucket === 'waste')
            .map((e) => ({
              name: wasteName(
                (state.data?.categories ?? []).find((c) => c.id === e.categoryId)?.name,
                e.note,
              ),
              amount: e.minutes,
            })),
        ).map((t) => ({ name: t.name, value: fmtMinutes(t.amount) }))}
        trend={wasteTrend(
          waste?.minutes ?? 0,
          // Cùng kỳ tuần trước: từ đầu tuần trước tới đúng thứ này của tuần trước.
          (state.data?.previous ?? []).some((e) => e.date >= addDays(week, -7))
            ? (state.data?.previous ?? [])
                .filter(
                  (e) =>
                    e.bucket === 'waste' &&
                    e.date >= addDays(week, -7) &&
                    e.date <= addDays(day, -7),
                )
                .reduce((t, e) => t + e.minutes, 0)
            : null,
          fmtMinutes,
          'cùng kỳ tuần trước',
          15,
        )}
        empty="Tuần này chưa ghi giờ lãng phí nào. Gõ “lướt điện thoại 1 tiếng” bên Nhật ký là có."
      />

      {GOLDEN_HOURS && (
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
            Giờ vàng tính lúc bạn thật sự có mặt. Ngồi cùng nhà mà mỗi người một màn hình thì không
            tính.
          </div>
        </div>
      )}

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

      <AddButton label="Ghi giờ hôm nay" onPress={() => setMoKhay(true)} />

      <Sheet
        open={sheetOpen}
        headline={`Ghi giờ · ${labelDay(day)}`}
        onClose={() => setMoKhay(false)}
      >
        <div className="pills" style={{ flexWrap: 'wrap' }}>
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
        <CategoryPicker
          categories={state.data?.categories ?? []}
          bucket={bucket}
          pick={categoryId}
          onPick={setDanhMucId}
          onCreated={(dm) => {
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
              background: 'var(--brand)',
              color: '#fff',
              borderRadius: 12,
              padding: '10px 18px',
              fontWeight: 600,
            }}
          >
            Thêm
          </button>
        </div>
        {GOLDEN_HOURS && bucket === 'family' && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 12,
              fontSize: 14,
            }}
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
      </Sheet>

      <RoutineSection
        nep={state.data?.nep ?? []}
        ngay={state.data?.ngayNep ?? []}
        homNay={day}
        onChanged={state.reload}
      />

      {/* Catalog: tầng giữa, y khuôn màn Tài chính.
          Donut nói "công việc 89%", danh sách dưới nói "8h, 2h, 8h…". Câu người ta thật
          sự hỏi nằm ở giữa — tuần này HỌP mất mấy giờ — và trước đây không chỗ nào trả
          lời. Bấm một dòng thì xuống /thoi-gian/:bucket xem từng mục. */}
      <TimeCatalog entries={entries} categories={state.data?.categories ?? []} />

      {/* Danh sách "Ghi gần đây" đã bỏ 27/11/2026 theo ý Founder. Sửa và xoá từng mục vẫn
          có ở /thoi-gian/:bucket — bấm một dòng catalog hay một dòng chú thích của vòng. */}
      {!state.loading && entries.length === 0 && (
        <p className="empty">Tuần này chưa ghi giờ nào.</p>
      )}
    </div>
  );
}

/**
 * Dải "cho mình và gia đình tuần này": giờ gia đình cộng giờ cá nhân, trên giờ đã ghi.
 *
 * Dùng lại khuôn .mucdu của Tài chính. Thước năm nấc cũng là thước, không phải biểu đồ:
 * 0, 10%, 20%, 30%, 40% trở lên.
 */
function ChoMinh({
  perMille: pm,
  phut,
  daGhi,
}: {
  readonly perMille: number | null;
  readonly phut: number;
  readonly daGhi: number;
}) {
  const nac = pm === null ? -1 : Math.min(4, Math.floor(pm / 100));

  return (
    <div className="mucdu">
      <div className="mucdu__dau">
        <Icon name="heart" size={19} />
        <span>Cho mình và gia đình</span>
      </div>
      <div className="mucdu__thuoc" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <i
            key={i}
            className={i <= nac ? 'is-on' : undefined}
            style={{ height: `${(i + 1) * 20}%` }}
          />
        ))}
      </div>
      <b>{perMille(pm)}</b>
      <div className="mucdu__chu">
        {pm === null
          ? 'Ghi giờ tuần này thì dải này có số.'
          : `${fmtMinutes(phut)} gia đình và cá nhân, trên ${fmtMinutes(daGhi)} đã ghi tuần này.`}
      </div>
    </div>
  );
}
