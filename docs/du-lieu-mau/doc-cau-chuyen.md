# Mira kể được chuyện — nhưng hiện không kể. Và giúp được một nửa.

> Kèm `cau-chuyen.md` (bảng số và ba câu chuyện đầy đủ). Viết tay, không bị ghi đè.

## Trả lời thẳng hai câu

**Có tạo ra story cho persona không?** Dữ liệu Mira lưu **đủ** để kể một câu chuyện nhận ra
được. Nhưng app hiện tại **không kể** — nó bày một bảng số và một câu nhận xét cùng khuôn
mỗi tuần. Khoảng cách giữa hai điều đó là một tính năng chưa làm, không phải một giới hạn dữ liệu.

**Có giúp họ tốt hơn không?** Trong số người dùng hết sáu tháng: **50% khá hơn, 50% không
đổi, 0% tệ đi**. Quy về mọi người đăng ký: **16% khá hơn**. Và giờ vàng gần như không nhúc
nhích với ai.

---

## 1 · Thử kể thật, chỉ bằng dữ liệu app có

Một công chức, vợ chồng chưa con, dùng hết sáu tháng. Những câu dưới đây dựng **hoàn toàn từ
giờ theo nhóm việc và hũ khoảnh khắc** — bộ dò không được nhìn biến cố thật:

> **Tuần 2** — giờ lãng phí vọt lên 48,6h, cao hơn mức thường 48%.
> **Tuần 3** — vọt lên 56,6h, cao hơn 73%. Tuần đó bạn bỏ 2 hạt muối vào hũ.
> **Tuần 4** — vọt lên 61,0h, cao hơn 86%; giờ vàng tụt còn 5,2h. Tuần đó bạn bỏ 2 hạt muối.
> **Tuần 5** — vọt lên 61,4h, cao hơn 88%; giờ vàng tụt còn 5,4h.
> **Tuần 8** — giờ công việc tụt còn 19,9h; giờ gia đình vọt lên 24,6h; giờ vàng vọt lên 13,8h.
> **Sáu tháng** — thu nhập đi từ 8,0tr lên 12,1tr.

Đời thật của người này, thứ app không hề nhìn thấy: **tuần 2 mất khách / cắt giờ**, tuần 4
được thưởng, tuần 8 đi chơi xa.

Mira không biết người này mất việc. Nhưng nó mô tả đúng **hình dạng** của việc mất việc: giờ
làm biến mất, giờ trống phình ra bốn tuần liền, hai tuần có hạt muối, giờ vàng tụt dù ở nhà
nhiều hơn. Rồi tuần 8 là một chuyến đi chơi — công việc biến mất lần nữa nhưng lần này giờ
vàng vọt lên gần gấp đôi.

**Đó là một câu chuyện, không phải một bảng số.** Và nó dựng được từ thứ app đã lưu.

---

## 2 · Mira nhìn thấy bao nhiêu phần đời

| | |
|---|---|
| Biến cố xảy ra khi người dùng còn mở app | 1.507 |
| Mira bắt được | **575 — 38%** |
| Tuần Mira đánh dấu mà **đúng có chuyện thật** | **93%** |
| Người không đủ dữ liệu để nói gì | **133/300 — 44%** |

Hình dạng này đúng cho sản phẩm: **nói ít nhưng gần như không nói sai.** Khi Mira bảo "tuần
này có gì đó", 93% là có thật. Nó bỏ sót 62% — chấp nhận được, và **không nên chỉnh để bắt
nhiều hơn**, vì cái giá là nói sai.

Nhưng con số đáng lo không phải 38%. Là **44% người đăng ký không bao giờ đủ dữ liệu để Mira
mở miệng**. Đây lại là vấn đề giữ chân, không phải vấn đề thuật toán — lần thứ tư cùng một
kết luận.

### Mira gần như mù với tin tốt ⚑

| Biến cố | Bắt được |
|---|---|
| Mất khách / cắt giờ | **68%** |
| Căng thẳng trong nhà | 47% |
| Đi chơi xa | 47% |
| Người thân ốm | 41% |
| Dự án gấp | 40% |
| Ốm | 35% |
| Con ốm | 29% |
| **Được thưởng** | **12%** |

Chuyện xấu nhất bắt được **68%**, chuyện vui nhất bắt được **12%**.

Lý do nằm ở cấu trúc dữ liệu, không phải ở bộ dò: **tin xấu hiện ra trong giờ** — giờ làm
mất, giờ trống phình, giờ vàng tụt — mà giờ thì ghi theo tuần, đủ mịn để thấy. **Tin tốt
hiện ra trong tiền**, mà tiền ghi theo tháng, quá thô để thấy một tuần vui.

Hệ quả cho một sản phẩm tên là "hũ hạnh phúc": **nếu để tự nhiên, Mira sẽ kể một cuộc đời
buồn hơn cuộc đời người ta đã sống.** Nó sẽ nhớ bốn tuần mất việc và quên tháng được thưởng.

Đối trọng duy nhất đang có là **viên kẹo trong hũ** — thứ duy nhất Mira ghi lại được niềm
vui bằng lời. Trong mô phỏng, hạt chỉ rơi vào 17% số ngày có ghi. Nghĩa là hũ không phải
tính năng phụ để giữ chân; **nó là thứ cân lại cái nhìn lệch của toàn bộ phần còn lại.**
Nên nó phải xuất hiện nhiều hơn trong câu chuyện, không phải ít hơn.

---

## 3 · Giúp được ai, bao nhiêu

So giờ lãng phí hai tháng cuối với **bản sao không cài app của chính mình**:

| Nhóm | n | Khá hơn | Không đổi | Tệ hơn |
|---|---|---|---|---|
| Còn dùng tới cuối | 80 | **50%** | 50% | **0%** |
| Đã bỏ giữa chừng | 220 | 4% | 96% | 0% |
| **Tất cả người đăng ký** | 300 | **16%** | 84% | **0%** |

Ba điều rút ra:

**Không ai tệ đi.** Không một người nào trong 300 có giờ lãng phí cao hơn bản sao không cài
app quá 5%. Mira không gây hại — không tạo áp lực làm người ta bỏ cuộc rồi buông xuôi. Với
một sản phẩm cố tình bỏ chuỗi ngày và điểm số, đây là bằng chứng mô hình rằng lựa chọn đó
không phản tác dụng.

**Một nửa người ở lại thì có tác dụng, một nửa thì không.** Không phải "hiệu quả nhỏ với mọi
người" mà là "hiệu quả rõ với một nửa, bằng không với nửa kia". Đáng tìm xem nửa nào — đó là
câu hỏi cho người thật, không phải cho mô phỏng.

**Giờ vàng gần như không đổi với ai**: 11% người còn dùng, 4% toàn bộ người đăng ký. Khớp
với kết quả trước. Mira dịch được giờ lãng phí, không dịch được giờ với người thân.

---

## Ba việc rút ra

**1 · Làm phần kể chuyện, không phải thêm số.** Dữ liệu đã đủ. Một màn "sáu tháng của bạn"
hiện vài tuần Mira đánh dấu, mỗi tuần một câu, kèm hạt trong hũ tuần đó. Độ chính xác 93%
nghĩa là dám bày ra mà không sợ nói sai.

**2 · Cân lại cái nhìn lệch về phía buồn.** Mira thấy tin xấu gấp năm lần tin tốt. Hai cách:
cho hũ chỗ lớn hơn trong câu chuyện, và tìm cách để tin tốt hiện ra trong **giờ** chứ không
chỉ trong tiền — ví dụ đánh dấu tuần có giờ vàng cao bất thường là một sự kiện đáng kể,
ngang với tuần có giờ làm vọt.

**3 · Đừng chỉnh bộ dò để bắt nhiều hơn.** 38% bắt được với 93% đúng là đánh đổi đúng. Hạ
ngưỡng xuống sẽ bắt thêm vài biến cố và đổi lại nói sai nhiều hơn — với một app đọc đời tư,
nói sai đắt hơn im lặng.

## Con số cần người thật

Tỷ lệ người ghi được **từ ba ngày mỗi tuần trở lên** sau 12 tuần. Trong mô hình là 56%
(167/300). Dưới ngưỡng đó Mira không có gì để kể, và toàn bộ phần kể chuyện trở thành vô
nghĩa — bất kể làm hay tới đâu.
