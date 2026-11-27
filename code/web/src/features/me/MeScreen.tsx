import { Link } from 'react-router-dom';
import type { User } from '@mira/contract';
import { closeSession } from '../../lib/session';
import { googleSignOut } from '../../lib/google';
import { ImportExport } from './ImportExport';
import { ReminderSettings } from './ReminderSettings';

/**
 * Màn Tôi. Bốn việc: trả lời những hạt muối tới hạn, đặt giờ nhắc, mang dữ liệu vào ra,
 * và thoát. Không có hồ sơ — thứ gì không cần thì không bày.
 */
export function MeScreen({
  user,
  onSignOut,
}: {
  readonly user: User;
  readonly onSignOut: () => void;
}) {
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
            closeSession();
            // Không tắt chỗ này thì Google tự đăng nhập lại ngay màn sau, và người vừa
            // bấm Thoát sẽ thấy mình vẫn đang ở trong.
            googleSignOut();
            onSignOut();
          }}
          style={{ fontSize: 14, color: 'var(--fg-dim)' }}
        >
          Thoát
        </button>
      </div>

      {/* Hạt muối tới hạn đã dời sang Hũ 26/11/2026: người ta vào đây để chỉnh cài đặt,
          không phải để nhìn lại một ngày tệ. Xem `features/home/DueSalt.tsx`. */}
      <Link to="/hu" className="sm">
        Hũ kẹo, hũ muối và câu hỏi lại sau 42 ngày nằm ở tab Hũ ›
      </Link>

      <ReminderSettings />

      <ImportExport />

      <div className="card">
        <div className="label">Riêng tư</div>
        <p style={{ marginTop: 8, fontSize: 15, lineHeight: 1.5 }}>
          Dữ liệu của bạn nằm trên máy chủ Mira, gắn với tài khoản này. Không tài khoản nào khác đọc
          được.
        </p>
        <p className="empty" style={{ marginTop: 8 }}>
          Đồng hồ cát đang tắt. Mira không đếm ngược đời bạn trừ khi bạn tự bật.
        </p>
      </div>
    </div>
  );
}
