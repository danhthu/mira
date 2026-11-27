# Mira — chỉ dẫn gốc cho Claude Code

Repo tách hai nhánh việc, mỗi nhánh có `CLAUDE.md` riêng với luật chi tiết:

- **`code/`** — sản phẩm (app di động + backend). Đọc [`code/CLAUDE.md`](code/CLAUDE.md) trước khi chạm vào `code/fe/` hoặc `code/be/`.
- **`growth/`** — blog, landing page, content, thương hiệu, đo lường. Chưa có CLAUDE.md riêng — theo giọng và ràng buộc mô tả trong `docs/00-vision.md` và `growth/content/HANDOFF.md`. Hệ vận hành tăng trưởng (agent, skill, task, báo cáo) ở [`growth/os/`](growth/os/README.md); quy ước cho agent ở `growth/os/docs/AGENT_BRIEF.md`.

Spec sản phẩm dùng chung cho cả hai nhánh nằm ở [`docs/`](docs/) (không thuộc riêng `code/` hay `growth/`): `00-vision.md` → `08-three-pillars.md`.

**Đụng tới nhập liệu bằng chat thì đọc [`docs/12-mo-hinh-mira.md`](docs/12-mo-hinh-mira.md) TRƯỚC.** Đó là mô hình nghiệp vụ viết cho agent: bốn ô thời gian, bảy ô tiền, hũ kẹo/muối, thứ tự xử lý của bộ đọc câu, và bốn cái bẫy bỏ dấu tiếng Việt đã gây lỗi thật. Từ vựng của bộ đọc câu nằm ở `code/be/src/services/parse-rules.json` — sửa file đó chứ đừng gõ từ khoá vào mã nguồn.

## Cấu trúc thư mục

```
code/
  fe/                 ← React Native + Expo app
  be/                 ← Node.js + TypeScript backend
  docs/               ← ARCHITECTURE.md — tài liệu vận hành riêng cho code/ (decisions, debug, plans, changelog sẽ thêm khi cần)
  CLAUDE.md           ← luật kiến trúc + anti-AI rules cho fe/be

growth/
  os/                 ← Growth OS: CLI + SQLite + memory + scheduler cho mục tiêu 1.000 người dùng/90 ngày.
                        Đọc growth/os/README.md và growth/os/memory/PROJECT_CONTEXT.md trước khi làm việc growth.
                        Agent ở .claude/agents/, skill ở .claude/skills/. Mọi ghi dữ liệu qua `node growth/os/bin/os.mjs`.
  site/               ← (chưa tách) landing + calculator — hiện đang chung trong growth/blog/
  blog/               ← Astro blog site
  content/            ← bài viết .md + content-queue.json + HANDOFF.md (tách khỏi code)
  brand/              ← tokens.json, logo, voice — chưa có nội dung
  tracking.yaml       ← khung theo dõi growth metrics — chưa có nội dung

docs/                 ← spec sản phẩm dùng chung
tools/                ← tooling nội bộ (vd. tools/admin — duyệt/tạo ảnh blog)
```

## Việc chung, không riêng nhánh nào

- Không commit thẳng lên `main`.
- Tên commit, branch, PR: tiếng Anh.
- Khi thấy tài liệu mâu thuẫn hoặc thiếu, ghi vào HANDOFF.md của thư mục liên quan, đừng tự suy đoán.
