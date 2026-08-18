# Today Feature

## Trạng thái hiện tại

- `TodayScreen.tsx`: render headline, danh sách người, nút Bắt đầu/Ghi nhanh, ô nhập khoảnh khắc
- `PersonTimeRow.tsx`: render avatar + tên + số phút
- `useTodayData.ts`: fetch persons + timeEntries hôm nay, tính `goldenMinutesToday`
- `todayStore.ts`: Zustand store quản lý state của màn hình

## Quyết định đã chốt

- `goldenMinutesToday` hiện là tổng phút từ timeEntries bucket 'people' + 'self'
- Quick log modal gộp "Bắt đầu" và "Ghi nhanh" thành cùng một UI cho đơn giản
- Inline moment input submit bằng Enter key

## Câu hỏi còn mở

1. "Giờ vàng" cần được tính đúng theo `src/core/goldenHours.ts` (agent khác). Hiện tại chỉ đếm phút từ DB, chưa áp dụng công thức từ `03-formulas.md`.
2. "Bắt đầu" (background timer) chưa implement — cần WebSocket hoặc background task.
3. Màn hình cần refresh khi quay lại từ tab khác. Hiện tại chỉ load 1 lần khi mount.

## Bước tiếp theo

1. Kết nối `goldenHours.ts` từ `src/core/` khi agent kia hoàn thành
2. Implement background timer với `expo-task-manager`
3. Thêm pull-to-refresh trên FlatList
4. Test quick log với dữ liệu thật
