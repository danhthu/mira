# 01 — Kiến trúc module

## Ba lớp

```
LỚP DA        Sống chậm · Nhịp mùa · Ngày trắng · Giới nghiêm
              (không phải màn hình — là cách app cư xử)
                          ▲
LỚP CẢM XÚC   Khoảnh khắc · Kết nối · Không gian chung · Tâm trí · Di sản · Học hỏi · Đồ đạc
              (lý do người dùng ở lại)
                          ▲
LỚP XƯƠNG     Thời gian · Tài chính · Mục tiêu · Thân thể
              (lý do người dùng cài đặt)
                          ▲
LÕI           Sổ cái vốn sống — 4 loại vốn, mọi giao dịch
```

---

## LỚP XƯƠNG

### M1 · Thời gian

| Tính năng | Ghi chú |
|---|---|
| Giờ vàng | Đo giờ với con / bố mẹ / bạn đời / bạn thân / riêng tôi. **Chỉ đo cái đáng đo** — không đo giờ ngủ, giờ lướt điện thoại |
| Giờ thật của công việc | làm + đi lại + chuẩn bị + hồi sức |
| Ngân sách 168 giờ | 6 khoang: Việc · Sức khỏe · Người thân · Học · Nghỉ · Riêng tôi. Phân bổ trước, không ghi nhận sau |
| Vay & nợ giờ | "Việc đã vay 11h từ Nghỉ ngơi tuần này" |
| Đồng bộ lịch | Google/Apple Calendar, tự phân loại vào khoang |
| Chi phí ẩn | Tự cộng giờ phụ trợ quanh mỗi sự kiện lịch |
| Đồng hồ cát | Số lần/giờ còn lại với từng người theo nhịp hiện tại. **Mặc định tắt** |

### M2 · Tài chính

| Tính năng | Ghi chú |
|---|---|
| Tỷ giá đời | đ/giờ thật, không phải giờ hợp đồng |
| Vốn tự do | Số tháng sống được nếu nghỉ việc ngày mai |
| Quy đổi chi tiêu | Mỗi khoản chi → số giờ đời + số ngày tự do bị đẩy lùi |
| Ngân sách 6 khoang giá trị | Cùng 6 khoang với module Thời gian, không theo danh mục kế toán |
| Đọc SMS ngân hàng | Xác nhận 1 chạm. Không dùng API ngân hàng |
| Ví chung | Cặp đôi/gia đình, minh bạch |
| Chi tiêu vô nghĩa | Khoản chi không để lại khoảnh khắc nào (giao với M5) |
| Mô phỏng đường tự do | "Giảm 1 ngày làm/tuần cần bao lâu tiết kiệm" |

### M3 · Mục tiêu

Nguyên tắc gốc: mục tiêu dạng **"trở thành"**, không phải "đạt được". Cái đích không bao giờ xong, nên không bao giờ trượt.

| Tầng | Nhịp | Số lượng tối đa | Ví dụ |
|---|---|---|---|
| Bản ngã | 3–5 năm | 3 | Người có cơ thể khỏe |
| Mùa | 3 tháng | 2 | Mùa này tập trung vào giấc ngủ |
| Nhịp | Tuần | không giới hạn | Đi bộ 3 buổi · Gọi bố 1 lần |

Tính năng: **giá của mục tiêu** (tự tính giờ/tuần + tiền/tháng) · **cảnh báo xung đột** (hai mục tiêu tranh cùng quỹ giờ) · **hạn 90 ngày** tự hết nếu không gia hạn · **buông một mục tiêu mỗi mùa** (bắt buộc, và được ăn mừng) · **mục tiêu ngược** (ít họp hơn, ít mua hơn) · **bằng chứng thay vì phần trăm**.

### M4 · Thân thể

Chỉ 3 thứ: ngủ · vận động · năng lượng. Đồng bộ HealthKit/Google Fit, không nhập tay. Không đếm calo.
Tính năng riêng: **bảo vệ giấc ngủ** — cảnh báo khi lịch mai bắt dậy sớm mà tối nay còn việc.

---

## LỚP CẢM XÚC

### M5 · Khoảnh khắc
Ghi dưới 15 giây (chữ / ảnh / giọng) · không chấm điểm · không streak · **Thước phim** cuối tháng và cuối năm · xuất sách ảnh in.

### M6 · Kết nối con người
Vòng tròn Dunbar 5/15/50 · nhiệt kế quan hệ · nhật ký gặp gỡ 1 dòng · gợi ý một cuộc hẹn mỗi tuần dựa trên lịch trống + ngân sách còn dư · nhắc ngày quan trọng.

### M7 · Không gian chung
Hai người (vợ chồng / mẹ con / bạn thân): chung ngân sách giờ, chung ví, chung hũ khoảnh khắc. Bạn đồng hành 1-1 cho một mục tiêu. Vòng tròn ≤6 người, mỗi tuần một câu hỏi chung. **Không feed, không like, không bình luận.**

### M8 · Tâm trí
Check-in cảm xúc 1 chạm · **"điều đang đè nặng"** → viết ra, Mira cất đi, 7 ngày sau hỏi lại · thở 3 phút, không gamify.

### M9 · Di sản
Thư gửi mình 1 năm sau · điếu văn tự viết (1 lần/năm) · hộp để lại cho con (ảnh, giọng, lời nhắn).

### M10 · Học hỏi
Sách đang đọc · kỹ năng đang học · ý tưởng chợt nghĩ · tổng kết cuối năm "tôi đã đổi ý về gì".

### M11 · Đồ đạc
Đếm số món sở hữu · mỗi tuần gợi ý buông 1 món · liên thông tài chính: giá mua ÷ số lần dùng.

---

## LỚP DA (xuyên suốt, không có màn hình riêng)

### M12 · Sống chậm
- **Ngày trắng** — mỗi tuần 1 ngày app im lặng hoàn toàn
- **Giới nghiêm** — sau 21h chỉ còn nút ghi khoảnh khắc
- **Ma sát cố ý** — thêm mục tiêu mới phải chờ sáng hôm sau
- **Nhịp mùa** — 24 tiết khí, luôn kèm một hành động ngoài trời
- **Đếm ngược đời người** — mặc định TẮT
- **Lá thư Chủ nhật** — output AI duy nhất của toàn hệ thống

---

## Giao điểm giữa các module

Đây là giá trị thật của Mira. Không app đơn lẻ nào làm được.

| Giao | Kết quả |
|---|---|
| Thời gian × Tiền | "Bạn kiếm thêm 8tr tháng này, trả bằng 26 giờ ngủ" |
| Tiền × Khoảnh khắc | "12tr chi cho đồ đạc, 900k cho chuyến Đà Lạt. 6/7 khoảnh khắc tháng này đến từ chuyến 900k đó" |
| Người × Khoảnh khắc | "85% khoảnh khắc vui của bạn có mặt Linh" |
| Thời gian × Người | "Bạn dành 51 giờ cho đồng nghiệp, 3 giờ cho bố mẹ" |
| Tiền × Mục tiêu | "Mục tiêu này ăn 6h/tuần và 3tr/tháng — đẩy lùi tự do 4 tháng" |
| Ngủ × Khoảnh khắc | "Những ngày ngủ dưới 6 tiếng, hũ hạnh phúc luôn trống" |

Bốn đến sáu câu trên **chính là sản phẩm**. Mọi thứ còn lại là hạ tầng để nói được chúng.
