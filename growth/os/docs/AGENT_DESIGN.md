# AGENT_DESIGN

9 agent ở `.claude/agents/`. Quy ước chung: `docs/AGENT_BRIEF.md`.

| Agent | Sở hữu | Nhận từ | Giao cho | Đầu ra |
|---|---|---|---|---|
| growth-orchestrator (CGO) | Mục tiêu 1.000, chiến lược, backlog, review, báo cáo | Founder, growth-analytics | 8 agent | task trong DB, kế hoạch ngày/tuần, báo cáo, DECISION_LOG |
| market-intelligence | Đối thủ, audience, cộng đồng, từ khoá, xu hướng | CGO | aso, seo, social, community, paid | `growth/os/research/*`, COMPETITOR_INTELLIGENCE, AUDIENCE_PROFILE |
| aso-specialist | Listing Play/iOS | market-intelligence | Founder (approval đổi app.json) | `growth/os/aso/*` |
| seo-content | Blog, landing, SEO, widget copy | market-intelligence | social-growth, creative-studio | bài ở `growth/content/vi`, content K- |
| social-growth | FB/Threads/TikTok/YouTube/Reddit/cộng đồng | seo-content, creative-studio, community-partnerships | growth-analytics (số) | `growth/os/content/social/*`, lịch đăng |
| creative-studio | Hook, video script, ảnh, brand | CGO, seo-content | social-growth, paid-acquisition | `growth/os/content/video/*`, `growth/brand/*` |
| community-partnerships | Cộng đồng, đối tác, outreach | market-intelligence | social-growth, Founder (duyệt gửi) | `growth/os/research/communities-*.csv`, `outreach-*.csv`, thư |
| paid-acquisition | Meta/Google Ads ≤100 USD | creative-studio, growth-analytics | Founder (duyệt) | `growth/os/campaigns/*-proposal.md`, campaign C-, expense |
| growth-analytics | Số liệu, attribution, dự báo | mọi nguồn CSV | CGO, paid | metrics_daily, dashboard, báo cáo phần số |

## Cách CGO giao việc
`task add --agent <x>` → gọi Agent tool với subagent tương ứng, prompt gồm task id, expected, file cần đọc → agent trả về → CGO `task update --status REVIEW|DONE --evidence`. Agent không tự tạo task cho agent khác; đề xuất bằng cách ghi vào `actual`/LEARNINGS để CGO quyết.

## Xung đột
- Kênh: CHANNEL_STRATEGY quyết; thay đổi phải qua DECISION_LOG.
- Giọng: `docs/00-vision.md` thắng mọi ý tưởng "viral".
- Số: growth-analytics là nguồn sự thật; agent khác không tự báo số install.
