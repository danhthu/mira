# FOUNDER_HANDOVER — Mira Growth OS, 2026-10-13

Bàn giao sau Stage 1–6. Mọi thứ dưới đây đã có trong repo, chạy được, và chưa commit (PROJECT.yaml cấm tự động commit — lệnh commit ở mục 12).

## 1. Audit repo
`growth/os/docs/REPOSITORY_AUDIT.md`, `EXISTING_CAPABILITIES.md`, `MISSING_CAPABILITIES.md`. Điểm quyết định: app **chưa lên store**, chưa build native, `app.json` còn tên vỏ `DailyOps`; blog có 91 bài draft, 0 published; không GA4/ESP/social. → Giai đoạn 1 chạy bằng waitlist + PWA + nội dung.

## 2. Kiến trúc
`docs/SYSTEM_ARCHITECTURE.md`, `DATA_MODEL.md`, `SCHEDULER_DESIGN.md`, `SECURITY_MODEL.md`, `AGENT_DESIGN.md`, `SKILL_DESIGN.md`. Đặt ở `growth/os/` (không phải `growth-system/` gốc) để khớp cấu trúc repo. Không dependency mới.

## 3. Agent (9) — `.claude/agents/`
growth-orchestrator (CGO, opus) · market-intelligence · aso-specialist · seo-content · social-growth · creative-studio · community-partnerships · paid-acquisition · growth-analytics (sonnet). Mỗi file: vai trò, memory cần đọc, trách nhiệm cụ thể cho Mira, skill, đầu ra, cấm, checklist DONE.

## 4. Skill (21 mới + 1 sẵn) — `.claude/skills/`
product-analysis · market-research (gộp competitor) · keyword-research · app-store-optimization · seo-content-production · blog-publishing · social-media-content · viral-content-creation · short-video-production · community-research · partnership-outreach · paid-advertising · growth-analytics · attribution-tracking · conversion-optimization · growth-experimentation · campaign-management · task-orchestration · daily-reporting · weekly-growth-review · memory-management · (sẵn) mira-nghien-cuu.

## 5. Cơ sở dữ liệu
SQLite `growth/os/db/growth.sqlite` (gitignore), lược đồ `db/schema.sql`: tasks, task_history, campaigns, expenses, content, experiments, metrics_daily, approvals, runs, locks, audit_log. CLI `growth/os/bin/os.mjs` là cổng duy nhất. Trạng thái commit được: `dashboard/`, `reports/`, `sprints/`, `memory/`.

## 6. Scheduler
`scheduler/jobs.json` (13 job: 5 script, 8 Claude). Script có lock/retry/idempotent/log/alert — đã test. Cài: `scheduler/README.md` (PowerShell script cho Windows + scheduled task Claude Code). **Chưa bật** — cần bạn chạy một lần (T-0021).

## 7. Integration
Không integration nào nối thật (không có app/GA4/ads để nối). Đường nạp CSV thủ công hoạt động (`metric import`, đã test với `analytics/csv-template.csv`). Hướng dẫn export từng nguồn: `analytics/README.md`. Attribution và giới hạn: `attribution/README.md`.

## 8. Analytics
Nguồn sự thật `metrics_daily` với `quality` = measured / estimated / unattributed. Báo cáo in riêng ba loại. Waitlist không cộng vào installs. Trong app: **không** ở V1 (ràng buộc #5).

## 9. Kết quả test
`node --test growth/os/tests/os.test.mjs` → **9/9 pass**: task (trùng, phụ thuộc, evidence), campaign (duyệt chỉ founder, trần), expense (trần tổng/campaign), content (workflow, giọng, URL), experiment (chặn SCALE phù phiếm), metrics (idempotent, ước tính cần note, snapshot), attribution (UTM), scheduler (lock, idempotent/ngày, retry, alert). Chạy thật trên DB chính: 22 task nạp, trùng bị chặn, 3 job script OK, báo cáo ngày + dashboard + memory state sinh đúng.

## 10. Sprint S1 (14 ngày)
`growth/os/sprints/S1.md` — 22 task, 8 READY ngay (không cần credential), 7 task thuộc bạn. Xem `node growth/os/bin/os.mjs task list --sprint S1`.

## 11. Quyết định đang chờ bạn (theo thứ tự mở khoá)
1. **T-0001** Định nghĩa install gồm PWA? Ngày dự kiến có build store?
2. **T-0002** Tên miền thật (hiện `mira.trady360.com`) + nơi host blog.
3. **T-0013** Tài khoản social Mira (FB Page, Threads, TikTok) — hoặc để hệ thống soạn, bạn đăng.
4. **T-0021** Bật scheduler (5 phút).
5. **T-0019** Cho phép gắn GA4 vào `growth/blog` (code_change — không đụng app).
6. **T-0012** Chọn ESP newsletter.
7. Ngân sách: chưa cần duyệt gì — paid chỉ từ Phase 3, và chỉ khi có landing + pixel.

Trả lời trong chat; CGO ghi DECISION_LOG và mở khoá task.

## 12. Lệnh vận hành

```bash
node growth/os/bin/os.mjs status
```
```bash
node growth/os/bin/os.mjs task list --status READY
```
```bash
node growth/os/bin/os.mjs run daily-report --force
```
```bash
node growth/os/bin/os.mjs campaign update C-0001 --status APPROVED --actor founder
```
```bash
node --test growth/os/tests/os.test.mjs
```
Gọi CGO trong Claude Code: "Dùng skill task-orchestration, lập kế hoạch hôm nay cho Mira Growth OS."

Commit (nhánh hiện tại `laptop`, không lên `main`):
```bash
git add .claude/agents .claude/skills growth/os CLAUDE.md .gitignore && git commit -m "feat(growth): add Mira Growth OS — agents, skills, CLI, scheduler, sprint S1"
```

## Còn thiếu / chưa làm
- Deploy blog, GA4, ESP, social, store: chờ quyết định ở mục 11.
- Dashboard web: chưa cần — Markdown + JSON đủ cho 1 người đọc.
- GitHub Actions / Agent SDK để chạy khi máy tắt: thiết kế ở SCHEDULER_DESIGN, chưa xây.
- `.claude/launch.json` còn trỏ đường dẫn cũ `trady360\mira` — không thuộc growth, chưa sửa.
