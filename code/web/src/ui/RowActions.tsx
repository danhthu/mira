/**
 * Hai nút **Sửa** và **Xoá** của một dòng danh sách. Một bộ duy nhất cho cả app.
 *
 * ────────────────────── VÌ SAO LÀ NÚT HIỆN RA, KHÔNG PHẢI CHẠM ĐỂ MỞ ──────────────────────
 *
 * Trước đây chỉ màn Thời gian theo nhóm mới sửa được mục giờ, và cách mở là **chạm vào
 * dòng** — không có dấu hiệu nào nói rằng chạm được. Người dùng không chạm thử vào một
 * dòng chữ để xem nó có mở ra gì không; họ cho rằng dòng ấy là chữ in. Kết quả: `PATCH`
 * và `DELETE` thông từ máy chủ tới api-client mà không ai dùng bao giờ.
 *
 * Nút hiện ra thì xấu hơn một chút và dùng được hơn nhiều.
 *
 * ─────────────────────────── XOÁ HỎI LẠI, NGAY TẠI DÒNG ĐÓ ───────────────────────────
 *
 * Không dùng `window.confirm`: hộp thoại hệ thống bật ra giữa màn hình, không nói rõ nó
 * đang hỏi về dòng nào, và trên iPhone thì nó che mất chính cái dòng ấy. Hỏi ngay tại
 * chỗ thì câu hỏi và vật bị xoá nằm cạnh nhau.
 *
 * Và xoá **không bôi đỏ chói**. Ràng buộc cứng của Mira: đỏ chỉ dành cho chi tiêu trong
 * donut tiền. Một mục giờ ghi nhầm không đáng để app doạ người ta.
 */
import { useState } from 'react';

export function RowActions({
  onEdit,
  onDelete,
  question = 'Xoá hẳn dòng này?',
  editLabel = 'Sửa',
  editing = false,
}: {
  /** Bỏ trống thì dòng này chỉ xoá được, không sửa được. */
  readonly onEdit?: (() => void) | undefined;
  readonly onDelete: () => Promise<unknown>;
  readonly question?: string;
  readonly editLabel?: string;
  /** Form sửa đang mở hay không — để nút đổi chữ thành "Xong". */
  readonly editing?: boolean;
}) {
  const [confirming, setChac] = useState(false);
  const [busy, setDangChay] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  async function xoa(): Promise<void> {
    setDangChay(true);
    setLoi(null);
    try {
      await onDelete();
      // KHÔNG tắt `dangChay` khi thành công: dòng sắp biến mất, và bật nút lại trong
      // một nhịp vẽ cuối chỉ mời người ta bấm xoá lần nữa.
    } catch (cause: unknown) {
      setLoi(cause instanceof Error ? cause.message : 'Không xoá được.');
      setDangChay(false);
      setChac(false);
    }
  }

  if (confirming) {
    return (
      <div className="rowActions rowActions--confirm">
        <span className="sm">{question}</span>
        <button type="button" className="rowActions__cancel" onClick={() => setChac(false)}>
          Thôi
        </button>
        <button type="button" className="rowActions__delete" disabled={busy} onClick={() => void xoa()}>
          {busy ? 'Đang xoá…' : 'Xoá'}
        </button>
      </div>
    );
  }

  return (
    <div className="rowActions">
      {loi !== null && <span className="rowActions__error">{loi}</span>}
      {onEdit !== undefined && (
        <button type="button" onClick={onEdit} aria-expanded={editing}>
          {editing ? 'Xong' : editLabel}
        </button>
      )}
      <button type="button" onClick={() => setChac(true)}>
        Xoá
      </button>
    </div>
  );
}
