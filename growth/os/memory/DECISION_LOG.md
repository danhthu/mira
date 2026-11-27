# DECISION_LOG — chỉ thêm, không sửa/xoá dòng cũ

Khuôn: `- **YYYY-MM-DD** (ai) quyết định — lý do — ảnh hưởng`. Thêm bằng `node growth/os/bin/os.mjs memory log --file DECISION_LOG --text "..."`.

- **2026-10-13** (cgo) Chuyển thể "Autonomous Game Growth OS" cho Mira: giữ mục tiêu 1.000 người dùng/90 ngày và trần 100 USD; đổi "game" thành app Mira, đổi kênh ưu tiên theo người Việt (thêm THREADS, hạ REDDIT) — vì bản gốc là mẫu cho game, Founder yêu cầu "làm tương tự cho Mira".
- **2026-10-13** (cgo) Đặt hệ thống ở `growth/os/` thay vì `growth-system/` ở gốc — repo đã tách `growth/` theo CLAUDE.md gốc; agent ở `.claude/agents/`, skill ở `.claude/skills/`.
- **2026-10-13** (cgo) Dùng `node:sqlite` (Node 24 có sẵn) + CLI không dependency — tránh thêm package vào repo, chạy được ngay trên máy Founder.
- **2026-10-13** (cgo) Install = Android + iOS + PWA; waitlist tách riêng — app chưa lên store, cần chỉ số dẫn đường nhưng không được lẫn với install. **Chờ Founder xác nhận.**
- **2026-10-13** (cgo) Scheduler: job xác định chạy bằng `os run <job>` (Windows Task Scheduler / cron); job cần LLM chạy qua scheduled task của Claude Code desktop — vì không có CI, `claude` CLI không trong PATH, và phiên Claude Code không phải dịch vụ nền.
- **2026-10-13** (cgo) Gộp `competitor-analysis` vào `market-research`, và `keyword-research` tái dùng lane SEO của skill `mira-nghien-cuu` có sẵn — tránh hai skill trùng trách nhiệm. `gaming-community-research` đổi tên `community-research`, `game-product-analysis` đổi tên `product-analysis`.
- **2026-10-13** (cgo) Không thêm SDK analytics vào app ở V1 — ràng buộc cứng #5 local-first. Analytics chỉ trên blog/landing/PWA (GA4) và cần approval `code_change` nếu đụng `code/fe`.

- **2026-10-13** (cgo) Tạm dừng mọi nội dung nói 'dữ liệu nằm trên máy bạn' và mọi footage app cho tới khi Founder quyết T-0023 (App.tsx xoá dữ liệu mỗi lần mở) — bằng chứng growth/os/research/product-analysis-2026-10-13.md
