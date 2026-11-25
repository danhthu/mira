# Số nào mang tín hiệu, số nào là nhiễu

> Sinh bởi `code/tools/tin-hieu.mjs` trên đúng dân số 300 người của `thi-truong.md`.
> Vẫn là mô phỏng, không phải người thật — xem phần giới hạn ở `thi-truong.md`.

Ba câu hỏi cho mỗi con số Mira bày ra:

1. **Phân biệt người** — số này có khác nhau giữa người với người không? Số nào ai cũng
   giống ai thì không dùng để định vị được.
2. **Trùng lặp** — hai số có đang nói cùng một điều không?
3. **Đổi theo tuần** — tuần sau mở app, số này có khác đi đủ để đáng nhìn không? Đây là thứ
   quyết định người ta còn quay lại (N-208).

---

## 1 · Phân biệt người đến đâu

Cột **p10 → p90** là khoảng giữa người thứ 10% và người thứ 90%. Khoảng hẹp nghĩa là con số
đó gần như nhau với mọi người.

| Số | p10 | Trung vị | p90 | Hệ số biến thiên |
|---|---|---|---|---|
| Nợ giữ lại | 0,0tháng | **0,0tháng** | 50,5tháng | 1,40 |
| Biên độ mức dư | 2,9điểm % | **13,2điểm %** | 67,4điểm % | 1,10 |
| Mức dư trung bình | 7,5% | **36,5%** | 58,7% | 0,61 |
| Vốn tự do | 2,8tháng | **8,3tháng** | 16,4tháng | 0,59 |
| Giờ vàng / tuần | 2,6h | **7,9h** | 15,0h | 0,57 |
| Thu nhập | 5,8tr | **11,7tr** | 25,4tr | 0,55 |
| Giờ gia đình / tuần | 5,6h | **13,8h** | 22,0h | 0,46 |
| Tỷ lệ lãng phí | 11,2% | **18,2%** | 27,2% | 0,34 |
| Giờ lãng phí / tuần | 9,5h | **15,3h** | 22,3h | 0,32 |
| Giờ công việc / tuần | 38,6h | **50,9h** | 67,4h | 0,21 |
| Tổng đã ghi / tuần | 75,3h | **86,5h** | 100,1h | 0,11 |

## 2 · Số nào nói lại điều số khác đã nói

Tương quan tuyệt đối từ 0,55 trở lên. Từ **0,8** trở lên thì bày cả hai chỉ tốn chỗ.

| Cặp số | r | |
|---|---|---|
| Giờ gia đình / tuần ↔ Giờ vàng / tuần | 0,99 | **trùng — bỏ một** |
| Giờ lãng phí / tuần ↔ Tỷ lệ lãng phí | 0,96 | **trùng — bỏ một** |
| Giờ công việc / tuần ↔ Tỷ lệ lãng phí | -0,82 | **trùng — bỏ một** |
| Giờ lãng phí / tuần ↔ Giờ công việc / tuần | -0,71 | gần nhau |
| Giờ công việc / tuần ↔ Tổng đã ghi / tuần | 0,63 | gần nhau |
| Giờ gia đình / tuần ↔ Tổng đã ghi / tuần | 0,61 | gần nhau |
| Giờ vàng / tuần ↔ Tổng đã ghi / tuần | 0,61 | gần nhau |

## 3 · Đổi theo tuần đến đâu

**Tỷ lệ tuần đáng nhìn**: phần trăm số tuần mà con số đổi ít nhất 15% và ít nhất nửa giờ so
với tuần trước.

**Người "đứng yên"**: số người mà con số này đổi đáng kể ở dưới 20% số tuần — với họ, màn
hình đó tuần nào cũng như tuần nào.

| Số | Tuần đáng nhìn | Người đứng yên | SD giữa người | SD trong một người | Tỷ số | Nên dùng để nói |
|---|---|---|---|---|---|---|
| Giờ lãng phí | **12%** | 247/300 | 5,1h | 1,1h | 4,89 | **bạn là ai** |
| Giờ gia đình | **41%** | 42/300 | 6,0h | 1,7h | 3,47 | **bạn là ai** |
| Giờ vàng | **42%** | 27/300 | 4,5h | 1,1h | 4,11 | **bạn là ai** |
| Giờ công việc | **14%** | 184/300 | 10,7h | 3,3h | 3,26 | **bạn là ai** |
| Tổng đã ghi | **3%** | 289/300 | 9,1h | 3,3h | 2,74 | **bạn là ai** |

## 4 · Số nào kéo điểm phù hợp

| Số | Tương quan với điểm |
|---|---|
| Giờ lãng phí / tuần | 0,57 |
| Giờ công việc / tuần | -0,53 |
| Tỷ lệ lãng phí | 0,49 |
| Giờ vàng / tuần | 0,32 |
| Giờ gia đình / tuần | 0,30 |
| Vốn tự do | 0,28 |
| Nợ giữ lại | 0,13 |
| Thu nhập | 0,13 |
| Mức dư trung bình | -0,13 |
| Tổng đã ghi / tuần | 0,04 |
| Biên độ mức dư | -0,02 |
