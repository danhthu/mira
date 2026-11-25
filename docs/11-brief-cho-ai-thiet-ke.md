# Mira — bản tóm tắt để nhờ AI lên concept giao diện

> Dán nguyên phần dưới (từ dòng `---` trở xuống) vào ChatGPT. Nó tự đứng được, không
> cần kèm ảnh chụp hay file nào khác.
>
> Cập nhật 25/11/2026. Mỗi lần mô hình dữ liệu đổi thì sửa luôn file này, vì một bản
> brief lỗi thời sẽ đẻ ra concept cho một sản phẩm không tồn tại.

---

## Bối cảnh

Tôi đang làm **Mira**, một ứng dụng web (React, dùng trên điện thoại là chính) cho người
Việt đi làm, có gia đình, khoảng 30–45 tuổi. Toàn bộ giao diện bằng tiếng Việt.

Tôi cần bạn lên **concept giao diện** cho nó. Đọc kỹ phần dưới rồi hẵng đề xuất.

## Mira trả lời một câu hỏi, không phải nhiều câu

**"Đời tôi đang trôi về đâu?"**

Không phải app năng suất. Không phải app thiền. Không phải sổ thu chi. Nó không giúp
người ta làm được nhiều việc hơn — nó cho người ta **nhìn thấy** mình đang tiêu đời mình
vào đâu, bằng những con số không cãi được, rồi để họ tự quyết.

Giọng của sản phẩm: **điềm tĩnh, nói thẳng, không cổ vũ, không phán xét**. Không "Tuyệt
vời! Bạn giỏi quá!". Không huy hiệu, không chuỗi ngày, không pháo hoa. Người dùng là
người trưởng thành đang nhìn vào một sự thật khó chịu; vỗ tay vào lúc đó là xúc phạm.

## Mô hình dữ liệu — đây là phần ràng buộc mọi thứ

### 1. Thời gian: bốn ô

Mỗi ngày người dùng ghi các mục giờ. Mỗi mục rơi vào đúng **một trong bốn ô**:

| Ô | Nghĩa |
|---|---|
| `work` | Việc kiếm tiền, kể cả đi lại vì việc |
| `family` | Người nhà |
| `personal` | Ngủ, ăn, học, thể thao, chăm bản thân |
| `waste` | Điện thoại, mạng xã hội, giải trí thụ động |

Mẫu số là **giờ tỉnh trong ngày** (cấu hình được, mặc định 16–17 tiếng), **không phải 24
tiếng**: ngủ là cái khung chứ không phải một lát bánh.

**Giờ vàng** là một lát nằm *bên trong* ô `family`: lúc thật sự có mặt với người nhà, chứ
không phải ngồi cùng phòng mà cầm điện thoại. Đây là con số quan trọng nhất của sản phẩm.

### 2. Danh mục: tên việc do người dùng tự đặt

Nằm **bên trong** một ô, không thay thế ô. Tối đa 6 danh mục mỗi ô. Ví dụ ô `work` có
"Họp dự án A", "Đi lại". Danh mục là **tuỳ chọn** — ghi giờ mà không chọn danh mục vẫn
hợp lệ.

### 3. Nếp: việc lặp lại, khai một lần

Khai "Ăn tối, 30 phút, thứ 2 đến thứ 6" một lần, Mira tự sinh mục giờ mỗi ngày. Người
dùng chỉ **từ chối** những hôm không làm. Có trần lùi 7 ngày: vắng ba tháng quay lại thì
khoảng trống để trống, không bịa.

### 4. Hũ: kẹo và muối

Mỗi ngày có thể bỏ vào hũ một **viên kẹo** (ngày vui) hoặc một **hạt muối** (ngày nặng).
Chỉ một dòng cảm nhận, **không có thang điểm, không có mức độ**. Sau **42 ngày** Mira hỏi
lại đúng một lần về một hạt muối: "chuyện này giờ còn nặng không?" — rồi thôi.

### 5. Tiền: đúng năm con số mỗi tháng

Không ghi từng giao dịch. Mỗi tháng chỉ có năm ô:

- Thu nhập ròng
- Chi tiêu tháng
- Trả nợ mỗi tháng
- Dư nợ
- Tài sản ròng

Ba ô đầu là **dòng chảy** (cộng dồn trong tháng), hai ô cuối là **mức** (ảnh chụp, ghi đè).

Từ đó suy ra:
- **Vốn tự do** = tài sản ròng ÷ chi tiêu tháng → *"nghỉ việc thì sống được bao nhiêu tháng"*. Đây là con số lớn nhất màn Tài chính.
- **Mức dư** = (thu − chi − trả nợ) ÷ thu
- **Số tháng bị nợ giữ lại** = dư nợ ÷ chi tiêu tháng

### 6. Mục tiêu

Ba hạng: 3 mục tiêu lớn, 2 vừa, 5 nhỏ. Giờ cho mục tiêu phải **khai nguồn**: rút từ ô
nào. Thường là rút từ `waste` — đó là cả ý đồ.

## Các màn đang có

Thanh tab dưới cùng, 5 mục:

| Màn | Nội dung |
|---|---|
| **Nhật ký** (màn chính) | Giao diện chat để nhập liệu. Trên cùng có 3 con số: tháng tự do, giờ vàng tuần, lãng phí tuần — bấm vào từng con số đi sang màn chi tiết |
| **Thời gian** | Donut bốn ô + danh sách mục giờ, gom các mục lặp lại thành một dòng |
| **Sáu tháng** | Mira kể lại sáu tháng qua bằng lời, dựa trên dữ liệu đã ghi |
| **Tài chính** | Năm ô tiền và các con số suy ra |
| **Mục tiêu** | Ba hạng mục tiêu |

Còn một màn **Hũ** và một màn **Tôi** (tài khoản), vào từ các màn trên.

## Màn Nhật ký — chỗ tôi cần concept nhất

### Đang chạy thế nào

Người dùng gõ một câu tiếng Việt bình thường. Máy chủ đọc câu bằng luật (không cần AI),
chỉ câu nào luật chịu mới nhờ LLM.

```
"sáng họp 3 tiếng, chiều đón con 30 phút"
   → 2 mục giờ: Họp 180' work  |  Đón con 30' family (giờ vàng)

"hôm qua ngủ 7 tiếng"      → 420' personal, ghi vào NGÀY HÔM QUA
"rút atm 2 triệu"          → cộng 2tr vào Chi tiêu tháng
"mệt quá, cả ngày căng"    → một hạt muối
"chuyển khoản 5tr sang tiết kiệm" → không ghi, kèm lý do
```

Mira **ghi luôn, không hỏi lại**, mỗi dòng kèm nút **Hoàn tác**. Mảnh câu nào có số mà
đọc không nổi thì nói thẳng ra nguyên văn mảnh đó, không im lặng bỏ qua.

### Vì sao chọn chat

Bản cũ bắt người dùng điền form: **54 thao tác** trước khi thấy con số đầu tiên, **11
thao tác mỗi ngày**, và phải hiểu **4 khái niệm** (ô, danh mục, giờ vàng, thứ trong tuần)
mới khai nổi một nếp. Ba chỗ hỏng đó cùng một gốc: người dùng phải *dịch đời mình sang mô
hình dữ liệu*. Chat đảo chiều việc dịch đó.

## Bằng chứng từ giả lập người dùng

Tôi đã chạy mô phỏng persona. Kết quả định hướng mọi quyết định:

1. **Giữ chân là chỗ thắt**, không phải tính năng. Người ta không bỏ vì thiếu chức năng, họ bỏ vì ngày thứ chín không còn gì mới để nhìn.
2. **Giữ cho mới mẻ: +49%** giữ chân.
3. **Giảm ma sát ghi: +39%**.
4. Dữ liệu nghiêng hẳn về phía xấu: **68% tin xấu, 12% tin tốt**. Nên giao diện mà chỉ biết ăn mừng sẽ im lặng gần như cả năm.

## Việc tôi cần bạn làm

Lên concept giao diện cho **màn Nhật ký (chat)** và hàng nhập liệu của nó, trả lời được:

1. Làm sao **giảm số thao tác** của một lần ghi xuống gần một chạm, cho những việc lặp lại mỗi ngày?
2. Sau khi ghi xong, hiện **phản hồi gì** để người dùng thấy câu vừa gõ đã làm đổi bức tranh — mà không rơi vào vỗ tay?
3. Làm sao để **ngày thứ chín vẫn còn gì để nhìn**?
4. Nút **Hoàn tác** đặt ở đâu để luôn với tới được nhưng không hút mắt hơn nội dung?

## Ràng buộc — xin đừng vi phạm

- **Không linh vật, không avatar robot, không bong bóng mặt cười.** Mira không phải một nhân vật, nó là một cái gương.
- **Không huy hiệu, chuỗi ngày, điểm số, pháo hoa, "Tuyệt vời!".**
- **Không bôi đỏ.** Tháng âm hiện màu xám. Mira không mắng người dùng.
- **Không màu pastel gradient tím hồng.** Bảng màu đang dùng: nền kem, chữ xanh navy đậm, điểm xuyết xanh lá (giờ vàng) và hổ phách (lãng phí).
- **Không thêm khái niệm mới.** Bốn ô, giờ vàng, hũ, năm ô tiền — đã đủ nhiều rồi.
- **Ưu tiên điện thoại.** Chạm được bằng một ngón cái.
- Tiếng Việt tự nhiên, câu ngắn. Không "Hãy cùng khám phá hành trình của bạn".

## Định dạng trả lời tôi muốn

1. Mô tả bố cục màn Nhật ký theo từng khối, từ trên xuống.
2. Mô tả hàng nhập liệu và mọi trạng thái của nó.
3. Mô tả thẻ kết quả sau khi ghi.
4. Nói rõ cái gì bạn **bỏ đi** so với hiện tại và vì sao.
5. Nếu có chỗ bạn thấy mâu thuẫn trong brief này, nói ra, đừng tự đoán.
