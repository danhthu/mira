# Tôi (màn hub)

## Trạng thái hiện tại

`screens/MeScreen.tsx` là menu điều hướng tới tám module không nằm trên thanh
tab, cộng Cài đặt. Năm nhóm theo `vi.me.section*`:

| Nhóm | Route trong `MeStackParamList` |
|---|---|
| Thời gian | `Hourglass` |
| Thân thể & tâm trí | `Mood`, `Health` |
| Con người | `Connect`, `Space` |
| Giữ lại | `Legacy`, `Learning`, `Items` |
| Cài đặt | `Settings` |

Đã xác nhận trên `http://localhost:8081`: đủ năm nhóm, chín hàng, bấm vào đẩy
được sang màn con, header có nút quay lại.

## Quyết định đã chốt

- **Đây là menu, không phải dashboard.** R-025 cấm dashboard, biểu đồ, phần trăm,
  so sánh với tuần trước. Mỗi hàng chỉ có tên module. Không con số tổng hợp,
  không thanh tiến độ, không huy hiệu, không màu đỏ.
- **Nhãn hàng lấy lại `title` của từng module** (`vi.mood.title`,
  `vi.health.title`…) thay vì thêm khoá mới trong `vi.me`. Tên module chỉ nên có
  một nguồn; hai bản thì sớm muộn cũng lệch nhau.
- **Không import `features/slow`.** Luật kiến trúc cấm `features/X` import
  `features/Y`, và màn này không cần trạng thái im lặng: nó vốn đã không nói gì.
- **Không chevron, không icon.** Chưa có bộ icon trong `shared/`, và một glyph
  `›` viết thẳng trong JSX là chuỗi hiển thị nằm ngoài `i18n/vi.ts`.

## Câu hỏi còn mở

- Chưa rõ màn này có nên hiện trạng thái ngày trắng / giới nghiêm không. Hiện
  không hiện, vì hiện lên là thêm một chỗ app nói — trái tinh thần M12. Nếu sau
  này muốn, phải giải quyết trước ràng buộc import ở
  `features/slow/HANDOFF.md` câu hỏi 3.

## Bước tiếp theo

- Không có việc bắt buộc. Khi `shared/` có bộ icon thì cân nhắc thêm icon cho
  từng hàng; trước đó thì để nguyên.
