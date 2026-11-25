# 300 người, 6 tháng — Mira hợp với ai

> Sinh bởi `code/tools/population.mjs` (seed cố định). Số thô: `dan-so.csv`.
> 300 người, mỗi người 26 tuần, 15 nghề × 5 giai đoạn sống × 3 vùng.

## Đọc cái này trước

Đây là **mô phỏng từ tham số do người viết đặt**, không phải dữ liệu người thật. Nó trả lời
được đúng một câu: *với nhịp sống giả định như vậy, các phép tính của Mira có ra con số đáng
nhìn không.*

Nó **không** trả lời được: ai sẽ thích dùng, ai chịu ghi mỗi ngày, ai chịu trả tiền. Những
câu đó chỉ có người thật mới trả lời. Mọi kết luận thị trường dưới đây là **giả thiết cần đi
kiểm**, không phải kết quả.

## Điểm được chấm thế nào

Bốn thành phần giá trị, mỗi cái 0–100, tính **từ chính đầu ra của Mira** — nếu một phép tính
của app không ra con số đáng nhìn cho người này thì điểm thấp:

| Thành phần | Trọng số | Ý nghĩa |
|---|---|---|
| Rò rỉ | 30% | Donut có nhóm nào đủ lớn để giật mình không (mốc: 1h lãng phí mỗi ngày) |
| Tín hiệu tiền | 26% | Vốn tự do có nghĩa (cần tài sản để chia) + nợ quy ra tháng tự do |
| Tín hiệu quan hệ | 24% | Giờ vàng có tồn tại không |
| Có gì mới | 20% | Biến động giữa các tuần. Đời quá đều thì app lặp lại chính nó và người ta bỏ (N-208) |

Trừ đi **chi phí ghi chép**: nghề khó ghi (ca kíp, chạy ngoài đường) cộng số mục phải ghi mỗi
ngày. N-208 nói đây là lý do bỏ app tự theo dõi số một.

`điểm = giá trị − chi phí × 0,55`

## Theo nghề

| Nghề | n | Điểm | Xếp | Lãng phí/tuần | Giờ vàng/tuần | Vốn tự do | Chi phí ghi |
|---|---|---|---|---|---|---|---|
| Lập trình / IT | 20 | **43** | tạm | 19,5h | 6,6h | 13,0 | 38 |
| Công chức | 20 | **43** | tạm | 22,3h | 8,0h | 9,4 | 39 |
| Hành chính văn phòng | 20 | **43** | tạm | 20,7h | 9,6h | 7,7 | 38 |
| Freelancer sáng tạo | 20 | **43** | tạm | 21,7h | 6,7h | 10,7 | 44 |
| Bán hàng online | 20 | **39** | tạm | 16,1h | 8,8h | 10,3 | 60 |
| Marketing | 20 | **39** | tạm | 18,2h | 6,2h | 9,7 | 41 |
| Nội trợ toàn thời gian | 20 | **38** | tạm | 15,0h | 11,3h | 8,1 | 54 |
| Kinh doanh | 20 | **32** | tạm | 12,7h | 7,0h | 11,2 | 63 |
| Sinh viên | 20 | **30** | yếu | 26,7h | 2,7h | 8,7 | 48 |
| Giáo viên | 20 | **28** | yếu | 12,2h | 8,0h | 5,7 | 51 |
| Kế toán / tài chính | 20 | **26** | yếu | 9,5h | 6,4h | 8,9 | 41 |
| Công nhân nhà máy | 20 | **18** | yếu | 15,2h | 7,4h | 8,4 | 82 |
| Chủ quán ăn nhỏ | 20 | **14** | không hợp | 9,0h | 11,4h | 7,7 | 85 |
| Tài xế công nghệ | 20 | **12** | không hợp | 11,5h | 8,3h | 9,5 | 91 |
| Y tá / điều dưỡng | 20 | **8** | không hợp | 10,2h | 8,2h | 8,9 | 88 |

## Theo giai đoạn sống

| Giai đoạn | n | Điểm | Rò rỉ | Tiền | Quan hệ | Mới mẻ |
|---|---|---|---|---|---|---|
| Có con nhỏ | 72 | **39** | 88 | 52 | 98 | 40 |
| Vợ chồng chưa con | 53 | **31** | 88 | 58 | 59 | 39 |
| Độc thân 28–34 | 35 | **30** | 92 | 63 | 23 | 35 |
| Có con đi học | 67 | **29** | 89 | 50 | 59 | 40 |
| Độc thân 22–27 | 73 | **23** | 92 | 57 | 19 | 37 |

## Theo thu nhập

| Mức | n | Điểm | Vốn tự do TB | Rò rỉ | Tiền |
|---|---|---|---|---|---|
| Dưới 8tr | 64 | **27** | 8,4 | 95 | 52 |
| 8–15tr | 141 | **30** | 8,9 | 88 | 55 |
| 15–25tr | 65 | **33** | 9,8 | 89 | 56 |
| Trên 25tr | 30 | **32** | 10,8 | 85 | 58 |

## Theo vùng

| Vùng | n | Điểm | Thu nhập TB | Vốn tự do TB |
|---|---|---|---|---|
| Thị trấn / nông thôn | 63 | **31** | 8,8tr | 10,6 |
| Thành phố tỉnh | 110 | **30** | 12,6tr | 9,0 |
| HCM / Hà Nội | 127 | **30** | 16,8tr | 8,6 |

## Phân bố

| | Số người | Tỷ lệ |
|---|---|---|
| Hợp (≥45) | 46 | 15% |
| Tạm (30–44) | 127 | 42% |
| Yếu (18–29) | 65 | 22% |
| Không hợp (<18) | 62 | 21% |

Điểm trung bình toàn dân số: **30.3**.
Giá trị trung bình 61.9, chi phí ghi trung bình 57.5.

## Thành phần nào kéo điểm xuống

| Thành phần | Trung bình | Số người dưới 20 điểm |
|---|---|---|
| Rò rỉ | 90 | 0 |
| Tín hiệu tiền | 55 | 24 |
| Tín hiệu quan hệ | 54 | 71 |
| Có gì mới | 39 | 0 |
