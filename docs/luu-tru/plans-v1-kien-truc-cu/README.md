# Lưu trữ — kế hoạch V1 theo kiến trúc cũ

Sáu file trong thư mục này sinh ngày 2026-08-25 (skill `lap-ke-hoach`, cổng G3), viết cho app Mira tự xây với kiến trúc `features/`/`core/`/`db/` + SQLite/Drizzle. App đó bị thay hoàn toàn bằng khung Batify ngày 27/08 (commit `d633408`).

**Chuyển vào đây ngày 2026-09-05, hai lý do:**

1. Chúng nằm ở `plans/` gốc repo nhưng `PLAN.md` mới **không còn tham chiếu** — tài liệu mồ côi.
2. Mỗi file ghi "ứng với nhóm X trong `PLAN.md`", mà `PLAN.md` viết lại 27/08 có nhóm A–E mang nghĩa hoàn toàn khác (A = hạ tầng, B = HabitTracker, C = Work, D = lỗi kiểu, E = chốt). Ai đọc theo nhóm D của `PLAN.md` mà mở `mira-v1-d-khoanh-khac.md` sẽ lạc sang chuyện khác hẳn.

**Vẫn còn giá trị:** phần phân tích khoảng trống yêu cầu không phụ thuộc kiến trúc. Ví dụ `mira-v1-d` chỉ ra R-038 đòi ghi khoảnh khắc đủ ba dạng (chữ/ảnh/giọng) mà mới có hai, và `personIds` luôn rỗng vì luồng ghi không cho chọn người. Những nhận xét đó vẫn đúng khi xây lại Khoảnh khắc trên khung mới.

Kế hoạch đang dùng: [`../../../PLAN.md`](../../../PLAN.md).
