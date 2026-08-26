# Mục tiêu (M3)

## Trạng thái hiện tại

Xong phần lõi của M3 theo `docs/01-modules.md` mục M3 và `docs/03-formulas.md` mục 7.

- `src/core/goalCost.ts` — hàm thuần: `calculateGoalCost`, `detectGoalConflict`,
  `canAddGoal`, `goalExpiry`, `goalExpiryDate`. Test: `src/core/__tests__/goalCost.test.ts`
  (32 ca).
- `src/db/repositories/goalRepository.ts` — `findAllGoals`, `findGoalById`, `createGoal`,
  `releaseGoal`, `expireOverdueGoals`.
- `src/features/goals/screens/GoalsScreen.tsx` — danh sách theo ba tầng, thêm mục tiêu,
  buông mục tiêu kèm lý do, cảnh báo tranh quỹ giờ.
- `src/features/goals/components/GoalCard.tsx` — một mục tiêu: giá bằng giờ, giá bằng
  tiền, số ngày tự do bị đẩy lùi, hạn còn lại.

## Quyết định đã chốt

- **Không phần trăm, không streak, không badge.** Card chỉ hiện giá và hạn; tiến độ để cho
  bằng chứng người dùng tự thấy, đúng như M3 ghi.
- **Buông dùng màu nhấn, hết hạn dùng màu xám.** Buông là việc đáng mừng nên nó không mờ đi;
  hết hạn là dữ kiện chứ không phải lỗi nên không có màu cảnh báo nào (bảng token cũng
  không có màu đỏ).
- **Hạn 90 ngày ghi thẳng vào `expiresAt` lúc tạo**, và `expireOverdueGoals` chạy khi mở màn
  hình. App local-first, không có tiến trình nền nào chạy lúc app đóng nên đây là chỗ duy
  nhất kiểm được hạn.
- **Hằng số của M3 (`GOAL_TIER_LIMITS`, `GOAL_EXPIRY_DAYS`) đặt trong `core/goalCost.ts`**
  chứ không trong `core/constants.ts`. `constants.ts` nằm ngoài phạm vi file của lượt này;
  chỗ đúng lâu dài của hai hằng số này là `constants.ts`.
- **`GoalTier` `import type` từ `@/shared/types`** thay vì khai lại trong core. Khai hai bản
  là đúng thứ mà comment đầu `shared/types/index.ts` cảnh báo. Import chỉ ở mức type nên
  bị xoá lúc biên dịch, không tạo phụ thuộc lúc chạy.
- **Chi tiêu tháng lấy qua `moneyRepository.findAllMoneyRecords`**, không tự truy vấn bảng
  `money` trong `goalRepository`. Khi chưa có số liệu tháng nào thì `monthlyExpense = 0` và
  `calculateGoalCost` trả `freedomDelayDays = null` — card bỏ hẳn dòng đó, không hiện 0.

## Câu hỏi còn mở

- **"Quỹ giờ khoang tương ứng" trong `03-formulas.md` mục 7 chưa có chỗ neo.** Bảng `goal`
  không có cột `bucket`, nên không biết mục tiêu thuộc khoang nào để so với quỹ giờ khoang
  đó. Tạm dùng quỹ cả tuần (168 giờ) làm ngưỡng — đây là ngưỡng duy nhất spec nói rõ.
  `detectGoalConflict` nhận `budgetMinutesPerWeek` làm tham số nên khi có cột `bucket` thì
  chỉ cần đổi chỗ gọi. Cần chốt: goal có gắn khoang không?
- **Thiếu chuỗi trong `i18n/vi.ts` mục `vi.goals`** (chưa tự thêm, theo phạm vi lượt này):
  - nhãn cho hai ô nhập chi phí (giờ/tuần, tiền/tháng) — đang phải dùng dòng xem trước
    `costHours` / `costMoney` thay nhãn;
  - `save` / `cancel` riêng cho goals — đang mượn `vi.today.save` và `vi.today.cancel`;
  - nhãn "đã hết hạn" — mục tiêu hết hạn hiện chỉ đổi sang màu xám, không có chữ;
  - câu giải thích khi một tầng đã đủ số mục tiêu, và khi tổng chi phí chạm 168 giờ/tuần —
    hiện chỉ làm mờ ô chọn tầng và khoá nút lưu, người dùng không đọc được lý do.
- **Gia hạn mục tiêu chưa có lối vào.** M3 nói hạn 90 ngày "tự hết nếu không gia hạn" nhưng
  danh sách việc của lượt này không có nút gia hạn, nên `status = 'renewed'` hiện chưa bao
  giờ được ghi. Cần chốt màn hình nào gia hạn.
- **`deleteAllGoals` chưa viết** vì `SettingsScreen` (ngoài phạm vi) mới xoá person, time
  entry và moment. Khi mở rộng nút "Xoá toàn bộ dữ liệu" thì thêm hàm này.

## Bước tiếp theo

1. Chốt hai câu hỏi trên (khoang giờ của goal, chuỗi i18n còn thiếu) rồi bổ sung
   `vi.goals.*` và thay các chuỗi đang mượn.
2. Thêm nút gia hạn để `status = 'renewed'` có đường đi thật.
3. Nối `deleteAllGoals` vào SettingsScreen khi module đó mở rộng.
