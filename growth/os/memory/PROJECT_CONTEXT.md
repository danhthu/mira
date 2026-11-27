# PROJECT_CONTEXT — Mira Growth OS

Đọc file này đầu tiên. Mỗi agent chỉ đọc thêm file memory liên quan tới việc của mình (bảng cuối).

## Nhiệm vụ

1.000 người dùng mới thật cho Mira trong 90 ngày, tính từ **2026-10-13** (ngày 1) đến **2027-01-10** (ngày 90). Ngân sách trả phí tối đa **100 USD**, chỉ chi sau khi Founder duyệt từng campaign. Organic là động cơ chính.

## Sản phẩm (sự thật, lấy từ repo — không phải giả định)

- Mira: app di động, tiếng Việt, đo **Giờ vàng** (giờ/tuần bên người quan trọng), **Tỷ giá đời** (thu nhập ròng/giờ thật), **Vốn tự do** (tháng sống được không cần đi làm). Spec: `docs/00-vision.md` → `docs/08-three-pillars.md`.
- Giọng: bạn điềm đạm, không phán xét, không "nên/phải/hãy", không dấu chấm than, sentence case. Không streak, không badge, không màu đỏ trách móc.
- Local-first: dữ liệu nằm trên máy, V1 không gửi gì lên server → **không thêm SDK analytics vào app nếu Founder chưa duyệt**.
- Kỹ thuật: React Native + Expo 51, `code/fe`. Chưa có build native, chưa lên Google Play / App Store. Có web build + PWA (`npm run web:build`). `app.json` còn mang tên vỏ Batify (`DailyOps`, `com.wai.dailyops`) — phải đổi trước khi lên store.
- Blog: Astro ở `growth/blog`, site `https://mira.trady360.com/blog` (tên miền chưa chốt). 91 bài draft tiếng Việt ở `growth/content/vi/`, **0 bài published**. Lịch 120 ngày: `docs/07-blog-120-days.md`. Kế hoạch test marketing có sẵn: `docs/06-marketing-test.md` (3 góc A/B/C, 6 hook, ngưỡng quyết định).
- Chưa có: GA4, pixel, ESP newsletter, landing có form, widget máy tính (6 công cụ mô tả trong bài chưa build), ảnh bài blog, tài khoản social của Mira (chưa thấy trong repo).

## Định nghĩa install (chờ Founder xác nhận — xem `config/targets.json`)

installs = Android (first-time installers) + iOS (first-time downloads) + PWA (appinstalled). **Waitlist email là chỉ số dẫn đường, không cộng vào installs.** Trước khi có store listing, hệ thống vẫn chạy: xây nội dung, cộng đồng, landing, waitlist, PWA.

## Hệ thống

- CLI: `node growth/os/bin/os.mjs` (task, campaign, content, experiment, metric, report, memory, run). Mọi agent dùng CLI, không mở SQLite tay.
- Agent: `.claude/agents/*.md`. Skill: `.claude/skills/*/SKILL.md`. Lịch: `growth/os/scheduler/jobs.json`.
- Tài liệu: `growth/os/docs/`. Dashboard: `growth/os/dashboard/README.md`.

## Ai đọc gì

| Agent | Đọc thêm |
|---|---|
| growth-orchestrator | CURRENT_STATE, GROWTH_STRATEGY, DECISION_LOG |
| market-intelligence | COMPETITOR_INTELLIGENCE, AUDIENCE_PROFILE |
| aso-specialist | GAME_PROFILE, AUDIENCE_PROFILE, COMPETITOR_INTELLIGENCE |
| seo-content | GAME_PROFILE, CHANNEL_STRATEGY (SEO/BLOG), `growth/content/HANDOFF.md` |
| social-growth | CHANNEL_STRATEGY, AUDIENCE_PROFILE, LEARNINGS |
| creative-studio | GAME_PROFILE, AUDIENCE_PROFILE, LEARNINGS |
| community-partnerships | CHANNEL_STRATEGY (COMMUNITY/PARTNERSHIP), AUDIENCE_PROFILE |
| paid-acquisition | GROWTH_STRATEGY (ngân sách), CHANNEL_STRATEGY, `config/budget.json` |
| growth-analytics | CURRENT_STATE, `config/channels.json`, `growth/os/attribution/README.md` |
