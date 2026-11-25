---
name: short-video-production
description: Viết kịch bản video ngắn 15–25 giây cho TikTok/Reels/Shorts của Mira từ 6 hook docs/06 §5 — cấu trúc 0–2s hook số, 3–15s phép tính trên màn hình, 15–25s câu hỏi + CTA — kèm shot list quay footage thật của app, text overlay, caption, hashtag VN. Dùng khi nói "kịch bản video", "TikTok script", "video 15 giây", "quay app", "shot list", "Reels", "Shorts", "short video", "video script", "storyboard". KHÔNG dùng để viết caption/post thường (social-media-content), KHÔNG bịa màn hình chưa có trong code, KHÔNG đánh APPROVED khi chưa có asset thật.
---

# short-video-production — kịch bản 15–25 giây, footage thật

## Mục đích

Mỗi hook thành một kịch bản quay được bằng điện thoại trong một buổi: biết quay màn hình nào (đường dẫn file trong `code/fe`), chữ gì đè lên, nói gì, kết bằng câu hỏi nào. CHANNEL_STRATEGY: footage thật của app, **không mock-up giả**; app chưa có build native nên nhiều kịch bản sẽ ở trạng thái "chờ asset" — đó là bình thường, không phải lý do để vẽ màn hình giả.

## Khi nào dùng

- Khi `viral-content-creation` chọn hook cần video, hoặc task READY của creative-studio.
- Khi app chạy được trên điện thoại/PWA để quay (GAME_PROFILE bảng màn hình cột "Quay footage được?").

## Đầu vào bắt buộc

`PROJECT_CONTEXT.md`, `GAME_PROFILE.md` (bảng màn hình thật + cột quay được), `AUDIENCE_PROFILE.md`, `LEARNINGS.md`, `docs/00-vision.md`, `docs/03-formulas.md` (phép tính đúng), `docs/06-marketing-test.md` §5 (6 hook), hook file `growth/os/content/social/hooks-*.md` nếu có, `growth/os/config/channels.json`.

## Cấu trúc bắt buộc (15–25s)

| Giây | Khối | Nội dung | Overlay |
|---|---|---|---|
| 0–2 | Hook số | Một con số, một câu, không mở đầu "xin chào" | Số lớn, 1 dòng |
| 3–15 | Phép tính trên màn hình | Quay thật: nhập 2–4 ô → ra số; hoặc chữ chạy phép tính nếu màn hình chưa có | Từng bước phép tính `docs/03` |
| 15–25 | Câu hỏi + CTA | Câu hỏi để lại (không chốt bài học), CTA một câu, trỏ công cụ/app/bio | Câu hỏi + "link ở bio" |

Giọng đọc (nếu có): điềm đạm, nói với một người, không hô hào, không dấu chấm than trong overlay.

## Các bước thực thi

1. **Chọn hook** (1–6 `docs/06` §5 hoặc H-id từ hooks file). Hook 3 và 6 → kèm câu phản biện ở khối 15–25 và ngưỡng dừng 10–15% bình luận tiêu cực.
2. **Ghi content**: `node growth/os/bin/os.mjs content add --topic="Video hook <n>: <ý>" --channel=TIKTOK --format=short-video --hook="<câu 0–2s>" --cta="<đích>" --body-ref=growth/os/content/video/<K-id>-<slug>.md` → K-id; `task add --title="Kịch bản + quay video <K-id>" --agent=creative-studio --impact=4 --confidence=0.5 --urgency=3 --effort=3 --deadline=<d> --expected="kịch bản + shot list + asset thật"`.
3. **Chọn màn hình quay**: tra GAME_PROFILE bảng màn hình; chỉ dùng dòng "Quay footage được? = có", ghi đường dẫn file (ví dụ `code/fe/src/TimeTracker/Screens/Home.tsx`) và dữ liệu mẫu cần nhập trước. Không có màn hình hợp → khối 3–15 chuyển sang "phép tính bằng chữ/giấy", ghi `FOOTAGE: không có màn hình thật cho ý này`.
4. **Viết kịch bản** theo `templates/video-script.md`: thoại, overlay, shot list (góc máy, thời lượng, hành động ngón tay), âm thanh (không nhạc bản quyền; ghi "nhạc thư viện nền tảng").
5. **Phép tính** chép đúng `docs/03` với bộ số nhất quán (30 triệu / 60 giờ → 115.000đ/giờ; 25 triệu ÷ 115.000 ≈ 217 giờ). Số khác phải có N-xxx.
6. **Caption + hashtag**: caption ≤ 150 ký tự, câu hỏi; 3–5 hashtag VN không dấu và có dấu xen (`#tygiadoi #tudotaichinh #giovang #danvanphong`); không hashtag trend vô liên quan.
7. **Link**: `node growth/os/bin/os.mjs link --url=<đích> --channel=TIKTOK --campaign=<hook-id> --content=video` → `content update K-xxxx --utm="<link>"` (đặt ở bio; ghi vào file).
8. **Asset**: mục "Asset thật" liệt kê file video/ảnh đã quay (`growth/os/content/video/assets/<K-id>/...` hoặc đường dẫn Founder cung cấp). Chưa có → trạng thái tối đa REVIEW với note "chờ asset"; `content update K-xxxx --status=REVIEW`.
9. Có asset thật + Founder duyệt → `content update K-xxxx --status=APPROVED`; sau khi đăng tay → `--status=PUBLISHED --url=<URL>`; theo dõi 48h ghi vào hooks file (viral-content-creation bước 8).
10. `task update T-xxxx --status=REVIEW|DONE --evidence=growth/os/content/video/<K-id>-<slug>.md`.

## Đầu ra

`growth/os/content/video/<K-id>-<slug>.md` theo `templates/video-script.md`. Tóm tắt khuôn:

```markdown
# <K-id> — <hook n> — <slug>
- Trạng thái: DRAFT | REVIEW (chờ asset) | APPROVED | PUBLISHED · Task · Góc A/B/C · Kênh: TIKTOK (+YOUTUBE Shorts)
- Màn hình quay: code/fe/src/<...>.tsx — dữ liệu mẫu: ... · Hoặc: FOOTAGE: không có màn hình thật
## Kịch bản theo giây (0–2 / 3–15 / 15–25): thoại · overlay · shot
## Shot list: # · cảnh · thời lượng · hành động · ghi chú quay
## Caption · Hashtag · Link UTM (bio)
## Asset thật: đường dẫn file | chưa có
## Sau khi đăng: URL · xem · bình luận · % tiêu cực
```

## Kiểm chất lượng

- [ ] Tổng thời lượng 15–25s; ba khối đúng mốc giây.
- [ ] Màn hình quay có đường dẫn file thật và GAME_PROFILE ghi "quay được"; không mock-up, không màn hình vẽ.
- [ ] Phép tính đúng `docs/03`, số có nguồn.
- [ ] Kết bằng câu hỏi; overlay 0 dấu chấm than; không "nên/phải/hãy"; không streak.
- [ ] Hook 3/6 có phản biện + ngưỡng dừng.
- [ ] Trạng thái APPROVED chỉ khi mục "Asset thật" có file tồn tại và Founder duyệt.

## Khi lỗi / kẹt

- App không chạy trên điện thoại → quay PWA trên trình duyệt mobile (web build) nếu màn hình đó render; ghi rõ "footage PWA". Không được → task cho founder "quay màn hình X", content REVIEW.
- Màn hình còn chữ tiếng Anh/vỏ Batify → không quay phần đó; ghi vào GAME_PROFILE "Việc mở" qua task cho market-intelligence; không sửa code.
- Cần tài khoản TikTok/YouTube → `approval request --kind=access`.

## Agent liên quan

creative-studio (chủ), social-growth (đăng, theo dõi), market-intelligence (cập nhật màn hình), founder (quay/duyệt).

## Công cụ dùng

Read, Write (`growth/os/content/video/`), CLI `os.mjs`, skill rà giọng cho thoại/caption.
