# Onboarding Feature

## Trạng thái hiện tại

- `WelcomeScreen.tsx`: chọn vai trò bằng chips (multi-select), navigate sang AddPeople
- `AddPeopleScreen.tsx`: nhập tên từng người theo vai trò đã chọn
- `CadenceScreen.tsx`: stepper cho mỗi người — bao nhiêu lần/tháng, mặc định theo vai trò

## Quyết định đã chốt

- 3 màn hình, mỗi màn hình 1 câu hỏi — theo spec
- Mặc định cadence: child=30 (hằng ngày), parent=2, partner=30, friend=2, self=30
- Sau CadenceScreen: tạo tất cả persons vào DB, set `onboardingComplete = true` trong Zustand
- Skip button ở WelcomeScreen → vào AddPeople với `roles = []` → CadenceScreen với `persons = []` → kết thúc

## Câu hỏi còn mở

1. Nếu user skip và không tạo person nào, app sẽ vào main tabs nhưng với dữ liệu trống. UX cần xem lại.
2. Error handling khi `createPerson()` fail chưa có — loading state có nhưng error state chưa hiển thị.
3. Tuổi và khoảng cách không hỏi trong onboarding (đúng theo spec). Cần flow sau này khi bật hourglass.

## Bước tiếp theo

1. Thêm error state hiển thị khi save thất bại trong CadenceScreen
2. Test flow đầy đủ: Welcome → AddPeople → Cadence → Main app
3. Test edge case: bỏ qua toàn bộ onboarding
