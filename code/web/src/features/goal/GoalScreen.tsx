import { useEffect, useRef, useState } from 'react';
import { GOAL_TIER_CAP, type Goal, type GoalTier } from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { today, weekStartOf } from '../../lib/date';
import { minutes as fmtMinutes } from '../../lib/format';
import { HabitSection } from './HabitSection';
import { Sheet } from '../../ui/Sheet';
import { AddButton } from '../../ui/AddButton';
import { RowActions } from '../../ui/RowActions';

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
    const [goals, budget, habits, all] = await Promise.all([
      store.listGoals(tier),
      store.goalBudget(week),
      store.habitWeek(week),
      store.listGoals(),
    ]);
    return { goals, budget, habits, all };
  }, [tier, week]);

  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('2');
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState<Goal | null>(null);
  const [sua, setSua] = useState<Goal | null>(null);
  // Thẻ "Thêm mục tiêu" chuyển vào khay sau nút cộng, giống màn Tài chính và Thời gian.
  const [sheetOpen, setMoKhay] = useState(false);

  const goals = state.data?.goals ?? [];
  const all = state.data?.all ?? null;
  const demTang = (t: GoalTier): number => (all ?? []).filter((g) => g.tier === t).length;

  // Mở vào tầng Quý mà Quý trống thì màn nói "chưa có mục tiêu nào" với người có ba mục
  // tiêu ở hai tầng kia (27/11/2026, chính người viết app đọc nhầm). Lần tải đầu: Quý trống
  // thì nhảy sang tầng đầu tiên có mục tiêu. Chỉ một lần, để không giật tab người ta chọn.
  const daChon = useRef(false);
  useEffect(() => {
    if (daChon.current || all === null) return;
    daChon.current = true;
    if (all.some((g) => g.tier === tier)) return;
    const co = (['quarter', 'rhythm', 'long'] as const).find((t) => all.some((g) => g.tier === t));
    if (co !== undefined) setTier(co);
  }, [all, tier]);
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
      setMoKhay(false);
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
        <div className="sm">{all === null ? '' : `${all.length} đang chạy`}</div>
      </div>

      <div className="pills">
        {(['long', 'quarter', 'rhythm'] as const).map((t) => (
          <button key={t} type="button" aria-pressed={tier === t} onClick={() => setTier(t)}>
            {TIER_LABEL[t]}
            {all !== null && (
              <span className="pill-dem">
                {' '}
                {demTang(t)}/{GOAL_TIER_CAP[t]}
              </span>
            )}
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
                color:
                  budget.shortfallMinutes > 0
                    ? 'var(--amber)'
                    : budget.neededMinutes === 0
                      ? 'var(--fg-dim)'
                      : 'var(--green)',
              }}
            >
              {budget.shortfallMinutes > 0
                ? `Thiếu ${fmtMinutes(budget.shortfallMinutes)}`
                : budget.neededMinutes === 0
                  ? 'Chưa mục tiêu nào cần giờ'
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
        <HabitSection weekStart={week} weeks={state.data?.habits ?? []} onChanged={state.reload} />
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

            {/* BA việc, không phải một.
                  Sửa      — gõ nhầm tên, hoặc đổi số giờ mỗi tuần.
                  Xoá      — "tôi gõ nhầm, nó chưa từng là mục tiêu của tôi".
                  Kết thúc — "tôi đã theo đuổi nó, giờ thôi", và có bước hai hỏi số giờ
                             vừa giải phóng chuyển sang đâu.
                Gộp xoá với kết thúc thì một dòng gõ nhầm nằm vĩnh viễn trong lịch sử
                như một lần bỏ cuộc không có thật. */}
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
              <>
                <div className="row-foot" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEnding(goal)}
                    style={{ fontSize: 14, color: 'var(--fg-dim)' }}
                  >
                    Kết thúc mục tiêu này
                  </button>
                  <RowActions
                    onEdit={() => setSua(sua?.id === goal.id ? null : goal)}
                    editing={sua?.id === goal.id}
                    onDelete={async () => {
                      await store.deleteGoal(goal.id);
                      state.reload();
                    }}
                    question={`Xoá hẳn “${goal.title}”?`}
                  />
                </div>

                {sua?.id === goal.id && (
                  <EditGoal
                    goal={goal}
                    onDone={() => {
                      setSua(null);
                      state.reload();
                    }}
                  />
                )}
              </>
            )}
          </div>
        ))
      )}

      <AddButton label="Thêm mục tiêu" onPress={() => setMoKhay(true)} />

      <Sheet
        open={sheetOpen}
        headline={`Thêm mục tiêu · ${TIER_LABEL[tier]}`}
        onClose={() => setMoKhay(false)}
      >
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
      </Sheet>
    </div>
  );
}

/**
 * Sửa một mục tiêu đang chạy: tên và số giờ mỗi tuần.
 *
 * Không sửa được tầng. Đổi tầng là đổi trần đang áp cho mục tiêu, và kéo một cái sang
 * tầng khác có thể làm tầng ấy vượt trần — mà chính cái trần mới chữa được bệnh đặt quá
 * nhiều. Muốn đổi tầng thì kết thúc cái cũ, tạo cái mới: đi qua đúng cửa kiểm trần.
 */
function EditGoal({ goal, onDone }: { readonly goal: Goal; readonly onDone: () => void }) {
  const [title, setTitle] = useState(goal.title);
  const [hours, setHours] = useState((goal.weeklyMinutes / 60).toFixed(2).replace(/\.?0+$/, ''));
  const [busy, setDangChay] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  const phut = Math.round(Number(hours.replace(',', '.')) * 60);
  const hopLe = title.trim() !== '' && Number.isInteger(phut) && phut > 0;
  const changed = title.trim() !== goal.title || phut !== goal.weeklyMinutes;

  async function save(): Promise<void> {
    setDangChay(true);
    setLoi(null);
    try {
      await store.updateGoal(goal.id, { title: title.trim(), weeklyMinutes: phut });
      onDone();
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không lưu được.');
      setDangChay(false);
    }
  }

  return (
    <div className="edit">
      <input
        className="edit__text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Bạn muốn làm thêm điều gì?"
        aria-label="Tên mục tiêu"
      />
      <div className="edit__row" style={{ marginTop: 10 }}>
        <input
          value={hours}
          onChange={(event) => setHours(event.target.value)}
          inputMode="decimal"
          aria-label="Số giờ mỗi tuần"
        />
        <span className="sm">giờ mỗi tuần</span>
        <button
          type="button"
          className="edit__save"
          disabled={!hopLe || busy || !changed}
          onClick={() => void save()}
        >
          {busy ? 'Đang lưu…' : 'Lưu'}
        </button>
      </div>
      {loi !== null && (
        <p className="empty" style={{ color: 'var(--amber)', marginTop: 8 }}>
          {loi}
        </p>
      )}
    </div>
  );
}
