# Đọc kết quả tín hiệu

> Kèm `tin-hieu.md` (bảng số, sinh tự động). File này viết tay, không bị ghi đè.

## Cái gì là phát hiện thật, cái gì là vết của mô hình

Phải tách trước, nếu không sẽ tin nhầm:

| Kết quả | Thật hay vết mô hình |
|---|---|
| Tổng đã ghi gần như không phân biệt ai với ai (CV 0,11) | **Thật.** Tổng giờ bị chặn trên bởi giờ tỉnh, ai cũng lấp gần hết. Không phụ thuộc tham số. |
| Mọi số đều "nói bạn là ai" hơn "tuần này khác gì" (tỷ số ≥ 2,7) | **Thật về hướng.** Người khác nhau nhiều hơn là tuần của một người khác nhau — đúng với nếp sống ngoài đời. |
| Nợ giữ lại phân biệt mạnh nhất (CV 1,40) | **Thật.** Có nợ hay không là nhị phân, và dư nợ chênh nhau hàng chục lần. |
| Giờ vàng ↔ giờ gia đình r = 0,99 | **Vết mô hình.** Tôi sinh giờ vàng bằng cách nhân giờ gia đình với một tỷ lệ cố định cho mỗi người. Ngoài đời tỷ lệ "thật sự có mặt" dao động theo ngày, nên r thật sẽ thấp hơn. Hướng thì đúng — giờ vàng là tập con của giờ gia đình nên luôn tương quan mạnh. |
| Giờ lãng phí chỉ đổi đáng kể ở 12% số tuần | **Vết mô hình một phần.** Tôi rút giờ lãng phí mỗi ngày từ một phân phối cố định, không có xu hướng, nên tổng tuần bị san phẳng. Ngoài đời có tuần bùng. Nhưng hướng vẫn đáng tin: thói quen lướt là thứ ổn định. |

---

## Ba phát hiện đáng sửa sản phẩm

### 1 · Ô "Tổng đã ghi" trên trang chủ là con số tệ nhất có thể chọn ⚑

Trong 11 số Mira bày ra, "tổng đã ghi mỗi tuần" đứng **chót cả ba bảng**:

| | Giá trị | Xếp |
|---|---|---|
| Hệ số biến thiên giữa người | 0,11 | **11/11** |
| Tỷ lệ tuần đáng nhìn | 3% | **5/5** |
| Tương quan với điểm phù hợp | 0,04 | **10/11** |

**289 trên 300 người** có con số này đứng yên — nghĩa là mở app tuần nào cũng thấy một số
gần y hệt. Nó không phân biệt được ai với ai, không đổi theo tuần, và không liên quan gì tới
việc Mira có ích cho người đó hay không.

Đây đúng là con số tôi vừa đặt lên ô Thời gian ở trang chủ trong phiên này.

**Đề xuất:** giữ nhãn **THỜI GIAN** (ô phải là tên trụ, đúng như anh nói), nhưng đổi con số
lớn sang **giờ vàng tuần này**. Giờ vàng đứng đầu bảng "đổi theo tuần" (42%) và thứ ba bảng
"phân biệt người" (0,57). Dòng phụ để giờ lãng phí.

### 2 · Giờ vàng và giờ gia đình là một số, đừng bày thành hai ⚑

r = 0,99 trong mô phỏng — con số này bị thổi lên vì cách tôi sinh dữ liệu, nhưng hướng thì
chắc chắn: giờ vàng là **tập con** của giờ gia đình, nên hai thanh luôn chạy cùng nhau.

Hiện màn Thời gian bày cả hai: donut có lát "Gia đình", ngay dưới là thanh chia "Trong giờ
gia đình: giờ vàng / còn lại". Người dùng phải đọc hai lần để biết một điều.

**Đề xuất:** bỏ lát "Gia đình" khỏi donut và thay bằng **"Giờ vàng"** — tức donut chia
*công việc · giờ vàng · cá nhân · lãng phí*, còn giờ gia đình không-giờ-vàng gộp vào cá nhân.
Hoặc giữ donut như cũ và bỏ hẳn thẻ chia bên dưới. Chọn một, đừng giữ cả hai.

Cùng lý do, **đừng bày cả giờ lãng phí lẫn tỷ lệ lãng phí** (r = 0,96).

### 3 · Mira không có số nào hợp để nói "tuần này khác gì" ⚑⚑

Đây là phát hiện nặng nhất, và nó giải thích con số "có gì mới = 39" ở phân tích thị trường.

Tỷ số *dao động giữa người ÷ dao động trong một người* của **cả năm** số theo tuần đều từ
**2,74 trở lên**. Không có số nào dưới 1. Nghĩa là mọi con số Mira tính ra đều nói nhiều về
*bạn là người thế nào* hơn là *tuần vừa rồi có gì khác*.

Hệ quả trực tiếp: màn hình hàng tuần của Mira về bản chất đang lặp lại một bức chân dung.
Lần đầu xem thì giật mình, lần thứ năm thì chán — đúng cơ chế bỏ app ở N-208.

**Hai cách chữa, và chúng không loại trừ nhau:**

**a. Tách hai loại số ra hai chỗ.** Số "bạn là ai" (vốn tự do, nợ giữ lại, tỷ lệ lãng phí)
bày **một lần lúc mở tài khoản và mỗi tháng một lần**, không bày mỗi tuần. Màn tuần chỉ giữ
hai số có tỷ lệ đổi cao nhất: giờ vàng (42%) và giờ gia đình (41%).

**b. Lấy cái mới từ chỗ khác, không từ con số.** Hạt cũ nổi lên — "hôm nay ba tháng trước"
— là nguồn nội dung duy nhất **không phụ thuộc vào việc đời có thay đổi hay không**. Nó mới
mỗi lần vì nó lấy từ chữ người dùng viết, không từ phép tính.

Đây là lần thứ hai ý tưởng đó nổi lên từ một phân tích độc lập. Nên đưa vào bản chốt.

---

## Số đáng giữ nhất và số đáng bỏ

| Số | Phân biệt | Đổi theo tuần | Kéo điểm | Nên |
|---|---|---|---|---|
| Nợ quy ra tháng tự do | **1,40** | — | 0,13 | **giữ** — số phân biệt mạnh nhất, và không app nào khác có |
| Biên độ mức dư | **1,10** | — | −0,02 | giữ, nhưng bày theo quý chứ không theo tháng |
| Giờ vàng / tuần | 0,57 | **42%** | 0,32 | **giữ, đưa lên trang chủ** |
| Vốn tự do | 0,59 | — | 0,28 | giữ — số lõi của trụ tiền |
| Giờ lãng phí / tuần | 0,32 | 12% | **0,57** | giữ — liên quan mạnh nhất tới việc app có ích |
| Giờ gia đình / tuần | 0,46 | 41% | 0,30 | **gộp với giờ vàng**, đừng bày riêng |
| Tỷ lệ lãng phí | 0,34 | — | 0,49 | **bỏ** — trùng giờ lãng phí (r = 0,96) |
| Giờ công việc / tuần | 0,21 | 14% | −0,53 | giữ trong donut, đừng làm số nổi bật |
| Tổng đã ghi / tuần | **0,11** | **3%** | 0,04 | **bỏ khỏi trang chủ** |

Một điều đáng chú ý ở cột cuối: **giờ lãng phí tương quan 0,57 với điểm phù hợp, cao nhất**,
còn giờ công việc tương quan **−0,53**. Nghĩa là Mira có ích nhất cho người rò rỉ nhiều và
làm ít — và ít ích nhất cho người làm quần quật. Cùng kết luận với "nghịch lý kế toán" ở
phân tích thị trường, nhưng rút ra từ một phép đo khác hẳn.

---

## Việc cần làm với người thật

Ba con số dưới đây quyết định mọi kết luận ở trên, và cả ba đều đang là tham số tôi đặt tay:

1. **Giờ lãng phí thật mỗi tuần của người Việt.** Nếu thấp hơn nhiều so với 9–27h tôi giả
   định, toàn bộ bảng điểm đổi.
2. **Giờ lãng phí có bùng theo tuần không.** Quyết định xem Mira có số nào để nói mỗi tuần
   hay không. Đây là câu quan trọng nhất trong ba câu.
3. **Tỷ lệ "thật sự có mặt" trong giờ gia đình dao động bao nhiêu.** Quyết định giờ vàng có
   phải một số riêng hay chỉ là cách đọc lại giờ gia đình.

Không cái nào cần app hoàn chỉnh để đo. Mười người ghi tay hai tuần là đủ.
