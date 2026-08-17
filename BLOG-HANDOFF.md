# Blog Mira — handoff context (đọc file này trước khi làm tiếp)

Ghi lại ngày 2026-08-17. Mục đích: cho phép mở một session Claude Code mới, không có
lịch sử hội thoại, vẫn tiếp tục đúng mạch việc đang làm.

## Việc đã làm

Draft xong **28 bài blog** (Giai đoạn 1 / 4 của lịch nội dung 120 ngày trong
`docs/07-blog-120-days.md`) — toàn bộ Tuần 1-4, chủ đề lần lượt:

| Tuần | Ngày | Chủ đề | Công cụ đi kèm |
|---|---|---|---|
| 1 | 1-7 | Tỷ giá đời (thu nhập thật theo giờ) | `life-rate-calculator` |
| 2 | 8-14 | Định nghĩa lại "giàu" (vốn tự do) | `freedom-months-calculator` |
| 3 | 15-21 | Quy đổi tiền ↔ giờ | `expense-hours-calculator` |
| 4 | 22-28 | Thời gian với con | `child-hourglass-calculator` |

File nằm ở `content/blog/vi/01-*.md` đến `28-*.md`. Hàng đợi publish ở
`content/blog/content-queue.json` (28 dòng, `status: "pending"` hết — chưa bài nào live).

## Vì sao các file trông như vậy

- **Frontmatter `draft: true`** — theo đúng cơ chế "draft-based publish queue" mô tả trong
  playbook (`docs/blog-system-playbook.html` — file gốc là snapshot Claude Artifact, đã lưu lại
  nguyên văn ở đây vì Desktop chỉ có bản HTML vỏ không đọc được offline). Publish một bài =
  đổi `draft: false`, cập nhật `date`, đổi `status` tương ứng trong `content-queue.json`.
- **Số liệu ví dụ trong bài luôn tính đúng công thức thật** trong `docs/03-formulas.md` — không
  phải số tròn bịa cho khớp tiêu đề. Ví dụ xuyên suốt: một người lương 30 triệu, 60 giờ làm
  thật/tuần → tỷ giá đời ≈115.000đ/giờ — con số này lặp lại nhất quán ở nhiều bài (điện thoại
  25 triệu = 217 giờ, đúng khớp).
- **Giọng theo `docs/00-vision.md`**: như bạn điềm đạm, không phán xét, không "nên/phải/hãy"
  trong phần kêu gọi hành động, sentence case, không phóng đại.
- **Cụm "thời gian với con" (tuần 4) và "bố mẹ" (tuần 5, chưa viết)** là cụm rủi ro cao theo
  chính playbook — đã cố tình thêm cảnh báo trước công cụ (bài 23), và một bài phản biện
  (24) + một câu chuyện đối trọng (26) để không một chiều.

## Anti-AI — quy tắc đã áp dụng khi viết, cần giữ nguyên cho các tuần sau

1. Không dùng: "trong thế giới hiện đại", "không thể phủ nhận", "hãy cùng", "tóm lại",
   "kết luận", chuỗi gạch đầu dòng 3 vế đều tăm tắp lặp lại nhiều lần trong cùng bài.
2. Câu dài ngắn xen kẽ. Mỗi bài có ít nhất một chỗ "tự sửa lời" giữa câu (ví dụ: "Nghe cũng ổn.
   Nhưng...") — nhịp nói thật, không phải nhịp liệt kê hoàn hảo của văn bản máy.
3. Không lạm dụng gạch ngang em-dash liên tiếp.
4. Số liệu luôn bắt nguồn từ công thức thật, không phải số đẹp chọn để khớp tiêu đề.
5. **Vẫn cần con người đọc lại bằng giọng thật trước khi publish** — các quy tắc trên giảm rủi
   ro bị nhận diện là AI, không loại bỏ hoàn toàn. Đừng bỏ qua bước này.

## Chưa làm — cần làm tiếp nếu muốn hết 120 ngày

- **Tuần 5-9** (Giai đoạn 2, ngày 29-63): bố mẹ, chi phí ẩn công việc, ngân sách 168 giờ, nói
  không, đường tới tự do. Toàn bộ tiêu đề đã có sẵn trong `docs/07-blog-120-days.md`.
- **Tuần 10-13** (Giai đoạn 3, ngày 64-91): câu chuyện/phản biện, sống chậm, thu gom hạnh phúc,
  mục tiêu & buông bỏ.
- **Tuần 14-17** (Giai đoạn 4, ngày 92-120): quan hệ, so sánh & công cụ, ra mắt beta, tổng kết.
- **Cảnh báo đặc biệt cho tuần 5**: bài ngày 29 và 70 trong lịch được đặt sẵn để xử lý phản ứng
  tiêu cực về cụm bố mẹ — đừng bỏ hai bài đó khi viết tới.

## Hình ảnh — vẫn CHƯA làm, cần bạn

Mỗi bài có field `image_prompt` trong frontmatter. Session trước không có quyền vào Gemini
Chrome extension đã đăng nhập của bạn nên không tự sinh ảnh được. Hai lựa chọn:

1. Tự dán từng `image_prompt` vào Gemini, tải ảnh, đặt đúng path ghi trong `image:` field.
2. Cấp quyền cho công cụ "Claude in Chrome" ở session mới để Claude thao tác trực tiếp trên
   Chrome thật của bạn (dùng element ref, không dùng toạ độ pixel cố định — đúng khuyến nghị
   playbook mục 7).

## Dữ liệu còn thiếu — cần xác nhận trước khi publish thật (chưa đổi từ lần trước)

1. **Tên miền thật** của blog/app — chưa thấy trong spec, playbook chỉ có domain ví dụ
   `trady360.com`. Cần để điền canonical URL, sitemap, JSON-LD, robots.txt.
2. **ESP gửi newsletter** (Mailchimp/ConvertKit/tự build) — các bài Thư Chủ nhật đang để
   placeholder `[link]`.
3. **`CONTENT-STYLE.md`** — chưa tồn tại trong repo. Playbook mục 6 yêu cầu file này để quy định
   ngân sách highlight màu (3-6 span/bài, 2-6 từ/span). Bài 01 có để một comment
   `<!-- highlight-spans -->` mẫu, chưa có file quy tắc chính thức.
4. **GA4 measurement ID** hiện có của app chính, để tái sử dụng.
5. **Widget thật** cho 4 công cụ tính đã dùng trong Tuần 1-4 — hiện chỉ là mô tả placeholder
   trong bài, cần build bằng đúng công thức `docs/03-formulas.md`.

## Cấu trúc thư mục hiện tại

```
F:\Danh Thu\github\mira\
  BLOG-HANDOFF.md          ← file này
  CLAUDE.md                 ← chỉ dẫn code cho app Mira (không phải blog)
  docs\                      ← toàn bộ spec app (00-vision đến 08-three-pillars)
    blog-system-playbook.html ← nguyên tắc hệ thống blog (domain, SEO, draft-queue, ảnh, cron...)
  content\blog\
    content-queue.json       ← hàng đợi publish, 28 dòng
    vi\01-*.md ... 28-*.md    ← 28 bài draft
```

## Nếu mở session mới, nên bắt đầu bằng

Đọc file này, rồi `docs/07-blog-120-days.md` để biết tiêu đề tuần tiếp theo, rồi
`docs/00-vision.md` + phần "Anti-AI" ở trên trước khi viết bài mới — giữ đúng giọng và
công thức đã dùng ở 28 bài trước để cả blog đọc như một mạch nhất quán.
