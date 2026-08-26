# Yêu cầu

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25. Mỗi dòng một yêu cầu, mã `R-xxx`, truy vết được về nguồn trong `docs/nguon/kiem-ke.md`.
>
> Phạm vi bóc chi tiết: **V1** (M1 Thời gian + M5 Khoảnh khắc, theo S-006). Các module V2 trở đi được **ghi nhận** ở nhóm cuối để không mất dấu, nhưng chưa bóc tới mức use-case — đúng phạm vi được giao cho vòng G1 này.

## Ràng buộc cứng — áp dụng toàn bộ vòng đời sản phẩm, không riêng V1

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-001 | Tổng thao tác nhập liệu của người dùng không vượt quá 60 giây mỗi ngày | S-001 tr.dòng56, S-006 dòng109 | ràng buộc | cao |
| R-002 | Hệ thống không bao giờ quy đổi thời gian thuộc bucket `people` (giờ vàng) sang tiền, ở bất kỳ đâu | S-004 dòng81-82, S-001 dòng54 | ràng buộc | cao |
| R-003 | Đồng hồ cát mặc định tắt cho mọi người, chỉ bật khi người dùng chủ động chọn | S-004 dòng103, S-003 dòng18 (`hourglassEnabled` default false) | ràng buộc | cao |
| R-004 | Khi Đồng hồ cát hiển thị, luôn kèm một hành động cụ thể ngay bên dưới | S-004 dòng104 | ràng buộc | cao |
| R-005 | Đồng hồ cát không dùng ngôn ngữ đếm ngược sinh tử — viết "còn khoảng N lần gặp", không viết "còn N năm" | S-004 dòng105 | ràng buộc | cao |
| R-006 | Mỗi card Đồng hồ cát có nút ẩn vĩnh viễn | S-004 dòng106 | ràng buộc | cao |
| R-007 | Ứng dụng không có streak, không có badge, không có thông báo hay màu đỏ báo "chưa đủ" | S-006 dòng121 | ràng buộc | cao |
| R-008 | Chuỗi hiển thị dùng sentence case, không dấu chấm than, không dùng "nên/phải/hãy" | S-001 dòng41-43 | ràng buộc | cao |
| R-009 | Tiền lưu bằng số nguyên VND, không dùng số thực | S-003 dòng5 | ràng buộc | cao |
| R-010 | Thời lượng lưu bằng số nguyên phút, không dùng giờ thập phân | S-003 dòng6 | ràng buộc | cao |
| R-011 | Dữ liệu nằm hoàn toàn trên máy người dùng ở V1, không đồng bộ server | S-006 dòng4, dòng120 | ràng buộc | cao |
| R-012 | Người dùng xuất được toàn bộ dữ liệu ra JSON | S-006 dòng100, dòng120 | chức năng | cao |
| R-013 | Người dùng xoá được toàn bộ dữ liệu của mình | S-006 dòng101 | chức năng | cao |
| R-049 | Toàn bộ `src/core/` là hàm thuần, không phụ thuộc React, có test | S-004 dòng3, S-006 dòng119 | ràng buộc | cao |
| R-050 | Test `src/core/` phủ hết trường hợp biên mô tả trong S-004 | S-006 dòng119 | phi chức năng | cao |
| R-051 | Ứng dụng chạy được trên cả iOS và Android | S-006 dòng122 | phi chức năng | cao |
| R-052 | Mỗi bảng dữ liệu có `id` (uuid v7), `createdAt`, `updatedAt`, `deletedAt` | S-003 dòng8 | ràng buộc | cao |
| R-053 | Schema viết đầy đủ 13 bảng ngay từ đầu, chỉ migration dần theo phiên bản, không thiết kế lại giữa chừng | S-003 dòng140 | ràng buộc | cao |

## Giới hạn phạm vi V1

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-054 | V1 không bao gồm tính năng AI | S-006 dòng4 | ràng buộc | cao |
| R-055 | V1 không bao gồm đồng bộ dữ liệu qua server | S-006 dòng4 | ràng buộc | cao |
| R-056 | V1 không bao gồm module Tài chính (M2) | S-006 dòng4, S-005 dòng9-10 | ràng buộc | cao |
| R-057 | V1 không bao gồm module Mục tiêu (M3) | S-006 dòng4, S-005 dòng9-11 | ràng buộc | cao |

## Onboarding (V1)

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-014 | Bước 1 hỏi "Ai là người bạn muốn giữ thời gian cho?" — chọn nhiều từ Con/Bố mẹ/Bạn đời/Bạn thân/Bản thân, chưa hỏi tên | S-006 dòng38-39 | chức năng | cao |
| R-015 | Bước 2 cho nhập tên từng người đã chọn vai trò, trên một màn hình danh sách | S-006 dòng40 | chức năng | cao |
| R-016 | Bước 3 hỏi tần suất mong muốn gặp mỗi người (lần/tháng) bằng slider, mặc định theo vai trò (con: hằng ngày, bố mẹ: 2 lần/tháng) | S-006 dòng41 | chức năng | cao |
| R-017 | Onboarding không hỏi tuổi, không hỏi thu nhập | S-006 dòng42 | ràng buộc | cao |
| R-018 | Tuổi và khoảng cách chỉ hỏi khi người dùng chủ động bật Đồng hồ cát trong Settings, kèm giải thích lý do cần và luôn tắt được | S-006 dòng44 | chức năng | cao |
| R-019 | Toàn bộ onboarding hoàn thành dưới 90 giây | S-006 dòng115 | phi chức năng | cao |

## Màn hình Hôm nay (M1)

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-020 | Hiển thị một dòng chính dạng "Tuần này bạn có N giờ vàng." | S-006 dòng52 | chức năng | cao — xem ghi chú sửa bên dưới |
| R-021 | Hiển thị danh sách người đã ở cùng hôm nay, kèm avatar và số phút | S-006 dòng55 | chức năng | cao |
| R-022 | Có nút "Bắt đầu" → chọn người → đếm giờ chạy nền | S-006 dòng56 | chức năng | cao |
| R-023 | Có nút phụ "Ghi nhanh" → chọn người + chọn khoảng (30 phút / 1 giờ / 2 giờ / tự nhập) | S-006 dòng57 | chức năng | cao |
| R-024 | Có một ô nhập khoảnh khắc luôn hiện, gõ và enter là ghi xong | S-006 dòng58 | chức năng | cao |
| R-025 | Không có dashboard, biểu đồ, phần trăm, hay so sánh với tuần trước | S-006 dòng60 | ràng buộc | cao |

## Giờ vàng — công thức (M1)

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-026 | `goldenHoursPerWeek` = tổng phút của `timeEntry` có bucket `people` hoặc `self`, trong 7 ngày qua, chia 60 | S-004 dòng10-12 | chức năng | cao |
| R-027 | Hiển thị làm tròn 1 chữ số thập phân | S-004 dòng15 | chức năng | cao |
| R-028 | Tuần chưa đủ 7 ngày dữ liệu → hiển thị "đang tính, cần thêm N ngày", không ngoại suy | S-004 dòng18 | chức năng | cao |
| R-029 | Chưa có dữ liệu nào → không hiện số 0, hiện lời mời ghi lần đầu | S-004 dòng19 | chức năng | cao |

## Màn hình Đồng hồ cát (M1)

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-030 | Mặc định trống, chỉ có một dòng giải thích và nút bật | S-006 dòng66 | chức năng | cao |
| R-031 | Sau khi bật, mỗi người một card: tên, nhịp gặp hiện tại, số lần gặp còn lại, nút "Đặt lịch gọi", nút "Ẩn card" | S-006 dòng68-78 | chức năng | cao |
| R-032 | Chạm vào card mở lịch sử gặp gỡ (từ `timeEntry` và `moment` liên quan) và nút "hẹn lần tới" | S-006 dòng81 | chức năng | cao |
| R-033 | Công thức với con: `yearsLeft = 18 − childAge`; `hoursLeft = currentWeeklyHours × 52 × yearsLeft` | S-004 dòng90-92 | chức năng | cao |
| R-034 | Công thức với bố mẹ ở xa: `yearsLeft = max(0, lifeExpectancy − parentAge)` (mặc định 78, cho sửa); `visitsLeft = visitsPerYear × yearsLeft`; `daysTogether = visitsLeft × daysPerVisit` | S-004 dòng96-100 | chức năng | cao |

## Màn hình Khoảnh khắc (M5)

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-035 | Dòng thời gian ngược, gộp theo tháng, mỗi mục một dòng chữ kèm ảnh nếu có và người liên quan | S-006 dòng87 | chức năng | cao |
| R-036 | Nút ghi khoảnh khắc mới luôn nổi ở góc màn hình | S-006 dòng88 | chức năng | cao |
| R-037 | Cuối mỗi tháng hiện banner "Tháng N của bạn có X khoảnh khắc", chạm để xem lại dạng slideshow | S-006 dòng90 | chức năng | cao |
| R-038 | Ghi khoảnh khắc dưới 15 giây, hỗ trợ chữ / ảnh / giọng | S-002 dòng69, S-006 dòng117 | chức năng | cao |
| R-039 | Khoảnh khắc không chấm điểm, không streak | S-002 dòng69 | ràng buộc | cao |

## Settings (V1)

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-040 | Danh sách người quan trọng, thêm/sửa/xoá được | S-006 dòng96 | chức năng | cao |
| R-041 | Bật/tắt Đồng hồ cát riêng cho từng người | S-006 dòng97 | chức năng | cao |
| R-042 | Giờ giới nghiêm buổi tối, mặc định 21h | S-006 dòng98, S-002 dòng95 | chức năng | cao |
| R-043 | Ngày trắng (chọn thứ trong tuần), mặc định tắt | S-006 dòng99, S-002 dòng94 | chức năng | cao |
| R-044 | Xuất dữ liệu ra JSON | S-006 dòng100 | chức năng | cao |
| R-045 | Xoá toàn bộ dữ liệu | S-006 dòng101 | chức năng | cao |

## Widget & nhập nhanh (V1)

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-046 | Widget màn hình chính hiển thị 3 avatar người hay gặp nhất, chạm 1 phát bắt đầu đếm | S-006 dòng107 | chức năng | vừa — chưa rõ cửa sổ thời gian tính "hay gặp nhất", xem Q-005 |
| R-047 | Có iOS Shortcut / Android quick tile ghi "1 giờ với [người]" | S-006 dòng108 | chức năng | cao |
| R-048 | Một lượt ghi tối đa 3 chạm | S-006 dòng109 | phi chức năng | cao |

## Định nghĩa xong & cột mốc (V1)

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-063 | 8 tiêu chí DoD V1: onboarding <90s · ghi giờ vàng 3 chạm có widget · ghi khoảnh khắc <15s có ảnh · đồng hồ cát bật/tắt mặc định tắt luôn kèm hành động · `core/` có test phủ biên · dữ liệu local xuất JSON · không streak/badge/thông báo đỏ · chạy iOS+Android | S-006 dòng115-122 | phi chức năng | cao |
| R-064 | Cuối V1 cần đạt 50 người dùng thật, ≥30% còn ghi ở tuần thứ 4 | S-005 dòng19 | phi chức năng | cao |

## Ghi nhận roadmap V2 trở đi — chưa bóc use-case ở vòng này

| Mã | Phát biểu | Nguồn | Loại | Độ tin |
|---|---|---|---|---|
| R-058 | V2 (tháng 4-6) bật M2 Tài chính (tỷ giá đời, vốn tự do, quy đổi chi tiêu) và M6 Kết nối, phụ thuộc `person` và `timeEntry` từ V1 | S-005 dòng10 | giả định | cao |
| R-059 | V3 (tháng 7-9) bật M3 Mục tiêu và M7 Không gian chung, phụ thuộc tỷ giá đời từ V2 | S-005 dòng11 | giả định | cao |
| R-060 | V4 (tháng 10-12) bật M12 Lá thư Chủ nhật, M4 Thân thể, lớp Sống chậm, phụ thuộc ≥6 tháng dữ liệu | S-005 dòng12 | giả định | cao |
| R-061 | V5 (năm 2) bật M8 Tâm trí, M9 Di sản, M10 Học hỏi, M11 Đồ đạc, Nhịp mùa | S-005 dòng13 | giả định | cao |
| R-062 | Công thức V2 đã có sẵn trong S-004 (Tỷ giá đời §2, Vốn tự do §3, Quy đổi chi tiêu §4) — chưa gắn UC vì ngoài phạm vi V1, nhưng đã có code implement một phần trong `code/fe/src/core/lifeRate.ts`, `freedomCapital.ts`, `expenseConversion.ts` (xem ghi chú quyết định trong PROJECT.yaml) | S-004 §2-4 | giả định | cao |

## Sửa sau khi đối chiếu code — 2026-08-25

**R-020 đổi "Hôm nay" thành "Tuần này".** Nguồn S-006 dòng 52 viết "Hôm nay bạn có 2 giờ vàng", nhưng R-026 (cùng nguồn, từ `03-formulas.md`) định nghĩa giờ vàng tính trên cửa sổ 7 ngày. Hai câu này của cùng một bộ tài liệu mâu thuẫn nhau: nói "Hôm nay" mà hiện con số của cả tuần là nói sai sự thật với người dùng, trái thẳng nguyên tắc "đặt sự thật lên bàn" trong `00-vision.md`.

Người dùng đã chốt ngày 2026-08-25: giữ công thức 7 ngày, sửa lại chữ. Đây là sửa nguồn, không phải sửa yêu cầu theo code — nếu sau này muốn đúng chữ "Hôm nay" thì phải đổi cả công thức, và mất ý nghĩa của chỉ số giờ vàng vốn đo theo tuần.

## Ghi chú soi nhập nhằng — không tạo yêu cầu mới, chỉ đánh dấu để đối chiếu ở `cau-hoi.md`

Ba chỗ dưới đây được phát hiện khi bóc bảng này nhưng **không thể viết thành một yêu cầu rõ ràng đạt đủ bốn tiêu chí** (nghiệm thu được, có nguồn, đo được, có tác nhân) vì bản thân nguồn còn mâu thuẫn hoặc thiếu. Xem chi tiết ở `docs/dac-ta/cau-hoi.md` mã Q-001, Q-002, Q-003.
