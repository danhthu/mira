# AGENT_BRIEF — quy ước chung cho mọi agent & skill của Mira Growth OS

Mọi file trong `.claude/agents/` và `.claude/skills/*/SKILL.md` tuân theo brief này. Viết tiếng Việt (trừ tên file, mã lệnh). Giọng: ngắn, cụ thể, không khẩu hiệu.

## 1. Bối cảnh bắt buộc đọc trước khi làm

`growth/os/memory/PROJECT_CONTEXT.md` (luôn) + file memory theo bảng "Ai đọc gì" trong đó. Không nạp toàn bộ memory.

## 2. Sự thật về Mira không được quên

- App chưa lên store, chưa có build native; có PWA; 91 bài blog draft, 0 published; không có GA4/pixel/ESP/social account.
- Giọng Mira: điềm đạm, không "nên/phải/hãy", không dấu chấm than, không gây tội lỗi, không streak/badge. Áp cho mọi nội dung ra ngoài.
- Local-first: không thêm SDK vào app, không sửa `code/fe` vì marketing nếu chưa có approval `code_change`.
- Không bịa số. Số không đo được → ghi "chưa đo" hoặc `quality=estimated` kèm cách ước.

## 3. CLI — cách duy nhất ghi dữ liệu

`node growth/os/bin/os.mjs <lệnh>` (chạy từ gốc repo). Lệnh hay dùng:

```
status
task add --title "..." --agent <agent> --impact 1-5 --confidence 0-1 --urgency 1-5 --effort 1-5 --deadline YYYY-MM-DD --expected "..." [--deps T-0001,T-0002] [--sprint S1] [--needs-approval]
task list [--status READY|IN_PROGRESS|...] [--agent x] [--sprint S1]
task update T-0001 --status IN_PROGRESS|BLOCKED|REVIEW|DONE --note "..." [--actual "..."] [--evidence <path|url>]   # DONE bắt buộc --evidence
content add --topic "..." --channel <CH> --format blog|post|short-video|thread|letter|tool --hook "..." --cta "..." --body-ref <path> [--source-slug <slug>]
content update K-0001 --status RESEARCH|DRAFT|REVIEW|APPROVED|PUBLISHED --url <url> --utm <link>
experiment add --hypothesis "..." --channel <CH> --metric waitlist|installs|clicks|... --target "..." --end-date ...
experiment decide X-0001 --decision SCALE|ITERATE|STOP|INCONCLUSIVE --results "..."
campaign add --name "..." --platform META_ADS --budget-usd 20 --daily-cap-usd 3 ...   # kênh trả phí tự động PENDING_APPROVAL
expense add --amount-usd 2.5 --campaign C-0001 --note "..."                          # bị chặn nếu chưa duyệt / vượt trần
metric add --date YYYY-MM-DD --platform android|ios|pwa|web --channel <CH> --metric installs|waitlist|pageviews|clicks|store_visitors|spend_usd --value N --source <src> [--quality measured|estimated|unattributed --note "..."]
link --url <url> --channel <CH> --campaign <tên> [--content <tên bài/nhóm>]
approval request --kind budget|publish|access|code_change --request "..." [--ref <id>]
memory log --file LEARNINGS|DECISION_LOG --text "..."
report daily | report weekly | dashboard | memory state
```

Kênh (`<CH>`): SEO, BLOG, FACEBOOK_ORGANIC, TIKTOK, YOUTUBE, REDDIT, THREADS, COMMUNITY, PARTNERSHIP, NEWSLETTER, META_ADS, GOOGLE_ADS, DIRECT, UNKNOWN.

Agent (`<agent>`): growth-orchestrator, market-intelligence, aso-specialist, seo-content, social-growth, creative-studio, community-partnerships, paid-acquisition, growth-analytics, founder.

## 4. Cổng duyệt (human gate) — không được vòng qua

| Hành động | Cần |
|---|---|
| Chi tiền, tạo/bật campaign trả phí | campaign APPROVED bởi `--actor founder` |
| Publish ra ngoài (blog live, post social, outreach) | content ở APPROVED; outreach có approval `publish` |
| Sửa `code/fe`, `growth/blog` config, thêm SDK | approval `code_change` |
| Tạo tài khoản, xin quyền API | approval `access` |

Khi kẹt: ghi task BLOCKED + `approval request`, rồi làm việc khác. Không chờ.

## 5. Mỗi lần làm xong một task

1. `task update <id> --status DONE --evidence <file/url> --actual "<kết quả 1 dòng>"`.
2. Phát hiện mới có bằng chứng → `memory log --file LEARNINGS`.
3. Quyết định đổi hướng → `memory log --file DECISION_LOG`.
4. Hành động hướng ra ngoài đã tự ghi audit qua CLI; nếu làm ngoài CLI (ví dụ đăng tay), ghi `memory log` kèm URL.

## 6. Khuôn file agent (`.claude/agents/<name>.md`)

```
---
name: <name>
description: <1–2 câu: khi nào orchestrator gọi agent này>
tools: Read, Grep, Glob, Bash, Write, Edit, WebSearch, WebFetch   # bỏ bớt nếu không cần
model: sonnet | opus | inherit
---
# Vai trò
# Đọc trước (memory cụ thể)
# Trách nhiệm (gạch đầu dòng, cụ thể cho Mira)
# Skill được dùng
# Đầu ra chuẩn (file ở đâu, ghi CLI gì)
# Không được làm
# Kiểm tra trước khi báo DONE
```

## 7. Khuôn skill (`.claude/skills/<name>/SKILL.md`)

Frontmatter `name`, `description` (có từ khoá kích hoạt tiếng Việt lẫn Anh). Thân: Mục đích · Khi nào dùng · Đầu vào bắt buộc · Các bước thực thi (đánh số, có lệnh CLI thật) · Đầu ra (đường dẫn file, khuôn) · Kiểm chất lượng (checklist) · Khi lỗi/kẹt · Agent liên quan · Công cụ dùng. Skill là quy trình chạy được, không phải mô tả chung. Nếu cần template, đặt ở `.claude/skills/<name>/templates/`.

## 8. Đường dẫn đầu ra

| Loại | Nơi |
|---|---|
| Nghiên cứu, danh sách cộng đồng/đối tác/từ khoá | `growth/os/research/<chủ đề>-<YYYY-MM-DD>.md` (CSV nếu là bảng) |
| Nội dung social/video/outreach | `growth/os/content/<social|video|outreach>/<K-id>-<slug>.md` |
| Bài blog | vẫn `growth/content/vi/` + mirror `growth/blog/src/content/blog/` (quy trình trong `growth/content/HANDOFF.md`) |
| ASO | `growth/os/aso/<platform>-listing-<date>.md` |
| Đề xuất paid | `growth/os/campaigns/<C-id>-proposal.md` |
| Báo cáo | `growth/os/reports/{daily,weekly,monthly}/` |
| Nguồn bên ngoài có số | theo skill `mira-nghien-cuu`: `docs/nguon/nghien-cuu/` + INDEX |
