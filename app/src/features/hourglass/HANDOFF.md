# Hourglass Feature

## Trạng thái hiện tại

- `HourglassScreen.tsx`: màn hình trống khi không có ai bật hourglass, list cards khi có
- `HourglassCard.tsx`: card per person với estimate visits remaining, 2 action buttons

## Quyết định đã chốt

- Mặc định màn hình TRỐNG. Chỉ hiện cards khi `hourglassEnabled = true` trong DB.
- Estimate visits = `(lifeExpectancy - currentAge) * desiredCadence`, lifeExpectancy = 75 (placeholder)
- Công thức thật sẽ đến từ `src/core/hourglass.ts` (agent khác)
- "Ẩn card" ẩn card trong session hiện tại (không toggle DB) — chỉ để giảm cognitive load

## Câu hỏi còn mở

1. `estimateVisitsRemaining()` trong screen là placeholder — cần replace bằng `src/core/hourglass.ts` khi agent kia xong
2. "Đặt lịch gọi" cần tích hợp calendar app hoặc reminder. Hiện là no-op.
3. Cần hỏi birthYear khi user bật hourglass lần đầu (spec: hỏi sau, không trong onboarding). Hiện chưa có flow này.
4. Nếu `birthYear == null`, `estimatedVisitsRemaining = 0` và card trông kỳ. Cần xử lý UX.

## Bước tiếp theo

1. Replace `estimateVisitsRemaining()` với import từ `src/core/hourglass.ts`
2. Thêm flow hỏi tuổi khi user bật hourglass toggle trong Settings (với disclaimer rõ ràng per spec)
3. Implement "Đặt lịch gọi"
