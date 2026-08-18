# Settings Feature

## Trạng thái hiện tại

- `SettingsScreen.tsx`: 4 sections (Người quan trọng, Giới nghiêm, Ngày trắng, Dữ liệu)
- `PersonSettingRow.tsx`: row với avatar, tên, role, và toggle đồng hồ cát

## Quyết định đã chốt

- Toggle đồng hồ cát ghi thẳng vào DB qua `updatePersonHourglass()`
- `curfewHour` và `whiteDayOfWeek` lấy từ Zustand store (in-memory, chưa persist)
- Nút "Xóa toàn bộ" dùng Alert confirm trước khi xóa (nội dung xóa chưa implement)

## Câu hỏi còn mở

1. Time picker cho Giới nghiêm chưa implement — cần `@react-native-community/datetimepicker` hoặc custom wheel.
2. Day picker cho Ngày trắng cũng chưa có UI chọn.
3. Nút "Thêm người" cần navigate đến màn hình AddPerson mới — cần stack navigator trong Settings.
4. Export JSON cần `expo-sharing` để share file ra ngoài app.
5. Xóa toàn bộ dữ liệu cần implement soft delete tất cả records.
6. Settings (curfew, whiteDay) cần persist qua app restart. Cần `AsyncStorage` hoặc table DB riêng.

## Bước tiếp theo

1. Implement time picker cho Giới nghiêm
2. Implement day picker cho Ngày trắng
3. Persist settings vào SQLite hoặc AsyncStorage
4. Implement Export JSON với `expo-sharing`
5. Implement Xóa toàn bộ (soft delete all records)
