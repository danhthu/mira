import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

/**
 * Năm tab.
 *
 * Tab đầu đổi từ "Nhà" thành **Nhật ký**: cái tên cũ nói về một nơi, tên mới nói về việc
 * phải làm ở đó. Và việc đó giờ nằm trên cùng màn hình chứ không ở đáy.
 *
 * **Sáu tháng bỏ khỏi thanh tab 26/11/2026.** Nó hứa một thứ chưa có: chuyện sáu tháng
 * cần sáu tuần dữ liệu mới kể được, nên phần lớn thời gian bấm vào chỉ thấy biểu đồ mấy
 * tuần — thứ màn Thời gian đã nói rồi. Một tab mở ra là thấy "chưa đủ dữ liệu" làm người
 * ta thôi tin cả app. "Tôi" lấy lại chỗ đó.
 *
 * **Hũ lấy chỗ của Tôi 26/11/2026.** Hũ là nơi nằm của hạt cũ nổi lên và câu hỏi lại sau
 * 42 ngày — hai thứ kéo người ta quay lại — mà trước đó chỉ vào được qua một đường link
 * trong câu trả lời của chat. Tôi là màn cài đặt, mở vài tuần một lần: nó dời lên góc
 * phải của Nhật ký và của Hũ.
 */
const TABS: readonly { to: string; icon: IconName; label: string }[] = [
  { to: '/', icon: 'journal', label: 'Nhật ký' },
  { to: '/thoi-gian', icon: 'clock', label: 'Thời gian' },
  { to: '/tai-chinh', icon: 'wallet', label: 'Tài chính' },
  { to: '/muc-tieu', icon: 'target', label: 'Mục tiêu' },
  { to: '/hu', icon: 'jar', label: 'Hũ' },
];

export function TabBar() {
  return (
    <nav
      style={{
        position: 'fixed',
        insetInline: 0,
        bottom: 0,
        height: 'var(--tab-height)',
        paddingBottom: 'var(--inset-bottom)',
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--line)',
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
            color: isActive ? 'var(--brand)' : 'var(--fg-muted)',
          })}
        >
          {({ isActive }) => (
            <>
              {/* Icon nhuộm theo màu chữ của tab nhờ currentColor, nên tab đang chọn
                  sáng màu thương hiệu còn bốn tab kia xám. Emoji không làm được việc đó:
                  nó giữ màu của phông, nên cái đang chọn trông y hệt cái không chọn. */}
              <span style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
                <Icon name={tab.icon} size={21} strokeWidth={isActive ? 1.95 : 1.6} />
              </span>
              {tab.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
