# Bảng giả định

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25. Mọi chỗ máy phải tự quyết vì không nguồn nào nói rõ, ghi lại ở đây để không lọt ra ngoài mà người dùng chưa nhìn thấy — bắt buộc đọc lại ở điểm dừng D4 trước khi bàn giao.

| Mã | Nội dung đã tự quyết | Vì sao phải tự quyết | Hệ quả nếu sai |
|---|---|---|---|
| A-001 | Tám chi tiết luồng phụ/ngoại lệ trong `use-case.md` không có nguồn trực tiếp, cần thiết để UC dùng được thật: (1) UC-01 cho bỏ qua bước chọn vai trò mà vẫn vào được app, (2) UC-02 nối lại phiên đếm nếu app bị đóng giữa chừng, (3) UC-06 không hiện banner tháng cho tháng không có khoảnh khắc, (4) UC-09 xoá `person` chỉ soft-delete, giữ lịch sử `timeEntry`/`moment` liên quan, (5) UC-12 xuất JSON qua luồng chia sẻ chuẩn của hệ điều hành (không phải lưu file trực tiếp), (6) UC-13 hỏi xác nhận đúng một lần trước khi xoá toàn bộ dữ liệu, (7) UC-14 widget hiện trạng thái trống khi chưa có `person` nào, (8) UC-15 shortcut mặc định ghi đúng 60 phút. | Đây là mức chi tiết UX cần có để một UC hoàn chỉnh và làm được, nhưng `docs/00-08` viết ở tầm sản phẩm, không xuống tới độ chi tiết luồng lỗi/luồng trống. Không có những dòng này thì UC không lập trình được, để trống cũng là một dạng tự quyết ngầm — nên viết rõ thay vì im lặng. | Nếu người dùng có ý khác (ví dụ: không cho bỏ qua bước chọn vai trò ở onboarding, hoặc xuất JSON phải lưu file cục bộ thay vì qua share sheet), sửa lại đúng dòng tương ứng trong `use-case.md` trước khi bước G3 chia việc theo UC này. |

## Đã chốt cùng người dùng ngày 2026-08-25

Ba câu mức Chặn (Q-001, Q-002, Q-003) được người dùng xác nhận trực tiếp theo đúng phương án đề xuất — không còn là giả định một chiều của máy, ghi lại trong `cau-hoi.md` mục Trả lời, không lặp lại ở đây.

Bốn câu còn lại không có phản hồi khác ngoài im lặng chấp nhận — theo luật skill, chuyển thành giả định:

| Mã | Nội dung đã tự quyết | Vì sao phải tự quyết | Hệ quả nếu sai |
|---|---|---|---|
| A-003 | Q-004: ô nhập "giờ/tuần mong muốn" nằm trong màn chi tiết khi chạm card Đồng hồ cát, mặc định bằng `currentWeeklyHours` | Không nguồn nào mô tả nơi nhập `targetWeeklyHours` | Nếu đặt sai chỗ (ví dụ Settings chung), phải sửa lại UC-08 và màn hình liên quan |
| A-004 | Q-005: widget "3 avatar hay gặp nhất" dùng cùng cửa sổ 7 ngày với Giờ vàng | Không nguồn nào định nghĩa cửa sổ thời gian cho "hay gặp nhất" | Nếu người dùng muốn cửa sổ khác (30 ngày, all-time), widget sẽ phản ánh sai thói quen gần đây |
| A-005 | Q-006: `lifeExpectancy` sửa được trong màn chi tiết mỗi card Đồng hồ cát, không phải Settings chung | `03-formulas.md` nói "cho sửa" nhưng không nói ở đâu | Nếu đặt chung một chỗ, không sửa riêng được cho bố và mẹ |
| A-006 | Q-008: bật Đồng hồ cát cho `person` vai trò `child` chặn ngay tại bước bật trong Settings nếu chưa có `birthYear`, không cho bật rồi báo lỗi sau | Trường `birthYear` là tuỳ chọn trong schema nhưng bắt buộc về mặt nghiệp vụ khi bật Đồng hồ cát cho con | Nếu cho bật trước, card sẽ trống hoặc lỗi — vi phạm R-004 "luôn kèm hành động cụ thể" |
