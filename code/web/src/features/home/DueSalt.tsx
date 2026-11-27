import type { Moment } from '@mira/contract';
import { store } from '../../lib/store';
import { labelDay } from '../../lib/date';

/**
 * Hạt muối tới hạn: 42 ngày sau một ngày nặng, Mira hỏi lại đúng một lần.
 *
 * Trước 26/11/2026 khối này nằm trong màn Tôi, cạnh nút Thoát và phần nhập xuất dữ liệu.
 * Người ta vào Tôi để chỉnh cài đặt, không phải để nhìn lại một ngày tệ — nên câu hỏi
 * gần như không ai thấy. Nó thuộc về Hũ, nơi các hạt nằm.
 */
const ANSWERS = [
  ['same', 'Vẫn nặng như hôm đó'],
  ['lighter', 'Nhẹ hơn rồi'],
  ['gone', 'Không còn thấy gì'],
] as const;

export function DueSalt({
  due,
  onAnswered,
}: {
  readonly due: readonly Moment[];
  readonly onAnswered: () => void;
}) {
  if (due.length === 0) return null;

  async function answer(id: string, value: (typeof ANSWERS)[number][0]): Promise<void> {
    await store.answerRevisit(id, value);
    onAnswered();
  }

  return (
    <>
      <div className="label" style={{ marginTop: 6 }}>
        Hạt muối tới hạn · {due.length}
      </div>
      {due.map((moment) => (
        <div className="card" key={moment.id}>
          <div className="sm">{labelDay(moment.date)}</div>
          <div style={{ fontSize: 17, marginTop: 6, fontStyle: 'italic' }}>
            {moment.text ?? 'Một ngày nặng, không ghi chữ nào.'}
          </div>
          <div className="sm" style={{ marginTop: 12 }}>
            Bây giờ nhìn lại, nó thế nào?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {ANSWERS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => void answer(moment.id, value)}
                style={{
                  textAlign: 'left',
                  border: '1.5px solid var(--line)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  fontSize: 15,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="empty" style={{ marginTop: 10 }}>
            Bỏ qua cũng được. Mira không đếm số lần bạn bỏ qua.
          </p>
        </div>
      ))}
    </>
  );
}
