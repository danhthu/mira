# Scheduler — cài một lần

Lịch ở `jobs.json` (giờ Việt Nam). Hai loại job:

## 1. Job script (không cần Claude) — Windows Task Scheduler

Chạy PowerShell với quyền người dùng thường, từ gốc repo:

```powershell
powershell -ExecutionPolicy Bypass -File growth/os/scheduler/install-windows-tasks.ps1
```

Script đăng ký 5 task `MiraGrowth-<job>` gọi `node growth/os/bin/os.mjs run <job>`. Gỡ: `-Uninstall`. Xem log: `growth/os/logs/<ngày>.log`, bảng runs: `node growth/os/bin/os.mjs runs`. Thất bại sau 3 lần → `growth/os/logs/ALERTS.md`.

Chạy tay bất cứ lúc nào: `node growth/os/bin/os.mjs run daily-report --force`.

## 2. Job Claude (cần LLM) — scheduled task trong Claude Code desktop

Với mỗi job `type: claude` trong `jobs.json`, tạo scheduled task (skill `schedule` hoặc UI của app) với:
- cron = `when`, timezone Asia/Ho_Chi_Minh
- prompt = `claude_prompt` (đã trỏ đúng skill)
- working directory = gốc repo

Tối thiểu để hệ thống sống: `cgo-plan` (08:00), `morning-production` (09:00), `afternoon-distribution` (13:00), `memory-consolidate` (18:15), `daily-report-insights` (20:10), `weekly-plan` (T2), `weekly-review` (T6).

Nếu máy không mở app desktop vào giờ đó, job bỏ qua; CGO lần chạy kế tiếp đọc `os runs` và `task overdue` để bù.

## 3. Không trùng, không chạy đè
- Mỗi job script: lock `job:<name>` TTL 30 phút + chỉ 1 lần OK/ngày.
- Job Claude: CLI chặn task/content trùng; expense có cổng; nên chạy lại an toàn.

## 4. Khi muốn chạy không cần máy bật
Chuyển job script sang GitHub Actions (cron) + commit `dashboard/` và `reports/`; job Claude sang Claude Agent SDK với API key — xem `docs/SCHEDULER_DESIGN.md`. Chưa làm vì chưa cần.
