import { useState } from 'react';
import { GOAL_TIER_CAP, type Goal, type GoalTier } from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { today, weekStartOf } from '../../lib/date';
import { minutes as fmtMinutes } from '../../lib/format';
import { HabitSection } from './HabitSection';

const TIER_LABEL: Record<GoalTier, string> = {
  long: 'Dài hạn',
  quarter: 'Quý',
  rhythm: 'Nhịp tuần',
};

const COLORS = ['var(--deep)', 'var(--green)', 'var(--purple)', 'var(--amber)', 'var(--salt)'];

/**
 * Màn Mục tiêu. Ba quyết định của bản chốt nằm cả ở đây:
 *   - Mục tiêu nói bằng thứ muốn thêm, nên ô nhập gợi ý theo lối đó.
 *   - Khai nguồn từng mục tiêu một, ngay lúc tạo — không gộp thành một màn tổng.
 *   - Bỏ bớt luôn có bước hai: giờ vừa giải phóng chuyển sang mục tiêu nào.
 */
export function GoalScreen() {
  const week = weekStartOf(today());
  const [tier, setTier] = useState<GoalTier>('quarter');

  const state = useAsync(async () => {
    const [goals, budget, habits] = await Promise.all([
      store.listGoals(tier),
      store.goalBudget(week),
      store.habitWeek(week),
    ]);
    return { goals, budget, habits };
  }, [tier, week]);

  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('2');
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState<Goal | null>(null);

  const goals = state.data?.goals ?? [];
  const budget = state.data?.budget ?? null;
  const cap = GOAL_TIER_CAP[tier];
  const full = goals.length >= cap;

  async function create(): Promise<void> {
    const weeklyMinutes = Math.round(Number(hours.replace(',', '.')) * 60);
    if (title.trim() === '' || !Number.isInteger(weeklyMinutes) || weeklyMinutes <= 0) return;
    try {
      await store.createGoal({ tier, title, weeklyMinutes });
      setTitle('');
      setError(null);
      state.reload();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Không tạo được mục tiêu');
    }
  }

  async function end(goal: Goal, handOverTo: string | null): Promise<void> {
    await store.endGoal(goal.id, { handOverTo });
    setEnding(null);
    state.reload();
  }

  return (
    <div className="screen-body">
      <div className="row">
        <div className="title">Mục tiêu</div>
        <div className="sm">
          {goals.length}/{cap}
        </div>
      </div>

      <div className="pills">
        {(['long', 'quarter', 'rhythm'] as const).map((t) => (
          <button key={t} type="button" aria-pressed={tier === t} onClick={() => setTier(t)}>
            {TIER_LABEL[t]}
          </button>
        ))}
      </div>

      {budget !== null && (
        <div className="card">
          <div className="label">Nguyên liệu lấy từ đâu</div>
          <div className="split" style={{ height: 12, background: 'rgba(201,127,0,.3)' }}>
            <i
              style={{
                width: `${budget.neededMinutes === 0 ? 0 : Math.min(100, (budget.availableMinutes * 100) / budget.neededMinutes)}%`,
                background: 'var(--navy)',
              }}
            />
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              Lãng phí đã ghi {fmtMinutes(budget.availableMinutes)}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: budget.shortfallMinutes > 0 ? 'var(--amber)' : 'var(--green)',
              }}
            >
              {budget.shortfallMinutes > 0
                ? `Thiếu ${fmtMinutes(budget.shortfallMinutes)}`
                : 'Đủ nguyên liệu'}
            </div>
          </div>
        </div>
      )}

      {budget !== null && budget.shortfallMinutes > 0 && (
        <div className="card">
          <span className="flag">Không đủ nguyên liệu</span>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 12 }}>
            {goals.length} mục tiêu cần quá tay
          </div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8, lineHeight: 1.5 }}>
            Thiếu {fmtMinutes(budget.shortfallMinutes)}. Bỏ bớt một cái thì số giờ đó chuyển sang
            đâu?
          </div>
          <div className="statrow">
            <div>
              <div className="n">{fmtMinutes(budget.neededMinutes)}</div>
              <div className="sm">Đang cần</div>
            </div>
            <div>
              <div className="n">{fmtMinutes(budget.availableMinutes)}</div>
              <div className="sm">Đang có</div>
            </div>
            <div>
              <div className="n" style={{ color: 'var(--amber)' }}>
                {fmtMinutes(budget.shortfallMinutes)}
              </div>
              <div className="sm">Thiếu</div>
            </div>
          </div>
        </div>
      )}

      {tier === 'rhythm' && (
        <HabitSection
          weekStart={week}
          weeks={state.data?.habits ?? []}
          onChanged={state.reload}
        />
      )}

      <div className="label" style={{ marginTop: 6 }}>
        Đang chạy
      </div>

      {goals.length === 0 ? (
        <p className="empty">
          Chưa có mục tiêu nào ở tầng này. Tối đa {cap}. Ít thì thường đi được xa hơn.
        </p>
      ) : (
        goals.map((goal, index) => (
          <div className="card" key={goal.id} style={{ padding: '14px 18px' }}>
            <div className="row">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{goal.title}</div>
                <div className="sm">
                  {fmtMinutes(goal.weeklyMinutes)} mỗi tuần · lấy từ giờ lãng phí
                  {goal.expiresOn === null ? '' : ` · hết hạn ${goal.expiresOn}`}
                </div>
              </div>
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  background: COLORS[index % COLORS.length],
                  flex: 'none',
                }}
              />
            </div>

            {ending?.id === goal.id ? (
              <div style={{ marginTop: 12 }}>
                <div className="sm" style={{ marginBottom: 8 }}>
                  Số giờ này chuyển sang đâu?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {goals
                    .filter((other) => other.id !== goal.id)
                    .map((other) => (
                      <button
                        key={other.id}
                        type="button"
                        onClick={() => void end(goal, other.id)}
                        style={{
                          textAlign: 'left',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: 12,
                          padding: '10px 12px',
                        }}
                      >
                        {other.title}
                      </button>
                    ))}
                  <button
                    type="button"
                    onClick={() => void end(goal, null)}
                    style={{
                      textAlign: 'left',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 12,
                      padding: '10px 12px',
                      color: 'var(--fg-dim)',
                    }}
                  >
                    Trả lại cho mình, chưa định làm gì
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEnding(goal)}
                style={{ marginTop: 10, fontSize: 14, color: 'var(--fg-dim)' }}
              >
                Kết thúc mục tiêu này
              </button>
            )}
          </div>
        ))
      )}

      <div className="card">
        <div className="label">Thêm mục tiêu</div>
        <input
          id="goal-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Bạn muốn làm thêm điều gì?"
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
          <input
            id="goal-hours"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            inputMode="decimal"
            disabled={full}
            style={{
              width: 90,
              background: 'var(--screen)',
              border: '1.5px solid #d7dfe9',
              borderRadius: 12,
              padding: '10px 12px',
              fontSize: 16,
            }}
          />
          <span className="sm">giờ mỗi tuần, lấy từ giờ lãng phí</span>
        </div>
        <button
          type="button"
          onClick={() => void create()}
          disabled={full}
          style={{
            marginTop: 12,
            width: '100%',
            background: full ? '#d8dce3' : 'var(--navy)',
            color: full ? 'var(--fg-dim)' : '#fff',
            borderRadius: 12,
            padding: '11px 15px',
            fontWeight: 600,
          }}
        >
          {full ? `Tầng ${TIER_LABEL[tier].toLowerCase()} đã đầy` : 'Tạo mục tiêu'}
        </button>
        {full && (
          <p className="empty" style={{ marginTop: 10 }}>
            Tối đa {cap} mục tiêu ở tầng này. Bỏ bớt một cái đã. Mira không bán chỗ gỡ trần.
          </p>
        )}
        {error !== null && (
          <p className="empty" style={{ marginTop: 10, color: 'var(--amber)' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
