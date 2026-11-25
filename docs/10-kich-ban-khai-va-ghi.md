# Kịch bản khai và ghi: đếm từng thao tác, rồi đánh giá

> Ngày 25/11/2026. Đếm trên bản đang chạy, không ước lượng.
> Viết trước khi dựng màn nhập bằng chat, vì kết quả đếm quyết định màn đó phải làm gì.

## Kịch bản: Thu, tuần đầu dùng Mira

Lấy đúng đời thật của Founder làm mẫu, vì đó là bộ dữ liệu duy nhất có thật trong tay.

### Ngày 1 — khai

| Việc | Thao tác | Đếm |
|---|---|---|
| Khai 5 danh mục (Ăn tối, Nhà cửa, Đi lại, Giờ làm, Điện thoại) | chọn ô → `+ Mới` → gõ tên → `Tạo` | 5 × 4 = **20** |
| Khai 3 nếp (Ăn tối, Nhà cửa, Đi lại) | `+ Khai một nếp` → gõ tên → chọn ô → chọn thứ → gõ giờ → `Khai` | 3 × 6 = **18** |
| Nhập 5 ô tiền | mở màn → chạm ô → gõ → rời ô | 5 × 3 + 1 = **16** |
| **Tổng ngày đầu** | | **54 thao tác** |

### Ngày thường — ghi

| Việc | Thao tác | Đếm |
|---|---|---|
| Nếp tự ghi (ăn tối, nhà cửa, đi lại) | **0** | **0** |
| Giờ làm hôm nay | chọn ô → chọn danh mục → gõ giờ → `Thêm` | **4** |
| Điện thoại | chọn ô → chọn danh mục → gõ giờ → `Thêm` | **4** |
| Một hạt kẹo | gõ câu → chọn kẹo → `Bỏ vào hũ` | **3** |
| **Tổng mỗi ngày** | | **11 thao tác** |

---

## Đánh giá: ba chỗ được, ba chỗ hỏng

### Được

**Nếp đưa việc lặp về 0 thao tác.** Ba việc chiếm 3 giờ mỗi ngày giờ không tốn thao tác
nào. Đây đúng là đòn bẩy +39% của mô phỏng, và nó hoạt động.

**Danh mục không bắt buộc.** Bỏ qua được, nên nó không thành cửa chặn.

**Mỗi thao tác đều ngắn.** Không màn nào bắt điền một biểu mẫu dài.

### Hỏng

**⚑ 54 thao tác trước khi thấy con số đầu tiên.** Đây là vấn đề nặng nhất. Mô phỏng nói
giữ chân là chỗ thắt, và 54 thao tác đứng chắn **trước** lúc người ta nhìn thấy Mira có
ích gì. Thứ tự đang ngược: bắt khai hệ thống trước, trả giá trị sau.

**⚑ Mười một thao tác mỗi ngày vẫn là mười một.** Giảm từ mười lăm xuống mười một là tốt,
nhưng nó vẫn là mười một lần chạm vào một việc người ta làm lúc mệt nhất trong ngày.
Nghề khó ghi giữ chân **2,5%** trong mô phỏng; mười một thao tác không cứu được con số đó.

**⚑ Khai nếp đòi biết trước mô hình dữ liệu.** Muốn khai một nếp phải hiểu: ô là gì, danh
mục khác ô ra sao, giờ vàng nghĩa là gì, thứ nào trong tuần. Đó là **bốn khái niệm** phải
học trước khi ghi được dòng đầu tiên. Người ta cài app để ghi, không phải để học.

---

## Một ví dụ Founder đưa, và nó lộ ra điều khác

> *"hôm nay rút atm 2 triệu"*

Thử xếp câu này vào Mira hiện tại: **không có chỗ nào cả.**

Rút tiền ở ATM **không làm đổi tài sản ròng**. Tiền đi từ tài khoản sang ví, tổng không
đổi. Năm ô tiền của Mira là ảnh chụp mỗi tháng một lần, không phải sổ giao dịch.

Hai đường đi, và phải chọn:

**Đường A — Mira ghi giao dịch.** Thêm sổ thu chi. Trái thẳng với câu đã in trên màn Tài
chính: *"Mira không nối ngân hàng và không bóc hoá đơn. Năm ô này là tất cả những gì nó
cần."* Và mọi app sổ thu chi đều chết vì cùng một lý do: người ta bỏ ghi sau ba tuần.

**Đường B — chat trả lời thật.** *"Rút tiền không làm đổi tài sản ròng của bạn, nên Mira
không ghi. Nếu tháng này bạn tiêu nhiều hơn dự tính thì sửa ô Chi tiêu tháng."*

Tôi nghiêng về B, và nghiêng mạnh. Nhưng đây là quyết định sản phẩm, không phải quyết định
kỹ thuật, nên nó phải được nói ra chứ không lặng lẽ chọn hộ.

---

## Kết luận: chat không phải để cho đẹp

Ba chỗ hỏng ở trên có chung một gốc: **người dùng phải dịch đời mình sang mô hình dữ liệu
của Mira trước khi ghi được gì.** Chọn ô, chọn danh mục, chọn thứ trong tuần — đó là việc
của máy, đang bắt người làm.

Một dòng chat đảo ngược chiều dịch đó:

```
người gõ:  "sáng nay họp 3 tiếng, chiều đưa con đi học"
Mira hiểu: 3h Công việc · "Họp"
           30m Gia đình · "Đưa con đi học" · giờ vàng
Mira hỏi:  đúng không?
```

Vẫn một thao tác xác nhận, nhưng **không phải học khái niệm nào**. Ô và danh mục trở thành
thứ Mira suy ra, không phải thứ người dùng phải khai.

Và nó không xoá phần đã làm. Nếp vẫn là cách tốt nhất cho việc lặp lại (0 thao tác vẫn ít
hơn 1). Chat là cửa vào cho **mọi thứ còn lại**, và là cách khai nếp mà không phải học
bốn khái niệm.

### Điều chat tuyệt đối không được làm

Tự ghi khi chưa chắc. Bài học từ nếp còn nguyên giá trị: đây là chỗ máy viết vào nhật ký
của người, và **một dòng bịa làm hỏng niềm tin vào cả trăm dòng thật**. Hiểu được thì hỏi
lại rồi mới ghi; không hiểu thì nói không hiểu, đừng đoán bừa.
