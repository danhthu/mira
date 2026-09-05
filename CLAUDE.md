# Mira — chỉ dẫn gốc cho Claude Code

Repo tách hai nhánh việc, mỗi nhánh có `CLAUDE.md` riêng với luật chi tiết:

- **`code/`** — sản phẩm (app di động + backend). Đọc [`code/CLAUDE.md`](code/CLAUDE.md) trước khi chạm vào `code/fe/` hoặc `code/be/`.
- **`growth/`** — blog, landing page, content, thương hiệu, đo lường. Chưa có CLAUDE.md riêng — theo giọng và ràng buộc mô tả trong `docs/00-vision.md` và `growth/content/HANDOFF.md`.

Spec sản phẩm dùng chung cho cả hai nhánh nằm ở [`docs/`](docs/) (không thuộc riêng `code/` hay `growth/`): `00-vision.md` → `08-three-pillars.md`.

## Cấu trúc thư mục

```
code/
  fe/                 ← React Native + Expo app
  be/                 ← Node.js + TypeScript backend
  docs/               ← ARCHITECTURE.md — tài liệu vận hành riêng cho code/ (decisions, debug, plans, changelog sẽ thêm khi cần)
  CLAUDE.md           ← luật kiến trúc + anti-AI rules cho fe/be

growth/
  site/               ← (chưa tách) landing + calculator — hiện đang chung trong growth/blog/
  blog/               ← Astro blog site
  content/            ← bài viết .md + content-queue.json + HANDOFF.md (tách khỏi code)
  brand/              ← tokens.json, logo, voice — chưa có nội dung
  tracking.yaml       ← khung theo dõi growth metrics — chưa có nội dung

docs/                 ← spec sản phẩm dùng chung (00-08 + dac-ta/ + nguon/ + luu-tru/)
scripts/              ← soi-cau-truc.sh — kiểm luật kiến trúc, chạy được trong CI
tools/                ← tooling nội bộ (vd. tools/admin — duyệt/tạo ảnh blog)

PLAN.md               ← kế hoạch đang chạy
PROJECT.yaml          ← tiến độ G0-G6 + quyết định đã chốt
```

## Việc chung, không riêng nhánh nào

- Không commit thẳng lên `main`.
- Tên commit, branch, PR: tiếng Anh.
- Khi thấy tài liệu mâu thuẫn hoặc thiếu, ghi vào HANDOFF.md của thư mục liên quan, đừng tự suy đoán.
