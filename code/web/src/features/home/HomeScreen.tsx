import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BUCKET_LABEL_VI, type MomentKind } from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { addDays, labelDay, monthOf, today, weekStartOf } from '../../lib/date';
import { minutes as fmtMinutes, months as fmtMonths, perMille, UNKNOWN } from '../../lib/format';
import { GOLDEN_HOURS } from '../../lib/features';
import { Grain, Jar } from '../../ui/Grain';
import { oldGrainCaption, oldGrainRange, pickOldGrain } from '../../lib/oldGrain';

/**
 * Màn Nhật ký. Thứ tự trên màn này là kết quả của mô phỏng 300 persona, không phải chọn
 * cho đẹp:
 *
 *   1. **Ô viết trên cùng.** Giảm ma sát ghi là đòn bẩy +39%. Bản cũ để ô viết ở đáy,
 *      dưới bốn thẻ số — muốn ghi một câu phải cuộn qua hết phần thống kê. Đọc số là
 *      việc thỉnh thoảng, ghi là việc mỗi ngày; việc mỗi ngày phải đứng trước.
 *   2. **Hạt cũ nổi lên.** Đòn bẩy mạnh nhất, +49%.
 *   3. **Bốn thẻ trụ**, đều bấm được.
 *
 * Thẻ Thời gian KHÔNG hiện "tổng đã ghi". Tổng đã ghi chót cả ba bảng đo: phân biệt
 * 0,11 và chỉ đổi 3% giữa các tuần, nghĩa là nó gần như không bao giờ có tin mới.
 *
 * Chỗ đó từng là **giờ vàng**, thứ đứng đầu bảng với 42%. Founder tạm bỏ khái niệm giờ
 * vàng ngày 25/11/2026, nên giờ là cả giờ **Gia đình** — thước đo gần nhất còn lại, và
 * vẫn đổi theo tuần đủ để mang tin. Công tắc ở `lib/features.test.ts`.
 */
export function HomeScreen() {
  const day = today();
  const week = weekStartOf(day);
  const month = monthOf(day);

  const state = useAsync(async () => {
    const monthStart = `${month}-01`;
    const [cuTu, cuDen] = oldGrainRange(day);
    const [summary, moments, money, habits, budget, hatCu] = await Promise.all([
      store.weekSummary(week),
      store.listMoments(monthStart, addDays(monthStart, 40)),
      store.getMoney(month),
      store.habitWeek(week),
      store.goalBudget(week),
      store.listMoments(cuTu, cuDen),
    ]);
    return { summary, moments, money, habits, budget, hatCu };
  }, [week, month, day]);

  const [text, setText] = useState('');
  const [kind, setKind] = useState<MomentKind>('candy');
  const [saving, setSaving] = useState(false);

  async function submit(): Promise<void> {
    setSaving(true);
    try {
      await store.createMoment({ date: day, kind, text });
      setText('');
      state.reload();
    } finally {
      setSaving(false);
    }
  }

  const summary = state.data?.summary ?? null;
  const family = summary?.slices.find((s) => s.bucket === 'family') ?? null;

  /**
   * Con số lớn trên thẻ Thời gian.
   *
   * Giờ vàng đang tắt, nên nó là cả giờ Gia đình. Bật lại thì quay về phần vàng — một
   * chỗ đổi, không phải rải `GIO_VANG` khắp phần vẽ.
   */
  const gioChinh = GOLDEN_HOURS ? (summary?.goldenMinutes ?? null) : (family?.minutes ?? null);

  /**
   * Phần trăm của thanh dưới con số.
   *
   * Khi còn giờ vàng thì thanh đo "bao nhiêu phần giờ Gia đình là thật sự có mặt". Bỏ
   * giờ vàng thì phép chia ấy thành `family / family` = 100% mãi mãi — một thanh luôn
   * đầy không nói gì cả. Nên đổi mẫu số sang **tổng giờ đã ghi trong tuần**: Gia đình
   * chiếm bao nhiêu phần tuần của bạn.
   */
  const thanhPhanTram = (() => {
    if (GOLDEN_HOURS) {
      if (family === null || family.minutes === 0) return 0;
      return Math.min(100, ((summary?.goldenMinutes ?? 0) * 100) / family.minutes);
    }
    const total = summary?.loggedMinutes ?? 0;
    if (total === 0 || family === null) return 0;
    return Math.min(100, (family.minutes * 100) / total);
  })();
  const moments = state.data?.moments ?? [];
  const candies = moments.filter((m) => m.kind === 'candy').length;
  const salts = moments.length - candies;
  const derived = state.data?.money.derived ?? null;
  // Nhịp tuần của Mira là thói quen: đếm theo tuần, không theo chuỗi ngày.
  const habits = state.data?.habits ?? [];
  const habitDone = habits.reduce((total, w) => total + w.done, 0);
  const habitTarget = habits.reduce((total, w) => total + w.habit.targetPerWeek, 0);

  const previousFamily =
    summary?.previous?.slices.find((s) => s.bucket === 'family')?.minutes ?? null;
  const diff = family !== null && previousFamily !== null ? family.minutes - previousFamily : null;

  const hatCu = pickOldGrain(state.data?.hatCu ?? []);

  return (
    <div className="screen-body">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="title">{labelDay(day)}</div>
          <div className="sm" style={{ marginTop: 3 }}>
            Mira
          </div>
        </div>
        {/* Tab "Tôi" đã rút khỏi thanh dưới để nhường chỗ cho Sáu tháng. Đây là cửa vào. */}
        <Link to="/toi" className="sm" aria-label="Màn Tôi">
          Tôi ›
        </Link>
      </div>

      <div className="label" style={{ marginTop: 11 }}>
        Hôm nay có gì
      </div>

      <input
        id="moment-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') void submit();
        }}
        placeholder="Viết một câu là đủ…"
        style={{
          background: 'var(--surface)',
          border: '1.5px solid #d7dfe9',
          borderRadius: 15,
          padding: '13px 17px',
          fontSize: 16,
          width: '100%',
        }}
      />

      <div style={{ display: 'flex', gap: 12 }}>
        {(['candy', 'salt'] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={kind === option}
            onClick={() => setKind(option)}
            style={{
              flex: 1,
              background: kind === option ? 'var(--navy)' : 'var(--surface)',
              color: kind === option ? '#fff' : 'inherit',
              border: `1.5px solid ${kind === option ? 'var(--navy)' : '#e2e8f0'}`,
              borderRadius: 14,
              padding: '14px 15px',
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            <Grain kind={option} />
            {option === 'candy' ? 'Viên kẹo' : 'Hạt muối'}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={saving}
        style={{
          background: 'var(--navy)',
          color: '#fff',
          borderRadius: 14,
          padding: '13px 15px',
          fontWeight: 600,
          opacity: saving ? 0.6 : 1,
        }}
      >
        Bỏ vào hũ
      </button>

      {hatCu !== null && (
        <div className="cu">
          <div className="cu__k">{oldGrainCaption(hatCu.date, day)}</div>
          <p className="cu__t">“{hatCu.text}”</p>
          <Link to="/hu" className="sm" style={{ display: 'inline-block', marginTop: 10 }}>
            Mở hũ
          </Link>
        </div>
      )}

      <div className="grid2">
        <Link to="/hu" className="card card-link">
          <div className="label">
            Hũ <span className="goc">›</span>
          </div>
          <Jar kinds={moments.slice(0, 24).map((m) => m.kind)} />
          <div className="sm" style={{ marginTop: 10 }}>
            {moments.length === 0 ? 'Chưa có hạt nào' : `${candies} kẹo · ${salts} muối`}
          </div>
        </Link>

        <Link to="/thoi-gian" className="card card-link">
          <div className="label">
            Thời gian <span className="goc">›</span>
          </div>
          {/* KHÔNG phải "tổng đã ghi". Tổng đã ghi chót cả ba bảng đo: phân biệt 0,11
              và chỉ đổi 3% giữa các tuần, nên nó gần như không bao giờ mang tin mới.
              Trước đây chỗ này là giờ vàng — Founder tạm bỏ khái niệm đó ngày
              25/11/2026, nên giờ là cả giờ Gia đình, thước đo gần nhất còn lại. */}
          <div className="big" style={{ color: 'var(--green)', marginTop: 8 }}>
            {gioChinh === null || gioChinh === 0 ? UNKNOWN : fmtMinutes(gioChinh)}
          </div>
          <div className="sm" style={{ marginTop: 4 }}>
            {GOLDEN_HOURS ? 'Giờ vàng tuần này' : 'Gia đình tuần này'}
          </div>
          <div className="bar">
            <i
              style={{
                width: `${thanhPhanTram}%`,
                background: 'var(--green)',
              }}
            />
          </div>
          <div className="sm" style={{ marginTop: 9 }}>
            {diff === null
              ? `${BUCKET_LABEL_VI.family} ${family === null ? UNKNOWN : fmtMinutes(family.minutes)}`
              : diff === 0
                ? 'Bằng tuần trước'
                : diff > 0
                  ? `Nhiều hơn tuần trước ${fmtMinutes(diff)}`
                  : `Ít hơn tuần trước ${fmtMinutes(-diff)}`}
          </div>
        </Link>

        <Link to="/tai-chinh" className="card card-link">
          <div className="label">
            Tài chính <span className="goc">›</span>
          </div>
          <div className="big" style={{ marginTop: 8 }}>
            {fmtMonths(derived?.freeCapitalMonths ?? null)}
          </div>
          <div className="sm" style={{ marginTop: 4 }}>
            Tháng sống được nếu dừng
          </div>
          <div className="bar">
            <i
              style={{
                width: `${Math.min(100, (derived?.freeCapitalMonths ?? 0) * 4)}%`,
                background: 'var(--deep)',
              }}
            />
          </div>
          <div className="sm" style={{ marginTop: 9 }}>
            Mức dư {perMille(derived?.surplusPerMille ?? null)}
          </div>
        </Link>

        <Link to="/muc-tieu" className="card card-link">
          <div className="label">
            Mục tiêu <span className="goc">›</span>
          </div>
          <div className="big" style={{ marginTop: 8 }}>
            {habits.length === 0 ? UNKNOWN : `${habitDone}/${habitTarget}`}
          </div>
          <div className="sm" style={{ marginTop: 4 }}>
            Thói quen tuần này
          </div>
          <div className="bar">
            <i
              style={{
                width: `${habitTarget === 0 ? 0 : Math.min(100, (habitDone * 100) / habitTarget)}%`,
                background: 'var(--green)',
              }}
            />
          </div>
          <div className="sm" style={{ marginTop: 9 }}>
            {state.data === null || state.data.budget.shortfallMinutes === 0
              ? 'Đủ giờ để làm'
              : `Thiếu ${fmtMinutes(state.data.budget.shortfallMinutes)}`}
          </div>
        </Link>
      </div>

      <p className="empty">
        Vàng ấm là ngày vui, xanh nguội là ngày nặng. Mỗi hạt muối Mira hỏi lại đúng một lần, sau 42
        ngày.
      </p>
    </div>
  );
}
