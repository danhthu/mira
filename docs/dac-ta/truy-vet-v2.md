# Truy vết hai chiều — UC ↔ R (V2)

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25.

## Chiều 1 — mỗi UC về R nào

| UC | Tên | Về yêu cầu |
|---|---|---|
| UC-16 | Nhập ảnh chụp tài chính hằng tháng | R-068, R-076 |
| UC-17 | Nhập tải công việc theo tuần | R-066 |
| UC-18 | Xem Tỷ giá đời | R-065, R-067, R-069, R-070, R-071, R-072, R-073 |
| UC-19 | Xem Vốn tự do | R-075, R-076, R-077, R-078, R-079, R-080, R-081, R-082 |
| UC-20 | Ghi khoản chi thủ công | R-086, R-088 |
| UC-21 | Xác nhận khoản chi từ SMS ngân hàng | R-087, R-088 |
| UC-22 | Xem quy đổi một khoản chi | R-083, R-084, R-085 |
| UC-23 | Xem danh sách chi tiêu vô nghĩa | R-090 |
| UC-24 | Lập ngân sách 6 khoang giá trị theo tiền | R-086 |
| UC-25 | Mô phỏng giảm ngày làm | R-091 |
| UC-26 | Thiết lập Ví chung | R-089 |
| UC-27 | Xếp người quan trọng vào vòng tròn Dunbar | R-095 |
| UC-28 | Xem và cập nhật nhiệt kế quan hệ | R-096 |
| UC-29 | Ghi nhật ký gặp gỡ một dòng | R-097 |
| UC-30 | Nhận gợi ý hẹn gặp hằng tuần | R-098 |
| UC-31 | Nhận nhắc ngày quan trọng | R-099 |

**Kiểm tra "UC có, R không":** không có chi tiết luồng nào trong `use-case-v2.md` thoát khỏi bảng trên — khác với V1, vòng này không thêm giả định luồng phụ nào có nguồn gốc kỹ thuật thuần tuý (dạng "nối lại phiên đếm khi app đóng"), vì phần lớn UC ở V2 còn thiếu đến mức chưa tới bước cần giả định luồng phụ — chúng đang chờ trả lời câu hỏi mức Chặn trước (UC-21, UC-24, UC-25, UC-26, UC-28, UC-29, UC-30, UC-31 đều có ít nhất một điểm chưa xác định, ghi ngay trong luồng chính/ngoại lệ của từng UC thay vì giấu đi).

## Chiều 2 — mỗi R về UC nào (hoặc lý do không cần UC)

| R | Về UC | Nếu không có UC, vì sao |
|---|---|---|
| R-065 | UC-18 | |
| R-066 | UC-17, UC-18 | |
| R-067 | UC-18 | |
| R-068 | UC-16 | |
| R-069 | UC-18 | |
| R-070 | UC-18 | |
| R-071 | UC-18 | |
| R-072 | UC-18 | |
| R-073 | UC-18 | |
| R-075 | UC-19 | |
| R-076 | UC-16, UC-19 | |
| R-077 | UC-19 | |
| R-078 | UC-19 | |
| R-079 | UC-19 | |
| R-080 | UC-19 | |
| R-081 | UC-19 | |
| R-082 | UC-19 | |
| R-083 | UC-22 | |
| R-084 | UC-22 | |
| R-085 | UC-22 | Cũng là ràng buộc chéo áp cho mọi nơi hiển thị `timeEntry`, UC-22 là nơi rõ nhất |
| R-086 | UC-20, UC-24 | |
| R-087 | UC-21 | |
| R-088 | UC-20, UC-21 | |
| R-089 | UC-26 | |
| R-090 | UC-23 | |
| R-091 | UC-25 | |
| R-092 | — | Ràng buộc phụ thuộc dữ liệu, không phải hành vi có màn hình riêng |
| R-093 | — | Chỉ số đo sau ra mắt, không phải hành vi trong app |
| R-094 | — | Ràng buộc mô hình kinh doanh (gói trả phí), không phải UC |
| R-095 | UC-27 | |
| R-096 | UC-28 | |
| R-097 | UC-29 | |
| R-098 | UC-30 | |
| R-099 | UC-31 | |

**Kiểm tra "R có, UC không" ngoài bảng trên:** không còn dòng nào bỏ trống lý do.

## Đối chiếu riêng — R nào đang "treo" vì câu hỏi mức Chặn chưa trả lời

Khác với V1 (nơi mọi R đều đủ rõ để viết UC dùng được ngay), năm R của V2 sinh ra UC nhưng bản thân UC đó chưa đủ chi tiết để bắt đầu thiết kế màn hình thật, vì phụ thuộc câu trả lời còn treo:

| R / UC | Câu hỏi đang chặn |
|---|---|
| R-089 / UC-26 | Q-011, Q-012 — cấu trúc dữ liệu và cơ chế chia sẻ của Ví chung |
| R-096 / UC-28 | Q-017 — cách tính nhiệt kế quan hệ |
| R-097 / UC-29 | Q-018 — nhật ký gặp gỡ có bảng riêng hay tái dùng `moment` |
| R-098 / UC-30 | Q-013 — nguồn dữ liệu "lịch trống" khi Đồng bộ lịch đã hoãn |
| R-099 / UC-31 | Q-018 — "ngày quan trọng" chưa có chỗ lưu trong schema |

Đây không phải lỗi truy vết — mỗi R vẫn về đúng một UC, chỉ là UC đó tự bản thân nó ghi rõ chỗ chưa xác định thay vì che đi. Không tạo thêm UC mới cho tới khi các câu hỏi này có câu trả lời.
