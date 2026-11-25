# Bốn vai, sáu tháng — dữ liệu mẫu và kết quả

> Sinh bởi `code/tools/personas.mjs` (seed cố định, chạy lại ra đúng bộ này).
> Khoảng: **2026-06-01 → 2026-11-30** (26 tuần).
> Mỗi vai có một file JSON cùng thư mục, đúng định dạng kho localStorage của `code/web`.
>
> Đây là dữ liệu **bịa theo mô hình**, không phải người thật. Nó dùng để kiểm xem các con số
> Mira đưa ra có nói lên điều gì không — chứ không phải để kết luận về nghề nghiệp nào.

## Nạp vào app để xem

Mở https://mira.joybit.one, bật Console rồi dán:

```js
localStorage.setItem('mira.v1', JSON.stringify(/* nội dung file <vai>.json */));
location.reload();
```

## Giờ chia theo nhóm việc

| Vai | Công việc | Gia đình | Cá nhân | Lãng phí | Đã ghi / giờ tỉnh |
|---|---|---|---|---|---|
| **Nhân viên lập trình** | 1324h (59,0%) | 110h (4,9%) | 294h (13,1%) | 519h (23,1%) | 76,7% |
| **Nhân viên kinh doanh** | 1412h (69,9%) | 164h (8,1%) | 158h (7,8%) | 288h (14,2%) | 69,0% |
| **Nhân viên kế toán** | 1191h (58,5%) | 505h (24,8%) | 136h (6,7%) | 203h (10,0%) | 69,5% |
| **Sinh viên** | 534h (25,8%) | 256h (12,4%) | 495h (23,9%) | 786h (38,0%) | 70,7% |

## Giờ vàng và luật khai nguồn

| Vai | Giờ vàng/tuần | Lãng phí/tuần | Mục tiêu cần/tuần | Đủ nguyên liệu? |
|---|---|---|---|---|
| **Nhân viên lập trình** | 2,3h | 19,8h | 6,0h | còn dư 13,8h |
| **Nhân viên kinh doanh** | 2,9h | 11,0h | 3,0h | còn dư 8,0h |
| **Nhân viên kế toán** | 14,6h | 7,8h | 2,5h | còn dư 5,3h |
| **Sinh viên** | 6,4h | 30,1h | 5,0h | còn dư 25,1h |

## Tài chính

| Vai | Mức dư TB | Thấp nhất | Cao nhất | Vốn tự do đầu → cuối | Nợ giữ lại |
|---|---|---|---|---|---|
| **Nhân viên lập trình** | 53,3% | 51,9% | 54,7% | 13,5 → **18,3** tháng | — |
| **Nhân viên kinh doanh** | 26,4% | -3,8% | 56,3% | 7,4 → **8,0** tháng | 14,6 tháng |
| **Nhân viên kế toán** | 15,8% | -3,3% | 19,6% | 14,8 → **16,4** tháng | 82,4 tháng |
| **Sinh viên** | 11,0% | -10,0% | 21,4% | 1,9 → **2,7** tháng | — |

## Hũ và thói quen

| Vai | Kẹo | Muối | Muối tới hạn | Đã trả lời | Nhẹ đi |
|---|---|---|---|---|---|
| **Nhân viên lập trình** | 29 | 11 | 8 | 6 | 4/6 |
| **Nhân viên kinh doanh** | 15 | 9 | 5 | 4 | 3/4 |
| **Nhân viên kế toán** | 36 | 24 | 21 | 19 | 12/19 |
| **Sinh viên** | 14 | 8 | 7 | 5 | 3/5 |

| Vai | Thói quen | Mục tiêu | Thực tế |
|---|---|---|---|
| Nhân viên lập trình | Ngủ trước 12h | 5 lần/tuần | **2,4** lần/tuần |
| Nhân viên lập trình | Tập gym | 3 lần/tuần | **2,0** lần/tuần |
| Nhân viên kinh doanh | Gọi về cho bố mẹ | 2 lần/tuần | **1,0** lần/tuần |
| Nhân viên kinh doanh | Đi bộ 30 phút | 4 lần/tuần | **2,0** lần/tuần |
| Nhân viên kế toán | Ăn tối cùng nhà | 5 lần/tuần | **4,1** lần/tuần |
| Nhân viên kế toán | Đi ngủ trước 11h | 5 lần/tuần | **2,6** lần/tuần |
| Sinh viên | Học từ vựng | 5 lần/tuần | **2,0** lần/tuần |
| Sinh viên | Chạy bộ | 3 lần/tuần | **1,2** lần/tuần |
