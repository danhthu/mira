# Mira App — Handoff tổng quan

## Trạng thái hiện tại

Scaffold hoàn chỉnh. Tất cả 40 file đã được tạo và kiến trúc đã sẵn sàng. App có thể compile TypeScript và các màn hình có thể render (sau khi npm install và chạy migrations).

## Quyết định đã chốt

- **UUID**: Dùng timestamp + random string (`Date.now().toString(36) + Math.random().toString(36)`) thay vì UUID v7 thật. Cần thêm thư viện `uuid` hoặc `react-native-get-random-values + uuid` để có UUID v7 đúng chuẩn.
- **DB initialization**: Dùng raw SQL trong `execAsync` để tạo bảng. Drizzle-kit migrations chưa được setup — chạy `npx drizzle-kit generate` và migrate properly trước khi production.
- **Settings persistence**: Zustand store là in-memory. `curfewHour` và `whiteDayOfWeek` không được persist qua app restart. Cần thêm `@react-native-async-storage/async-storage` + Zustand `persist` middleware.
- **onboardingComplete**: Kiểm tra DB (đếm persons) khi app khởi động. Nếu có ít nhất 1 person, bỏ qua onboarding.
- **core/ directory**: Để trống cho agent khác. Các màn hình dùng placeholder values (không gọi core functions).
- **Navigation**: Dùng `@react-navigation/native-stack` cho onboarding, `@react-navigation/bottom-tabs` cho main app.

## Câu hỏi còn mở

1. Sau khi onboarding xong và `onboardingComplete = true` trong Zustand, app restart sẽ kiểm tra DB và set lại đúng — nhưng `setOnboardingComplete(true)` cần được gọi. Luồng này đã đúng nhưng cần test.
2. Màn hình Cài đặt > Thêm người cần một navigator riêng (stack) để push màn hình AddPerson mới. Hiện tại nút "Thêm người" chưa làm gì.
3. Nút "Bắt đầu" trong TodayScreen cần chạy background timer — hiện tại nó mở quick log modal. Timer thật cần implement.
4. Export JSON trong SettingsScreen chưa implement — cần dùng `expo-sharing` hoặc tương tự.
5. Hourglass card "Đặt lịch gọi" chưa implement — cần tích hợp calendar.

## Bước tiếp theo (theo thứ tự ưu tiên)

1. **Chạy `npm install`** trong thư mục `app/`
2. **Chạy `npx tsc --noEmit`** để check lỗi TypeScript
3. **Chạy `expo start`** để test app trên simulator
4. **Kết nối core agent**: sau khi `src/core/goldenHours.ts` và `src/core/hourglass.ts` có, import và dùng trong `useTodayData.ts` và `HourglassScreen.tsx`
5. **Implement background timer** cho "Bắt đầu" button
6. **Add UUID library** để có ID đúng chuẩn
7. **Setup Drizzle migrations** với `drizzle-kit generate`
