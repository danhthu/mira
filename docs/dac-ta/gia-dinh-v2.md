# Bảng giả định — V2

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25. Mã tiếp số từ A-007 (A-001 đến A-006 đã dùng ở V1). Mọi chỗ máy phải tự quyết vì không nguồn nào nói rõ, ghi lại ở đây để không lọt ra ngoài mà người dùng chưa nhìn thấy.

| Mã | Nội dung đã tự quyết | Vì sao phải tự quyết | Hệ quả nếu sai |
|---|---|---|---|
| A-007 | `convertExpense` trong code hiện có trả `{ hoursCost: 0, freedomDaysCost: 0 }` khi `amount = 0`, thay vì để công thức tự suy ra 0 | Đây là một nhánh đặc biệt trong code đã viết sẵn, không có dòng nào trong `03-formulas.md` xác nhận hay phủ nhận cách xử lý này — về mặt toán học kết quả giống nhau nên không phải lỗi, chỉ là chưa có nguồn xác nhận rõ ràng | Không có hệ quả thực tế vì công thức gốc cũng ra đúng 0 trong mọi trường hợp `lifeRate`/`monthlyExpense` hợp lệ — ghi lại cho đủ, không cần sửa |
| A-008 | UC-21 (xác nhận SMS ngân hàng): khoản `expense` chưa xác nhận (`confirmed = false`) không tính vào các phép tính cần dữ liệu đã xác nhận (Quy đổi chi tiêu, Ngân sách 6 khoang, Chi tiêu vô nghĩa) | Không nguồn nào nói rõ khoản chưa xác nhận có tính vào các phép tổng hợp hay không, nhưng để một khoản nháp (có thể sai số tiền do OCR/SMS đọc nhầm) lẫn vào số liệu chính thức là rủi ro rõ ràng hơn phương án ngược lại | Nếu người dùng muốn khoản chưa xác nhận vẫn tính tạm (ước lượng), phải sửa lại logic lọc ở mọi màn hình đọc `expense` |
| A-009 | `money.monthlySaving` (dùng trong `freedomDaysGained` và biên "netWorth âm") suy ra bằng `netWorth` tháng này trừ `netWorth` tháng trước, vì bảng `money` không có cột riêng cho `monthlySaving` | Schema `money` trong `02-data-model.md` không có trường này, nhưng công thức ở `03-formulas.md` dòng 56 và dòng 63 đều cần nó — phải chọn một cách suy ra để UC-19 dùng được | Nếu `netWorth` biến động vì lý do khác ngoài tiết kiệm (ví dụ thị trường chứng khoán lên xuống), cách suy này sẽ tính sai `monthlySaving`, làm lệch cả `freedomDaysGained` |

## Chưa chuyển thành giả định — đang chờ ở mức Chặn/Rủi ro

Khác với V1, vòng này còn năm câu hỏi mức Chặn (Q-009, Q-010, Q-011, Q-012, Q-018) và bốn câu mức Rủi ro/Để sau (Q-013 đến Q-017) chưa có câu trả lời tại thời điểm sinh tài liệu này. Theo đúng luật gốc của skill, các câu mức Chặn **không được tự trả lời** để chuyển thành giả định — phải giữ nguyên trong `cau-hoi-v2.md`, chờ người dùng. Bảng này sẽ được cập nhật thêm sau khi có câu trả lời, đúng quy trình đã áp dụng ở V1 (xem cách `gia-dinh.md` gốc tách phần "đã chốt cùng người dùng" ra khỏi phần giả định một chiều).
