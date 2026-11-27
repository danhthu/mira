# Mô hình Mira — luật cho agent

> Đọc file này trước khi chạm vào bất cứ thứ gì liên quan tới nhập liệu bằng chat.
> Từ vựng của bộ đọc câu nằm ở `code/be/src/services/parse-rules.json`; file này giải thích
> *tại sao* nó như vậy. Sửa JSON mà không đọc file này là cách nhanh nhất để làm hỏng
> những con số người dùng đang tin.

---

## 1. Mira là gì

Một cuốn nhật ký đời sống. Nó trả lời đúng hai câu hỏi:

- **Thời gian của tôi đi đâu?**
- **Tiền của tôi đang ở đâu?**

Nó **không phải** sổ thu chi, không phải app quản lý công việc, không phải trợ lý trả
lời câu hỏi. Mọi đề xuất tính năng phải đi qua hai câu hỏi trên trước.

### Hệ quả cho người viết mã

Người dùng mở Mira ra trong lúc mệt, cuối ngày, trên điện thoại, gõ một tay. Họ gõ sai
dấu. Họ gõ tắt. Họ không học cú pháp nào cả. **Ghi được là thắng; bắt họ gõ đúng là
thua.**

---

## 2. Bốn ô thời gian

| Ô | Mã | Là gì |
|---|---|---|
| Công việc | `work` | Việc kiếm sống, kể cả đi lại vì công việc |
| Gia đình | `family` | Ở cùng người nhà, việc nhà, bữa ăn chung |
| Cá nhân | `personal` | Ngủ, thể thao, học, chăm mình |
| Lãng phí | `waste` | Thời gian trôi mà không ai chọn: lướt, xem vô định |

Bốn ô này **cố định**. Không có ô thứ năm, không có ô suy ra, không có chỉ số gộp.
Chúng khớp với `CHECK` constraint trong migrations và với `code/contract/src/index.ts` —
lệch một chỗ là lệch cả ba.

### Giờ vàng — ĐANG TẮT

Giờ vàng là tập con của `family`: ở cùng người nhà mà không vừa làm vừa nhìn điện thoại.
Founder **tạm bỏ khái niệm này ngày 25/11/2026**.

Tắt bằng một cờ: `"gioVang": false` trong `parse-rules.json`. Cột `golden` dưới CSDL vẫn
nguyên và mục cũ vẫn giữ cờ cũ. Bật lại là đổi một chữ — **đừng xoá cột, đừng xoá cờ,
đừng dọn dẹp cho gọn.**

---

## 3. Bảy ô tiền

| Ô | Mã | Dòng chảy hay mức? |
|---|---|---|
| Thu nhập ròng | `netIncome` | **Dòng chảy** — cộng dồn trong tháng |
| Chi tiêu tháng | `monthlyExpense` | **Dòng chảy** — cộng dồn |
| Đầu tư | `investment` | **Dòng chảy** — cộng dồn |
| Lãng phí | `wastedMoney` | **Dòng chảy** — cộng dồn |
| Trả nợ mỗi tháng | `debtPayment` | **Dòng chảy** — cộng dồn |
| Dư nợ | `debtBalance` | **Mức** — câu sau thay câu trước |
| Tài sản ròng | `netWorth` | **Mức** — câu sau thay câu trước |

Phân biệt này là **bắt buộc**, và từ 26/11/2026 nó quyết định cả cách NHẬP:

- **Năm ô dòng chảy không gõ tay nữa.** Chúng là tổng các `money_entry` của tháng — một
  khoản có số tiền, danh mục và ngày, đúng khuôn mục giờ bên Thời gian. Gửi chúng lên
  `PUT /money/:month` thì máy chủ từ chối, kèm câu chỉ sang `POST /money-entries`.
- **Hai ô mức vẫn gõ một con số.** "Tôi đang nợ 240 triệu" không phải tổng của nhiều lần
  nợ; tách thành khoản lẻ rồi cộng là nhân đôi tài sản của người ta mỗi lần khai lại.

Bảng `money` vì vậy chỉ còn hai cột `debt_balance` và `net_worth`. Năm cột cũ đã bị xoá
ở migration 013, sau khi số trong chúng được chuyển thành khoản ngày mùng 1, danh mục
tên "Số cũ".

### Danh mục tiền: y khuôn danh mục thời gian

`money_category` là bản sao của `category`, cố ý giống từng luật — **tuỳ chọn**, **cất đi
chứ không xoá**, **trần 6 cái mỗi ô**. Mỗi danh mục thuộc đúng một ô dòng chảy, giống
danh mục thời gian thuộc một `bucket`. Hai ô mức không có danh mục.

Tên danh mục thành **từ khoá của bộ đọc câu**, và nó **thắng từ khoá dựng sẵn**: "mua
vàng 5tr" vào danh mục "Mua vàng" của người dùng chứ không vào nhóm đầu tư mặc định.
Tên dài nhất thắng, giống `matchCategory` bên thời gian.

Mira vẫn **không nối API ngân hàng và không bóc hoá đơn**. Người dùng tự gõ khoản nào
họ thấy đáng gõ.

### Đầu tư và lãng phí nằm NGOÀI chi tiêu

Ba khoản ra rời nhau, cộng lại mới hết thu nhập:

```
monthlyExpense + investment + wastedMoney + debtPayment  ≤  netIncome
```

Nhét lãng phí vào chi tiêu rồi lại vẽ nó thành một lát riêng của vòng dòng tiền là đếm
hai lần: tổng các lát vượt quá vòng, và con số "còn lại" ở giữa vòng sai.

Khác nhau giữa hai ô mới: **lãng phí là tiền MẤT, đầu tư là tiền CHUYỂN** sang
`netWorth`. Nên `surplusPerMille` trừ lãng phí mà **không trừ đầu tư** — trừ đầu tư thì
mức dư tụt mỗi lần người dùng gửi tiết kiệm, tức là app khen người tiêu hết và phạt
người để dành.

Hệ quả: con số giữa vòng dòng tiền ("còn lại", có trừ đầu tư) **khác** mức dư. Giao diện
phải nói rõ chỗ khác đó, nếu không hai số cạnh nhau đọc như app tính sai.

### Thứ tự nhóm từ khoá tiền là một luật

`docCau` duyệt `tuKhoaTien` theo thứ tự mảng và **dừng ở nhóm đầu tiên khớp**. Nhóm đầu
tư và nhóm lãng phí phải đứng **trước** hai nhóm `monthlyExpense`, vì chữ "mua" và chữ
"tiêu" trần nằm ở đó: đảo thứ tự là "mua vàng 10tr" thành một khoản tiêu mất.

Nhóm lãng phí là nhóm **nước đôi** (`chiTien: false`). "lãng phí 300k" là tiền, "lãng phí
30m" là ba mươi phút vào ô Lãng phí của màn Thời gian.

### Rút tiền mặt

Về kế toán, rút tiền không đổi tài sản ròng — tiền đi từ tài khoản sang ví. Mira từng
trả lời đúng như vậy rồi **từ chối ghi**, và Founder bác bỏ: người gõ "rút 500k" vào một
cuốn nhật ký đời sống đang nói *"tôi vừa lấy 500k ra để tiêu"*, chứ không hỏi một câu kế
toán. **Rút tiền → cộng vào Chi tiêu tháng.**

---

## 4. Hũ: viên kẹo và hạt muối

Ngày vui bỏ vào hũ kẹo, ngày nặng bỏ vào hũ muối. **Không có mức độ ở giữa** — không có
thang điểm, không có "hơi buồn".

Hạt muối có **nhịp hỏi lại 42 ngày**: sáu tuần sau Mira hỏi chuyện đó giờ ra sao. Vì thế
**một câu nặng chỉ được sinh MỘT hạt**, dù câu có mấy mệnh đề. Nhân đôi một hạt là làm
nhiễu đúng chỗ đang đếm.

---

## 5. Danh mục và nếp

- **Danh mục**: tên việc người dùng tự đặt, tối đa 6 mỗi ô. Đây là **từ khoá tốt nhất
  đang có** — tên họ tự đặt nói đúng hơn mọi danh sách gõ cứng, nên nó được khớp **trước**
  bảng từ vựng.
- **Nếp**: việc lặp, máy tự điền. Mục do nếp sinh ra mang `source: 'nep'` và **không tính
  là "người dùng đã ghi hôm nay"** — nếu tính thì lời nhắc tắt vĩnh viễn với bất kỳ ai có
  một nếp chạy hằng ngày.

---

## 6. Bộ đọc câu — thứ tự và luật

Chỉ có **một tầng: luật**. Không gọi LLM, không cần khoá API. Founder bỏ hẳn đường đó
ngày 25/11/2026, sau khi người dùng nhận về dòng "Máy chủ chưa cấu hình
ANTHROPIC_API_KEY" giữa lúc đang ghi nhật ký.

Nghĩa là **luật phải gánh hết**. Thiếu một từ khoá không còn là "chất lượng kém hơn một
chút", nó là mất hẳn một mục.

### Thứ tự xử lý

```
1. Bỏ dấu cả câu          ← hạ chữ thường TRƯỚC, bỏ dấu SAU (xem §7)
2. Chặn "không ghi được"  ← CHỈ khi câu có số tiền thật
3. Tách mảnh              ← ở ';' và 'rồi' và dấu phẩy KHÔNG nằm giữa hai chữ số
4. Mỗi mảnh:
     a. cắt cụm chỉ ngày   ("hôm qua", "thứ 6", "3 ngày trước")
     b. thử đọc TIỀN       ← cần CẢ số tiền LẪN từ khoá ô
     c. thử đọc GIỜ        ← cần thời lượng, rồi:
            danh mục người dùng  →  bảng từ vựng  →  LƯỚI HỨNG
5. Không mảnh nào ra gì → thử CẢM XÚC trên cả câu → một hạt
6. Mảnh có chữ số mà không đọc được → trả 'chuaHieu' kèm nguyên văn
7. Vẫn không gì → 'chiu', và ghi một dòng log `doc_chiu`
```

### Lưới hứng — luật quan trọng nhất

**Thời lượng + tên việc là ĐỦ để ghi.** Không cần khớp từ khoá nào.

Ô thì đoán (`personal`), và `doanO: true` báo cho giao diện nói rõ là đang đoán.

Lý do: vá thêm từ khoá chỉ dời cái hố đi chỗ khác — đời sống một người có hàng trăm
việc, không bao giờ liệt kê hết. Mất hẳn 30 phút tệ hơn xếp nhầm ô: ô sai sửa một cú
chạm, mục không ghi thì tuần sau không ai nhớ ra để mà sửa.

Ngoại lệ duy nhất: câu **chỉ có con số**, không có tên việc ("30 phút"). Ghi ra một dòng
"Ghi tay · 30m" mà tuần sau đọc lại cũng không ai biết là gì — thà không ghi.

### Đoán thì phải nói là đoán

Đoán im lặng thì người dùng tin con số, và một tháng sau cột Cá nhân phình lên toàn thứ
Mira tự xếp vào đó, không ai hiểu tại sao.

---

## 7. Bốn cái bẫy đã cắn thật

Mỗi cái dưới đây đã gây lỗi trên máy Founder. Đừng đạp lại.

**1. Bỏ dấu sai thứ tự.** `"Đ"` hoa là U+0110, một ký tự riêng, NFD không tách được. Phải
**hạ chữ thường TRƯỚC, bỏ dấu SAU**. Làm ngược thì "Đi làm 8 tiếng" ra `"đi lam"` và
không khớp gì — mà người ta viết hoa chữ đầu câu, nên lỗi này ăn đúng vào những câu hay
gõ nhất.

**2. Bỏ dấu làm hai từ khác nghĩa thành một.** `"chuyện tiền"` và `"chuyển tiền"` giống
hệt nhau sau khi bỏ dấu. `"khó"` và `"kho"` (kho cá) cũng vậy. `"ổn"` và `"ồn"` cũng vậy.
→ **Không nhận chữ trần mơ hồ**, và chặn "không ghi được" chỉ chạy khi câu có số tiền.

**3. Dấu phẩy giữa hai chữ số là dấu thập phân.** Người Việt viết "1,5h". Tách mảnh ở đó
thì "họp 1,5h" thành "họp 1" và "5h".

**4. `\b` sau chữ cái ASCII không chốt được ở chữ có dấu.** `"thứ 6 họp"` với mẫu `6\s*h\b`
thì `\b` sau `h` vẫn đúng vì `"ọ"` không phải `\w` — nó ăn mất "6 h" của "họp". Dùng
`(?![\p{L}])` kèm cờ `u`.

---

## 8. Luật khi sửa `parse-rules.json`

1. **Viết thường, không dấu.** Câu người dùng đã bỏ dấu khi so khớp. Gõ "thể dục" vào đó
   là tạo một dòng chết — không lỗi, không cảnh báo, chỉ là không bao giờ khớp.
   `__tests__/parseRules.test.test.ts` bắt lỗi này.
2. **Thứ tự mảng là thứ tự ưu tiên.** Cụ thể trước chung: `tam cho con` (gia đình) phải
   nằm trên `tam` (cá nhân).
3. **Thêm vào `tuKhoaO` thì dè dặt.** Đoán sai ô là bẻ cong con số cả app xoay quanh.
4. **Thêm vào `camXuc` thì thoải mái.** Đoán sai chỉ là một hạt thừa, gỡ một cú chạm.
5. **Đừng thêm từ khoá để vá một câu lẻ.** Hỏi trước: câu đó đã có lưới hứng đỡ chưa? Nếu
   rồi thì chỉ thêm khi ô đoán ra SAI, không phải khi nó thiếu đẹp.

---

## 9. Mira không trả lời câu hỏi

Khung chat chỉ **ghi**, không **đáp**. Founder gõ "xem ở đâu" vào đó và Mira trả về "chưa
hiểu câu này" — đúng về mặt kỹ thuật, vô dụng về mặt con người.

Đây là **giới hạn đã biết, chưa quyết hướng xử lý.** Đừng tự dựng một bộ hỏi–đáp. Nếu
đụng tới, hỏi Founder trước.
