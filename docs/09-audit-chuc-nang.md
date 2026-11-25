# Audit chức năng: xem, thêm, chi tiết, sửa, xoá

> Ngày 25/11/2026. Kiểm bằng tay trên bản chạy thật, tài khoản `danhthu`, không chỉ đọc mã.
> Dữ liệu rác tạo lúc thử đã xoá bằng `npm run nap`.

## Bảng tổng

Mỗi thực thể, năm việc. `API` là máy chủ có làm được không; `UI` là người dùng có bấm được không.

| Thực thể | Xem danh sách | Thêm | Chi tiết | Sửa | Xoá |
|---|---|---|---|---|---|
| **Giờ** | API ✓ UI ✓ | API ✓ UI ✓ | API ✓ UI ✓ | API ✓ **UI ✗** | API ✓ **UI ✗** |
| **Hạt** (kẹo/muối) | API ✓ UI ✓ | API ✓ UI ✓ | API ✓ UI ✓ | **không có** | **không có** |
| **Tiền** | API ✓ **UI ✗** | API ✓ UI ✓ | API ✓ UI ✓ | API ✓ UI ✓ | **không có** |
| **Mục tiêu** | API ✓ UI ✓ | API ✓ UI ✓ | **không có** | **không có** | kết thúc ✓ |
| **Thói quen** | API ✓ UI ✓ | API ✓ UI ✓ | **không có** | **không có** | dừng ✓ |
| **Tài khoản** | — | Google ✓ | ✓ tên hiển thị | **không có** | **không có** |

## Chạy thật thì ổn

Thử tay từng cái trên máy, không đoán:

| Việc | Kết quả |
|---|---|
| Thêm hạt kẹo rồi hạt muối từ trang chủ | ✓ hiện ngay, mở Hũ thấy cả hai, gom đúng theo tháng |
| Thêm 1,5 giờ Gia đình | ✓ danh sách cập nhật, donut đổi 8,6% → 9,8% |
| Điền năm ô tiền | ✓ vốn tự do 15,0 tháng, nợ giữ lại 10,0 tháng, mức dư 16,7% |
| Tạo mục tiêu tầng Quý | ✓ hạn 23/02/2027, đúng 90 ngày |
| Tạo thói quen, đánh dấu rồi bỏ đánh dấu | ✓ 0/4 → 1/4 → 0/4 |
| Bốn thẻ trang chủ, bốn lát donut | ✓ đều mở ra màn chi tiết |
| Gom nếp lặp | ✓ 24 mục còn 1 dòng |

---

## Lỗi phải sửa

### 1 ⚑ Xuất file làm mất lịch sử thói quen

**Nặng nhất trong bảng này**, vì nó mất dữ liệu qua chính tính năng sao lưu.

`NhapXuat.tsx → xuat()` lấy thói quen bằng `store.habitWeek(hôm nay)`. Mà `habitWeek` trong
`be/src/services/habit.ts`:

- gọi `findActive()` → **thói quen đã dừng không có trong file xuất**
- gọi `checksInRange(weekStart, +6)` → **chỉ bảy ngày của tuần này**

Xuất rồi nhập lại là mất sạch mọi lần đánh dấu trước thứ Hai, và mất luôn mọi thói quen đã
dừng. Im lặng, không báo gì.

Chỗ này là hai quyết định đúng va vào nhau. Chú thích trong `habit.ts` viết:

> *Chỉ đọc đúng bảy ngày của tuần đang xem. Không có hàm nào ở đây nhìn ra ngoài tuần đó,
> nên không có cách nào tính được chuỗi ngày — đó là chủ ý, không phải thiếu sót.*

Chủ ý đó đúng cho giao diện. Nhưng nó khiến **không có đường nào lấy lịch sử ra**, kể cả khi
người dùng muốn mang dữ liệu của chính mình đi. Phải thêm một route riêng cho xuất, tách khỏi
route mà màn Thói quen dùng.

### 2 ⚑ Ghi sai giờ thì chịu, không sửa không xoá được

`PATCH /time-entries/:id` và `DELETE /time-entries/:id` **có trên máy chủ**, `updateTimeEntry`
và `deleteTimeEntry` **có trong api-client**, và **không màn nào gọi**. Mã chết.

Gõ `15` thay vì `1.5` là xong, con số sai đó nằm lại trong donut mãi mãi. Đường duy nhất để
sửa là xuất file, sửa tay bằng text editor, nhập lại.

Đây là lỗ dễ vá nhất trong danh sách: đường ống đã thông cả, chỉ thiếu nút bấm.

### 3 Tài chính đóng cứng ở tháng hiện tại

`MoneyScreen` đặt `const month = monthOf(today())`, không có nút lùi tháng. API `GET /money/:month`
nhận mọi tháng, nhưng giao diện chỉ cho xem tháng này.

Hệ quả: không bao giờ nhìn được tháng trước. Mà vốn tự do chỉ có nghĩa khi so được với lần
trước — một con số đứng một mình không nói được nó đang lên hay xuống.

### 4 Thời gian cũng đóng cứng ở tuần hiện tại

Cùng một lỗi, chỗ khác. `TimeScreen` chốt `weekStartOf(today())`. Màn chi tiết có vẽ bốn cột
tuần nên đỡ hơn, nhưng vẫn không bấm vào cột nào được.

Mira bán ý tưởng "nhìn lại". Hiện tại nhìn lại được xa nhất là bốn cột trên một biểu đồ.

### 5 Hạt đã bỏ vào hũ thì không gỡ ra được

Không có `PATCH` lẫn `DELETE` cho hạt, cả máy chủ lẫn giao diện. Tôi từng viết trong
`HuScreen.tsx` rằng đó là chủ ý: *"nhật ký sửa được là nhật ký không tin được"*.

Câu đó nghe hay nhưng chưa ai quyết. Gõ nhầm một chữ, hay lỡ bấm Hạt muối khi định bấm Viên
kẹo, thì vết đó nằm lại vĩnh viễn. **Đây là câu hỏi sản phẩm, không phải lỗi kỹ thuật** — cần
Founder chốt. Đường giữa thường gặp: cho sửa trong 24 giờ đầu, sau đó khoá.

### 6 Mục tiêu và thói quen không sửa được tên

Tạo xong là cố định. Đặt sai số giờ mỗi tuần thì phải kết thúc rồi tạo lại, và lần tạo lại
ăn mất một suất trong trần (3 dài hạn / 2 quý / 5 nhịp tuần).

### 7 Tài khoản thiếu ba thứ cơ bản

Không đổi được mật khẩu, không có quên mật khẩu, không xoá được tài khoản. Đã ghi từ trước
nhưng chưa làm. Với người dùng ngoài thì cả ba đều bắt buộc, riêng cái thứ ba còn là nghĩa vụ
pháp lý ở nhiều nơi.

---

## Chỗ nhỏ, nhưng là lỗi

**Đồng hồ cát hứa suông.** Màn Tôi viết *"Đồng hồ cát đang tắt. Mira không đếm ngược đời bạn
trừ khi bạn tự bật."* Không có công tắc nào. Câu đó hứa một tính năng không tồn tại — hoặc
làm công tắc, hoặc bỏ câu.

**Ngày hiển thị không nhất quán.** Màn Thời gian, mục "Ghi gần đây" in `2026-11-25`. Màn chi
tiết in `Thứ 4, 25/11`. Cùng một dữ liệu, hai cách viết, cách thứ nhất là cách máy đọc.

**Xuất file gọi 36 lần liên tiếp.** `xuat()` chạy `getMoney` 36 tháng, tuần tự, mỗi lần một
vòng mạng. Qua tunnel là hơn mười giây đứng im không báo gì. Chạy song song, hoặc thêm một
route trả cả dải tháng.

**Mục tiêu không có màn chi tiết.** Bấm vào một mục tiêu không ra gì. Không thấy được tuần
nào đã bỏ bao nhiêu giờ vào nó — mà đó chính là câu hỏi "mục tiêu này có thật không".

---

## Thứ tự nên sửa

Xếp theo thiệt hại chia cho công sức, không theo thứ tự ở trên.

1. **Nút sửa và xoá cho mục giờ.** Đường ống đã thông, chỉ thiếu nút. Nửa buổi.
2. **Xuất file lấy đủ lịch sử thói quen.** Đang mất dữ liệu thật. Cần một route mới.
3. **Lùi tuần, lùi tháng.** Hai màn, cùng một kiểu sửa. Mở ra toàn bộ phần "nhìn lại".
4. **Chốt chuyện sửa hạt.** Cần Founder quyết trước, code sau.
5. Sửa tên mục tiêu và thói quen.
6. Đổi mật khẩu, quên mật khẩu, xoá tài khoản. Bắt buộc trước khi có người dùng ngoài.
