# CHECKLIST — bật Growth OS chạy toàn bộ

Thứ tự này mở khoá dần: bước 0 chạy được ngay, mỗi bước sau mở thêm một nhánh agent. Tích xong bước nào, nói trong chat để CGO ghi DECISION_LOG.

## 0. Chạy ngay hôm nay (0 phút chuẩn bị)

- [ ] Commit hệ thống (nhánh `laptop`):
  ```bash
  git add .claude/agents .claude/skills growth/os CLAUDE.md .gitignore && git commit -m "feat(growth): add Mira Growth OS — agents, skills, CLI, scheduler, sprint S1"
  ```
- [ ] Gọi CGO lần đầu trong Claude Code: *"Dùng skill task-orchestration, lập kế hoạch hôm nay cho Mira Growth OS và giao 3 task READY cho agent."* → 8 task không cần credential sẽ chạy (phân tích sản phẩm, đối thủ, từ khoá, cộng đồng, duyệt 14 bài blog, brand token, GA4 plan).
- [ ] Cuối ngày: `node growth/os/bin/os.mjs run daily-report --force` rồi đọc `growth/os/reports/daily/<hôm nay>.md`.

## 1. Quyết định bằng lời (5 phút, trả lời trong chat)

- [ ] **T-0001** Install = Android + iOS + PWA, waitlist tách riêng — đồng ý? Ngày dự kiến có build store?
- [ ] **T-0002** Tên miền thật của blog/landing + nơi host (hiện `mira.trady360.com`, chưa deploy).
- [ ] **T-0012** ESP newsletter: Buttondown / MailerLite / Substack / khác?
- [ ] Định hướng paid: giữ trần 100 USD, chỉ thử từ Phase 3 — đồng ý?

## 2. Tài khoản & quyền (30–60 phút, chỉ bạn làm được)

- [ ] **T-0013** Tạo Facebook Page, Threads, TikTok cho Mira → gửi URL. (Chưa có thì agent vẫn soạn post, bạn đăng tay.)
- [ ] **T-0019** Cho phép gắn GA4 vào `growth/blog` (tạo property, gửi Measurement ID qua chat — không đụng app).
- [ ] Xác minh domain trong Search Console sau khi deploy blog.
- [ ] `GEMINI_API_KEY` vào `tools/admin/.env` nếu muốn sinh ảnh blog tự động.
- [ ] (Tuỳ chọn) Cấu hình skill `telegram-report-bot` để nhận báo cáo 20:00 trên điện thoại.

## 3. Bật tự động (10 phút) — **T-0021**

- [ ] Job script (Windows Task Scheduler):
  ```bash
  powershell -ExecutionPolicy Bypass -File growth/os/scheduler/install-windows-tasks.ps1
  ```
  Kiểm: `node growth/os/bin/os.mjs runs` sáng hôm sau có dòng OK.
- [ ] Job Claude — tạo scheduled task trong Claude Code (nói *"dùng skill schedule"* hoặc UI), tối thiểu 4 cái, prompt lấy từ `growth/os/scheduler/jobs.json`:
  - [ ] `cgo-plan` 08:00 hằng ngày
  - [ ] `morning-production` 09:00 T2–T7
  - [ ] `afternoon-distribution` 13:00 T2–T7
  - [ ] `daily-report-insights` 20:10 hằng ngày
  - [ ] (nên) `weekly-plan` T2 08:30 · `weekly-review` T6 17:15 · `memory-consolidate` 18:15
- [ ] Máy mở app Claude Code vào các giờ đó (job bỏ qua nếu app đóng; CGO bù vào lần chạy kế).

## 4. Mở khoá nhánh nội dung ra ngoài (sau bước 1–2)

- [ ] Deploy blog lần đầu (`cd growth/blog && npm run build`, đẩy `dist/` lên host đã chọn) → agent `seo-content` publish 1 bài/ngày theo lịch.
- [ ] Duyệt 14 post social đầu tiên: `node growth/os/bin/os.mjs content list --status REVIEW` → xem file ở `growth/os/content/social/`, rồi `content update K-xxxx --status APPROVED --actor founder`.
- [ ] Duyệt danh sách outreach khi có: `node growth/os/bin/os.mjs approval list` → `approval decide <id> --status APPROVED`.

## 5. Nhịp của bạn sau khi hệ thống chạy (≈10 phút/ngày)

- Sáng: đọc `growth/os/reports/daily/<hôm qua>.md`, mục **CẦN FOUNDER** — trả lời trong chat.
- `node growth/os/bin/os.mjs approval list` — duyệt/từ chối.
- Thứ Sáu: đọc `growth/os/reports/weekly/`, quyết experiment nếu CGO hỏi.
- Khi có số thật (ESP, GA4, store): `node growth/os/bin/os.mjs metric add ...` hoặc đưa CSV vào `growth/os/analytics/imports/` và nói CGO nạp.

## Dấu hiệu hệ thống đang chạy đúng

- `node growth/os/bin/os.mjs status`: IN_PROGRESS/DONE tăng mỗi ngày, overdue = 0.
- `growth/os/logs/ALERTS.md` không có dòng mới.
- Báo cáo ngày không còn dòng "Chưa có số đo nào được nạp" sau khi có GA4/ESP.
