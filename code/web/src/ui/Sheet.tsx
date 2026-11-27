/**
 * Khay trượt từ đáy lên. Chỗ để KHAI, mở ra bằng nút cộng.
 *
 * ─────────────────────────── VÌ SAO KHAY, KHÔNG PHẢI THẺ NẰM SẴN ───────────────────────────
 *
 * Trước đây mỗi màn có một thẻ nhập nằm lẫn giữa các thẻ đọc. Hai việc khác hẳn nhau bị
 * trộn vào một dòng cuộn: người mở app để NGÓ phải cuộn qua ô nhập, người mở app để GHI
 * phải cuộn tìm ô nhập. Màn Tài chính nặng nhất — năm ô nhập đẩy mọi con số xuống dưới
 * màn hình thứ hai.
 *
 * Tách ra: màn hình chỉ còn phần đọc, phần ghi nằm sau một nút. Nút ở góc dưới phải, chỗ
 * ngón tay cầm điện thoại một tay chạm tới được.
 *
 * ─────────────────────────────── MẤY CHI TIẾT PHẢI ĐÚNG ───────────────────────────────
 *
 * • Escape và bấm ra ngoài thì đóng. Khay không có đường thoát là khay giam người dùng.
 * • Khoá cuộn thân trang trong lúc mở, nếu không thì trên iOS kéo khay sẽ cuộn trang dưới.
 * • `aria-modal` + `role="dialog"`: trình đọc màn hình phải biết phần sau khay đang bị
 *   che, không thì nó đọc tiếp mấy thẻ bên dưới như thể vẫn dùng được.
 * • Đáy khay chừa `env(safe-area-inset-bottom)` cho vạch Home của iPhone.
 */
import { useEffect, type ReactNode } from 'react';

export function Sheet({
  open,
  headline,
  onClose,
  children,
}: {
  readonly open: boolean;
  readonly headline: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const key = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', key);

    const cuonCu = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', key);
      document.body.style.overflow = cuonCu;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet__scrim" onClick={onClose}>
      {/* Chặn nổi bọt: bấm vào trong khay không được tính là bấm ra ngoài. */}
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={headline}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__head">
          <div className="sheet__title">{headline}</div>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}
