# 300 người nói gì — góp ý sản phẩm và thị trường

> Đọc kèm `thi-truong.md` (bảng số, sinh tự động) và `dan-so.csv` (số thô).
> File này viết tay, **không bị ghi đè** khi chạy lại `code/tools/population.mjs`.

## Phạm vi của kết luận

Mô phỏng này trả lời được **một câu**: với nhịp sống giả định, các phép tính của Mira có ra
con số đáng nhìn không. Nó **không** nói được ai sẽ thích dùng, ai chịu ghi mỗi ngày, ai
chịu trả tiền.

Hai con số nhạy nhất với giả định của người viết, phải nhớ khi đọc:

- **Giờ lãng phí** (9–27h/tuần tuỳ nghề) do tham số đặt tay. Nếu người Việt thật lãng phí
  ít hơn nhiều, điểm "rò rỉ" sụp và mọi kết luận đổi theo.
- **Hệ số ma sát ghi chép** theo nghề cũng đặt tay. Đây chính là thứ quyết định thứ hạng,
  nên nó cũng là thứ cần đi kiểm trước nhất.

Mọi điều dưới đây là **giả thiết có cấu trúc**, không phải kết quả nghiên cứu.

---

## Phát hiện lớn nhất: chi phí ghi gần như nuốt sạch giá trị

| | Trung bình toàn dân số |
|---|---|
| Giá trị Mira sinh ra | **61,9** |
| Chi phí ghi chép | **57,5** |
| Điểm còn lại | **30,3** |

Giá trị không phải vấn đề. Mira sinh ra con số đáng nhìn cho gần như mọi người — điểm "rò rỉ"
trung bình 90, và **không một ai trong 300 người có điểm rò rỉ dưới 20**. Luôn có cái để nói.

Vấn đề là **cái giá để nó nói được**.

Thử tính độ nhạy: nếu giảm chi phí ghi đi 30%, điểm trung bình đi từ 30,3 lên **39,8** —
tăng 31% mà không cần thêm một tính năng nào. Không có thay đổi nào khác trong mô hình này
cho đòn bẩy tương đương.

**Việc đáng làm nhất không phải thêm tính năng, mà là làm cho việc ghi gần như biến mất.**
Beyond Time (N-214) đã giải đúng bài này: app học nếp của bạn, gợi ý việc bạn hay làm giờ đó,
phần lớn chỉ cần bấm *"That's right"*. Đó là thứ đáng học nhất từ đối thủ gần nhất.

---

## Nghề quyết định, thu nhập và vùng gần như không

| Chia theo | Khoảng cách giữa cao nhất và thấp nhất |
|---|---|
| **Nghề** | 8 → 43 (**35 điểm**) |
| Giai đoạn sống | 23 → 39 (16 điểm) |
| Thu nhập | 27 → 33 (6 điểm) |
| **Vùng** | 30 → 31 (**1 điểm**) |

Đây là kết quả bất ngờ nhất và có ích nhất.

**Vùng gần như không ảnh hưởng.** HCM/Hà Nội 30, thành phố tỉnh 30, nông thôn 31. Không cần
chiến lược riêng cho tỉnh — tin tốt cho phân phối, và trái với giả định mặc định của hầu hết
app Việt.

**Thu nhập cũng gần như không.** Chênh 6 điểm giữa nhóm dưới 8tr và trên 25tr. Mira không
phải sản phẩm cho người giàu; vốn tự do 8,4 tháng của nhóm thu nhập thấp vẫn là con số đáng
nhìn như 10,8 tháng của nhóm cao.

**Cái quyết định là nghề** — và cụ thể hơn, là **bạn có ngồi một chỗ không**.

### Bốn nghề đầu bảng đều là một kiểu người

| Nghề | Điểm | Chi phí ghi |
|---|---|---|
| Lập trình / IT | 43 | 38 |
| Công chức | 43 | 39 |
| Hành chính văn phòng | 43 | 38 |
| Freelancer sáng tạo | 43 | 44 |

Giờ đều, ngồi trước màn hình, tự chủ thời gian, điện thoại trong tầm tay cả ngày. Chi phí
ghi 38–44, thấp nhất trong bảng.

### Bốn nghề đáy bảng cũng là một kiểu

| Nghề | Điểm | Chi phí ghi | Giờ vàng/tuần |
|---|---|---|---|
| Công nhân nhà máy | 18 | 82 | 7,4h |
| Chủ quán ăn nhỏ | 14 | 85 | 11,4h |
| Tài xế công nghệ | 12 | 91 | 8,3h |
| Y tá / điều dưỡng | 8 | 88 | 8,2h |

Ca kíp, chạy ngoài đường, tay bận. **Không phải vì họ không cần** — chủ quán ăn có 11,4 giờ
vàng mỗi tuần, cao nhất bảng; y tá có vốn tự do 8,9 tháng, ngang IT. Giá trị tiềm năng của
họ không thấp.

Vấn đề là **luật 60 giây không khả thi với họ**. Với nhóm này, marketing khác không cứu được
gì; phải là một cách ghi khác hẳn — một chạm cuối ca, hoặc không ghi gì cả mà suy từ nguồn
khác.

---

## Nghịch lý kế toán: người kỷ luật là người Mira ít giúp được nhất

Kế toán ngồi bàn, chi phí ghi chỉ 41 — ngang nhóm đầu bảng. Nhưng điểm chỉ **26**, xếp thứ
11/15.

Lý do: **giờ lãng phí 9,5h/tuần, thấp nhất trong 15 nghề.** Đời quá đều thì donut tuần nào
cũng giống tuần nào, và app không có gì mới để nói.

Điều này đúng với cả nghề y tá (10,2h) và chủ quán (9,0h) — ba nghề lãng phí ít nhất cũng
nằm trong nhóm điểm thấp.

**Mira cần sự lộn xộn để có ích.** Người đã tự sắp xếp được đời mình không phải khách hàng
của nó. Đây là một giới hạn thật của sản phẩm, không phải lỗi cần sửa — nhưng nên biết để
đừng nhắm nhầm vào nhóm "người kỷ luật muốn tối ưu thêm".

---

## Trụ quan hệ chỉ hợp một nửa dân số

**71 trên 300 người có điểm tín hiệu quan hệ dưới 20** — gần một phần tư. Hầu hết là độc thân
22–27 (điểm quan hệ trung bình **19**) và 28–34 (**23**).

Ngược lại, nhóm có con nhỏ đạt **98** và là giai đoạn sống đứng đầu bảng (39 điểm).

Hai đường đi, phải chọn:

- **Nhắm vào người có gia đình.** Giờ vàng là chỗ mạnh nhất, chênh 16 điểm so với độc thân
  trẻ. Nhưng đó cũng là nhóm bận nhất, ít thời gian ghi nhất.
- **Hoặc mở rộng định nghĩa giờ vàng** cho người độc thân — giờ với bạn bè, với chính mình.
  Rủi ro: nới ra thì nó mất đi cái sắc, và thành "giờ cá nhân" như mọi app khác.

Tôi nghiêng về cách một, và nói thẳng với nhóm độc thân trẻ rằng trụ đó chưa dành cho họ,
thay vì làm loãng nó.

---

## "Có gì mới" là lỗ hổng thiết kế lớn nhất chưa được xử lý

Trong bốn thành phần giá trị, đây là thành phần **thấp nhất: 39/100**.

| Thành phần | TB |
|---|---|
| Rò rỉ | 90 |
| Tín hiệu tiền | 55 |
| Tín hiệu quan hệ | 54 |
| **Có gì mới** | **39** |

N-208 nói thẳng: một trong hai lý do bỏ app tự theo dõi là **app báo đi báo lại cùng một thứ**.
Thẻ nhận xét xoay vòng mà tôi vẽ ở concept chưa đủ — nó xoay giữa vài câu, nhưng nếu đời người
ta đều thì nội dung vẫn lặp.

Ba hướng, chưa cái nào có trong bản chốt:

1. **So sánh theo mùa, không chỉ theo tuần.** Tháng này so cùng kỳ tháng trước, quý này so
   quý trước. Chu kỳ quyết toán của kế toán hay chạy số của sales chỉ hiện ra ở thang đó.
2. **Hạt cũ nổi lên.** Ý tưởng "hôm nay ba tháng trước" đã bàn mà chưa đưa vào bản chốt. Đây
   là nguồn nội dung mới duy nhất không phụ thuộc vào việc đời có thay đổi hay không — vì nó
   lấy từ chính chữ người dùng viết.
3. **Câu hỏi thay vì câu kể.** Thay "tuần này bạn dành 22h cho gia đình" bằng "đoán xem tuần
   này nhiều hơn hay ít hơn tuần trước?" rồi mới mở số. Rẻ để làm, và biến một con số cũ
   thành một khoảnh khắc mới.

---

## Tóm lại: ba việc nên làm, theo thứ tự

**1 · Giảm chi phí ghi, trước mọi thứ khác.** Đòn bẩy +31% điểm, lớn hơn mọi tính năng mới
cộng lại. Học cách Beyond Time làm: gợi ý theo nếp, một chạm xác nhận, bỏ qua thì để xám.

**2 · Nhắm thị trường đầu theo kiểu công việc, không theo thu nhập hay thành phố.** Người
ngồi bàn, giờ đều, có màn hình trước mặt: IT, công chức, hành chính, freelancer, marketing.
Năm nghề này chiếm 100/300 trong mô phỏng và là toàn bộ nhóm điểm cao.

**3 · Sửa "có gì mới" trước khi lo thêm trụ.** Đây là thành phần yếu nhất và là lý do bỏ app
đã được chứng minh trong tài liệu. Hạt cũ nổi lên là cách rẻ nhất.

### Và một điều nên thôi làm

Đừng cố làm cho nghề ca kíp dùng được bằng cách sửa giao diện. Y tá 8 điểm, tài xế 12 — khoảng
cách với nhóm đầu là 35 điểm, và toàn bộ nằm ở chi phí ghi. Hoặc làm một cách nhập khác hẳn
cho họ, hoặc chấp nhận họ không phải khách của V1. Nửa vời sẽ hỏng cả hai.
