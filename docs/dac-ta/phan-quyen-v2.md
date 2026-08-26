# Phân quyền — V2

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25.

## Vẫn một vai trò duy nhất — với một chỗ chưa chốt được

`docs/dac-ta/phan-quyen.md` (V1) đã ghi chú trước: M7 Không gian chung (V3) là nơi "vai trò thứ hai" thật sự xuất hiện — hai người cùng đăng nhập, cùng sửa một dữ liệu. V2 chưa tới đó, nhưng Ví chung (M2) và toàn bộ M6 Kết nối con người đưa khái niệm "người khác" vào gần hơn một bước, nên phần này cần viết lại thay vì chỉ kế thừa bảng một-vai-trò cũ.

| Vai trò | Ai | Quyền |
|---|---|---|
| Người dùng | Chủ thiết bị | Toàn quyền đọc/ghi/xoá mọi dữ liệu của chính mình, bao gồm dữ liệu mô tả người khác (Ví chung, nhật ký gặp gỡ, nhiệt kế quan hệ) |

Không có vai trò thứ hai đăng nhập ở V2. `person` (bao gồm người có vai trò `partner` dùng cho Ví chung) vẫn là **đối tượng được ghi nhận** bởi Người dùng, không phải tài khoản riêng — đúng nguyên tắc đã lập ở V1.

## Vì sao đây là "khả năng ngắn", không phải kết luận chắc

Ví chung (R-089, UC-26) được mô tả trong `01-modules.md` là "minh bạch giữa các bên" — cụm "các bên" gợi ý có ít nhất hai người cùng xem được cùng một dữ liệu tài chính. Nếu đúng vậy, đây đã là một hình thức multi-user thật (hai thiết bị, hai người, cùng nhìn một sổ), không còn là "một người quan sát dữ liệu về người khác" như phần còn lại của app.

Ba khả năng, không tự chọn:

1. **Ví chung chỉ là ghi chép một chiều** — Người dùng tự nhập, tự xem, người kia không có quyền truy cập app. "Minh bạch" chỉ có nghĩa Người dùng có thể xuất/chia sẻ dữ liệu ra ngoài (ảnh chụp màn hình, export) để cho người kia xem thủ công. Giữ nguyên mô hình một-vai-trò ở trên, không cần sửa gì.
2. **Ví chung cần đồng bộ hai thiết bị** — Cần một cơ chế chia sẻ dữ liệu thật giữa hai máy, mâu thuẫn với R-011 (V1: "dữ liệu nằm hoàn toàn trên máy người dùng, không đồng bộ server" — lưu ý phát biểu gốc ghi rõ "ở V1", chưa nói gì cho V2). Nếu đúng hướng này, đây là một hạng mục kiến trúc lớn chưa ai nhắc tới trong `docs/00-04`.
3. **Ví chung dùng cùng mô hình với M7 sau này** — thiết kế tạm cho V2 theo hướng 1 (một chiều), rồi thay bằng cơ chế multi-user thật của M7 ở V3, chấp nhận phải làm lại.

Không đủ căn cứ để chọn — chuyển thành câu hỏi mức Chặn, xem `docs/dac-ta/cau-hoi-v2.md` mã Q-011 (cấu trúc dữ liệu Ví chung) và Q-012 (có cần đồng bộ hai thiết bị hay không). Bảng vai trò ở trên tạm viết theo khả năng 1 vì đó là phương án ít thay đổi kiến trúc nhất, nhưng chưa phải quyết định cuối.

## M6 Kết nối con người — không phát sinh vai trò mới

Năm tính năng của M6 (Dunbar, nhiệt kế quan hệ, nhật ký gặp gỡ, gợi ý hẹn gặp, nhắc ngày quan trọng) đều là Người dùng quan sát và ghi chép về người khác, không có luồng nào cần người khác đăng nhập hay duyệt. Không phát sinh câu hỏi phân quyền từ M6.

## Đối chiếu checklist-miền — mục "Người dùng và quyền"

Kết quả giống hệt V1: không phát sinh câu hỏi nào từ mục đăng nhập/quên mật khẩu/khoá tài khoản/2FA, vì bản chất local-first chưa đổi ở V2. Câu hỏi duy nhất phát sinh ở vòng này nằm ở "Ai duyệt cái gì" khi Ví chung có hai bên cùng xem — nhưng đó là hệ quả của tính năng mới (Ví chung), không phải một mục checklist bị bỏ sót thường lệ.
