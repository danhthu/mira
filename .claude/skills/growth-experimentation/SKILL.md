---
name: growth-experimentation
description: Vòng đời thử nghiệm tăng trưởng của Mira — viết giả thuyết đo được, `experiment add` với metric/baseline/target/end_date, theo dõi, `experiment decide` SCALE/ITERATE/STOP/INCONCLUSIVE, ghi LEARNINGS. Dùng khi nói "mở thử nghiệm", "test giả thuyết", "A/B", "góc nào thắng", "quyết experiment", "scale hay stop", "experiment", "hypothesis", "growth test", "3 góc A/B/C". KHÔNG dùng để dựng campaign paid (paid-advertising) hay để tối ưu một trang cụ thể (conversion-optimization) — hai skill đó gọi skill này khi cần ghi thử nghiệm.
---

# Growth experimentation — thử nghiệm có kết luận

## Mục đích

Chiến lược Mira là giả thuyết ([H] trong AUDIENCE_PROFILE). Thử nghiệm là cách duy nhất nâng [H] lên [F]. Một thử nghiệm không có baseline, target và ngày kết thúc thì không phải thử nghiệm — là hoạt động.

## Khi nào dùng

- CGO hoặc agent có câu "tôi nghĩ X sẽ tốt hơn Y" mà chưa có số.
- Giai đoạn 3 Validation (ngày 31–45): so 3 góc bằng số organic.
- Weekly review (Thứ Sáu): mọi experiment hết `end_date` phải được quyết.

## Đầu vào bắt buộc

- `growth/os/memory/AUDIENCE_PROFILE.md` (giả thuyết gốc, nhãn [H]), `LEARNINGS.md` (đừng thử lại thứ đã có kết luận), `CHANNEL_STRATEGY.md` (kênh định thử).
- Số nền (baseline) từ `metric sum` — nếu chưa có số nền, thử nghiệm đầu tiên có mục tiêu "tạo baseline", target ghi "n/a — tạo nền".
- Kênh đúng taxonomy; metric là một trong: waitlist, installs, pwa_installs, clicks, store_visitors, pageviews. CLI chặn SCALE nếu metric ∈ impressions, likes, views, reach, followers.

## Các bước thực thi

1. Viết giả thuyết theo khuôn: "Nếu <đổi gì> cho <ai, kênh nào> thì <metric> đạt <target> so với <baseline> trong <n ngày>, vì <lý do từ AUDIENCE_PROFILE / bình luận thật>". Một thử nghiệm một biến.
2. Định cỡ mẫu tối thiểu trước khi mở (ghi vào `--variables`): social organic ≥ 3 post/góc và ≥ 1.000 lượt hiển thị tổng mỗi góc; landing ≥ 300 pageviews mỗi biến thể; email/waitlist ≥ 20 sự kiện ở biến thể thắng; paid ≥ 8 USD chi (budget.json `min_spend_before_judging_usd`). Dưới mức này kết luận là INCONCLUSIVE, không phải STOP.
3. Mở thử nghiệm:
   ```
   node growth/os/bin/os.mjs experiment add --hypothesis "Góc C (tỷ giá đời) cho CTR ra landing cao hơn góc A và B trên Threads" --channel THREADS --metric clicks --objective "chọn góc chính cho tuần 5-6" --audience "người theo dõi Threads Mira + hashtag tài chính cá nhân" --variables "góc A/B/C, 3 post mỗi góc, cùng khung giờ 20h, cùng CTA; mẫu tối thiểu 1.000 hiển thị/góc" --baseline "chưa có — tạo nền" --target "góc thắng có clicks/1.000 hiển thị gấp >=1.5x góc kém nhất, >=30 clicks" --start-date 2026-10-27 --end-date 2026-11-09
   ```
   Có campaign/paid liên quan → thêm `--campaign C-xxxx --budget-usd N`.
4. Gắn nội dung và link: mỗi biến thể là một content K-id với `utm_content` = `X-0001-A|B|C` (skill attribution-tracking), để số về tách được theo biến thể. Ghi X-id vào task liên quan (`task update T-xxxx --note "thuộc X-0001"`).
5. Trong thời gian chạy: không đổi biến. Số về ghi vào metrics_daily (growth-analytics) theo kênh; ghi kết quả tạm bằng `experiment update X-0001 --results "ngày 5/14: A 12 clicks/1.100, B 19/1.300, C 15/900"`. Bình luận "nặng nề/áp lực" trên góc B đếm riêng (docs/06 §5): > 10–15% → STOP sớm.
6. Hết `end_date` (xem `experiment list --open`): nạp số cuối, so target, quyết:
   ```
   node growth/os/bin/os.mjs experiment decide X-0001 --decision SCALE --results "C: 48 clicks/3.100 hiển thị (1.55%), A: 21/2.900 (0.72%), B: 44/3.400 (1.29%) nhưng 14% bình luận 'nặng'; C thắng theo clicks và sạch bình luận"
   ```
   Luật quyết: SCALE = đạt target với mẫu đủ, metric không phải vanity · ITERATE = có tín hiệu nhưng chưa đạt hoặc mẫu thiếu một phần, nêu biến tiếp theo · STOP = không đạt với mẫu đủ, hoặc vi phạm giọng/ràng buộc · INCONCLUSIVE = mẫu không đủ, ghi vì sao và có mở lại không.
7. Ghi học được: `memory log --file LEARNINGS --text "X-0001: góc C CTR 1.55% vs A 0.72% trên Threads (n=9 post, 9.400 hiển thị) — dùng C làm góc chính social tuần 5-6"`. Nếu SCALE đổi thứ tự kênh/góc trong GROWTH_STRATEGY → `memory log --file DECISION_LOG` trước, rồi sửa file (skill memory-management). Cập nhật nhãn [H] → [F] hoặc gạch bỏ trong AUDIENCE_PROFILE.
8. SCALE sinh task mới qua task-orchestration (ví dụ "Soạn 7 post góc C tuần sau", agent social-growth). STOP cũng sinh task dọn (gỡ CTA, đổi hook).

## Mẫu đầu tiên cho Mira — 3 góc A/B/C organic trên Threads

| Góc | Hook (docs/06 §2, §5) | Content | utm_content |
|---|---|---|---|
| A | "Bạn giàu mấy tháng?" (hook 4) | K-A1..A3 | X-0001-A |
| B | "Còn khoảng 68 lần gặp bố mẹ" (hook 3) — organic trước, đọc bình luận | K-B1..B3 | X-0001-B |
| C | "Một giờ đời bạn giá bao nhiêu?" (hook 1) | K-C1..C3 | X-0001-C |

Metric: `clicks` ra landing (UTM). Phụ: tỷ lệ bình luận tiêu cực của B. Dự đoán gốc [H]: B CTR cao nhất, C email cao nhất — thử nghiệm này kiểm nửa đầu; nửa sau (waitlist theo góc) là X-0002 trên landing.

## Đầu ra

- Bản ghi X-id trong DB (`experiment show X-0001`), kết quả trong `results`, quyết định trong `decision`.
- Dòng LEARNINGS cho mọi quyết định khác INCONCLUSIVE; dòng DECISION_LOG nếu đổi chiến lược.
- Tuỳ chọn, khi thử nghiệm nhiều biến: `growth/os/research/experiment-X-0001-<YYYY-MM-DD>.md` ghi bảng số theo biến thể và ngày.

## Kiểm chất lượng

- [ ] Giả thuyết có đủ: đổi gì, cho ai, metric, target, baseline, ngày kết thúc, lý do.
- [ ] Một biến; biến thể tách được bằng `utm_content`.
- [ ] Metric không phải impressions/likes/views/reach/followers (CLI chặn SCALE, nhưng chặn từ lúc viết).
- [ ] Cỡ mẫu tối thiểu ghi trong `--variables`; `--results` nêu n.
- [ ] Không có experiment quá `end_date` mà `decision` còn trống (`experiment list --open`).
- [ ] Hook 3/6 chỉ organic; có đếm bình luận tiêu cực.

## Khi lỗi / kẹt

- `cần --results trước khi quyết định`: ghi số thật vào `--results`; không có số → INCONCLUSIVE kèm lý do, không bịa.
- `không SCALE dựa trên chỉ số "views"`: mở lại thử nghiệm mới với metric clicks/waitlist, giữ X cũ ITERATE.
- Số về rơi vào UNKNOWN vì thiếu utm_content: ghi INCONCLUSIVE, sửa link, chạy lại — ghi LEARNINGS về lỗi quy trình.
- Thử nghiệm cần sửa `code/fe`/`growth/blog`: approval `code_change` trước, experiment ở trạng thái chờ (start_date tương lai).

## Agent liên quan

`growth-orchestrator` (mở/quyết) · `social-growth`, `seo-content`, `creative-studio` (biến thể) · `growth-analytics` (số theo biến thể) · `paid-acquisition` (thử nghiệm có chi).

## Công cụ dùng

CLI `os.mjs` (experiment add/list/show/update/decide, metric sum, memory log, task add/update) · Read memory · Write file research khi nhiều biến.
