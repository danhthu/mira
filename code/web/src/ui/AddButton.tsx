/**
 * Nút cộng nổi ở góc dưới phải. Một nút, một việc: mở khay khai.
 *
 * Nó nằm TRÊN thanh tab, lùi vào trong 18px — đủ xa để ngón tay không chạm nhầm tab
 * Mục tiêu ngay dưới, mà vẫn trong vùng ngón cái với tới khi cầm một tay.
 *
 * `nhan` là chữ cho trình đọc màn hình, không hiện ra: dấu cộng một mình thì người sáng
 * mắt hiểu ngay, còn người dùng VoiceOver chỉ nghe "nút" — vô nghĩa.
 */
export function AddButton({ label, onPress }: { readonly label: string; readonly onPress: () => void }) {
  return (
    <button type="button" className="fab" onClick={onPress} aria-label={label} title={label}>
      <span aria-hidden="true">+</span>
    </button>
  );
}
