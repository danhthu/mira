# Phân quyền

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25.

## Một vai trò duy nhất

Mira V1 là ứng dụng local-first, một người một máy (R-011). Không có tài khoản, không có đăng nhập nhiều người, không có vai trò quản trị/kiểm duyệt. `person` trong dữ liệu (con, bố mẹ, bạn đời...) là **đối tượng được ghi nhận**, không phải tài khoản đăng nhập vào app.

| Vai trò | Ai | Quyền |
|---|---|---|
| Người dùng | Chủ thiết bị | Toàn quyền đọc/ghi/xoá mọi dữ liệu của chính mình |

## Đối chiếu checklist-mien — mục "Người dùng và quyền"

| Câu hỏi checklist | Trả lời |
|---|---|
| Danh sách vai trò, tên gì | Một vai trò duy nhất: Người dùng (xem trên) |
| Cách đăng nhập | Không có — app mở trực tiếp vào dữ liệu cục bộ của máy đó, không tài khoản |
| Người nhập có tự duyệt được không | Không áp dụng — không có luồng duyệt, mọi bản ghi do người dùng tạo có hiệu lực ngay |
| Quên mật khẩu | Không áp dụng — không có mật khẩu |
| Khoá tài khoản | Không áp dụng — không có tài khoản |
| Xác thực hai lớp | Không áp dụng |

**Kết luận:** không phát sinh câu hỏi nào từ mục này — checklist trả lời được hết ngay từ bản chất local-first, không cần đưa vào `cau-hoi.md`.

## M7 Không gian chung (V3) — ghi chú để không quên

`01-modules.md` mô tả M7 cho phép 2 người chung ngân sách giờ, chung ví — đây là lúc khái niệm "vai trò thứ hai" mới xuất hiện thật. Ngoài phạm vi vòng phân tích này (V1 chỉ M1+M5), ghi nhận lại để phần phân quyền phải viết lại từ đầu khi tới V3, không phải mở rộng dần từ bảng một-vai-trò ở trên.
