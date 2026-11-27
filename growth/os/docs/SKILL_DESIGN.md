# SKILL_DESIGN

21 skill mới + 1 có sẵn (`mira-nghien-cuu`). Đổi tên so với mẫu gốc để khớp Mira: `game-product-analysis`→`product-analysis`, `gaming-community-research`→`community-research`; gộp `competitor-analysis` vào `market-research` (ghi DECISION_LOG).

| Skill | Agent chính | Gọi skill khác | Đầu ra |
|---|---|---|---|
| product-analysis | market-intelligence, creative | — | GAME_PROFILE.md |
| market-research | market-intelligence | mira-nghien-cuu (doi-thu) | research/competitors-*.csv, weekly-*.md |
| keyword-research | market-intelligence, seo | mira-nghien-cuu (seo) | research/keywords-*.csv |
| app-store-optimization | aso-specialist | keyword-research | aso/*-listing-*.md |
| seo-content-production | seo-content | keyword-research, viet-nhu-nguoi | growth/content/vi/*, content K- |
| blog-publishing | seo-content | attribution-tracking | bài live, content PUBLISHED |
| social-media-content | social-growth | attribution-tracking | content/social/* |
| viral-content-creation | creative-studio, social | growth-experimentation | hook, experiment X- |
| short-video-production | creative-studio | product-analysis | content/video/* |
| community-research | community-partnerships, market | — | research/communities-*.csv |
| partnership-outreach | community-partnerships | attribution-tracking | research/outreach-*.csv, content/outreach/* |
| paid-advertising | paid-acquisition | campaign-management, attribution-tracking | campaigns/*-proposal.md, C-, expense |
| growth-analytics | growth-analytics | attribution-tracking | metrics_daily, dashboard |
| attribution-tracking | growth-analytics, mọi agent đăng | — | links.csv, link UTM |
| conversion-optimization | seo-content, aso | growth-experimentation | experiment, đề xuất landing |
| growth-experimentation | CGO, paid, creative | — | experiment X-, LEARNINGS |
| campaign-management | paid, social | — | campaign C- |
| task-orchestration | CGO | — | task T-, kế hoạch ngày |
| daily-reporting | CGO, analytics | telegram-report-bot | reports/daily/* |
| weekly-growth-review | CGO | growth-experimentation | reports/weekly/*, monthly/* |
| memory-management | CGO, mọi agent | — | memory/* |

Mỗi skill: Mục đích · Khi dùng/không dùng · Đầu vào · Bước (lệnh CLI thật) · Đầu ra (đường dẫn, khuôn) · Kiểm chất lượng · Khi kẹt · Agent liên quan · Công cụ.
