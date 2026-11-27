# SYSTEM_ARCHITECTURE — Mira Growth OS

Nguyên tắc: tách khỏi runtime app, không dependency mới, mọi thứ là file + SQLite + CLI, LLM chỉ ở lớp agent/skill.

```
┌──────────────── Lớp điều phối (Claude Code) ────────────────┐
│ .claude/agents/*  (9 agent)      .claude/skills/*  (21 skill)│
│   growth-orchestrator ──gọi──▶ 8 agent chuyên môn            │
└───────────────┬───────────────────────────────┬─────────────┘
                │ đọc/ghi qua CLI                │ đọc/ghi memory
┌───────────────▼───────────────┐   ┌───────────▼─────────────┐
│ growth/os/bin/os.mjs (CLI)    │   │ growth/os/memory/*.md    │
│  lib/tasks, campaigns,        │   │  PROJECT_CONTEXT …       │
│  content, experiments,        │   │  CURRENT_STATE (AUTO blk)│
│  metrics, report, attribution,│   └──────────────────────────┘
│  scheduler                    │
└───────────────┬───────────────┘
                ▼
       growth/os/db/growth.sqlite (gitignore)  ──▶ dashboard/snapshot.json + README.md (commit)
                ▲                                 reports/{daily,weekly,monthly}/*.md
   analytics/imports/*.csv (Play, ASC, GA4, manual)  logs/*.log, logs/ALERTS.md
```

## Thành phần

| Thành phần | Đường dẫn | Vai trò |
|---|---|---|
| CLI | `growth/os/bin/os.mjs` | Cổng duy nhất ghi dữ liệu; chứa mọi cổng duyệt/trần ngân sách |
| Lib | `growth/os/lib/*.mjs` | tasks, campaigns(+expenses, approvals), content, experiments, metrics, report, attribution, scheduler |
| DB | `growth/os/db/schema.sql` | SQLite WAL, idempotent `CREATE IF NOT EXISTS` |
| Config | `growth/os/config/{channels,budget,targets}.json` | Taxonomy kênh, trần ngân sách, mục tiêu/cột mốc |
| Memory | `growth/os/memory/*.md` | 9 file, nạp chọn lọc theo agent |
| Agents | `.claude/agents/*.md` | 9 agent |
| Skills | `.claude/skills/*/SKILL.md` | 21 skill + `mira-nghien-cuu` có sẵn |
| Scheduler | `growth/os/scheduler/jobs.json` + `lib/scheduler.mjs` | Job script (lock/retry/log) và job Claude (scheduled task) |
| Analytics | `growth/os/analytics/` | Importer CSV, hướng dẫn export từng nguồn |
| Attribution | `growth/os/attribution/` | UTM/referrer/campaign link, sổ link, hạn chế |
| Reports/Dashboard | `growth/os/reports/`, `growth/os/dashboard/` | Markdown + JSON |
| Tests | `growth/os/tests/` | `node --test`, DB tạm |
| Sprints | `growth/os/sprints/` | Kế hoạch 14 ngày |

## Luồng một ngày

1. 07:00 `os run collect-metrics` → kiểm số hôm qua, dashboard, nhắc số thiếu.
2. 08:00 CGO (scheduled task) → `task-orchestration`: tạo/ưu tiên/gán.
3. 09–12 agent sản xuất (research/SEO/creative) nhận task READY → DONE với evidence.
4. 13–17 agent phân phối (social/community/ASO) — chỉ APPROVED mới ra ngoài.
5. 18:00 `os run verify-tasks`; 18:15 `memory-management` gom phát hiện, `os memory state`.
6. 20:00 `os run daily-report`; 20:10 CGO điền phát hiện/ưu tiên; gửi Telegram nếu bật.

## Ranh giới an toàn

- CLI chặn: chi tiền chưa duyệt, vượt trần, SCALE bằng chỉ số phù phiếm, PUBLISHED thiếu URL, DONE thiếu evidence, task trùng, content trùng, hook trái giọng.
- Không đụng `code/`, `growth/blog` config, `content-queue.json` nếu chưa có approval tương ứng.
- Secrets chỉ qua env (`GEMINI_API_KEY`, token Telegram), không file trong repo.

## Phụ thuộc & luồng thực thi giữa agent

```
market-intelligence ──▶ aso-specialist, seo-content, social-growth, community-partnerships, paid-acquisition
seo-content ──▶ social-growth (cắt bài), creative-studio (ảnh/video)
creative-studio ──▶ social-growth, paid-acquisition
community-partnerships ──▶ social-growth (nơi đăng)
growth-analytics ──▶ growth-orchestrator (số), paid-acquisition (stop rules)
growth-orchestrator ──▶ tất cả (task), founder (approval)
```
