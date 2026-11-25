---
name: viral-content-creation
description: Nghĩ và đóng gói hook/format dễ chia sẻ cho Mira — ảnh kết quả máy tính, "con số sốc có nguồn", thử thách 7 ngày ghi giờ vàng, meme giọng điềm đạm — xoay ba góc A/B/C, mỗi hook một experiment, theo dõi tỷ lệ bình luận tiêu cực để dừng. Dùng khi nói "hook viral", "nội dung dễ share", "con số sốc", "thử thách 7 ngày", "meme Mira", "format lan truyền", "viral content", "shareable", "hook ideas", "what would people share". KHÔNG dùng để viết post hoàn chỉnh theo nền tảng (social-media-content), KHÔNG dùng cho kịch bản video (short-video-production), KHÔNG được dùng tính năng chưa có trong code.
---

# viral-content-creation — hook và format dễ chia sẻ

## Mục đích

Mira có một lợi thế tự nhiên: con số của chính người đọc (115.000đ/giờ, 217 giờ cho cái điện thoại, 68 lần gặp bố mẹ) gây sốc nhưng thật. Skill này biến lợi thế đó thành format lặp lại được, mỗi format là một thử nghiệm có chỉ số, và có **công tắc dừng** cho góc gây tội lỗi — vì `docs/06` §8 cảnh báo góc B thắng bằng tội lỗi thì retention thấp.

## Khi nào dùng

- Đầu mỗi vòng thử nghiệm organic (CHANNEL_STRATEGY: 3 góc × 2 hook trên Threads/FB trước khi chi tiền).
- Khi `growth-experimentation` quyết ITERATE cho một hook → cần biến thể mới.
- Khi có kết quả máy tính mới (công cụ live) hoặc số N-xxx mới độ tin `cao` đáng "sốc".

## Đầu vào bắt buộc

`PROJECT_CONTEXT.md`, `GAME_PROFILE.md` (được nói gì; không bịa tính năng), `AUDIENCE_PROFILE.md`, `LEARNINGS.md` (hook nào đã thử), `docs/00-vision.md` (giọng, 3 rủi ro), `docs/06-marketing-test.md` §2 (ba góc), §5 (6 hook + ngưỡng 10–15%), §8, `docs/nguon/nghien-cuu/INDEX.md` (số có nguồn), `growth/os/content/social/` (format đã dùng).

## Bốn format gốc

| Format | Cách làm | Góc hợp | Cần gì |
|---|---|---|---|
| Ảnh kết quả máy tính | Một màn hình: ô nhập ẩn, hiện 1 con số lớn + 1 dòng ngữ cảnh | A, C | Công cụ/màn hình thật hoặc ảnh do creative-studio dựng **ghi rõ "minh hoạ"** |
| Con số sốc có nguồn | Một số từ N-xxx độ tin cao, một phép tính, một câu hỏi | A, B, C | Mã N, nguồn ghi ngay trong ảnh/caption |
| Thử thách 7 ngày ghi giờ vàng | Mỗi tối ghi số giờ thật bên người quan trọng, ngày 7 đăng tổng; không streak, bỏ ngày được | B (bản nhẹ) | Mẫu ghi tay (bảng 7 ô) — không cần app |
| Meme giọng điềm đạm | Khung meme quen, chữ bình thản, không chấm than, tự giễu nhẹ | C | Ảnh nền không bản quyền |

## Các bước thực thi

1. `node growth/os/bin/os.mjs task add --title="Hook viral vòng <n>" --agent=creative-studio --impact=4 --confidence=0.5 --urgency=3 --effort=2 --deadline=<YYYY-MM-DD> --expected="≥6 hook (3 góc × 2) + experiment mỗi hook"` → IN_PROGRESS.
2. **Đọc LEARNINGS + experiment list** (`experiment list --open`) để không lặp hook đã STOP.
3. **Sinh hook**: mỗi góc A/B/C ít nhất 2 hook, mỗi hook gắn 1 format. Hook lấy số từ `docs/06` §5 hoặc N-xxx; mọi số ghi nguồn. Mỗi hook một dòng ≤ 20 từ, không dấu chấm than, không "nên/phải/hãy".
4. **Kiểm tính năng**: hook nhắc "app đếm giúp bạn" chỉ khi GAME_PROFILE cột "Nói ra ngoài" = `có`; nếu `KHÔNG` → đổi sang "công cụ tính" hoặc "tự tính tay". Không mock-up giả.
5. **Kiểm rủi ro**: hook góc B phải có (a) hành động đi kèm, (b) câu phản biện nhẹ; ghi kế hoạch đếm bình luận tiêu cực 48h.
6. **Mở experiment cho từng hook** (gọi skill `growth-experimentation` nếu có, hoặc trực tiếp):
   `node growth/os/bin/os.mjs experiment add --hypothesis="Hook <id> góc <X> format <F> đạt ≥ <target> trên <kênh>" --channel=THREADS --metric=clicks --baseline="chưa đo" --target="<số>" --start-date=<d> --end-date=<d+7>` → ghi X-id vào file hook.
7. **Ghi file** `growth/os/content/social/hooks-<YYYY-MM-DD>.md` (khuôn dưới). Hook được chọn → chuyển cho `social-media-content` / `short-video-production` viết bản đăng (K-id tạo ở đó).
8. **Sau 48h đăng** (do social-growth ghi): tỷ lệ bình luận "nặng nề/áp lực" = số bình luận tiêu cực ÷ tổng bình luận. > 10–15% → `experiment decide X-xxxx --decision=STOP --results="<n>/<m> bình luận tiêu cực = <p>%"` và `memory log --file=LEARNINGS --text="Hook <id> góc B dừng: <p>% tiêu cực (X-xxxx)"`. Dưới ngưỡng và có click → ITERATE/SCALE.
9. `task update T-xxxx --status=DONE --evidence=growth/os/content/social/hooks-<date>.md --actual="<n> hook, <m> experiment"`.

## Đầu ra

```markdown
# Hook vòng <n> — <dd/mm/yyyy>

| ID | Góc | Format | Hook (≤20 từ) | Nguồn số | Tính năng nhắc tới (GAME_PROFILE) | Hành động kèm | X-id | Kênh thử | Ngưỡng dừng |
|---|---|---|---|---|---|---|---|---|---|
| H-01 | C | con số sốc | lương 30 triệu, 60 giờ thật: 115 nghìn một giờ | docs/03 §2 | không | tự tính 3 ô | X-0001 | THREADS | 15% tiêu cực |
| H-03 | B | thử thách 7 ngày | bảy tối ghi số giờ thật bên con, không chấm điểm | — | không | mẫu bảng 7 ô | X-0003 | FACEBOOK_ORGANIC | 10% tiêu cực |

## Ghi chú rủi ro
- H-03: câu phản biện kèm: "ít không có nghĩa là sai, chỉ là một con số để nhìn".

## Theo dõi 48h (điền sau khi đăng)
| ID | URL | Xem | Click | Bình luận | Tiêu cực | % | Quyết |
```

## Kiểm chất lượng

- [ ] ≥ 2 hook mỗi góc, mỗi hook có X-id.
- [ ] Mọi con số có nguồn (docs/03, docs/06 §5, hoặc N-xxx độ tin cao/vừa).
- [ ] Không hook nào nhắc tính năng ngoài GAME_PROFILE; ảnh minh hoạ ghi "minh hoạ".
- [ ] Hook góc B có hành động + phản biện + ngưỡng dừng ≤ 15%.
- [ ] 0 dấu chấm than, 0 "nên/phải/hãy", không streak/badge trong thử thách.
- [ ] Không trùng hook đã STOP trong LEARNINGS.

## Khi lỗi / kẹt

- Chưa có công cụ/màn hình thật cho "ảnh kết quả" → dùng format con số sốc hoặc ảnh "minh hoạ" do creative-studio dựng; task cho creative-studio.
- Chưa có tài khoản để thử → vẫn mở experiment với note "đăng tay bởi Founder", kênh ghi đúng.
- Không đếm được bình luận (không truy cập) → Founder chụp/đếm tay; ghi `quality=estimated`.

## Agent liên quan

creative-studio (chủ), social-growth (đăng, đếm 48h), growth-analytics (metric), founder (duyệt góc B).

## Công cụ dùng

Read, Write (`growth/os/content/social/hooks-*.md`), CLI `os.mjs` (`experiment`, `memory`, `task`), skill `growth-experimentation`, skill rà giọng.
