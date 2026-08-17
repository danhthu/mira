# 08 — Ba xương sống & cơ chế mục tiêu

> Bản này thay thế phần "lớp xương" trong `01-modules.md`.
> Ba trụ: **Thời gian · Tài chính · Mục tiêu**. Mục tiêu là cầu nối, không phải trụ thứ ba độc lập.

---

## 0 · Câu chuyện một dòng

```
LÃNG PHÍ (giờ) + BỐC HƠI (tiền)   →  NGUYÊN LIỆU
                    ↓
              MỤC TIÊU chuyển hóa
                    ↓
GIỜ Ý NGHĨA + THÁNG TỰ DO          →  KẾT QUẢ
```

**Mira tìm chỗ rò rỉ, và chuyển nó thành thứ bạn muốn.**

Đây là toàn bộ sản phẩm. Mọi tính năng không phục vụ vòng này đều bị cắt.

---

# TRỤ 1 · THỜI GIAN

## Chỉ số Bắc Đẩu

```
Giờ tỉnh    = 168 − giờ ngủ
Giờ ý nghĩa = Σ thời gian nhóm MEANINGFUL
Chỉ số Mira = Giờ ý nghĩa / Giờ tỉnh        (%)
```

## Chỉ ba nhóm, không phải sáu

| Nhóm | Gồm | Cách lấy dữ liệu |
|---|---|---|
| **LÃNG PHÍ** (waste) | Lướt vô định · họp mình không nói câu nào · kẹt xe thừa · chờ đợi · làm lại vì sai · nhậu xã giao không muốn đi | Bán tự động (screen time, lịch, GPS) + xác nhận 1 chạm |
| **Ý NGHĨA** (meaningful) | Người thân · tận hưởng · học · sức khỏe · sáng tạo · nghỉ ngơi thật sự | Ghi tay 1 chạm |
| **CẦN THIẾT** (necessary) | Ngủ · ăn · việc nhà · công việc kiếm tiền · di chuyển tối thiểu | **KHÔNG GHI** — suy ra |

**Quyết định thiết kế quan trọng nhất của toàn app:**

```
Giờ cần thiết = Giờ tỉnh − Giờ lãng phí − Giờ ý nghĩa
```

Người dùng **không bao giờ phải nhập nhóm CẦN THIẾT**. Nó là phần dư. Đây là cách cắt 70% gánh nhập liệu so với mô hình 6 khoang cũ.

## Phát hiện lãng phí tự động

| Nguồn | Suy ra |
|---|---|
| Screen Time / Digital Wellbeing | Giờ lướt mạng xã hội, video ngắn |
| Google/Apple Calendar | Họp ≥5 người, lặp lại hằng tuần, không phải người tổ chức → nghi ngờ |
| GPS / Significant Locations | Thời gian di chuyển vượt mức trung bình tuyến đó |
| Thời gian app mở ban đêm | Giờ ngủ bị ăn mất |

Mỗi tối Mira đưa ra **tối đa 3 phỏng đoán**, người dùng chạm "đúng / không". Không hỏi lại cái đã trả lời.

## Mục tiêu của trụ Thời gian

Không đặt mục tiêu tuyệt đối ("mỗi tuần 20 giờ ý nghĩa"). Đặt **mục tiêu chuyển dịch**:

> Tuần này chuyển **1 giờ** từ LÃNG PHÍ sang Ý NGHĨA.

Lý do: mục tiêu tuyệt đối khiến người bận thấy mình thất bại ngay tuần đầu. Mục tiêu chuyển dịch luôn khả thi với mọi hoàn cảnh, kể cả người làm 60 giờ/tuần.

Hiển thị:
> Tuần này: **14,5 giờ ý nghĩa** (+1,5) · **9 giờ lãng phí** (−1,5)
> Bạn đã chuyển được 1,5 giờ.

---

# TRỤ 2 · TÀI CHÍNH

## Chỉ số Bắc Đẩu

```
Vốn tự do (tháng) = Tài sản ròng / Chi phí sống thật hằng tháng
```

Trả lời đúng một câu: **mai nghỉ việc thì sống được bao lâu.**

## Chỉ 5 ô nhập, mỗi tháng một lần, 2 phút

| # | Ô nhập | Ví dụ |
|---|---|---|
| 1 | Thu nhập ròng / tháng | 30.000.000 |
| 2 | Chi phí cố định / tháng (nhà, điện nước, ăn, học phí) | 14.000.000 |
| 3 | Trả nợ / tháng (gốc + lãi) | 5.000.000 |
| 4 | Tiết kiệm + đầu tư / tháng | 6.000.000 |
| 5 | Tài sản ròng hiện có (thanh khoản − nợ còn lại) | 180.000.000 |

## Mọi thứ còn lại đều suy ra

```
Chi phí sống thật  = ô2 + ô3                        = 19.000.000
Tỷ lệ tiết kiệm    = ô4 / ô1                        = 20%
Vốn tự do          = ô5 / (ô2 + ô3)                 = 9,5 tháng
Bốc hơi            = ô1 − ô2 − ô3 − ô4              = 5.000.000
Ngày tự do mua thêm= ô4 / (ô2+ô3) × 30              = 9,5 ngày/tháng
```

## "Bốc hơi" — phát hiện quan trọng nhất

Người dùng **không cần ghi từng khoản chi**. Phần tiền không giải thích được chính là con số cần biết:

> Tháng này **5 triệu bốc hơi**. Bạn không nhớ nó đi đâu.
> 5 triệu = **43 giờ đời bạn** = **7,9 ngày tự do**.

Đây là chỗ giải bài toán "thuế nhập liệu" của mọi app tài chính. Ghi chi tiêu chi tiết là tùy chọn, dành cho ai muốn truy con số bốc hơi. Mặc định: không ghi gì.

## Bốn nấc giàu

| Nấc | Vốn tự do | Ý nghĩa |
|---|---|---|
| **Sống sót** | < 3 tháng | Mất việc là khủng hoảng |
| **An toàn** | 3 – 12 tháng | Đủ để tìm việc mới không hoảng |
| **Linh hoạt** | 1 – 5 năm | Đủ để đổi nghề, nghỉ dài, khởi nghiệp |
| **Tự do** | > 25 năm chi phí | Không cần đi làm nữa |

Người dùng luôn thấy mình đang ở nấc nào và **còn bao xa tới nấc kế tiếp** — không bao giờ thấy con số trần trụi.

> Bạn đang ở **An toàn** (9,5 tháng).
> Còn **7 tháng tiết kiệm** nữa để bước sang Linh hoạt.

## Nợ, vay, đầu tư — xử lý tối giản

- **Nợ**: chỉ cần biết trả bao nhiêu/tháng và còn nợ bao nhiêu. Không quản lý từng khoản vay, không lịch trả nợ. Nợ ăn thẳng vào tài sản ròng và vào chi phí sống thật — hai chỗ đó đủ để người dùng thấy đau.
- **Đầu tư**: chỉ là một dòng trong tài sản ròng. Mira **không** theo dõi danh mục, không hiện lãi/lỗ, không gợi ý mua gì. Đây là ranh giới cứng — Mira không phải app đầu tư và không đưa lời khuyên tài chính.
- **Lãng phí tiền**: chính là ô "bốc hơi". Không cần phân loại.

---

# TRỤ 3 · MỤC TIÊU (cầu nối)

Mục tiêu không phải danh sách việc cần làm. Mục tiêu là **cơ chế chuyển nguyên liệu thành kết quả**.

## Ba tầng

| Tầng | Nhịp | Tối đa | Ví dụ |
|---|---|---|---|
| **Dài hạn** | 1–5 năm | 3 | Lên nấc Linh hoạt · Trở thành người cha có mặt |
| **Quý** | 90 ngày | 2 | Quý này giảm giờ lướt xuống 5h/tuần |
| **Nhịp** | Tuần | 3–5 | Tối thứ 3 và thứ 5 không mở điện thoại sau 20h |

## Luật vàng: mọi mục tiêu phải khai nguồn

Mira **không cho đặt mục tiêu trên trời**. Khi tạo mục tiêu, bắt buộc trả lời hai câu:

**"Giờ này lấy từ đâu?"** → phải chọn từ danh sách LÃNG PHÍ đã ghi nhận thật.
**"Tiền này lấy từ đâu?"** → phải chọn từ con số BỐC HƠI hoặc từ khoản chi cố định cụ thể.

Nếu không có nguyên liệu, Mira nói thẳng:

> Mục tiêu này cần 6 giờ/tuần. Bạn chỉ đang lãng phí 4 giờ/tuần.
> 2 giờ còn lại sẽ phải lấy từ giấc ngủ hoặc từ Giờ ý nghĩa. Bạn muốn lấy từ đâu?

Đây là chỗ ba trụ khóa vào nhau và cũng là tính năng khác biệt nhất của Mira.

## Cảnh báo xung đột

```
Σ tất cả mục tiêu (giờ/tuần) ≤ tổng giờ LÃNG PHÍ hiện có
Σ tất cả mục tiêu (tiền/tháng) ≤ BỐC HƠI + phần cắt được từ chi cố định
```

Vượt ngưỡng → chặn, và hiện mục tiêu nào phải bỏ.

## Buông bỏ

- Mọi mục tiêu tự hết hạn sau **90 ngày**. Muốn tiếp phải chủ động gia hạn.
- Mỗi quý **bắt buộc buông ít nhất 1 mục tiêu**, kèm ghi lý do.
- Mira ăn mừng việc buông, gọi là "buông đúng chỗ". Không có màu đỏ, không có chữ "thất bại".

## Tiến độ đo bằng gì

Không phần trăm. Đo bằng **delta của hai chỉ số Bắc Đẩu**:

> Mục tiêu: "Lên nấc Linh hoạt"
> 90 ngày qua: vốn tự do 8,1 → 9,5 tháng (**+1,4**)
> Ở nhịp này, bạn tới nấc Linh hoạt sau **7 tháng**.

> Mục tiêu: "Có mặt với con"
> 90 ngày qua: giờ với con 4,2 → 6,8 h/tuần (**+2,6**)
> Nguyên liệu lấy từ: giờ lướt tối (−2,1h), họp thứ 6 đã hủy (−0,5h)

Dòng cuối là thứ tạo cảm giác nhân quả — người dùng thấy rõ mình đã đổi cái gì lấy cái gì.

---

# Bảng điều khiển: bốn con số duy nhất

Màn hình chính chỉ hiện bốn con số, không biểu đồ:

```
┌──────────────────────────────────────┐
│  Giờ ý nghĩa tuần này    14,5 h  +1,5│
│  Giờ lãng phí tuần này    9,0 h  −1,5│
├──────────────────────────────────────┤
│  Bạn giàu                9,5 tháng   │
│  Tháng này bốc hơi        5,0 tr     │
│                        = 43 giờ đời  │
└──────────────────────────────────────┘
```

Bốn con số này là **toàn bộ giá trị của Mira**. Nếu người dùng chỉ nhìn màn hình này rồi tắt app, sản phẩm vẫn hoạt động đúng.

---

# Ba vòng lặp thời gian

| Vòng | Tần suất | Thời lượng | Người dùng làm gì |
|---|---|---|---|
| **Ngày** | Mỗi tối | ≤ 20 giây | 1 chạm ghi giờ ý nghĩa · xác nhận ≤3 phỏng đoán lãng phí |
| **Tháng** | Mỗi tháng | ≤ 2 phút | Cập nhật 5 ô tài chính |
| **Quý** | 90 ngày | ≤ 10 phút | Xem lại mục tiêu · buông 1 · đặt mục tiêu mới có khai nguồn |

Tổng ngân sách nhập liệu: **≈ 10 phút/tháng**. Đây là ràng buộc cứng, ghi vào `CLAUDE.md`.

---

# Mục tiêu sản phẩm (KPI nội bộ)

Không phải mục tiêu của người dùng — mục tiêu của Mira với tư cách sản phẩm.

| Chỉ số | Ngưỡng tốt | Vì sao |
|---|---|---|
| % người dùng biết "mình giàu mấy tháng" sau 7 ngày | > 60% | Đây là khoảnh khắc "aha", phải đến sớm |
| % người dùng chuyển được ≥1 giờ waste → meaningful trong 30 ngày | > 40% | Bằng chứng app có tác dụng thật |
| Thời gian nhập liệu trung bình / tháng | < 12 phút | Ràng buộc gốc |
| % mục tiêu được đặt kèm khai nguồn hợp lệ | > 90% | Nếu thấp, luật vàng đang bị né |
| % mục tiêu được buông đúng hạn thay vì bỏ lửng | > 50% | Đo xem cơ chế buông có hoạt động |
| Retention tuần 6 | > 25% | Vực thẳm thật sự của app dạng này |

---

# Những gì bị cắt so với bản trước

| Cắt | Lý do |
|---|---|
| 6 khoang thời gian → còn 3 nhóm | Nhóm CẦN THIẾT suy ra được, không cần nhập |
| Ngân sách 168 giờ phân bổ trước | Quá nặng, ít người duy trì quá 2 tuần |
| Phân loại chi tiêu theo danh mục | Thay bằng con số "bốc hơi" — mạnh hơn, không tốn công |
| Theo dõi danh mục đầu tư | Ngoài phạm vi, và kéo theo rủi ro pháp lý |
| Quản lý từng khoản vay | Chỉ cần tổng trả/tháng và tổng còn nợ |
| Tiến độ mục tiêu bằng phần trăm | Thay bằng delta của 2 chỉ số Bắc Đẩu |

Đồng hồ cát, Khoảnh khắc, Kết nối vẫn giữ nguyên như `01-modules.md` — chúng nằm ở lớp cảm xúc, không thuộc ba xương sống này.
