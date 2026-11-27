# Lịch đăng social S1 — 14 ngày (T-0014)

Trạng thái: 14 post ở REVIEW, chưa post nào APPROVED, chưa đăng gì. D1 là ngày Founder có tài khoản Threads và Page Mira và đăng bài đầu tiên (ngày tuyệt đối chưa biết). Chưa có tài khoản, vì vậy đây là gói đăng tay. Mỗi ngày 1 Threads (K-id trong DB) và 1 biến thể Facebook Page nằm trong cùng file, khác chữ với bản Threads. Giờ đăng là giả định [A] (Threads 07:30 hoặc 21:00, Facebook 12:00 hoặc 20:00), chưa có số LEARNINGS.

## Lịch

| Ngày | Giờ Threads | Giờ FB | K-id (Threads) | Góc | Hook | Nguồn | Ảnh | Trạng thái | URL sau đăng |
|---|---|---|---|---|---|---|---|---|---|
| D1 | 07:30 | 12:00 | K-0030 | C | 1 | bài 02 | share-card-life-rate (K-0001) | REVIEW | |
| D2 | 21:00 | 12:00 | K-0031 | A | 4 | bài 08 | share-card-freedom-months (K-0002) | REVIEW | |
| D3 | 07:30 | 20:00 | K-0032 | B | mới | bài 04 | text-only | REVIEW | |
| D4 | 21:00 | 12:00 | K-0033 | C | 1 (biến thể) | bài 03 | text-only | REVIEW | |
| D5 | 07:30 | 20:00 | K-0034 | A | 4 (biến thể) | bài 09 | text-only | REVIEW | |
| D6 | 21:00 | 12:00 | K-0035 | B | **6** | share-card-child-hours (K-0003) | share-card-child-hours | REVIEW | |
| D7 | 07:30 | 12:00 | K-0036 | C | 1 (biến thể) | bài 06 | text-only | REVIEW | |
| D8 | 21:00 | 12:00 | K-0037 | A | 4 (biến thể) | bài 11 | text-only | REVIEW | |
| D9 | 07:30 | 20:00 | K-0038 | B | mới | bài 05 | text-only | REVIEW | |
| D10 | 21:00 | 12:00 | K-0039 | C | 1 (biến thể) | bài 07 | text-only | REVIEW | |
| D11 | 07:30 | 20:00 | K-0040 | A | 4 (biến thể) | bài 12 | text-only | REVIEW | |
| D12 | 21:00 | 12:00 | K-0041 | B | mới | bài 01 | text-only | REVIEW | |
| D13 | 07:30 | 12:00 | K-0042 | C | 2 | share-card-freedom-months (dòng 217 giờ) | chưa có → creative-studio | REVIEW | |
| D14 | 21:00 | 12:00 | K-0043 | A | 4 (biến thể) | bài 14 | text-only | REVIEW | |

File post: `growth/os/content/social/<K-id>-<slug>.md`. Số góc: C 5 (D1, 4, 7, 10, 13), A 5 (D2, 5, 8, 11, 14), B 4 (D3, 6, 9, 12). Thứ tự xoay C, A, B lặp lại.

## Luật đã kiểm

- Hook 3 và 6 (bố mẹ, con): chỉ D6 (hook 6), tức 1 lần trong 14 ngày, 0 lần ở D8 đến D14. Hook 3 không dùng vì con số "68 lần gặp" chưa có phép tính nguồn. D6 có hành động mở ("tuần này bạn muốn có thêm một giờ nào"), câu phản biện nhẹ ("bỏ qua cũng được") và giả định 6 giờ/tuần ghi rõ. Không post nào áp tỷ giá đời lên giờ với con hoặc bố mẹ (hook 5 không dùng).
- Theo dõi D6: đọc bình luận trong 24h, đếm bình luận nặng nề, áp lực, tội lỗi trên tổng. Trên 10-15% thì ghi LEARNINGS ngay, đề xuất CGO STOP hook 6, ghi `growth/os/research/hook-feedback-<ngày>.md`. Hook 6 chỉ organic.
- Bộ số khớp bài nguồn đã sửa (T-0008): 30 triệu, 48 giờ hợp đồng, 60 giờ thật, 144 và 115 nghìn, 9 + 1 + 2 giờ, 9,5 tháng (180/19), 4,5 tỷ (15 triệu x 12 x 25), 3,3 ngày/40 ngày/6,7 tháng (bài 12), 4 ngày (2/15 x 30), 83/43/58/96/62 nghìn (bài 06, có ghi minh hoạ), 217 giờ (25 triệu / 115.000đ), 2.500 giờ (6 x 52 x 8). Mọi ví dụ 30 triệu và 20 triệu đều kèm câu "ví dụ, cao hơn bình quân khoảng 9 triệu" ở Facebook hoặc bình luận.
- Không post nào nói app có tính năng gì, không nói "dữ liệu nằm trên máy", không "tải app". CTA là đọc bài blog (link ở bình luận đầu khi bài live) hoặc một câu hỏi mở. Máy tính ghi rõ "đang dựng, chưa dùng được".
- Link UTM để trống: blog 0 bài published. Khi bài live, mỗi file có sẵn lệnh `link` (THREADS và FACEBOOK_ORGANIC, `--content=goc-A|B|C`), rồi `content update <K-id> --utm`.
- Threads và Facebook không trùng chữ cùng ngày; không đăng vào nhóm nào (community do community-partnerships).

## Cần Founder quyết trước khi đăng

1. Ngôi "tôi" trong D3 (cầu Sài Gòn 42 phút), D8 (cắt giảm nhân sự, căn hộ 3 tỷ), D10 và D14 (từ thư Chủ nhật), D12 (mở bài 01): trải nghiệm thật của người đăng, hay chuyển sang giọng gộp. Cùng cảnh báo trong blog-review-S1-week1-2.md.
2. Góc B mỏng nguồn: chỉ D6 là B thật (thẻ 2.500 giờ). D3, D9, D12 là B nhẹ ("giờ còn lại cho đời sống"), vì bài 01-14 hầu như không viết về con và bố mẹ. Đề xuất seo-content viết 1-2 bài nguồn B (giờ với bố mẹ, không áp tỷ giá) trước khi đọc kết quả X-1 theo góc.
3. D13 cần ảnh (đề xuất creative-studio làm share card "217 giờ"); các post khác text-only, ảnh minh hoạ blog trong `growth/blog/public/blog/images/` chưa được duyệt cho social, do đó không đưa vào mặc định.
4. Khi đăng: ghi URL, `content update <K-id> --status PUBLISHED --url <URL>`; số views Founder báo tay thì growth-analytics ghi quality=estimated.
5. Bài blog chưa publish: D1 trở đi mọi link ở bình luận chỉ gắn khi bài live; nếu D1 đến trước, đăng không link (post vẫn đứng được một mình).

## Thử nghiệm

X-1 (xem `experiment list`): góc C có tỷ lệ click link trên lượt xem cao hơn A và B trên Threads. Lưu ý mẫu nhỏ: 5 post C, 5 post A, 4 post B trong 14 ngày, và click chỉ đo được khi link UTM có (cần blog live); trước đó chỉ so lượt xem và bình luận (estimated).
