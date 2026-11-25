---
name: conversion-optimization
description: Tối ưu chuyển đổi cho landing, blog và trang store của Mira theo funnel pageview → cta_click → store/PWA → install, dựa trên checklist landing docs/06 §3 và ngưỡng docs/06 §7. Dùng khi nói "tối ưu landing", "tăng tỷ lệ để lại email", "CRO", "conversion optimization", "landing checklist", "A/B landing", "tại sao vào nhiều mà không cài", "store listing conversion", "CTA". KHÔNG dùng để viết bài blog mới (seo-content), để sửa code/fe (cần approval code_change), hay để quyết ngân sách ads (paid-advertising).
---

# Conversion optimization — landing, blog, store

## Mục đích

Mira không có nhiều traffic để lãng phí: tăng tỷ lệ mỗi bước của funnel là cách rẻ nhất tới 1.000 người dùng. Skill này biến quan sát thành thử nghiệm có số, không phải danh sách "gợi ý cải thiện".

## Khi nào dùng

- Funnel (`growth/os/analytics/funnel-<date>.md`) cho thấy một bước rớt rõ: pageviews nhiều, cta_click ít; vào landing nhiều, waitlist dưới 8%; store visitors nhiều, install thấp.
- Trước khi landing lên live (ngày ≤ 7 theo `targets.json.leading_indicators.landing_live_day`).
- CGO giao task "tối ưu …" cho seo-content, creative-studio hoặc aso-specialist.

## Đầu vào bắt buộc

- Số funnel 7 ngày gần nhất (skill growth-analytics). Nếu chưa có GA4 → chỉ làm phần checklist tĩnh, không bịa tỷ lệ.
- `docs/06-marketing-test.md` §3 (khuôn landing), §7 (ngưỡng), §8 (bán bằng B, xây bằng C).
- `growth/os/memory/GAME_PROFILE.md` (tính năng thật để không hứa thứ app chưa có), `AUDIENCE_PROFILE.md`.
- Trang đang xét: URL landing/blog, hoặc file listing `growth/os/aso/<platform>-listing-<date>.md`.

## Funnel chuẩn và sự kiện đo (GA4 trên blog/landing)

| Bước | Sự kiện / metric | Nguồn |
|---|---|---|
| Vào trang | `page_view` → `pageviews` | GA4 |
| Bấm CTA | `cta_click` (param `cta_id`: hero, mid, footer, tool) | GA4 custom event — cần approval `code_change` nếu thêm vào `growth/blog` |
| Dùng thử công cụ tính | `tool_use` (param `tool`: ty-gia-doi, von-tu-do, gio-vang) | GA4 custom |
| Để lại email | `waitlist_submit` → `waitlist` | GA4 + ESP |
| Cài PWA | `appinstalled` → `pwa_installs` | GA4 |
| Sang store | click link có UTM → `store_visitors` | Play Console / ASC |
| Cài app | `installs` | Play Console / ASC |

Ngưỡng docs/06 §7: email trên landing > 8% · dùng thử công cụ > 30% khách vào landing · cost/email < 25.000đ · CTR ads > 1,5%.

## Các bước thực thi

1. Lấy số nền: `node growth/os/bin/os.mjs metric sum --metric pageviews --from <7 ngày trước>`; tương tự `clicks`, `waitlist`, `pwa_installs`, `store_visitors`, `installs`. Tính tỷ lệ từng bước, ghi vào `growth/os/analytics/cro-<trang>-<YYYY-MM-DD>.md` (khuôn dưới). Số chưa có → "chưa đo".
2. Rà checklist landing (`templates/landing-checklist.md`) trên trang thật: hero đúng câu hỏi "Một giờ đời bạn giá bao nhiêu?", 3 khối Tỷ giá đời / Vốn tự do / Giờ vàng, khối cam kết (không streak, không trách móc, không bán dữ liệu, dữ liệu trên máy) — không được bỏ, form email xuất hiện 2 lần (hero + cuối), dòng "N người đang chờ" chỉ khi N thật. Với blog: CTA cuối bài trỏ công cụ tính liên quan, có UTM `utm_source=blog`. Với store listing: 7 mục của aso-specialist, ảnh đầu tiên là màn hình con số (Tỷ giá đời), không có badge/streak.
3. Chọn đúng 1 bước rớt mạnh nhất so ngưỡng. Viết ≤ 3 ý tưởng sửa, mỗi ý tưởng một dòng "nếu đổi X thì Y tăng vì Z", Z phải dẫn từ AUDIENCE_PROFILE hoặc bình luận thật.
4. Ý tưởng cần số để kết luận → ghi thành thử nghiệm (skill growth-experimentation):
   ```
   node growth/os/bin/os.mjs experiment add --hypothesis "Hero dùng câu hỏi góc C thay vì tagline tăng tỷ lệ email" --channel BLOG --metric waitlist --baseline "5.1% (7 ngày, 412 pv)" --target ">8% trên >=300 pv" --variables "hero: tagline vs câu hỏi" --start-date 2026-10-27 --end-date 2026-11-03
   ```
   A/B thật trên Astro tĩnh không có công cụ chia tải → chạy tuần tự (tuần A rồi tuần B) hoặc chia theo nguồn traffic; ghi rõ trong `--variables` để khi đọc kết quả biết hạn chế.
5. Thay đổi cần sửa `growth/blog` hoặc `code/fe` → `approval request --kind code_change --request "<mô tả thay đổi, file, lý do, số nền>" --ref X-xxxx`; task BLOCKED tới khi duyệt. Thay đổi chỉ ở nội dung bài (`growth/content/vi/`) thì làm theo `growth/content/HANDOFF.md`.
6. Hết `end_date`: nạp số (growth-analytics), `experiment decide X-xxxx --decision ... --results "<trước → sau, cỡ mẫu>"`. Đạt ngưỡng → ghi LEARNINGS và áp cho trang khác; không đạt → ITERATE với ý tưởng tiếp theo trong danh sách bước 3.
7. Đóng task: `task update T-xxxx --status DONE --evidence growth/os/analytics/cro-<trang>-<date>.md --actual "<tỷ lệ trước → sau hoặc: checklist 9/12, 3 thử nghiệm đã mở>"`.

## Đầu ra

`growth/os/analytics/cro-<trang>-<YYYY-MM-DD>.md`:
```
# CRO — <trang/URL> — <ngày>
## Funnel 7 ngày (nguồn, chất lượng)
| Bước | Số | Tỷ lệ | Ngưỡng docs/06 §7 | Đạt? |
## Checklist landing (docs/06 §3)  — đạt x/12, thiếu: …
## Bước rớt chọn tối ưu: <bước> — vì <số>
## Ý tưởng (≤3): nếu đổi … thì … vì …
## Thử nghiệm đã mở: X-xxxx (metric, baseline, target, end_date)
## Cần duyệt: approval #n (code_change) / không
```

## Kiểm chất lượng

- [ ] Mọi tỷ lệ có tử số, mẫu số và khoảng ngày; mẫu < 100 pageviews thì ghi "chưa đủ mẫu", không kết luận.
- [ ] Khối cam kết còn nguyên trên landing sau mọi thay đổi.
- [ ] Không hứa tính năng chưa có trong GAME_PROFILE (6 công cụ tính chưa build thì không ghi "dùng thử ngay").
- [ ] Giọng: không "nên/phải/hãy", không dấu chấm than, không đếm ngược gây gấp.
- [ ] Mỗi ý tưởng đổi thành experiment có metric là waitlist/clicks/installs/pwa_installs, không phải views.
- [ ] Không sửa `code/fe`, `growth/blog` config khi chưa có approval.

## Khi lỗi / kẹt

- Chưa có GA4: làm checklist tĩnh + experiment ở trạng thái chờ số; ghi task BLOCKED, nhắc approval `access` cho GA4 trong CURRENT_STATE.
- Landing chưa tồn tại: đầu ra là bản thiết kế nội dung landing theo §3 ở `growth/os/content/landing-<date>.md`, giao Founder/creative-studio dựng.
- Góc B thắng áp đảo ở bước CTA nhưng rớt ở install/retention: áp docs/06 §8 — giữ hook B cho quảng bá, nội dung trang và app theo C; ghi DECISION_LOG.

## Agent liên quan

`seo-content` (landing/blog) · `aso-specialist` (store) · `creative-studio` (ảnh, video demo) · `growth-analytics` (số) · `growth-orchestrator` (chọn thử nghiệm).

## Công cụ dùng

CLI `os.mjs` (metric sum, experiment add/decide, approval request, task update, memory log) · Read landing/blog source (`growth/blog`, `growth/content/vi`) · WebFetch trang live để kiểm checklist.
