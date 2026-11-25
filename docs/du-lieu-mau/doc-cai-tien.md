# Cải tiến nào đáng làm trước — và một kết luận cũ của tôi bị lật

> Kèm `cai-tien.md` (bảng số). Viết tay, không bị ghi đè.

## Trước hết, sửa một con số của chính tôi

Hôm qua tôi nói "**7,1 giờ** mỗi người đăng ký trong sáu tháng". Con số đó **thấp hơn thực
tế của mô hình**, vì cách tính sai: tôi coi người bỏ giữa chừng đóng góp **bằng không**.

Nhưng người bỏ ở tuần 13 vẫn đã giảm lãng phí trong 13 tuần trước đó. Tính đúng — tổng giờ
lãng phí ít hơn so với bản sao không cài app, trên toàn kỳ, cho **mọi** người đăng ký kể cả
người đã bỏ:

> **12,8 giờ mỗi người đăng ký, trong sáu tháng.**

Con số này mới là con số nên dùng. Nó vẫn đã tính cả 73% bỏ cuộc.

---

## Bảng đòn bẩy

Mỗi can thiệp bật riêng, trên đúng 300 người đó, cùng tính cách, cùng biến cố:

| Cải tiến | Giữ tuần 26 | Giờ / người đăng ký | Tăng |
|---|---|---|---|
| **Giữ mới mẻ** (hạt cũ nổi lên, so theo mùa) | 27% → **44%** | 12,8h → **19,1h** | **+49%** |
| **Giảm ma sát ghi** (gợi ý theo nếp, một chạm) | 27% → **39%** | 12,8h → **17,8h** | **+39%** |
| **Nhắc khi trượt** (sau 4 ngày không ghi) | 27% → **53%** | 12,8h → **16,2h** | **+26%** |
| **Mục tiêu vào onboarding** | 27% → 27% | 12,8h → **13,8h** | **+7%** |
| | | | |
| Làm cả bốn | 27% → **83%** | 12,8h → **30,5h** | **+138%** |

---

## Kết luận hôm qua của tôi sai thứ tự

Hôm qua tôi xếp **"đẩy việc đặt mục tiêu vào luồng mở tài khoản"** là việc số 2, với lý do
luật khai nguồn hiệu quả gấp hơn hai lần chỉ ghi (−5,0% so với −2,3%).

Hệ số đó không sai. Nhưng xếp hạng thì sai: **đặt mục tiêu là đòn bẩy yếu nhất trong bốn,
+7%.**

Lý do nằm ở phép nhân:

```
tổng giá trị  =  số người còn dùng  ×  hiệu quả trên mỗi người
```

Ép mục tiêu nâng **vế phải** — nhưng không chạm vào vế trái. Giữ chân tuần 26 đứng yên ở
27%. Nâng hiệu quả gấp đôi trên một phần tư người dùng thì tổng chỉ nhích được chút.

Ba can thiệp kia nâng **vế trái**, và vế trái đang là chỗ thắt. 27% nghĩa là ba phần tư giá
trị tiềm năng đang rơi mất trước khi hiệu quả kịp tích luỹ.

**Quy tắc rút ra: khi giữ chân dưới 50%, mọi cải tiến về hiệu quả đều là tối ưu hoá sai chỗ.**

---

## Và một kết quả khó chịu phải nói thẳng

**"Nhắc khi trượt" cho tỷ lệ giữ chân cao nhất trong bốn can thiệp đơn lẻ: 27% → 53%.**
Gần gấp đôi.

Nhưng bản chốt tính năng của Mira ghi rõ, ở màn Mục tiêu và màn Thói quen:

> *Không nhắc, không hỏi vì sao bạn bỏ một tuần.*
> *Bỏ qua cũng được. Mira không đếm số lần bạn bỏ qua.*

Đây là xung đột thật giữa **con số** và **điều sản phẩm tự hứa**, và tôi không định làm mờ nó.

Vài điều đáng cân nhắc trước khi quyết:

- Giữ chân cao nhất nhưng giờ lấy lại chỉ **+26%**, thấp hơn cả giảm ma sát (+39%) và giữ
  mới mẻ (+49%). Người bị nhắc mới quay lại là người ghi hời hợt — họ ở lại trong thống kê
  nhiều hơn là ở lại thật.
- Hệ số tôi dùng (nhắc làm xác suất ghi tăng 35% trong ngày đó) là **phỏng đoán**, và
  phỏng đoán rộng tay. Nhắc nhở ngoài đời nhờn rất nhanh.
- Có một đường giữa: nhắc **không nói về việc bạn đã bỏ**. Không phải *"bạn chưa ghi 4 ngày"*
  mà *"hôm nay ba tháng trước bạn viết: …"*. Đó vừa là nhắc, vừa là *giữ mới mẻ* — can thiệp
  đứng đầu bảng — và không vi phạm câu đã hứa.

Tôi nghiêng về đường giữa. Nhưng đây là quyết định về giá trị sản phẩm, không phải quyết định
kỹ thuật.

---

## Hạt cũ nổi lên: lần thứ ba ý tưởng này đứng đầu

Ba phân tích độc lập, ba lần cùng một kết luận:

| Phân tích | Kết luận |
|---|---|
| Thị trường (300 người) | "Có gì mới" là thành phần giá trị thấp nhất, 39/100 |
| Tín hiệu | Không số nào hợp để nói "tuần này khác gì"; cái mới phải đến từ chỗ không phải phép tính |
| Cải tiến (bản này) | **Giữ mới mẻ là đòn bẩy đơn lẻ lớn nhất, +49%** |

Và nó là thứ **rẻ nhất** trong bốn: một truy vấn theo ngày trên bảng `moment` đã có sẵn, một
thẻ trên trang chủ. Không cần mô hình, không cần máy chủ, không đụng vào local-first.

**Nếu chỉ làm được một việc, làm việc này.**

---

## Cộng dồn gần như cộng thẳng

| | Giờ / người đăng ký |
|---|---|
| Hiện tại | 12,8h |
| Cộng thẳng phần tăng của bốn can thiệp | ~28,5h |
| Làm cả bốn thật | **30,5h** |

Hơn tổng một chút — vì giữ chân cao hơn thì hiệu quả có thêm thời gian tích luỹ. Nghĩa là
bốn can thiệp **không giẫm chân nhau**, và thứ tự làm không quan trọng bằng việc làm đủ.

Làm cả bốn: giữ chân tuần 26 lên **83%**, giờ lấy lại **gấp 2,4 lần**. Con số 83% là phi
thực tế với app tự theo dõi ngoài đời — nó cho thấy mô hình đang rộng tay với các can thiệp,
và là lý do phần dưới tồn tại.

---

## Cái gì trong bảng này đáng tin, cái gì không

**Đáng tin: thứ hạng tương đối và cơ chế.** Giữ chân là chỗ thắt; cải tiến hiệu quả khi giữ
chân thấp là tối ưu sai chỗ. Kết luận đó đến từ cấu trúc phép nhân, không từ con số cụ thể.

**Không đáng tin: độ lớn.** Ba mức can thiệp — giảm ma sát 50%, ép mục tiêu lên 85%, kéo dài
hào hứng gấp đôi — đều là **tôi đặt**. Tôi không có cơ sở nào để nói gợi ý theo nếp giảm được
đúng một nửa ma sát.

Bảng này trả lời *cơ chế nào đáng đầu tư*, không trả lời *làm xong thì được bao nhiêu*.

## Ba con số cần người thật, theo thứ tự

1. **Tỷ lệ còn ghi sau 12 tuần.** Mô hình cho 67%. Đây là mẫu số của mọi thứ khác.
2. **Một thẻ "hôm nay ba tháng trước" có giữ người lại không.** Rẻ nhất để thử, và đang là
   đòn bẩy số một trong mô hình. Có thể thử trên 20 người trong 4 tuần.
3. **Gợi ý theo nếp giảm được bao nhiêu phần ma sát thật.** Cần đo thời gian ghi trung bình
   trước và sau — không cần app hoàn chỉnh, chỉ cần một bản nháp.
