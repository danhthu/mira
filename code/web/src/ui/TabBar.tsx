import { NavLink } from 'react-router-dom';

/**
 * Năm tab, theo concept cải tiến sau khi chạy 300 persona.
 *
 * Tab đầu đổi từ "Nhà" thành **Nhật ký**: cái tên cũ nói về một nơi, tên mới nói về việc
 * phải làm ở đó. Và việc đó giờ nằm trên cùng màn hình chứ không ở đáy.
 *
 * "Tôi" rời khỏi thanh tab, nhường chỗ cho **Sáu tháng**. Màn Tôi mỗi tháng mở một lần,
 * còn Sáu tháng là chỗ trả lời câu hỏi người ta cài Mira để hỏi. Vào Tôi qua tên ở góc
 * màn Nhật ký.
 */
const TABS = [
  { to: '/', icon: '📓', label: 'Nhật ký' },
  { to: '/thoi-gian', icon: '⏱️', label: 'Thời gian' },
  { to: '/sau-thang', icon: '📖', label: 'Sáu tháng' },
  { to: '/tai-chinh', icon: '💰', label: 'Tài chính' },
  { to: '/muc-tieu', icon: '🎯', label: 'Mục tiêu' },
] as const;

export function TabBar() {
  return (
    <nav
      style={{
        position: 'fixed',
        insetInline: 0,
        bottom: 0,
        height: 'var(--tab-height)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: '#faf9f7',
        borderTop: '1px solid #eae7e1',
        display: 'flex',
        alignItems: 'center',
        maxWidth: 480,
        marginInline: 'auto',
      }}
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          style={({ isActive }) => ({
            flex: 1,
            textAlign: 'center',
            fontSize: 11,
            textDecoration: 'none',
            fontWeight: isActive ? 600 : 400,
            color: isActive ? 'var(--navy)' : '#9aa0a8',
          })}
        >
          {({ isActive }) => (
            <>
              <span
                style={{
                  fontSize: 19,
                  display: 'block',
                  marginBottom: 4,
                  opacity: isActive ? 1 : 0.45,
                }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
