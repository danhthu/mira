# Cơ chế thể hiện việc lặp lại: ba ngành, ba cách, và cách Mira chọn

> Lane `giao-dien`. Mã N-225 → N-230. Ngày 25/11/2026.
> Khởi nguồn từ một màn hình hỏng: `/thoi-gian/personal` có 28 dòng "Ăn tối 30m" giống hệt
> nhau. Hai mươi tám dòng chở đúng một bit thông tin.

## Bài toán thật ra là hai bài

Dễ nhầm thành một. Tách ra mới giải được:

1. **Lưu thế nào.** Một luật lặp, hay N bản ghi?
2. **Hiện thế nào.** Danh sách có nhiều dòng giống nhau thì làm gì?

Mira đang dính cả hai, và cái thứ nhất là gốc: Founder **nói một luật** ("ngủ 23h–6h, xem
như repeat"), script **lưu 28 sự kiện**.

---

## N-225 Lịch (RFC 5545): lưu luật, vá bằng ngoại lệ

**Nguồn:** `icalendar.org/iCalendar-RFC-5545`, `devguide.calconnect.org/iCalendar-Topics/Recurrences`.
Tin: cao (tiêu chuẩn IETF, hơn hai mươi năm triển khai).

Một sự kiện gốc mang `DTSTART` + `RRULE`. Ngày bỏ thì thêm vào `EXDATE`. Ngày sửa riêng thì
tạo một bản ghi đè, khoá bằng `RECURRENCE-ID` trỏ về giờ gốc. Bản ghi đè **không được** mang
`RRULE` của riêng nó.

**Cảnh báo quan trọng từ CalConnect:** sửa riêng đủ nhiều ngày thì khối dữ liệu phình to hơn
cả việc lưu từng ngày ngay từ đầu, mà độ phức tạp thì gấp mấy lần.

Các bẫy đã có người trả giá, ghi lại vì nếu Mira đi đường này sẽ gặp đúng chúng:

- **Lệch múi giờ:** Microsoft ghi nhận trường hợp `DTSTART` và `EXDATE` khác múi giờ thì ngày
  loại trừ **không có tác dụng**, im lặng.
- **Huỷ không đồng bộ:** Google Calendar API không sửa `EXDATE` khi một lần bị huỷ, client
  phải tự đối chiếu.
- **Nylas khuyên** gắn metadata trỏ ngược về sự kiện cha thay vì sửa `EXDATE`, vì xoá cha thì
  bản ghi đè vẫn sống sót lơ lửng.

## N-226 Syslog: gộp lúc hiện, không gộp lúc ghi

**Nguồn:** `docs.rsyslog.com`, `support.oneidentity.com` (syslog-ng), `docs.nxlog.co`.
Tin: cao (phần mềm hạ tầng, tài liệu chính thức).

syslog-ng gửi một dòng rồi kèm `Last message repeated n times`. rsyslog có tính năng tương
đương nhưng **mặc định tắt**, và tài liệu nói thẳng lý do:

> hầu hết công cụ phân tích log cần nhìn thấy các dòng lặp, chúng không xử lý được định dạng
> "last message repeated".

Bản cũ còn gộp ở phía đầu ra, nên hai tiến trình khác nhau phát ra chuỗi giống nhau bị gộp
làm một. Logwatch từng viết script bung các dòng đó ra, rồi tác giả bỏ luôn vì file tạm quá to.

**Bài học kỹ thuật:** so sánh thì **bỏ qua trường hay đổi**. `uniqseq` bỏ 16 ký tự đầu mỗi
dòng (dấu thời gian) trước khi so. Và một yêu cầu trên bug tracker của MAAS chỉ ra điểm tinh
tế: dòng gộp giữ được **mốc đầu và mốc cuối** mới cho biết các lần lặp trải trong bao lâu;
gộp ở phía client mà chỉ đếm số lần thì mất thông tin đó.

## N-227 ⚑ Ngân hàng: không đổi mô hình lưu, chỉ suy ra khi hiện

**Nguồn:** `plaid.com/blog/recurring-transactions`, Monarch, DocuClipper, Tink.
Tin: vừa (blog nhà cung cấp, không phải tiêu chuẩn).

Đây là ngành gần Mira nhất, và họ chọn khác cả hai ngành trên: **mỗi giao dịch vẫn là một bản
ghi riêng**. Nếp lặp được *suy ra* khi hiển thị, và bấm vào vẫn xem lại được từng giao dịch.

Cách dò, lấy từ Plaid và vài bản mã nguồn mở:

- Chuẩn hoá tên người bán trước khi gom.
- Gom theo tên + nhịp + số tiền **trong một biên dung sai**.
- Cần ít nhất 2 lần mới gọi là nếp.
- Số tiền dao động quá biên thì **loại**, ví dụ hoá đơn siêu thị. Đây mới là chỗ quan trọng.
- Một lần đổi rồi ổn định ở mức mới thì đọc là **đổi giá**, không phải khoản mới.

**Giới hạn họ thừa nhận:** mọi thuê bao mua trong iPhone đều ghi dưới một tên Apple, không
tách được. Và một thuê bao mới thường chỉ bị phát hiện sau lần tính tiền thứ hai hoặc thứ ba.

## N-228 Giao diện lịch: ba lựa chọn, không có cái nào thắng hẳn

**Nguồn:** GNOME Calendar issue 991, The Events Calendar forums, HCL Connections ideas.
Tin: thấp (phần lớn là than phiền và đề nghị tính năng, nhiều cái đã đóng với trạng thái
"không có kế hoạch").

Ba cách đã thử trong thực tế:

| Cách | Nhược đã có người kêu |
|---|---|
| Chỉ hiện lần sắp tới, kèm "xem tất cả" | Mất phần đã qua, không thấy nếp |
| Ẩn các lần con, chỉ giữ lần đầu | Không biết dòng nào thuộc chuỗi nào |
| Gom thành một dòng kèm nhãn lặp | Cần thiết kế riêng cho dòng gom |

Không có tài liệu hướng dẫn chính thức nào. Đây là vùng chưa ai chốt.

## N-229 ⚑ Lỗi tự gây ra khi dựng, và bài học rút ra

Bản đầu của dòng gom lấy **số phút hay gặp nhất** làm chuẩn rồi liệt kê những ngày lệch.
Chạy với dữ liệu thật thì màn Lãng phí hiện:

> *17 ngày không theo nếp*

Trên tổng 24 ngày. Mười bảy phần hai mươi tư thì **không còn nếp nào để mà lệch**. Cái gọi là
chuẩn chỉ là con số hay gặp nhất trong một đống số khác nhau, và bày nó ra như một chuẩn là
bịa ra một nếp không có thật.

Đúng cái bẫy ngân hàng đã tránh bằng biên dung sai. Phải tách **hai loại nếp**:

- **Nếp cứng** — hầu hết ngày cùng một số. Nói "30m mỗi ngày, trừ 2 ngày", và kể tên 2 ngày đó.
- **Nếp mềm** — số nào cũng khác. Nói **khoảng và trung bình**, vẽ thanh thành một đoạn trôi
  chứ không phải một thanh đầy, vì thanh đầy ngụ ý một con số chuẩn mà dữ liệu không có.

Ngưỡng hiện đặt ở một phần ba. Con số chọn tay, không đo được. Nhưng hướng thì chắc.

## N-230 ⚑ Chốt cho Mira, và một món nợ dữ liệu

**Hiển thị: theo ngân hàng.** Giữ N bản ghi, gom lúc hiện, bấm vào xem lại từng ngày. Đã dựng
ở `web/src/lib/gom.ts`, 16 test. Lý do không theo lịch: Mira không có lịch, không có lời mời,
không có múi giờ chéo nhau. Lấy `RRULE` về là rước một bộ máy để giải một bài không có.

**Lấy của syslog hai thứ:** giữ mốc đầu và mốc cuối trên dòng gom, và bỏ qua trường hay đổi
khi so (ở đây là ngày; gom theo việc chứ không theo ngày).

**Điều đáng xem là chỗ nếp đứt.** Một nếp đều tăm tắp không kể được chuyện gì. Nên nhóm gom
theo **việc**, không theo số phút — gom theo số phút thì đúng mấy ngày đáng nói nhất lại rơi
ra ngoài nhóm và nằm lẫn trong danh sách.

### Món nợ: 28 bản ghi đó không phải 28 quan sát

Phải nói rõ vì nó ảnh hưởng tới mọi con số phía sau. Bộ dữ liệu Thời gian sử dụng có **4 số
tuần thật**, script chia đều cho 7 ngày. Khung ngày khai báo thì là **một luật**, không phải
28 lần quan sát.

Nghĩa là 28 hàng trong CSDL đang **nói dối về độ tin của chính chúng**. Cột `source` hiện ghi
`manual` cho cả hai loại, trong khi `manual` nên chỉ dành cho thứ người dùng tự gõ.

Việc cần làm: thêm giá trị `source` cho dữ liệu suy ra (`nhap` hoặc `nep`), rồi màn hình hiện
khác đi — số do máy rải ra không nên trông giống số người ngồi ghi.

Gom lại là bước đầu, và nó đã **thành thật hơn** bản cũ: một dòng "mỗi ngày · 24 lần" gần với
sự thật ("đây là một nếp") hơn là 24 dòng giả vờ mỗi dòng một quan sát độc lập.
