# Yêu cầu — V2

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25. Phạm vi: **V2** (M2 Tài chính + M6 Kết nối con người), theo `docs/04-roadmap.md`. Mã tiếp số từ **R-065**, nối liền R-064 là mã cuối cùng đã dùng ở `docs/dac-ta/yeu-cau.md` (V1).
>
> Toàn bộ ràng buộc cứng của V1 (R-001 đến R-013, R-049 đến R-053) áp dụng nguyên vẹn cho V2, không lặp lại mã ở đây. Đáng chú ý nhất cho vòng này: R-002 (không bao giờ quy đổi giờ thuộc bucket `people` sang tiền) và R-053 (schema viết đủ 13 bảng từ đầu, không thiết kế lại giữa chừng) — cả hai đều va chạm trực tiếp với nội dung V2, xem mục đối chiếu code và bảng câu hỏi.

## Tỷ giá đời (M2)

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-065 | Tỷ giá đời là thu nhập ròng chia cho tổng giờ THẬT đổ vào công việc, không phải giờ hợp đồng | S-001 dòng33, S-002 dòng38 | chức năng | cao |
| R-066 | `realWorkHours = (workMinutes + commuteMinutes + prepMinutes + recoveryMinutes) / 60` | S-004 dòng26 | chức năng | cao |
| R-067 | `lifeRate = netIncome / (realWorkHours × 52 / 12)` | S-004 dòng27 | chức năng | cao |
| R-068 | `netIncome` là thu nhập sau thuế và bảo hiểm, tính theo tháng | S-004 dòng30 | ràng buộc | cao |
| R-069 | Thu nhập không đều hoặc freelance dùng trung bình trượt 3 tháng gần nhất; chưa đủ 3 tháng thì dùng trung bình số tháng đang có | S-004 dòng33 | chức năng | cao |
| R-070 | Nhiều nguồn thu nhập → cho nhập nhiều dòng income, mỗi dòng có giờ riêng; tỷ giá tổng = Σincome / Σgiờ, đồng thời hiện tỷ giá riêng từng nguồn | S-004 dòng34 | chức năng | cao |
| R-071 | Thu nhập thụ động (cho thuê, cổ tức) không tính vào tỷ giá đời vì 0 giờ gắn với nó; tính riêng vào `netWorth` | S-004 dòng35 | chức năng | cao |
| R-072 | `realWorkHours = 0` → không hiển thị tỷ giá đời, hiện "cần nhập giờ làm việc" | S-004 dòng36 | chức năng | cao |
| R-073 | Người không đi làm (nội trợ, sinh viên) → ẩn hoàn toàn chỉ số tỷ giá đời, không hiện "0đ/giờ" | S-004 dòng37 | chức năng | cao |

## Vốn tự do (M2)

> Mã **R-074 cố ý bỏ trống**: "tỷ giá đời không bao giờ áp lên giờ vàng" (S-001 dòng54) là cùng một yêu cầu đã có mã R-002 ở V1 (nguồn S-004 dòng81-82, S-001 dòng54) — không tạo mã mới cho một yêu cầu đã tồn tại, chỉ nhắc lại rằng R-002 áp dụng nguyên vẹn cho toàn bộ V2.

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-075 | Vốn tự do là số tháng sống được nếu nghỉ việc ngày mai | S-001 dòng34 | chức năng | cao |
| R-076 | `freedomMonths = max(0, netWorth) / monthlyExpense`; `netWorth` = tài sản thanh khoản (tiền mặt, tiết kiệm, chứng khoán) trừ nợ ngắn hạn, không tính nhà đang ở hay xe đang dùng | S-004 dòng44, dòng47-48 | chức năng | cao |
| R-077 | Hiển thị theo ba bậc: dưới 1 tháng hiện bằng ngày; từ 1 đến 24 tháng hiện bằng tháng; trên 24 tháng hiện bằng năm, làm tròn 1 chữ số thập phân | S-004 dòng50-53 | chức năng | cao |
| R-078 | `netWorth` âm → không hiện số âm, hiện "Bạn đang cách vạch tự do X tháng tiết kiệm" với `X = |netWorth| / monthlySaving` | S-004 dòng56 | chức năng | cao |
| R-079 | `monthlyExpense = 0` → không hiển thị vốn tự do | S-004 dòng57 | chức năng | cao |
| R-080 | `monthlySaving ≤ 0` → không tính quãng đường tự do, chỉ hiện trạng thái hiện tại | S-004 dòng58 | chức năng | cao |
| R-081 | `freedomDaysGained = monthlySaving / monthlyExpense × 30`, hiển thị to hơn `freedomMonths` vì luôn tính được kể cả với người mới bắt đầu | S-004 dòng63-68 | chức năng | cao |
| R-082 | Vốn tự do luôn hiển thị kèm quãng đường phía trước, không hiện con số trần một mình | S-001 dòng55 | ràng buộc | cao |

## Quy đổi chi tiêu (M2)

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-083 | `hoursCost = expense.amount / lifeRate` | S-004 dòng75 | chức năng | cao |
| R-084 | `freedomDaysCost = expense.amount / monthlyExpense × 30` | S-004 dòng76 | chức năng | cao |
| R-085 | Phép quy đổi chi tiêu chỉ áp cho `expense` và `workLoad` — tuyệt đối không áp cho `timeEntry` có `bucket = 'people'` (giờ vàng không có giá) | S-004 dòng81-82 | ràng buộc | cao |

## Ngân sách 6 khoang giá trị, SMS, Ví chung, Chi tiêu vô nghĩa, Mô phỏng (M2)

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-086 | Ngân sách 6 khoang giá trị dùng đúng 6 khoang của module Thời gian (Việc, Sức khỏe, Người thân, Học, Nghỉ, Riêng tôi), không theo danh mục kế toán ngân hàng | S-002 dòng28, dòng41 | chức năng | cao |
| R-087 | Đọc SMS ngân hàng tạo khoản chi nháp, người dùng xác nhận bằng đúng 1 chạm; không gọi API ngân hàng | S-002 dòng42 | chức năng | cao |
| R-088 | `expense` phân biệt nguồn tạo bằng `sourceType` (`manual \| sms \| notification`) và cờ `confirmed` để tách khoản đã xác nhận khỏi khoản còn chờ | S-003 dòng43 | ràng buộc | cao |
| R-089 | Ví chung dùng cho cặp đôi hoặc gia đình, minh bạch giữa các bên tham gia | S-002 dòng43 | chức năng | cao |
| R-090 | Chi tiêu vô nghĩa là khoản chi không để lại `moment` nào liên quan — tính năng giao cắt trực tiếp với module Khoảnh khắc (M5) | S-002 dòng44 | chức năng | cao |
| R-091 | Mô phỏng đường tự do trả lời câu "giảm 1 ngày làm/tuần cần bao lâu tiết kiệm" | S-002 dòng45 | chức năng | vừa — không có công thức cụ thể ở S-004, xem Q-016 |

## Ràng buộc và mốc riêng của V2

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-092 | V2 phụ thuộc dữ liệu `person` và `timeEntry` đã có từ V1, không khởi động ở trạng thái rỗng | S-005 dòng10 | ràng buộc | cao |
| R-093 | Cuối V2 cần đạt ≥15% người dùng nhập đủ 3 số tài chính; nếu thấp hơn, làm nhẹ phần tài chính đi chứ không đào sâu thêm | S-005 dòng20 | phi chức năng | cao |
| R-094 | Module Tài chính (M2) thuộc gói trả phí (~59k/tháng hoặc 490k/năm), không nằm trong phần miễn phí vĩnh viễn M1+M5 | S-005 dòng26-27 | ràng buộc | cao |

## Kết nối con người (M6)

Toàn bộ M6 chỉ được viết trong đúng một câu ở nguồn: *"Vòng tròn Dunbar 5/15/50 · nhiệt kế quan hệ · nhật ký gặp gỡ 1 dòng · gợi ý một cuộc hẹn mỗi tuần dựa trên lịch trống + ngân sách còn dư · nhắc ngày quan trọng."* (S-002 dòng72). Theo quy tắc bóc "một câu chứa nhiều việc thì tách nhiều dòng", năm cụm được tách thành năm yêu cầu dưới đây — không cụm nào có thêm chi tiết ở bất kỳ nguồn nào khác trong S-001 đến S-005.

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-095 | Người quan trọng được xếp vào vòng tròn Dunbar theo ba mức 5, 15, 50 | S-002 dòng72 | chức năng | vừa — schema đã có cột `person.dunbarRing` từ V1 (S-003 dòng16) nhưng chưa gán ý nghĩa nghiệp vụ, xem Q-011 |
| R-096 | Mỗi người quan trọng có một nhiệt kế quan hệ | S-002 dòng72 | chức năng | thấp — không nguồn nào mô tả cách tính hay hiển thị, xem Q-017 |
| R-097 | Có nhật ký gặp gỡ dạng một dòng ghi chú cho mỗi lần gặp | S-002 dòng72 | chức năng | vừa — không rõ đây là bảng riêng hay tái dùng `moment`, xem Q-018 |
| R-098 | Hệ thống gợi ý một cuộc hẹn mỗi tuần, dựa trên lịch trống và ngân sách giờ còn dư | S-002 dòng72 | chức năng | thấp — "lịch trống" cần dữ liệu lịch mà tính năng đọc lịch đã bị hoãn ra sau V1, xem Q-013 |
| R-099 | Hệ thống nhắc ngày quan trọng của người quan trọng | S-002 dòng72 | chức năng | thấp — không rõ "ngày quan trọng" là gì ngoài năm sinh, và schema chưa có chỗ lưu, xem Q-018 |

---

## Đối chiếu code hiện có

Ba file trong `code/fe/src/core/` đã implement một phần công thức mục Tỷ giá đời, Vốn tự do, Quy đổi chi tiêu — trước cả khi vòng phân tích này chạy. Đối chiếu từng công thức thật trong code với `docs/03-formulas.md`, không sửa code, chỉ báo cáo.

### `lifeRate.ts` — lệch công thức, cần chốt trước khi code tiếp

`docs/03-formulas.md` dòng 26-27 viết:
```
realWorkHours = (workMinutes + commuteMinutes + prepMinutes + recoveryMinutes) / 60
lifeRate = netIncome / (realWorkHours × 52 / 12)
```
Hệ số `× 52 / 12` có nghĩa: `workMinutes` và các trường liên quan trong công thức gốc là số liệu **theo tuần** (khớp với bảng `workLoad` — "Tải công việc theo tuần, một bản ghi mỗi tuần", S-003 dòng27-31), cần quy đổi sang giờ trong một tháng bằng cách nhân số tuần rồi chia 12 tháng.

`code/fe/src/core/lifeRate.ts` lại không có bước nhân `52/12` này. Hàm `calculateLifeRate` nhận `WorkPeriodInput[]`, mỗi phần tử có `month` và các trường phút — chú thích trong code ghi rõ `workMinutes` là *"monthly total"*. Với dữ liệu đầu vào đã coi là tổng theo tháng, code tính thẳng:
```
ratePerHour = totalIncome / totalRealWorkHours   // tổng nhiều tháng, không nhân 52/12
```
File test `code/fe/src/core/__tests__/lifeRate.test.ts` xác nhận cách hiểu này: `workMinutes: 12_000` cho một tháng được test kỳ vọng ra "200 giờ" (`12000/60`), và với thu nhập 30 triệu thì `ratePerHour` kỳ vọng đúng bằng `150_000` — tức `30_000_000 / 200`, không nhân thêm hệ số nào.

Đây là hai cách hiểu khác nhau về cùng một input, không phải một bên đúng một bên sai hiển nhiên:
- Nếu `WorkPeriodInput.workMinutes` được tạo ra bằng cách **cộng dồn nhiều bản ghi `workLoad` theo tuần thành một tháng** trước khi gọi hàm, thì tổng phút đã là số thật của cả tháng — công thức của code đúng, và hệ số `52/12` trong `docs/03-formulas.md` chỉ là cách viết tắt cho trường hợp người dùng nhập một con số/tuần duy nhất rồi ước lượng ra tháng, không áp dụng khi đã có dữ liệu tháng thật.
- Nếu thiết kế thật sự là mỗi tuần một dòng và lifeRate phải suy ra từ **một tuần đại diện** nhân lên, thì code đang thiếu hệ số `52/12` và sẽ tính sai tỷ giá đời — chênh lệch khoảng 4,33 lần (vì `52/12 ≈ 4,33`).

Không tự chọn bên nào — chuyển thành câu hỏi mức Chặn, xem `docs/dac-ta/cau-hoi-v2.md` mã Q-010.

Hai biên khác của mục Tỷ giá đời **chưa implement trong code**, không phải lỗi công thức mà là tính năng thiếu:
- "Nhiều nguồn thu" (R-070) — `WorkPeriodInput` chỉ có một `netIncome` mỗi kỳ, không có khái niệm nhiều dòng income với giờ riêng từng dòng.
- "Thu nhập thụ động không tính vào tỷ giá đời" (R-071) — không có trường nào phân biệt thu nhập chủ động/thụ động trong `WorkPeriodInput` hay `Money.ts`.
- "Người không đi làm → ẩn hoàn toàn" (R-073) khác với "`realWorkHours = 0` → hiện thông báo cần nhập giờ" (R-072) — code chỉ có một trạng thái `no_work_hours` chung cho cả hai trường hợp, chưa phân biệt được.

### `freedomCapital.ts` — khớp công thức, không phát hiện lệch

Đối chiếu từng biên trong `docs/03-formulas.md` dòng 44-68 với `calculateFreedomCapital`:
- `freedomMonths = max(0, netWorth) / monthlyExpense` — code tách nhánh `netWorth < 0` thành trạng thái `in_debt` riêng thay vì tính ra 0 rồi hiển thị 0, nhưng kết quả hiển thị cuối cùng tương đương với yêu cầu "không hiện số âm" (R-078).
- Ba bậc hiển thị (ngày / tháng / năm) đúng biên: `months < 1` → ngày, `months ≤ 24` → tháng, `months > 24` → năm 1 chữ số thập phân — khớp chính xác `docs/03-formulas.md` dòng 50-53, kể cả điểm biên đúng 24 tháng vẫn thuộc nhóm "tháng" chứ không nhảy sang "năm".
- `freedomDaysGained` chỉ tính khi `monthlySaving > 0`, trả `null` khi `monthlySaving` bằng 0 hoặc âm — khớp R-080 ("`monthlySaving ≤ 0` → không tính quãng đường").
- `distanceMonths` khi `in_debt` chỉ tính khi có `monthlySaving > 0` — khớp R-078.

Không có phát hiện sai lệch nào ở file này.

### `expenseConversion.ts` — khớp công thức, một điểm không có nguồn

`hoursCost = amount / lifeRate` và `freedomDaysCost = amount / monthlyExpense × 30` khớp đúng R-083, R-084. Xử lý `lifeRate = null` hoặc `= 0` → `hoursCost = null`, và `monthlyExpense = 0` → `freedomDaysCost = null`, đều hợp lý và không mâu thuẫn nguồn nào.

Một nhánh không có căn cứ trong `docs/03-formulas.md`: khi `amount = 0`, code trả về `{ hoursCost: 0, freedomDaysCost: 0 }` thay vì suy ra từ công thức (vốn sẽ luôn ra 0 dù `lifeRate` là gì). Đây là một lựa chọn hợp lý về mặt toán học nhưng không được nguồn nào xác nhận — không phải lỗi, ghi nhận là giả định ngầm đã có sẵn trong code, đưa vào `docs/dac-ta/gia-dinh-v2.md` mã A-007 thay vì bịa thành yêu cầu.

Về ràng buộc R-085 (không áp quy đổi cho `timeEntry.bucket = 'people'`): bản thân hàm `convertExpense` không nhận `timeEntry` làm input nên không thể vi phạm trực tiếp, nhưng ràng buộc này chỉ giữ được nếu tầng gọi hàm (UI/store) không bao giờ truyền dữ liệu giờ vàng vào — cần kiểm tra lại ở bước thiết kế UC-22, không phải lỗi ở tầng `core/` hiện tại.

### `Money.ts`, `Expense.ts`, `WorkLoad.ts`, `Person.ts` — khớp `02-data-model.md`

Bốn entity backend khớp đúng field-by-field với bảng tương ứng trong S-003: `money` (netIncome, monthlyExpense, netWorth, debt), `expense` (amount, description, bucket, sourceType, confirmed), `workLoad` (weekStart, workMinutes, commuteMinutes, prepMinutes, recoveryMinutes), `person` (đã có sẵn `dunbarRing: 5|15|50` từ V1, chưa dùng). Không phát hiện lệch trường hay kiểu dữ liệu.
