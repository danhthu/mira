# Moments Feature

## Trạng thái hiện tại

- `MomentsScreen.tsx`: danh sách ngược thời gian, gộp theo tháng, FAB button, modal thêm mới
- `MomentItem.tsx`: hiển thị text, ảnh (nếu có), avatar người liên quan

## Quyết định đã chốt

- Gộp theo tháng dùng `occurredAt.slice(0, 7)` (YYYY-MM)
- `SectionList` với section header mỗi tháng kèm count
- FAB ở góc phải dưới, always visible
- Thêm ảnh chưa implement (cần `expo-image-picker`)

## Câu hỏi còn mở

1. Thêm ảnh: nút "Thêm ảnh" trong modal chưa nối `expo-image-picker`. Cần implement.
2. Slideshow cuối tháng (spec: "chạm để xem lại dạng slideshow") là V4 feature — chưa làm.
3. Chọn người liên quan trong modal chưa có. Cần thêm người selector.
4. Infinite scroll / pagination khi có nhiều moments.

## Bước tiếp theo

1. Nối `expo-image-picker` cho nút thêm ảnh
2. Thêm person multi-select vào modal tạo moment
3. Implement slideshow viewer (V4)
