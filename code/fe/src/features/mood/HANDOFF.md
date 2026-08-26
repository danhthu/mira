# M8 Tâm trí

## Trạng thái hiện tại

- `screens/MoodScreen.tsx` — ba khối trong một `ScrollView`:
  1. Điều đã tới hạn hỏi lại (nếu có): hiện lại nguyên văn + hai nút `Vẫn còn nặng` / `Nhẹ rồi`.
  2. Check-in cảm xúc: năm mức, chạm một cái là bản ghi đã lưu. Sau khi lưu mới hiện ô ghi chú tuỳ chọn.
  3. Điều đang đè nặng: ô viết + nút xác nhận, bên dưới là danh sách Mira đang cất kèm ngày sẽ hỏi lại.
  Lịch sử 10 check-in gần nhất nằm cuối; khi chưa có gì thì chỗ đó là `DataState`.
- `reviewSchedule.ts` + test — mốc bảy ngày, hàm thuần.
- `db/repositories/moodRepository.ts` — `findRecentMoods`, `createMood`, `updateMoodNote`.
- `db/repositories/weightOnMindRepository.ts` — `findWeightsDueForReview`, `findWeightsInKeeping`, `createWeightOnMind`, `markWeightReviewed`.

## Quyết định đã chốt

- **Check-in lưu ngay khi chạm mức, ghi chú lưu sau bằng `updateMoodNote`.** Nếu gộp
  ghi chú vào lúc tạo thì check-in không còn là một chạm — đúng thứ `01-modules.md` yêu cầu.
- **Năm mức dùng chung một màu, một cỡ chữ.** Tô mức 1 khác màu mức 5 là chấm điểm cảm xúc.
  Bảng token không có màu đỏ/cam và không nên thêm.
- **Không có phần thở.** `01-modules.md` cho phép "thở 3 phút, không gamify", nhưng
  `vi.mood.*` chưa có chuỗi nào cho nó nên chưa dựng — xem "Câu hỏi còn mở".
- **Không streak, không đếm số ngày liên tiếp, không tổng kết điểm.** Lịch sử chỉ
  liệt kê ngày + mức + ghi chú.
- `reviewAt` do màn hình tính (`computeReviewAt`) rồi truyền vào DTO, vì
  `CreateWeightOnMindDto` trong `shared/types` đòi cả hai mốc.

## Câu hỏi còn mở

1. **Thiếu key i18n** (không tự thêm theo yêu cầu, đang mượn tạm `vi.common.ok`):
   - nhãn nút xác nhận cho ô ghi chú và ô "điều đang đè nặng" → đang dùng `vi.common.ok` ("OK").
   - tiêu đề cho danh sách lịch sử check-in → đang bỏ trống.
   - placeholder cho ô "điều đang đè nặng" → đang mượn `vi.mood.weightOnMindTitle`.
   - nhãn cho danh sách Mira đang cất (kiểu "sẽ hỏi lại ngày…") → đang chỉ hiện ngày dạng số.
   - toàn bộ chuỗi cho phần thở 3 phút → chưa có key nào.
2. `computeReviewAt` là hàm thuần, đúng ra thuộc `core/`. Lần này `core/` ngoài phạm vi
   sửa nên để tạm trong feature. Chuyển sang `core/` khi có dịp.
3. Màn Cài đặt xoá-toàn-bộ-dữ-liệu chưa xoá bảng `mood` và `weight_on_mind`
   (repository chưa có `deleteAllMoods` vì chưa ai gọi). Cần bổ sung khi sửa Cài đặt.
4. Chưa có nhắc chủ động khi tới hạn bảy ngày — người dùng phải tự mở màn này mới thấy.

## Bước tiếp theo

1. Bổ sung các key `vi.mood.*` liệt kê ở trên, thay `vi.common.ok` bằng nhãn đúng ngữ cảnh.
2. Nối `mood`/`weight_on_mind` vào luồng xoá dữ liệu ở Cài đặt.
3. Quyết định có làm phần thở 3 phút hay không; nếu làm thì không đếm lần, không chấm điểm.
