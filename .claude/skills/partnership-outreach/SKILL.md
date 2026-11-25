---
name: partnership-outreach
description: Tìm newsletter, podcast, blog cá nhân Việt Nam ≤ 10k người theo dõi về tài chính–gia đình, lập DB outreach, viết thư cá nhân hoá 3 đoạn cho từng người (nhắc đúng bài của họ, đề nghị cụ thể: công cụ tính miễn phí hoặc cross-post), xin Founder duyệt danh sách trước khi gửi, theo dõi phản hồi. Dùng khi nói "tìm đối tác", "newsletter nào", "podcast tài chính gia đình", "viết thư outreach", "cross-post", "partnership", "outreach email", "collab", "guest post". KHÔNG mass message, KHÔNG tự gửi khi chưa có approval publish, KHÔNG nhắm tài khoản > 10k hay thương hiệu lớn (The Present Writer là đối thủ nội dung, không phải đối tác).
---

# partnership-outreach — đối tác nhỏ, thư riêng từng người

## Mục đích

CHANNEL_STRATEGY mục PARTNERSHIP: 5 đối tác ≤ 10k follower, outreach cá nhân hoá, Founder duyệt danh sách trước khi gửi, không mass message. Skill này tạo ba thứ: DB ứng viên có nguồn, một thư riêng cho mỗi người (không template điền tên), và vòng theo dõi phản hồi — tất cả dừng trước cổng gửi.

## Khi nào dùng

- Phase 1–2 khi đã có ít nhất một công cụ tính hoặc bài blog live để đề nghị (không có gì live → chỉ làm DB, chưa viết thư).
- Hằng tháng rà lại phản hồi và bổ sung 5–10 ứng viên.

## Đầu vào bắt buộc

`PROJECT_CONTEXT.md`, `CHANNEL_STRATEGY.md` (PARTNERSHIP), `AUDIENCE_PROFILE.md`, `COMPETITOR_INTELLIGENCE.md` (ai là đối thủ, không outreach), `GAME_PROFILE.md` (được hứa gì), `docs/00-vision.md` (giọng), `growth/os/research/outreach-*.csv` gần nhất, `growth/os/config/channels.json` (PARTNERSHIP = utm_source partner / medium referral), danh sách bài/công cụ đã live (`node growth/os/bin/os.mjs content list --status=PUBLISHED`).

## Các bước thực thi

1. `node growth/os/bin/os.mjs task add --title="Outreach đợt <n>: tìm + thư" --agent=community-partnerships --impact=4 --confidence=0.6 --urgency=2 --effort=3 --deadline=<YYYY-MM-DD> --expected="outreach-<date>.csv ≥ 10 ứng viên, ≥ 5 thư, approval publish" ` → IN_PROGRESS.
2. **Tìm ứng viên** (WebSearch/WebFetch, tiếng Việt): Substack/Buttondown/Mailchimp archive VN về tiền–gia đình–công việc, podcast Spotify/Apple VN cùng chủ đề, blog cá nhân (WordPress/Ghost) có bài về lương, đổi việc, thời gian với con, về quê. Loại: > 10k follower (đọc số công khai, ghi ngày), thương hiệu/công ty, trang bán khoá học, đối thủ trong COMPETITOR_INTELLIGENCE.
3. **Với mỗi ứng viên**: đọc ≥ 2 bài gần nhất; ghi một bài cụ thể (URL + ý chính một câu) sẽ nhắc trong thư; kênh liên hệ **công khai do họ đăng** (email trên trang, form, DM nền tảng) — không tìm email qua công cụ dò; chủ đề khớp góc A/B/C; đề nghị phù hợp (`tool` = nhúng/dẫn công cụ tính miễn phí; `crosspost` = đăng chéo bài; `guest` = bài viết riêng cho họ; `mention` = nhắc nhau).
4. **Ghi CSV** `growth/os/research/outreach-<YYYY-MM-DD>.csv` (khuôn dưới), `status=candidate`.
5. **Chọn ≤ 5 người cho đợt**, ưu tiên: bài gần nhất khớp ngách nhất, có kênh liên hệ công khai, follower 1k–10k.
6. **Link riêng mỗi đối tác**: `node growth/os/bin/os.mjs link --url=<bài/công cụ live> --channel=PARTNERSHIP --campaign=outreach-<yyyymm> --content=<slug-đối-tác>` → ghi vào CSV cột `utm`.
7. **Viết thư** `growth/os/content/outreach/<slug-đối-tác>.md` — 3 đoạn, ≤ 180 từ: (1) nhắc đúng bài của họ và một điều cụ thể mình thấy đáng (không khen chung), (2) Mira là gì trong 2 câu + con số thật (115.000đ/giờ) + vì sao hợp với độc giả của họ, (3) một đề nghị cụ thể, dễ nói không, không deadline ép. Giọng `docs/00`: không "hãy", không chấm than, không "hợp tác đôi bên cùng có lợi". Ký tên Founder (tên do Founder cung cấp; chưa có → `[Tên Founder]`). Rà bằng skill `anthropic-skills:viet-nhu-nguoi`.
8. **Ghi content**: `content add --topic="Outreach <tên>" --channel=PARTNERSHIP --format=letter --hook="<câu đầu>" --cta="<đề nghị>" --body-ref=growth/os/content/outreach/<slug>.md` → K-id vào CSV; `content update K-xxxx --status=REVIEW`.
9. **Xin duyệt danh sách**: `approval request --kind=publish --request="Gửi outreach đợt <n> tới <n> người: <tên 1>, <tên 2>... — thư ở growth/os/content/outreach/, DB outreach-<date>.csv" --ref=T-xxxx`. Task → REVIEW. **Dừng ở đây.** Không gửi.
10. **Sau duyệt** (`approval list` thấy APPROVED): Founder gửi tay từ hộp thư của Founder (repo không có SMTP/API gửi) → ghi `status=sent`, `sent_date`, `content update K-xxxx --status=PUBLISHED --url=<kênh đã gửi>`; `memory log --file=LEARNINGS --text="outreach gửi <tên> ngày ... (K-xxxx)"`.
11. **Theo dõi phản hồi** mỗi tuần: cập nhật `status` ∈ {candidate, drafted, approved, sent, replied, agreed, declined, no_reply_14d}, `reply_date`, `outcome`. 14 ngày không trả lời → một thư nhắc ngắn (cũng qua approval) rồi đóng. Phản hồi "đồng ý" → task mới cho việc thực hiện (cross-post/công cụ) với UTM đã tạo.
12. `task update T-xxxx --status=DONE --evidence=growth/os/research/outreach-<date>.csv --actual="<n> ứng viên, <m> thư chờ duyệt"`.

## Đầu ra

CSV:

```csv
name,type,platform,url,followers,followers_read_date,contact_channel,contact_public_source,recent_post_url,recent_post_gist,angle,offer,status,k_id,utm,sent_date,reply_date,outcome,note
"Thư của Hà",newsletter,substack,https://....substack.com,2300,2026-10-16,email trên trang About,https://.../about,https://.../p/luong-20-trieu,"tự tính lương theo giờ, thấy thấp hơn tưởng",C,tool,drafted,K-0012,https://...?utm_source=partner&utm_medium=referral&utm_campaign=outreach-202610&utm_content=thu-cua-ha,,,,
```

Thư `growth/os/content/outreach/<slug>.md`:

```markdown
# Outreach — <tên> — <K-id> — trạng thái: DRAFT|REVIEW|APPROVED|SENT
- Gửi qua: <kênh công khai> · Bài nhắc: <URL> · Đề nghị: tool|crosspost|guest|mention · UTM: <link>

Chào <tên>,

<Đoạn 1 — bài của họ, một chi tiết cụ thể.>

<Đoạn 2 — Mira, 2 câu, một con số thật, vì sao hợp độc giả của họ.>

<Đoạn 3 — một đề nghị cụ thể, dễ từ chối.>

<Tên Founder>
```

## Kiểm chất lượng

- [ ] Mọi ứng viên ≤ 10k follower có ngày đọc; không đối thủ; không thương hiệu.
- [ ] Kênh liên hệ lấy từ nơi họ tự công bố (`contact_public_source` có URL); không dò email.
- [ ] Mỗi thư nhắc đúng một bài có URL thật đã đọc; không hai thư giống nhau > 50%.
- [ ] 3 đoạn, ≤ 180 từ, 0 chấm than, 0 "hãy/nên/phải"; đề nghị chỉ thứ đã live (GAME_PROFILE/content PUBLISHED).
- [ ] Có `approval request --kind=publish` với danh sách tên; không thư nào có `status=sent` trước khi approval APPROVED.
- [ ] Mỗi đối tác một UTM riêng, utm_content = slug đối tác.

## Khi lỗi / kẹt

- Chưa có gì live để đề nghị → dừng ở bước 4, note "chờ bài/công cụ live", task BLOCKED.
- Founder từ chối một tên → `status=declined_internal`, lý do vào note; không gửi.
- Không tìm được kênh liên hệ công khai → `contact_channel=không có`, không outreach người đó.
- Ứng viên trả lời yêu cầu trả phí/booking → ghi `outcome=paid_ask`, chuyển `paid-advertising`/Founder; không cam kết tiền.

## Agent liên quan

community-partnerships (chủ), seo-content (bài cross-post), growth-analytics (UTM), founder (duyệt danh sách, gửi tay, ký tên).

## Công cụ dùng

WebSearch, WebFetch (trang công khai), Read, Write (CSV + thư), skill `anthropic-skills:viet-nhu-nguoi`, CLI `os.mjs` (`task`, `content`, `link`, `approval`, `memory`). Không công cụ gửi email.
