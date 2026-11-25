# Checklist landing Mira — theo docs/06-marketing-test.md §3

Đánh dấu [x] khi đúng trên trang live. Tổng 12 mục.

## Hero
- [ ] 1. Tiêu đề là câu hỏi góc C: "Một giờ đời bạn giá bao nhiêu?" (hoặc biến thể đang thử nghiệm có X-id)
- [ ] 2. Đoạn dưới nêu đúng 3 ý: thu nhập thật theo giờ sau trừ kẹt xe/tăng ca/kiệt sức · mỗi khoản chi tốn bao nhiêu giờ · còn bao nhiêu giờ cho người quan trọng
- [ ] 3. Form email ngay dưới hero, 1 ô, nút nêu lợi ích ("Nhận bản dùng thử"), không dấu chấm than
- [ ] 4. Dòng "N người đang chờ" chỉ hiện khi N là số thật từ ESP; chưa có thì bỏ dòng

## Ba khối giữa
- [ ] 5. Tỷ giá đời — có ví dụ số (167.000đ → 115.000đ, 15 giờ/tuần không ai trả)
- [ ] 6. Vốn tự do — "sống được bao lâu nếu mai nghỉ việc", đếm theo tháng
- [ ] 7. Giờ vàng — ví dụ con 10 tuổi, ~2.500 giờ; không quy giờ ra tiền (ràng buộc docs/00)

## Khối cam kết (không được bỏ)
- [ ] 8. Đủ 4 ý: không streak · không thông báo trách móc · không bán dữ liệu · dữ liệu nằm trên máy
- [ ] 9. Câu "Mira không cần bạn mở app nhiều — Mira cần bạn sống nhiều" hoặc tương đương, không dấu chấm than

## CTA cuối và đo
- [ ] 10. Form email lặp lại cuối trang; nếu có PWA thì nút cài PWA đứng cạnh, không thay thế form
- [ ] 11. Link ra store/PWA/công cụ đều có UTM từ `os.mjs link`, có dòng trong `growth/os/attribution/links.csv`
- [ ] 12. GA4 bắn `cta_click` (cta_id), `waitlist_submit`, `tool_use`, `appinstalled` — hoặc ghi rõ "chưa có GA4, chưa đo"

## Giọng (rà cả trang)
- Không "nên/phải/hãy", không "!" , không đếm ngược, không màu đỏ cảnh báo, sentence case.
- Không hứa tính năng chưa có trong `growth/os/memory/GAME_PROFILE.md`.
