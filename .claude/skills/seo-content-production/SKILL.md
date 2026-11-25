---
name: seo-content-production
description: Viết bài blog Mira mới (tuần 14–17, ngày 92–120) hoặc hoàn thiện một bài draft đã có trong growth/content/vi theo lịch docs/07-blog-120-days.md và luật anti-AI trong HANDOFF — số có nguồn N-xxx, kết bằng câu hỏi, CTA về công cụ/app, rà giọng rồi ghi vào content pipeline. Dùng khi nói "viết bài blog", "hoàn thiện bài", "sửa bài draft", "bài ngày 95", "bài trụ cột tuần 15", "write blog post", "polish draft", "SEO content", "finish the draft". KHÔNG dùng để publish (blog-publishing), KHÔNG dùng để tìm số liệu mới (mira-nghien-cuu), KHÔNG dùng cho social/video.
---

# seo-content-production — viết và hoàn thiện bài blog

## Mục đích

Đưa một bài từ `pending` tới `REVIEW` trong pipeline: đúng loại bài theo thứ trong tuần, đúng số liệu có mã nguồn, đúng giọng Mira, đã qua rà AI. Không publish — việc đó là `blog-publishing` với cổng duyệt riêng.

## Khi nào dùng

- Task READY của seo-content kiểu "viết bài ngày N" hoặc "hoàn thiện bài <slug>".
- Khi `mira-nghien-cuu` tổng hợp tuần chỉ ra một bài draft dùng số đã bị bác (N-xxx ⚑) → sửa bài đó.

## Đầu vào bắt buộc

`PROJECT_CONTEXT.md`, `GAME_PROFILE.md` (tính năng được nói), `CHANNEL_STRATEGY.md` mục SEO/BLOG, `growth/content/HANDOFF.md` (anti-AI, bộ số nhất quán 30 triệu/60 giờ/115k; tuần 9: 25/18/7 triệu), `docs/00-vision.md`, `docs/03-formulas.md`, `docs/07-blog-120-days.md` (tiêu đề + loại bài đã chốt), `docs/nguon/nghien-cuu/INDEX.md`, `growth/content/content-queue.json`, `growth/os/research/keywords-*.csv` mới nhất, một bài cùng `type` đã viết tốt (ví dụ `growth/content/vi/03-may-tinh-ty-gia-doi.md`) để khớp frontmatter.

## Các bước thực thi

1. **Chọn bài**: đọc `content-queue.json`, lấy bài `pending` có `day` nhỏ nhất chưa có file trong `growth/content/vi/` (bài mới), hoặc bài được task chỉ định (hoàn thiện). Với bài mới ngày 92–120: tiêu đề và `type` lấy từ `docs/07` Giai đoạn 4, không tự nghĩ tiêu đề.
2. **Ghi task + content**:
   `node growth/os/bin/os.mjs task add --title="Viết bài ngày <N>: <slug>" --agent=seo-content --impact=3 --confidence=0.8 --urgency=3 --effort=3 --deadline=<YYYY-MM-DD> --expected="file vi/<NN>-<slug>.md qua check-posts + rà giọng, content ở REVIEW"`
   `node growth/os/bin/os.mjs content add --topic="<tiêu đề>" --channel=BLOG --format=blog --hook="<câu mở>" --cta="<tên công cụ/app>" --body-ref=growth/content/vi/<NN>-<slug>.md --source-slug=<slug>` → ghi lại K-id; `content update K-xxxx --status=DRAFT`.
3. **Chọn số liệu**: mọi con số ngoài ví dụ nhân vật phải có mã N-xxx từ INDEX (độ tin `cao`/`vừa`). Số chưa có → không bịa; gọi skill `mira-nghien-cuu` lane `nguyen-lieu` với truy vấn cụ thể, hoặc viết bài không có số đó. Ghi mã N trong comment HTML cuối bài: `<!-- nguồn: N-003, N-005 -->`.
4. **Tính lại ví dụ** bằng công thức `docs/03`: ghi phép tính trong bài (ít nhất một phép tính hiện rõ — luật `check-posts` trong HANDOFF). Nhân vật dùng bộ số nhất quán của HANDOFF; nhớ N-003: 30 triệu = 3,3× bình quân, đừng viết như "ai cũng vậy".
5. **Viết** theo khung số từ của `docs/07` §B cho loại bài (pillar 1500–2500, longtail 600–900, tool 500 + mô tả widget, story/counterpoint 800–1200, social 300–500, letter 400–700). Từ khoá chính từ CSV đặt ở tiêu đề/H2/đoạn đầu nếu không phá giọng. Bài `tool`: mô tả ô nhập + công thức; ghi rõ widget chưa build (HANDOFF) bằng dòng in nghiêng như bài 03.
6. **Kết bằng một câu hỏi** (không phải lời kêu gọi). CTA ngay trước câu hỏi: trỏ tới công cụ cùng cụm (`cta: "<widget>"`) hoặc app/waitlist — chỉ hứa thứ GAME_PROFILE cho phép.
7. **Rà giọng**: gọi skill `anthropic-skills:viet-nhu-nguoi` chế độ sửa trong file (nếu không có, dùng `anthropic-skills:avoid-ai-writing`); sau đó tự grep từ cấm: `grep -n "trong thế giới hiện đại\|không thể phủ nhận\|hãy cùng\|tóm lại\|kết luận\|!" growth/content/vi/<file>` — phải trống (trừ `!` trong code/URL).
8. **Frontmatter** đủ: `title, slug, altSlug, locale, date, draft: true, type, week, day, description, tags, image, image_prompt, cta` (+ `widget` cho tool). `date` theo nhịp HANDOFF (ngày 91 = 2026-11-15 → ngày N = 2026-11-15 + (N−91) ngày; CN đúng vào Chủ nhật).
9. `content update K-xxxx --status=REVIEW --note="cần người đọc lại bằng giọng thật (HANDOFF §Anti-AI #5)"`; `task update T-xxxx --status=REVIEW --evidence=growth/content/vi/<file>`. Không tự đặt APPROVED.
10. Chỉ sửa `growth/content/vi/`; **không** mirror sang `growth/blog/` và **không** đổi `content-queue.json` — việc của `blog-publishing`.

## Đầu ra

`growth/content/vi/<NN>-<slug>.md`:

```markdown
---
title: "<tiêu đề từ docs/07>"
slug: "<slug trong content-queue>"
altSlug: null
locale: "vi"
date: "YYYY-MM-DD"
draft: true
type: "pillar|longtail|tool|story|counterpoint|social|letter"
week: <n>
day: <n>
description: "<1–2 câu, có từ khoá chính>"
tags: ["<cluster>", "..."]
image: "/blog/images/<NN>-<slug>.jpg"
image_prompt: "<deep green + warm gold, no readable UI text>"
cta: "<widget hoặc app>"
---

<Mở bằng một tình huống cụ thể, không bằng định nghĩa.>

## <H2 có từ khoá tự nhiên>

<Phép tính hiện rõ: 30.000.000 ÷ (60 × 52 ÷ 12) ≈ 115.000đ/giờ.>

<Một chỗ tự sửa lời giữa câu. Câu dài ngắn xen kẽ.>

<CTA: một câu, trỏ công cụ/app.>

<Câu hỏi kết.>

<!-- nguồn: N-xxx, N-yyy · từ khoá: keywords-<date>.csv dòng ... -->
```

## Kiểm chất lượng

- [ ] Tiêu đề/loại/ngày khớp `docs/07` và `content-queue.json`; slug không đổi.
- [ ] Mọi số ngoài nhân vật có mã N trong comment cuối bài; không số độ tin `thấp`.
- [ ] Có ≥ 1 phép tính hiện rõ, đúng `docs/03`.
- [ ] Kết bằng câu hỏi; 0 dấu chấm than; 0 "nên/phải/hãy" ở phần kêu gọi; sentence case.
- [ ] Không "trong thế giới hiện đại / không thể phủ nhận / hãy cùng / tóm lại / kết luận"; không 3 gạch đầu dòng đều tăm tắp lặp nhiều lần; không em-dash liên tiếp.
- [ ] Không hứa tính năng app ngoài GAME_PROFILE; bài tuần 5 (bố mẹ) không có đếm ngược kiểu push.
- [ ] Số từ trong khung loại bài. Đã chạy skill rà giọng. Content ở REVIEW, không APPROVED.

## Khi lỗi / kẹt

- Số cần có mà INDEX không có và lane nguyên liệu không ra → viết bản không số, ghi `<!-- THIẾU: số X -->`, task về REVIEW với note; không điền số tròn.
- Hai file cùng số khác slug trong `vi/` (lỗi HANDOFF đã gặp) → không đoán; ghi task cho founder chọn, BLOCKED.
- Bài `tool` cần widget chưa có → vẫn viết, mô tả placeholder; thêm task `founder`/code (không tự tạo widget).
- Skill rà giọng không có → ghi note "chưa rà bằng skill", người duyệt rà tay.

## Agent liên quan

seo-content (chủ), market-intelligence (số liệu qua mira-nghien-cuu), founder (đọc lại giọng thật, APPROVED).

## Công cụ dùng

Read, Write, Edit (chỉ `growth/content/vi/`), Grep, skill `mira-nghien-cuu`, skill `anthropic-skills:viet-nhu-nguoi` / `avoid-ai-writing`, CLI `os.mjs`.
