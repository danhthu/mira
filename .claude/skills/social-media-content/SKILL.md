---
name: social-media-content
description: Soạn bài đăng theo từng nền tảng (Facebook, Threads, caption TikTok, Reddit) từ bài blog Thứ Bảy hoặc kết quả máy tính của Mira, kèm lịch đăng tuần, link UTM, trạng thái duyệt. Dùng khi nói "soạn post", "viết caption", "bài Threads", "post Facebook", "đăng Reddit", "lịch đăng tuần", "social content", "social post", "content calendar". KHÔNG dùng để nghĩ hook viral mới (viral-content-creation), KHÔNG dùng cho kịch bản video (short-video-production), KHÔNG tự đăng khi content chưa APPROVED hoặc chưa có tài khoản Mira.
---

# social-media-content — post theo nền tảng và lịch tuần

## Mục đích

Biến một nguồn đã có (bài `type: social` Thứ Bảy, bài khác, hoặc một kết quả máy tính) thành post sẵn đăng cho từng nền tảng, đúng giọng Mira, có link đo được, và một lịch tuần để Founder (hoặc social-growth khi được cấp tài khoản) đăng theo. Hiện **chưa có tài khoản social của Mira trong repo** (CURRENT_STATE mục Kẹt #5) → đầu ra mặc định là gói "đăng tay".

## Khi nào dùng

- Mỗi tuần sau khi có bài T7 ở REVIEW/APPROVED, hoặc khi `viral-content-creation` chốt một hook cần phủ nhiều nền tảng.
- Khi Founder nói "tuần này đăng gì".

## Đầu vào bắt buộc

`PROJECT_CONTEXT.md`, `CHANNEL_STRATEGY.md` (nhịp: FB 1/ngày, Threads 1–2/ngày, Reddit 1/tháng; luật không đăng cùng nội dung nhiều nhóm một ngày), `AUDIENCE_PROFILE.md`, `LEARNINGS.md`, `GAME_PROFILE.md` (được nói gì), `docs/00-vision.md` (giọng), `docs/06-marketing-test.md` §2 (ba góc) §5 (hook), bài nguồn trong `growth/content/vi/`, `growth/os/research/communities-*.csv` nếu có (nơi đăng + luật), `growth/os/config/channels.json`.

## Các bước thực thi

1. **Chọn nguồn**: bài T7 tuần này (`type: social` trong queue) hoặc nguồn task chỉ định. Mỗi nguồn → tối đa 4 post (FB, Threads, TikTok caption, Reddit), mỗi post một góc A/B/C ghi rõ.
2. **Ghi content cho từng post**: `node growth/os/bin/os.mjs content add --topic="<ý chính>" --channel=THREADS --format=post --hook="<câu đầu>" --cta="<đích>" --body-ref=growth/os/content/social/<K-id>-<slug>.md --source-slug=<slug bài gốc>` (channel: FACEBOOK_ORGANIC | THREADS | TIKTOK | REDDIT). Tạo content trước để có K-id đặt tên file, rồi `content update K-xxxx --body-ref=...` nếu cần.
3. **Link UTM**: `node growth/os/bin/os.mjs link --url=<URL bài/công cụ> --channel=THREADS --campaign=<slug bài gốc> --content=<goc-A|B|C>` → `content update K-xxxx --utm="<link>"`. Nền tảng không cho link trong post (Threads/TikTok) → link ở comment đầu / bio, ghi rõ trong file.
4. **Viết theo nền tảng**:
   - FB: 300–500 từ cắt từ bài T7, con số + phép tính hiện rõ, link cuối.
   - Threads: 1–3 câu + một con số, giọng tự sự ngôi thứ nhất; không hashtag dày.
   - TikTok caption: ≤ 150 ký tự + 3–5 hashtag VN (`#tygiadoi #tudotaichinh ...`), đi kèm kịch bản của `short-video-production` nếu có.
   - Reddit: tiêu đề câu hỏi + thân "chia sẻ công cụ, không bán", đọc luật sub trước (r/VietNam, r/vietnam_personal_finance), ghi luật vào file.
5. **Giọng Mira** (áp cho mọi nền tảng): không "nên/phải/hãy", không dấu chấm than, không gây tội lỗi, không streak/badge, sentence case, không emoji dày. Hook 3 và 6 (bố mẹ, con) phải kèm hành động và câu phản biện nhẹ — theo rủi ro #1 `docs/00`.
6. **Ảnh**: chỉ ảnh có thật trong `growth/blog/public/blog/images/` hoặc ảnh kết quả máy tính do creative-studio làm (đường dẫn file). Không ghi ảnh chưa tồn tại — ghi `ẢNH: chưa có → task creative-studio`.
7. **Lịch tuần** `growth/os/content/social/calendar-<YYYY-Www>.md`: mỗi dòng một post, giờ đăng (gợi ý: FB 12:00/20:00, Threads 07:30/21:00 — giả định, ghi [A] cho tới khi LEARNINGS có số), nơi đăng (Page / nhóm nào theo communities CSV, tần suất tối đa), trạng thái.
8. **Rà giọng** bằng skill `anthropic-skills:viet-nhu-nguoi` (hoặc `avoid-ai-writing`), grep `!` và "nên/phải/hãy".
9. `content update K-xxxx --status=REVIEW`; `task` tương ứng → REVIEW với evidence file. **Chỉ APPROVED mới đăng.** Chưa có tài khoản Mira → gói cho Founder đăng tay: file đã đủ text/ảnh/link/giờ; sau khi Founder đăng, Founder hoặc agent ghi `content update K-xxxx --status=PUBLISHED --url=<URL post>` và `memory log --file=LEARNINGS --text="đăng tay <K-id> tại <URL>"`.

## Đầu ra

`growth/os/content/social/<K-id>-<slug>.md`:

```markdown
# <K-id> — <nền tảng> — <slug>

- Nguồn: growth/content/vi/<NN>-<slug>.md · Góc: A|B|C · Hook số: <1–6 docs/06 §5 hoặc "mới">
- Trạng thái: DRAFT | REVIEW | APPROVED | PUBLISHED · Task: T-xxxx
- Giờ đăng đề xuất: <thứ, hh:mm> [A] · Nơi đăng: <Page Mira / nhóm X (luật: ...)/ sub>
- Link UTM: <link từ os.mjs> (đặt ở: cuối post | comment đầu | bio)
- Ảnh: <đường dẫn có thật> | chưa có → T-yyyy creative-studio

## Hook
<1 câu>

## Body
<theo nền tảng>

## CTA
<1 câu, không "hãy">

## Sau khi đăng
- URL: · Ngày: · Ghi nhận 48h: lượt xem / bình luận / tỷ lệ bình luận "nặng nề" (%)
```

Lịch tuần `calendar-<YYYY-Www>.md`:

```markdown
| Ngày | Giờ | Nền tảng | K-id | Góc | Nơi đăng | Trạng thái | URL sau đăng |
```

## Kiểm chất lượng

- [ ] Mỗi post có K-id, link UTM từ CLI, góc A/B/C, nguồn.
- [ ] 0 dấu chấm than, 0 "nên/phải/hãy", không claim tính năng ngoài GAME_PROFILE.
- [ ] Không post nào lên >1 nhóm cùng ngày; Reddit ≤ 1/tháng/sub.
- [ ] Ảnh ghi trong file tồn tại trên đĩa.
- [ ] Hook bố mẹ/con có kèm hành động + dòng theo dõi bình luận tiêu cực.
- [ ] Trạng thái ≤ REVIEW khi rời skill; không có hành động đăng nào được thực hiện.

## Khi lỗi / kẹt

- Chưa có tài khoản → không xin tạo trong skill; `approval request --kind=access --request="Tạo/cấp Facebook Page, Threads, TikTok cho Mira"` (một lần, kiểm `approval list` trước).
- Không có bài T7 tuần này → lấy bài T7 gần nhất chưa dùng (queue), hoặc kết quả máy tính; ghi nguồn.
- communities CSV chưa có → nơi đăng chỉ ghi "Page Mira"; tạo task cho `community-research`.

## Agent liên quan

social-growth (chủ), creative-studio (ảnh), community-partnerships (nhóm), founder (duyệt, đăng tay).

## Công cụ dùng

Read, Write (chỉ `growth/os/content/social/`), Grep, skill rà giọng, CLI `os.mjs`. Không WebFetch tới nền tảng social để đăng.
