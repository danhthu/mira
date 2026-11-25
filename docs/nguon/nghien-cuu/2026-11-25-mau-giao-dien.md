# Mẫu giao diện trên Dribbble: cái nào hợp Mira, cái nào không

> Lane `giao-dien`. Mã N-218 → N-224. Ngày 25/11/2026.
> Tám shot đã mở và xem tận nơi, không xét theo tiêu đề.

## Tiêu chí lọc, chốt trước khi xem

Không có tiêu chí thì cái nào cũng đẹp. Bốn câu hỏi, rớt một là loại:

1. **Có streak không?** Mira đã hứa *không đếm chuỗi ngày để làm bạn sợ đứt*. Mẫu nào lấy
   streak làm trục chính thì không dùng được, dù vẽ đẹp đến đâu.
2. **Có trợ lý AI không?** Mô phỏng 300 persona nói chỗ thắt là **giữ chân**, không phải
   chất lượng lời khuyên. Thêm một con bot nữa là thêm ma sát để giải một bài không tồn tại.
3. **Có cần ảnh không?** Mira không có ảnh và sẽ không có. Mẫu nào đẹp nhờ ảnh thì bỏ ảnh
   đi là sập.
4. **Mật độ số có vừa không?** Giảm ma sát là đòn bẩy +39%. Dashboard dày đặc đi ngược.

---

## N-218 ⚑ Verde Money Wrapped — mẫu đáng lấy nhất, và lấy cho đúng chỗ đang thiếu

**Nguồn:** Zakariya Buhari, `dribbble.com/shots/27849470`. Tin: vừa (concept, chưa có app thật).

Year-in-review cho một app tiết kiệm. Bốn màn full-bleed, mỗi màn **đúng một sự thật**:

- `YOUR 2026 WRAPPED — Your money year, in 5 stories — Tap to start`
- `This year you saved €4,820. That's 3× more than 2025.`
- `96 bills on time · €0 late fees · −18% on takeout`
- `August was your best month — €610 saved`, kèm biểu đồ cột tô sáng đúng một cột

**Tại sao đáng:** đây chính là hình dạng màn **"Sáu tháng của bạn"** còn đang nợ. Logic dò
sự kiện đã nằm ở `code/tools/cau-chuyen.mjs`; cái thiếu là khuôn trình bày, và khuôn đó ở
đây. Nó cũng khớp với phát hiện cũ: dữ liệu Mira dựng được chuyện đọc hiểu được (38% nhớ
đúng sự kiện, độ chính xác 93%).

**Hai chỗ phải đổi khi bê về:**

- Verde chỉ kể tin vui. Dữ liệu Mira **lệch sang tin xấu** (68% so với 12% tin tốt). Bê
  nguyên giọng ăn mừng vào là nói dối. Hũ kẹo-muối là đối trọng duy nhất, nên màn kể chuyện
  phải trộn cả hai, không phải một bản "wrapped" toàn pháo hoa.
- Gạch ngang dài trong tiêu đề là chuyện tiếng Anh. Tiếng Việt bỏ.

## N-219 Focus Tracker — khuôn cho màn chi tiết nhóm việc

**Nguồn:** Sk Abu Hasan, `dribbble.com/shots/27549798`. Tin: vừa.

App phân tích giờ màn hình. Ba thứ ăn khớp gần như 1:1 với màn `/thoi-gian/:nhom` vừa dựng:

| Mẫu | Mira |
|---|---|
| Danh sách app, mỗi dòng một thanh + mũi tên `›` | Danh sách mục, đã có; thanh thì chưa |
| `4h 56m ▼18,2% so với hôm qua` | Số lớn kèm chiều so sánh, Mira mới có số |
| Thẻ tuần `32h 40m · 5–11/5` | Thẻ tổng tuần |

**Bỏ:** phần "Daily Limit", "App Limit Alert", "Usage Reminder". Ba thứ đó là nhắc nhở và
trừng phạt — đúng cái Mira đã hứa không làm. Lấy cách bày số, không lấy cách quản người.

## N-220 Thalassa — đã dùng, giữ cho một việc

**Nguồn:** Sogaso/Orizon, `dribbble.com/shots/27096951`. Tin: vừa.

Mẫu Founder gửi. Đã lấy ba thứ: số lớn kèm mẫu số, lưới thẻ nhỏ có nhãn, và `View Details`
dưới mỗi chỉ số. Thanh chat AI, ảnh hero và mật độ chỉ số thì bỏ.

Giữ nó làm mẫu cho **lưới thẻ**, không phải cho cả hệ thống: nó là dashboard vận hành.

## N-221 Reflect (Paperpillar) — lấy đúng một hàng chip

**Nguồn:** Paperpillar, `dribbble.com/shots/27324167`. Tin: vừa.

Hàng `Recent moods` với bốn chip có icon và nhãn (Calm / Grateful / Pensive / Balanced) là
cách bày trạng thái gọn và đọc được ngay. Áp được cho hàng trả lời hạt muối
(Vẫn vậy / Nhẹ hơn / Qua rồi).

**Bỏ phần còn lại:** ảnh phong cảnh toàn màn, chữ serif, câu danh ngôn. Mira không có ảnh,
và câu danh ngôn là thứ Mira cố tình không nói.

## N-222 One Day — một mẫu đáng lấy, một mẫu phải tránh

**Nguồn:** Asib Iquebal, `dribbble.com/shots/27361254`. Tin: vừa.

**Lấy:** hàng `Quick capture` (New entry / Voice note / Photo / Mood) — bốn chip to, chạm
một cái là vào thẳng. Cùng họ với gợi ý một chạm vừa dựng. Và thẻ `Recent memories` ở cuối
trang chủ: đúng cái "hạt cũ nổi lên" đã làm, xác nhận hướng không lạc.

**Tránh:** `Writing streak` với bảy chấm thứ Hai đến Chủ nhật nằm ngay đầu màn. Mira đã
chốt không có streak. Đây là ví dụ rõ nhất cho chuyện mẫu đẹp mà chở theo một quyết định
sản phẩm ngược hẳn với mình.

## N-223 Ba mẫu đã loại, ghi lại để khỏi mở lại

| Shot | Vì sao loại |
|---|---|
| Artifact — Memories Told Through Objects (`27682571`) | Nền tối, sống bằng ảnh sản phẩm, có lớp mạng xã hội. Mira không có ảnh nào |
| Lume — Journaling App (`25812750`) | Gradient pastel + AI Journal Prompts + bảng giá $49,99/tháng. Hướng wellness-SaaS |
| SimpleTime (`25151296`) | Chấm công nhân sự: duyệt nghỉ phép, ca kíp, nhóm. Nhầm nghĩa chữ "time" |

## N-224 ⚑ Kết luận: Mira cần hai mẫu, không phải một

Đi tìm "một template cho Mira" là đi tìm thứ không có. Mira có hai loại màn và chúng cần
hai ngôn ngữ khác nhau:

**Màn hằng ngày** (Nhà, Thời gian, Tài chính, Mục tiêu, và các màn chi tiết) — nền sáng, thẻ
trắng, số lớn kèm mẫu số, danh sách có mũi tên. Mẫu: **Thalassa cho lưới, Focus Tracker cho
chi tiết**. Mira đã đi đúng hướng này rồi, chỉ cần thêm thanh tỉ lệ vào từng dòng danh sách.

**Màn kể chuyện** (Sáu tháng của bạn) — full-bleed, một sự thật một màn, chữ to, vuốt ngang.
Mẫu: **Verde Money Wrapped**. Chưa dựng.

Hai ngôn ngữ nằm cạnh nhau không sao, miễn là **ranh giới rõ**: màn kể chuyện vào bằng một
cửa riêng và đi ra là về màn thường. Trộn chúng lại thì màn hằng ngày thành ồn ào, còn màn
kể chuyện mất sức nặng.

**Một rủi ro phải nói trước:** cả hai mẫu Verde và Focus Tracker đều là concept trên
Dribbble, không phải app có người dùng thật. Chúng cho biết cách bày, không cho biết cách
đó có giữ chân được ai không.
