import { useState } from 'react';
import { HABIT_CAP, type HabitWeek } from '@mira/contract';
import { store } from '../../lib/store';
import { addDays, today } from '../../lib/date';

const WEEKDAY = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/**
 * Thói quen của tuần. Mira hỗ trợ thói quen nhưng đếm theo tuần, không theo chuỗi ngày:
 * bảy ô là bảy ngày của tuần này, hết tuần thì đếm lại từ đầu. Không có số chuỗi,
 * không có huy hiệu, và ngày chưa làm để trống chứ không bôi đỏ.
 */
export function HabitSection({
  weekStart,
  weeks,
  onChanged,
}: {
  readonly weekStart: string;
  readonly weeks: readonly HabitWeek[];
  readonly onChanged: () => void;
}) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('4');
  const [error, setError] = useState<string | null>(null);
  const day = today();
  const full = weeks.length >= HABIT_CAP;

  async function create(): Promise<void> {
    const targetPerWeek = Number(target);
    if (title.trim() === '') return;
    try {
      await store.createHabit({ title, targetPerWeek });
      setTitle('');
      setError(null);
      onChanged();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Không tạo được thói quen');
    }
  }

  async function toggle(habitId: string, date: string, done: boolean): Promise<void> {
    await store.checkHabit(habitId, date, done);
    onChanged();
  }

  return (
    <>
      <div className="label" style={{ marginTop: 6 }}>
        Thói quen tuần này
      </div>

      {weeks.length === 0 ? (
        <p className="empty">Chưa có thói quen nào. Tối đa {HABIT_CAP}.</p>
      ) : (
        weeks.map(({ habit, done, dates }) => (
          <div className="card" key={habit.id} style={{ padding: '14px 18px' }}>
            <div className="row">
              <div style={{ fontSize: 16, fontWeight: 600, minWidth: 0 }}>{habit.title}</div>
              <div style={{ fontWeight: 700, color: done >= habit.targetPerWeek ? 'var(--green)' : 'var(--fg)' }}>
                {done}/{habit.targetPerWeek}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {WEEKDAY.map((label, index) => {
                const date = addDays(weekStart, index);
                const checked = dates.includes(date);
                const future = date > day;
                return (
                  <button
                    key={date}
                    type="button"
                    aria-pressed={checked}
                    aria-label={`${habit.title} ${label}`}
                    disabled={future}
                    onClick={() => void toggle(habit.id, date, !checked)}
                    style={{
                      flex: 1,
                      height: 38,
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      background: checked ? 'var(--green)' : 'var(--screen)',
                      color: checked ? '#fff' : future ? 'var(--fg-faint)' : 'var(--fg-dim)',
                      border: `1px solid ${checked ? 'var(--green)' : 'var(--line)'}`,
                      opacity: future ? 0.5 : 1,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                void store.endHabit(habit.id).then(onChanged);
              }}
              style={{ marginTop: 10, fontSize: 14, color: 'var(--fg-dim)' }}
            >
              Dừng thói quen này
            </button>
          </div>
        ))
      )}

      <div className="card">
        <div className="label">Thêm thói quen</div>
        <input
          id="habit-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Bạn muốn làm đều đặn điều gì?"
          disabled={full}
          style={{
            marginTop: 10,
            width: '100%',
            background: 'var(--screen)',
            border: '1.5px solid #d7dfe9',
            borderRadius: 12,
            padding: '10px 12px',
            fontSize: 16,
          }}
        />
        <div className="row" style={{ marginTop: 10 }}>
          <select
            id="habit-target"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            disabled={full}
            style={{
              background: 'var(--screen)',
              border: '1.5px solid #d7dfe9',
              borderRadius: 12,
              padding: '10px 12px',
              fontSize: 16,
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="sm">lần mỗi tuần</span>
          <button
            type="button"
            onClick={() => void create()}
            disabled={full}
            style={{
              marginLeft: 'auto',
              background: full ? '#d8dce3' : 'var(--navy)',
              color: full ? 'var(--fg-dim)' : '#fff',
              borderRadius: 12,
              padding: '10px 18px',
              fontWeight: 600,
            }}
          >
            Thêm
          </button>
        </div>
        {full && (
          <p className="empty" style={{ marginTop: 10 }}>
            Tối đa {HABIT_CAP} thói quen. Dừng bớt một cái trước.
          </p>
        )}
        {error !== null && (
          <p className="empty" style={{ marginTop: 10, color: 'var(--amber)' }}>
            {error}
          </p>
        )}
      </div>

      <p className="empty">
        Bỏ một tuần thì tuần sau đếm lại từ đầu. Mira không đếm chuỗi ngày và không hỏi vì
        sao bạn bỏ.
      </p>
    </>
  );
}
