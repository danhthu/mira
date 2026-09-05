# ARCHITECTURE.md — Mira

> **File này đã được thay bằng con trỏ ngày 2026-09-05.**
>
> Bản trước (286 dòng) mô tả kiến trúc `app/src/features/` + SQLite/Drizzle + Zustand — lỗi thời hai lớp: thư mục gốc còn tên `app/` (đổi thành `code/fe/` từ đợt tái cấu trúc repo), và toàn bộ cây `features/`/`core/`/`db/` biến mất khi app bị thay bằng Batify ngày 27/08 (commit `d633408`).
>
> Giữ lại một tài liệu mô tả kiến trúc không tồn tại thì hại hơn lợi — người đọc sau sẽ tưởng đó là đích đến. Bản cũ vẫn tra được trong lịch sử git nếu cần:
> ```
> git show 41f8032~1:code/docs/ARCHITECTURE.md
> ```

Kiến trúc hiện tại nằm ở hai chỗ:

- **[`structure.md`](structure.md)** — cây thư mục thật, bốn luật import feature-based, trạng thái vi phạm hiện tại, và khoảng trống còn lại (chưa có tầng `core/`).
- **[`../CLAUDE.md`](../CLAUDE.md)** — luật bắt buộc khi viết code: anti-AI rules, quy ước ngôn ngữ, 6 ràng buộc cứng của sản phẩm, và danh sách nợ kỹ thuật của khung Batify.

Đặc tả sản phẩm (yêu cầu, use-case, công thức, mô hình dữ liệu) nằm ở [`../../docs/`](../../docs/) — không thuộc riêng `code/`.
