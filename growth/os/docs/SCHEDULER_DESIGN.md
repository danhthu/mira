# SCHEDULER_DESIGN

## Vấn đề
Phiên Claude Code không phải dịch vụ nền; repo không có CI; `claude` CLI không trong PATH; máy Founder là Windows 11.

## Lựa chọn đã cân nhắc

| Phương án | Ưu | Nhược | Quyết định |
|---|---|---|---|
| GitHub Actions | Chạy khi máy tắt, log sẵn | Cần secret, cần commit DB/state lên repo, LLM job cần API key trả tiền riêng | Để sau, khi có hosting/CI |
| Windows Task Scheduler + `node os.mjs run` | Có sẵn, zero dependency | Máy phải bật | **Chọn cho job script** |
| Claude Code scheduled task (desktop MCP `scheduled-tasks`) | Có LLM, dùng skill/agent sẵn, không cần API key riêng | Chạy trong app desktop, máy phải mở app | **Chọn cho job Claude** |
| Claude Agent SDK / API cron | Tự động hoàn toàn | Thêm code, chi phí API, secret | Giai đoạn sau nếu Founder muốn chạy khi vắng mặt |

## Hai loại job (`scheduler/jobs.json`)

- `type: script` — `node growth/os/bin/os.mjs run <name>`: collect-metrics, verify-tasks, daily-report, weekly-report, healthcheck. Có lock (bảng `locks`, TTL 30'), idempotent (1 OK/ngày), retry 3 lần, log `logs/YYYY-MM-DD.log`, bảng `runs`, thất bại → `logs/ALERTS.md`.
- `type: claude` — prompt trong `claude_prompt`, chạy qua scheduled task của app (hoặc `claude -p "<prompt>"` nếu CLI có). Idempotency nằm ở CLI (task trùng bị chặn, content trùng bị chặn, expense có cổng).

## Cài đặt (Founder làm một lần — xem `scheduler/README.md`)
1. `scheduler/install-windows-tasks.ps1` đăng ký 5 job script vào Task Scheduler.
2. Tạo scheduled task trong Claude Code desktop cho từng job `type: claude` với prompt tương ứng (hoặc dùng skill `schedule`).

## Thất bại & thông báo
- Script: ghi `ALERTS.md`; CGO đọc ở 08:00; nếu Telegram được cấu hình, skill daily-reporting gửi kèm.
- Claude job: nếu không chạy, `verify-tasks` 18:00 sẽ thấy không có task nào đổi trạng thái → ghi cảnh báo "không có hoạt động" (CGO kiểm bằng `os runs`).

## Rate limit / lịch sự
Job Claude dùng WebSearch/WebFetch có giới hạn tự nhiên; skill community/outreach cấm mass action; mọi hành động ra ngoài cần APPROVED.
