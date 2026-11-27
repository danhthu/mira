# Mira Growth OS

Hệ điều hành tăng trưởng cho Mira: 1.000 người dùng mới trong 90 ngày (2026-10-13 → 2027-01-10), ≤ 100 USD, organic là động cơ chính. Tách hoàn toàn khỏi runtime app; không dependency mới (Node 24 built-in `node:sqlite`).

## Chạy trong 60 giây

```bash
node growth/os/bin/os.mjs status
```
```bash
node growth/os/bin/os.mjs task list --status READY
```
```bash
node growth/os/bin/os.mjs report daily
```
```bash
node --test growth/os/tests/os.test.mjs
```

`node growth/os/bin/os.mjs help` in đủ lệnh.

## Cấu trúc

```
growth/os/
  bin/os.mjs          CLI duy nhất (task, campaign, expense, approval, content, experiment, metric, link, report, dashboard, memory, sprint, run)
  lib/                tasks, campaigns, content, experiments, metrics, report, attribution, scheduler, db
  db/schema.sql       lược đồ SQLite (growth.sqlite gitignore)
  config/             channels.json (taxonomy), budget.json (trần), targets.json (mục tiêu/cột mốc)
  memory/             9 file bối cảnh cho agent; CURRENT_STATE có khối AUTO
  scheduler/          jobs.json, README, install-windows-tasks.ps1
  analytics/          README (trạng thái integration + cách nạp CSV), csv-template.csv, imports/ (gitignore)
  attribution/        README (giới hạn attribution), links.csv
  reports/            daily/ weekly/ monthly/
  dashboard/          README.md + snapshot.json (sinh tự động)
  sprints/            S1.md (sinh từ DB)
  research/ content/ aso/ campaigns/   đầu ra của agent
  docs/               audit, kiến trúc, data model, scheduler, security, agent/skill design, AGENT_BRIEF, FOUNDER_HANDOVER
  tests/              node --test
```

Agent: `.claude/agents/` (9). Skill: `.claude/skills/` (21 + `mira-nghien-cuu`).

## Vòng lặp vận hành

PLAN (CGO 08:00) → DELEGATE (task READY → agent) → EXECUTE → VERIFY (18:00) → MEASURE (metric import, dashboard) → LEARN (memory log) → OPTIMIZE (weekly review T6) → lặp. Chi tiết `docs/SYSTEM_ARCHITECTURE.md`, lịch `scheduler/jobs.json`.

## Cổng an toàn (CLI chặn)

Chi tiền chưa duyệt · vượt 100 USD / 30 USD campaign / 5 USD ngày · PUBLISHED thiếu URL · DONE thiếu evidence · task/content trùng · hook trái giọng Mira · SCALE bằng impressions/likes · số ước không ghi cách ước.

## Gọi CGO bằng tay

Trong Claude Code: "Dùng skill task-orchestration, lập kế hoạch hôm nay cho Mira Growth OS" hoặc gọi agent `growth-orchestrator`.
