# Bảng câu hỏi

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25. Xếp theo mức chặn, nặng lên trên. Đọc lướt thấy phương án đề xuất ổn thì trả lời "ok hết" là G1 coi như xong; câu nào không trả lời sẽ tự chuyển thành giả định trong `gia-dinh.md` và hiện lại một lần nữa trước khi bàn giao (D4).

## Mức Chặn

| Mã | Vấn đề | Phương án đề xuất | Hệ quả nếu chọn sai | Ai chốt |
|---|---|---|---|---|
| Q-001 | `timeEntry.personId` khi `bucket = 'self'` — gắn vào một `person` có `role = 'self'`, hay để `personId = null`? Không nguồn nào nói rõ, nhưng ảnh hưởng trực tiếp cách tính Giờ vàng (R-026) và UC-02/03/04. | Tạo sẵn một `person` ẩn `role = 'self'` lúc onboarding (không hỏi tên riêng, tên mặc định "Bản thân"), mọi `timeEntry` bucket `self` gắn `personId` đó. Giữ nhất quán với "danh sách người đã ở cùng hôm nay" luôn có `personId`. | Nếu để `null`, "giờ với bản thân" sẽ không hiện được trong danh sách người ở UC-04, phải làm case riêng ở tầng hiển thị thay vì tầng dữ liệu. | Người dùng |
| Q-002 | "Giờ thật của công việc" (`workLoad`) liệt trong M1 ở `01-modules.md`, nhưng `02-data-model.md` đánh dấu bảng `workLoad` thuộc V2, và `05-v1-spec.md` (đặc tả riêng cho ranh giới V1) chỉ liệt "Giờ vàng + Đồng hồ cát" trong M1, không nhắc `workLoad`. Hai nguồn cùng hạng 1, không phân xử được bằng luật thẩm quyền. | Hoãn `workLoad` sang V2 cùng module Tài chính — công thức Tỷ giá đời (dùng `workLoad`) vốn đã là V2, đưa `workLoad` vào V1 một mình không có ý nghĩa nếu chưa có Tỷ giá đời để dùng nó. | Nếu đúng ra `workLoad` phải vào V1, cần thêm 1 UC + 1 màn hình nhập (làm/đi lại/chuẩn bị/hồi sức mỗi tuần) mà vòng phân tích này đã bỏ sót. | Người dùng |
| Q-003 | "Đồng bộ lịch" và "Chi phí ẩn" (`01-modules.md`, M1) cần kết nối Google/Apple Calendar — checklist miền mục Tích hợp (hệ thống ngoài, cách nối, ai giữ khoá) chưa có câu trả lời nào trong 6 nguồn. Definition of Done V1 (`05-v1-spec.md`) không nhắc tới hai tính năng này trong 8 tiêu chí. | Hoãn cả hai sang sau V1 — không thuộc DoD, chỉ 4 màn hình + widget/shortcut ghi tay là đủ để coi V1 xong. | Nếu bắt buộc phải có ở V1, cần thêm luồng OAuth Google/Apple Calendar — khối lượng việc lớn hơn hẳn phần còn lại của V1 cộng lại. | Người dùng |

## Mức Rủi ro

| Mã | Vấn đề | Phương án đề xuất | Hệ quả nếu chọn sai | Ai chốt |
|---|---|---|---|---|
| Q-004 | `targetWeeklyHours` dùng trong công thức `hoursIfMore` (Đồng hồ cát với con, R-033) nhưng không màn hình nào trong `05-v1-spec.md` mô tả nơi nhập giá trị này. | Thêm một ô nhập "giờ/tuần mong muốn" trong màn chi tiết khi chạm card Đồng hồ cát (không phải Settings chung, vì mỗi người một mục tiêu khác nhau), mặc định bằng `currentWeeklyHours`. | Thiếu chỗ nhập thì `hoursIfMore` không tính được — card chỉ hiện được nửa công thức. | Người dùng |
| Q-005 | Widget 3 avatar "người hay gặp nhất" (R-046) — cửa sổ thời gian tính "hay gặp nhất" chưa nguồn nào định nghĩa. | Dùng cùng cửa sổ 7 ngày với Giờ vàng (R-026), để nhất quán một chỗ tính "gần đây" duy nhất trong app. | Chọn sai cửa sổ (ví dụ all-time) sẽ khiến widget đứng yên không đổi dù thói quen người dùng đã đổi. | Người dùng |
| Q-008 | `person.birthYear` là trường tuỳ chọn, nhưng bắt buộc phải có để tính `yearsLeft` khi bật Đồng hồ cát cho một người vai trò `child` (R-033). Nếu người dùng bật công tắc mà chưa từng nhập năm sinh, hệ thống nên làm gì? | Chặn ngay tại bước bật trong Settings (UC-07 bước 2) — hỏi năm sinh làm điều kiện bắt buộc để bật, không cho bật rồi mới báo lỗi ở màn Đồng hồ cát. | Nếu cho bật trước rồi báo lỗi sau, người dùng thấy card Đồng hồ cát trống hoặc lỗi — đúng thứ R-004 "luôn kèm hành động cụ thể" cấm. | Người dùng |

## Mức Để sau

| Mã | Vấn đề | Phương án đề xuất | Hệ quả nếu chọn sai | Ai chốt |
|---|---|---|---|---|
| Q-006 | `lifeExpectancy` mặc định 78 (R-034), `03-formulas.md` nói "cho sửa" nhưng không nói sửa ở đâu. | Đặt trong màn chi tiết mỗi card Đồng hồ cát (không phải Settings chung) — vì tuổi thọ kỳ vọng có thể khác nhau giữa bố và mẹ. | Nếu để chung một chỗ, không sửa riêng được cho từng người, sai với tinh thần "mỗi người một card" của R-031. | Người dùng — có thể hỏi lại khi bắt đầu code UC-08 |

---

## Trả lời

Xác nhận ngày 2026-08-25.

| Mã | Trả lời |
|---|---|
| Q-001 | Theo phương án đề xuất — tạo `person` ẩn `role = 'self'` |
| Q-002 | Theo phương án đề xuất — hoãn `workLoad` sang V2 |
| Q-003 | Theo phương án đề xuất — hoãn Đồng bộ lịch + Chi phí ẩn ra sau V1 |
| Q-004, Q-005, Q-006, Q-008 | Không có phản hồi khác — áp dụng phương án đề xuất, chuyển vào `gia-dinh.md` mã A-003 đến A-006 |
