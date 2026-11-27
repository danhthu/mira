# CURRENT_STATE — trạng thái hiện tại (đọc mỗi đầu phiên)

<!-- AUTO:BEGIN -->
_Cập nhật tự động 2026-10-13 bởi `os memory state` — đừng sửa tay trong khối này._
- Ngày 0/90 · installs 0/1000 (Android 0, iOS 0, PWA 0) · waitlist 0
- Task: 0 đang làm · 11 chờ · 2 kẹt · 13 xong · quá hạn 0
- Ngân sách: chi 0/100 USD · chờ duyệt 6
- Thử nghiệm mở: 1 · nội dung đã đăng: 0
<!-- AUTO:END -->

## Giai đoạn
Phase 1 · Foundation (ngày 1–14). Sprint S1 trong DB (`os task list --sprint S1`) và `growth/os/sprints/S1.md`.

## Đang chạy / vừa xong
- 2026-10-13: Dựng Growth OS (CLI, DB, memory, agent, skill, scheduler, test). Chưa có task nào DONE ngoài việc dựng hệ thống.

## Kẹt — cần Founder
1. Xác nhận định nghĩa install (gồm PWA) và ngày dự kiến có build store.
2. Chốt tên miền thật (hiện `mira.trady360.com`).
3. Cho phép tạo GA4 property cho blog/landing (không đụng app).
4. Chọn ESP newsletter miễn phí.
5. Tạo/cấp tài khoản social Mira (Facebook Page, Threads, TikTok) — hệ thống chỉ soạn nội dung, Founder đăng cho tới khi cấp quyền.
6. Bật scheduled tasks (xem `growth/os/scheduler/README.md`).

## Integration
| Nguồn | Trạng thái |
|---|---|
| Google Play Console | chưa có app → chưa nối; importer CSV sẵn |
| App Store Connect | chưa có app → chưa nối; importer CSV sẵn |
| GA4 (blog/landing) | chưa tạo property |
| Search Console | chưa xác minh domain |
| Meta Ads / Google Ads | chưa có tài khoản ads trong repo |
| Telegram báo cáo | skill `telegram-report-bot` có sẵn, chưa cấu hình cho Mira |

## Hạn chế attribution đã biết
Xem `growth/os/attribution/README.md`. UTM không nhận diện được từng install app; iOS không có referrer; PWA install chỉ đếm được khi có GA4 trên web build.
