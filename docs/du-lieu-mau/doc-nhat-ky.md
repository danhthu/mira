# Đổi nhóm nhắm ăn đứt làm thêm tính năng

> Kèm `nhat-ky.md` (bảng số). Viết tay, không bị ghi đè.

## Kết quả một dòng

**Chỉ đổi nhóm nhắm sang người vốn đã ghi nhật ký — không sửa một dòng mã nào — cho kết quả
tốt hơn làm cả bốn cải tiến trên dân số chung.**

| | Giữ tuần 26 | Giờ lấy lại / người đăng ký | Khá hơn rõ rệt |
|---|---|---|---|
| Dân số chung, hiện tại | 27% | 12,8h | 16% |
| Dân số chung + **cả bốn cải tiến** | 83% | 30,5h | 62% |
| **Người hay ghi nhật ký, không cải tiến gì** | **86%** | **42,5h** | **82%** |
| Người hay ghi nhật ký + cả bốn cải tiến | 99% | 54,2h | 97% |

Bốn cải tiến tốn hàng tháng làm. Đổi nhóm nhắm tốn một câu trong phần mô tả trên store.

---

## Vì sao chênh lệch lớn như vậy

Mọi phân tích trong tuần này đều chỉ về cùng một chỗ: **chi phí ghi chép là nút thắt**.
Giá trị trung bình 61,9, chi phí ghi 57,5 — gần như triệt tiêu nhau.

Người đã có thói quen viết nhật ký là nhóm **đã trả trước phần chi phí đó**. Họ không phải
học một thói quen mới; họ đổi chỗ đặt một thói quen đã có. Mira chỉ xin thêm sáu mươi giây
vào một việc họ đang làm mười lăm phút mỗi ngày.

Số đọc được từ mô phỏng:

| | Dân số chung | Hay ghi nhật ký |
|---|---|---|
| Ngày ghi trong 6 tháng | 36,5 | **79,5** |
| Hạt bỏ vào hũ | 8,5 | **47,5** |
| Không đủ dữ liệu để Mira kể gì | **44%** | **4%** |

Con số cuối là chỗ đổi đời: từ gần một nửa người đăng ký mà app không nói được câu nào,
xuống còn một phần hai mươi lăm.

---

## Hệ quả lớn nhất: hũ phải đổi chỗ ⚑

**47,5 hạt mỗi người** so với 8,5 — gấp **5,6 lần**.

Hôm qua tôi kết luận rằng Mira nhìn thấy tin xấu gấp năm lần tin tốt (mất việc 68%, được
thưởng 12%), và rằng **hũ là đối trọng duy nhất** để câu chuyện không lệch về phía buồn.

Với nhóm này, đối trọng đó mạnh gấp năm lần rưỡi. Hũ thôi là một ô trên trang chủ; nó trở
thành phần lớn nhất của dữ liệu.

**Nên đảo thứ bậc sản phẩm.** Hiện Mira định vị là ứng dụng đo ba trụ, và hũ là một lớp phụ
để giữ chân. Với người hay ghi nhật ký thì ngược lại:

> **Mira là một cuốn nhật ký biết đếm.**

Không phải một app đo đạc có thêm chỗ viết. Viết là việc chính, và bốn con số là thứ cuốn
nhật ký tự rút ra từ những gì bạn đã viết.

Thay đổi này không cần viết lại mã — bốn màn đã có. Nó thay đổi thứ tự màn, câu mở đầu, và
cách mô tả trên store.

---

## Cái giá: nhóm nhỏ hơn nhiều

Đây là mặt trái, và nó có thật.

Mô phỏng đo **giá trị trên mỗi người**, không đo **có bao nhiêu người**. Người ghi nhật ký
đều đặn là một nhóm hẹp hơn hẳn dân số chung.

Phép tính để cân:

```
42,5h × số người ghi nhật ký   so với   12,8h × dân số chung
```

Hai vế bằng nhau khi nhóm ghi nhật ký bằng **30%** dân số chung có thể tiếp cận. Trên 30%
thì nhắm hẹp thắng cả về tổng tác động, dưới 30% thì thua về tổng nhưng vẫn thắng về chất.

Tôi không có số liệu về tỷ lệ người Việt ghi nhật ký đều đặn. **Đó là con số cần tìm trước
khi quyết** — và nó tìm được: hỏi trong các nhóm bullet journal, đếm lượng tìm kiếm, xem số
lượt tải app nhật ký tiếng Việt.

Một điểm an ủi: nhóm này **dễ tìm** hơn dân số chung rất nhiều. Họ tụ tập ở những chỗ nhận
ra được, họ nói về thói quen của mình, và họ giới thiệu cho nhau. Chi phí tiếp cận một người
trong nhóm hẹp có thể thấp hơn chi phí tiếp cận một người bất kỳ.

---

## Ba việc nên làm

**1 · Tìm xem nhóm này lớn cỡ nào ở Việt Nam.** Đây là câu hỏi chặn, phải trả lời trước.
Ngưỡng 30% quyết định nhắm hẹp hay nhắm rộng.

**2 · Nếu đủ lớn, đảo thứ bậc.** Ô nhập khoảnh khắc lên đầu trang chủ — đã làm rồi. Thêm:
màn Khoảnh khắc thành tab riêng thay vì nằm ké trang chủ, và câu mô tả đổi từ *"đo ba trụ
đời"* sang *"cuốn nhật ký biết đếm"*.

**3 · Vẫn làm hạt cũ nổi lên.** Với nhóm này nó còn giá trị hơn: 47,5 hạt trong sáu tháng
nghĩa là có đủ chất liệu để "hôm nay ba tháng trước" không bao giờ lặp lại. Với dân số chung
8,5 hạt thì tính năng đó cạn sau vài lần.

## Nhắc lại giới hạn

Năm giả định về nhóm này — tò mò cao, ma sát còn 45%, hào hứng nhạt chậm hơn 2,2 lần, hạt
nhiều gấp 2,6 lần — đều do tôi đặt. **Hướng** thì gần như chắc chắn: người đã viết mỗi ngày
sẽ ghi nhiều hơn người chưa. **Độ lớn** thì không có cơ sở nào ngoài phỏng đoán.

Cách kiểm rẻ nhất: tìm mười người đang ghi nhật ký đều đặn, cho họ dùng bốn tuần, đo số ngày
ghi và số hạt. Nếu ra gần 79,5 ngày và 47,5 hạt quy đổi theo tỷ lệ thì giả định đứng.
