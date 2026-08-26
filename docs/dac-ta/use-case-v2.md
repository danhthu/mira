# Use case — phạm vi V2

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25. Mọi UC dưới đây chỉ về yêu cầu đã có trong `docs/dac-ta/yeu-cau-v2.md` — không UC nào bịa thêm hành vi ngoài bảng đó. Mã tiếp số từ UC-16, nối liền UC-15 là mã cuối cùng đã dùng ở V1.
>
> **Tác nhân:** vẫn chỉ một vai trò — Người dùng (chủ thiết bị), giống V1. Ví chung (UC-26) là chỗ đầu tiên nhắc tới "người thứ hai", nhưng ở mức đặc tả này người thứ hai vẫn là dữ liệu do Người dùng nhập, không phải một tài khoản đăng nhập riêng — xem `docs/dac-ta/phan-quyen-v2.md` và câu hỏi mức Chặn Q-011, Q-012 trước khi coi UC-26 là thiết kế cuối.

---

## UC-16 · Nhập ảnh chụp tài chính hằng tháng

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đã có ít nhất một tháng dữ liệu `person`/`timeEntry` từ V1
**Về yêu cầu:** R-068, R-076

**Luồng chính:**
1. Người dùng vào màn Tài chính, chọn "Cập nhật tháng này".
2. Nhập thu nhập ròng sau thuế và bảo hiểm, chi tiêu trung bình tháng, tài sản ròng (thanh khoản), nợ.
3. Hệ thống tạo bản ghi `money` cho tháng hiện tại.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Một bản ghi `money` mới hoặc cập nhật cho tháng hiện tại.

---

## UC-17 · Nhập tải công việc theo tuần

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đang ở màn Tài chính
**Về yêu cầu:** R-066

**Luồng chính:**
1. Người dùng nhập số phút làm việc, đi lại, chuẩn bị, hồi sức cho tuần hiện tại.
2. Hệ thống tạo bản ghi `workLoad` gắn với `weekStart` của tuần đó.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Một bản ghi `workLoad` mới cho tuần hiện tại.

---

## UC-18 · Xem Tỷ giá đời

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một bản ghi `money` và `workLoad`
**Về yêu cầu:** R-065, R-067, R-069, R-070, R-071, R-072, R-073

**Luồng chính:**
1. Hệ thống tính `realWorkHours` từ `workLoad` theo R-066.
2. Hệ thống tính `lifeRate` theo R-067, dùng trung bình trượt 3 tháng gần nhất nếu có đủ dữ liệu (R-069).
3. Hiển thị tỷ giá đời (đồng/giờ).

**Luồng phụ:**
- 2a. Có nhiều nguồn thu nhập → hiển thị tỷ giá tổng và tỷ giá từng nguồn riêng (R-070).
- 2b. Có thu nhập thụ động → loại khỏi phép tính tỷ giá đời (R-071).

**Luồng ngoại lệ:**
- `realWorkHours = 0` → hiện "cần nhập giờ làm việc", không hiện số (R-072).
- Người dùng đã khai không đi làm → ẩn hoàn toàn chỉ số, không hiện "0đ/giờ" (R-073).

**Hậu điều kiện:** Không có — UC chỉ đọc.

---

## UC-19 · Xem Vốn tự do

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một bản ghi `money`
**Về yêu cầu:** R-075, R-076, R-077, R-078, R-079, R-080, R-081, R-082

**Luồng chính:**
1. Hệ thống tính `freedomMonths` theo R-076.
2. Hiển thị theo bậc ngày/tháng/năm tương ứng (R-077).
3. Hiển thị `freedomDaysGained` to hơn `freedomMonths`, kèm quãng đường phía trước (R-081, R-082).

**Luồng phụ:**
- 1a. `monthlySaving ≤ 0` → không tính quãng đường, chỉ hiện trạng thái hiện tại (R-080).

**Luồng ngoại lệ:**
- `netWorth` âm → không hiện số âm, hiện "Bạn đang cách vạch tự do X tháng tiết kiệm" (R-078).
- `monthlyExpense = 0` → không hiển thị vốn tự do (R-079).

**Hậu điều kiện:** Không có — UC chỉ đọc.

---

## UC-20 · Ghi khoản chi thủ công

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đang ở màn Tài chính
**Về yêu cầu:** R-086, R-088

**Luồng chính:**
1. Người dùng nhập số tiền, mô tả, chọn một trong 6 khoang giá trị.
2. Hệ thống tạo `expense` với `sourceType = 'manual'`, `confirmed = true`.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Một `expense` mới, đã xác nhận.

---

## UC-21 · Xác nhận khoản chi từ SMS ngân hàng

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có SMS ngân hàng mới đến máy — chỉ áp dụng trên nền tảng đọc được nội dung SMS, xem Q-009
**Về yêu cầu:** R-087, R-088

**Luồng chính:**
1. Hệ thống phát hiện SMS ngân hàng, tạo `expense` nháp với `sourceType = 'sms'`, `confirmed = false`.
2. Người dùng chạm một lần để xác nhận → `confirmed = true`.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:**
- Người dùng bỏ qua, không xác nhận → `expense` giữ `confirmed = false`, không tính vào các phép tính cần khoản chi đã xác nhận (chi tiết ngưỡng này chưa có nguồn, xem A-008 trong `gia-dinh-v2.md`).

**Hậu điều kiện:** Một `expense` mới, trạng thái xác nhận theo lựa chọn của người dùng.

---

## UC-22 · Xem quy đổi một khoản chi ra giờ đời và ngày tự do

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `expense` và đã tính được `lifeRate`
**Về yêu cầu:** R-083, R-084, R-085

**Luồng chính:**
1. Người dùng chạm vào một khoản chi.
2. Hệ thống hiển thị `hoursCost` và `freedomDaysCost` theo R-083, R-084.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:**
- Chưa tính được `lifeRate` → `hoursCost` không hiển thị, chỉ hiện `freedomDaysCost` nếu tính được.

**Hậu điều kiện:** Không có — UC chỉ đọc. Không bao giờ áp dụng cho `timeEntry` (R-085).

---

## UC-23 · Xem danh sách chi tiêu vô nghĩa

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `expense` đã xác nhận
**Về yêu cầu:** R-090

**Luồng chính:**
1. Người dùng vào màn Chi tiêu vô nghĩa.
2. Hệ thống liệt các `expense` không có `moment` nào liên quan trong cửa sổ đối chiếu (cửa sổ cụ thể chưa có nguồn, xem Q-015).

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Không có — UC chỉ đọc.

---

## UC-24 · Lập ngân sách 6 khoang giá trị theo tiền

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đang ở màn Tài chính
**Về yêu cầu:** R-086

**Luồng chính:**
1. Người dùng phân bổ số tiền dự kiến cho từng khoang trong 6 khoang giá trị.
2. Hệ thống lưu cấu hình, đối chiếu với `expense` thực tế theo khoang.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Cấu hình ngân sách theo khoang được lưu. Công thức đối chiếu vượt/còn dư mỗi khoang chưa có nguồn cho tiền (chỉ có cho giờ ở `03-formulas.md` mục 6), xem Q-014.

---

## UC-25 · Mô phỏng giảm ngày làm để đổi lấy tự do

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đã tính được `lifeRate` và `freedomMonths`
**Về yêu cầu:** R-091

**Luồng chính:**
1. Người dùng chọn "giảm 1 ngày làm/tuần".
2. Hệ thống ước tính cần bao lâu tiết kiệm để bù — công thức cụ thể chưa có nguồn, xem Q-016.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Không có — UC chỉ đọc, kết quả mang tính mô phỏng.

---

## UC-26 · Thiết lập Ví chung với người thứ hai

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `person` với vai trò `partner` hoặc `other`
**Về yêu cầu:** R-089

**Luồng chính:**
1. Người dùng chọn một `person` để mở Ví chung.
2. Hệ thống hiển thị các `expense` liên quan minh bạch cho cả hai bên xem — cơ chế "cho cả hai bên xem" khi ứng dụng vẫn local-first một máy chưa có nguồn nào giải thích, xem Q-011, Q-012.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Chưa xác định được đầy đủ — UC này cần trả lời Q-011, Q-012 trước khi coi là sẵn sàng thiết kế màn hình.

---

## UC-27 · Xếp người quan trọng vào vòng tròn Dunbar

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `person`
**Về yêu cầu:** R-095

**Luồng chính:**
1. Người dùng chọn một `person`, gán vào một trong ba vòng: 5, 15, hoặc 50.
2. Hệ thống lưu vào `person.dunbarRing` (cột đã có sẵn trong schema từ V1, chưa dùng).

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** `person.dunbarRing` cập nhật. Ý nghĩa nghiệp vụ của việc xếp vòng (ảnh hưởng gì tới màn hình khác) chưa có nguồn, xem Q-011.

---

## UC-28 · Xem và cập nhật nhiệt kế quan hệ

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `person`
**Về yêu cầu:** R-096

**Luồng chính:**
1. Người dùng vào chi tiết một `person`.
2. Hệ thống hiển thị nhiệt kế quan hệ hiện tại — cách tính hoặc cách người dùng tự đánh giá chưa có nguồn, xem Q-017.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Chưa xác định — phụ thuộc câu trả lời Q-017.

---

## UC-29 · Ghi nhật ký gặp gỡ một dòng

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `person`
**Về yêu cầu:** R-097

**Luồng chính:**
1. Người dùng chọn một `person`, gõ một dòng ghi chú về lần gặp vừa rồi.
2. Hệ thống lưu ghi chú, gắn với `person` đó và thời điểm hiện tại.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Một bản ghi mới — chưa rõ đây là bảng riêng hay tái dùng `moment` sẵn có, xem Q-018.

---

## UC-30 · Nhận gợi ý hẹn gặp hằng tuần

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `person` với `desiredCadence` đã khai
**Về yêu cầu:** R-098

**Luồng chính:**
1. Mỗi tuần, hệ thống gợi ý một người nên hẹn gặp, dựa trên lịch trống và ngân sách giờ còn dư.
2. Người dùng xem gợi ý, tự quyết định có hẹn hay không.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:**
- Chưa có dữ liệu lịch trống thật (Đồng bộ lịch đã hoãn ra sau V1) → không rõ hệ thống lấy "lịch trống" từ đâu, xem Q-013.

**Hậu điều kiện:** Không có — UC chỉ đọc, gợi ý không tự động tạo hẹn.

---

## UC-31 · Nhận nhắc ngày quan trọng

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `person` có ngày quan trọng đã khai
**Về yêu cầu:** R-099

**Luồng chính:**
1. Đến ngày quan trọng của một `person`, hệ thống nhắc người dùng.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Không có — UC chỉ đọc. "Ngày quan trọng" ngoài năm sinh chưa có chỗ lưu trong schema 13 bảng, xem Q-018.
