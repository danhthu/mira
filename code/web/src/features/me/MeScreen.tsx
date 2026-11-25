import type { User } from '@mira/contract';
import { store } from '../../lib/store';
import { useAsync } from '../../lib/useAsync';
import { today } from '../../lib/date';
import { dongPhien } from '../../lib/phien';
import { googleThoat } from '../../lib/google';
import { NhapXuat } from './NhapXuat';

/**
 * Màn Tôi. Ba việc: trả lời những hạt muối tới hạn, mang dữ liệu vào ra, và thoát.
 * Không có hồ sơ, không có cài đặt — thứ gì không cần thì không bày.
 */
export function MeScreen({ user, onRa }: { readonly user: User; readonly onRa: () => void }) {
  const state = useAsync(() => store.momentsDue(today()), []);
  const due = state.data ?? [];

  async function answer(id: string, value: 'same' | 'lighter' | 'gone'): Promise<void> {
    await store.answerRevisit(id, value);
    state.reload();
  }

  return (
    <div className="screen-body">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="title">{user.displayName ?? user.username}</div>
          <div className="sm" style={{ marginTop: 3 }}>
            @{user.username}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            dongPhien();
            // Không tắt chỗ này thì Google tự đăng nhập lại ngay màn sau, và người vừa
            // bấm Thoát sẽ thấy mình vẫn đang ở trong.
            googleThoat();
            onRa();
          }}
          style={{ fontSize: 14, color: 'var(--fg-dim)' }}
        >
          Thoát
        </button>
      </div>

      <div className="label" style={{ marginTop: 6 }}>
        Hạt muối tới hạn
      </div>

      {due.length === 0 ? (
        <p className="empty">
          Chưa có hạt nào tới hạn. Mira hỏi lại mỗi hạt muối đúng một lần, sau 42 ngày.
        </p>
      ) : (
        due.map((moment) => (
          <div className="card" key={moment.id}>
            <div className="sm">{moment.date}</div>
            <div style={{ fontSize: 17, marginTop: 6, fontStyle: 'italic' }}>
              {moment.text ?? 'Một ngày nặng, không ghi chữ nào.'}
            </div>
            <div className="sm" style={{ marginTop: 12 }}>
              Bây giờ nhìn lại, nó thế nào?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {(
                [
                  ['same', 'Vẫn nặng như hôm đó'],
                  ['lighter', 'Nhẹ hơn rồi'],
                  ['gone', 'Không còn thấy gì'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => void answer(moment.id, value)}
                  style={{
                    textAlign: 'left',
                    border: '1.5px solid #e2e8f0',
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
        ))
      )}

      <NhapXuat />

      <div className="card">
        <div className="label">Riêng tư</div>
        <p style={{ marginTop: 8, fontSize: 15, lineHeight: 1.5 }}>
          Dữ liệu của bạn nằm trên máy chủ Mira, gắn với tài khoản này. Không tài khoản nào
          khác đọc được.
        </p>
        <p className="empty" style={{ marginTop: 8 }}>
          Đồng hồ cát đang tắt. Mira không đếm ngược đời bạn trừ khi bạn tự bật.
        </p>
      </div>
    </div>
  );
}
