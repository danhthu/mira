# Sáu tháng của 300 người — có tính cách, có biến cố, có bỏ cuộc

> Sinh bởi `code/tools/hanh-trinh.mjs`. Số thô theo tuần: `hanh-trinh-tuan.csv`
> (15.600 dòng — 300 người × 26 tuần × 2 nhánh).

## Mô hình này khác bản trước ở đâu

Bản trước (`thi-truong.md`) rút giờ mỗi ngày từ một phân phối cố định suốt 26 tuần. Không
có tính cách, không có trạng thái mang sang hôm sau, không có biến cố, không ai bỏ cuộc.
Cuộc đời phẳng lì — và đó là lý do nó kết luận giờ lãng phí hầu như không đổi theo tuần.

Bản này thêm bốn thứ:

1. **Tính cách** — năm nét rút một lần, ảnh hưởng suốt sáu tháng: kỷ luật, bốc đồng, lo âu,
   gắn kết người thân, tò mò về số của mình.
2. **Trạng thái ngày** — năng lượng và căng thẳng kéo sang hôm sau, không rút lại từ đầu.
   Một tuần xấu kéo theo tuần sau.
3. **Biến cố đời** — dự án gấp, ốm, con ốm, người thân ốm, đi chơi xa, được thưởng, mất
   khách, căng thẳng trong nhà. Có thời lượng, có dư âm, có ảnh hưởng tới thu nhập.
4. **Vòng lặp với app** — ghi hay không ghi mỗi ngày, bỏ hẳn sau 12 ngày liền không ghi,
   và nếu còn ghi thì hành vi đổi dần.

**Hệ số tác động của app lấy từ tài liệu đã rà, không bịa:** theo dõi tiến độ d ≈ 0,40
(Harkin 2016, N-202) và kế hoạch nếu–thì d ≈ 0,65 (Gollwitzer & Sheeran 2006, N-201), quy
sang phần trăm qua độ lệch chuẩn trong một người. Nghĩa là mô phỏng trả lời: *nếu các hệ số
trong tài liệu đúng thì sáu tháng trông thế nào* — **không** chứng minh app có tác dụng.

**300 người đối chứng dùng cùng seed**: cùng tính cách, cùng biến cố, cùng nghề. Khác duy
nhất là không cài app.

---

## 1 · Bao nhiêu người còn ghi

| Tuần | Còn dùng | Ngày ghi / tuần (người còn dùng) |
|---|---|---|
| 1 | **98%** | 2,7 |
| 2 | **96%** | 2,6 |
| 4 | **91%** | 2,4 |
| 6 | **86%** | 2,4 |
| 8 | **79%** | 2,1 |
| 12 | **67%** | 2,0 |
| 16 | **51%** | 1,9 |
| 20 | **36%** | 2,1 |
| 26 | **27%** | 1,4 |

Sau 26 tuần còn **80/300** người (27%).
Người bỏ giữa chừng bỏ ở tuần thứ **12,9** tính trung bình.

## 2 · Ai ở lại, ai bỏ

| Nét tính cách | Người ở lại | Người bỏ | Chênh |
|---|---|---|---|
| Kỷ luật | 0,60 | 0,48 | +0,12 |
| Tò mò về số của mình | 0,53 | 0,48 | +0,05 |
| Gắn kết người thân | 0,51 | 0,50 | +0,01 |
| Bốc đồng | 0,61 | 0,69 | -0,08 |
| Lo âu | 0,51 | 0,49 | +0,01 |

## 3 · Sáu tháng thay đổi được gì

Giờ trung bình mỗi tuần, tháng 1–2 so với tháng 5–6.

| Nhóm | n | Lãng phí đầu | Lãng phí cuối | Đổi | Giờ vàng đầu | Giờ vàng cuối | Đổi |
|---|---|---|---|---|---|---|---|
| Còn dùng tới cuối (app) | 80 | 29,6h | 29,0h | **-2%** | 5,6h | 5,4h | **-4%** |
| Đã bỏ giữa chừng (app) | 220 | 25,5h | 26,6h | **+4%** | 6,4h | 6,1h | **-3%** |
| Đối chứng — không cài app | 300 | 26,9h | 27,8h | **+3%** | 6,1h | 5,9h | **-4%** |

### So sánh sạch: người ở lại với chính họ ở nhánh không cài app

Cùng 80 người, cùng tính cách, cùng biến cố — chỉ khác có app hay không.

| | Có app | Không app | Chênh lệch |
|---|---|---|---|
| Giờ lãng phí, đổi sau 6 tháng | **-2%** | +2% | -4% |
| Giờ vàng, đổi sau 6 tháng | **-4%** | -5% | 2% |

## 4 · Tuần có đủ biến động để đáng mở app không

Tỷ lệ tuần mà con số đổi ít nhất 15% và nửa giờ so với tuần trước.

| Số | Mô hình phẳng (bản trước) | Mô hình có biến cố (bản này) |
|---|---|---|
| Giờ lãng phí | 12% | **45%** |
| Giờ gia đình | 41% | **60%** |
| Giờ vàng | 42% | **61%** |
| Giờ công việc | 14% | **50%** |

---

## 5 · Bốn hồ sơ

### Marketing · Vợ chồng chưa con · Thành phố tỉnh

**Tính cách:** Kỷ luật 59 · Tò mò về số của mình 56 · Gắn kết người thân 18 · Bốc đồng 49 · Lo âu 51
**App:** còn dùng tới cuối · không đặt mục tiêu · ghi 61 ngày
**Biến cố:** tuần 2 ốm · tuần 3 mất khách / cắt giờ · tuần 5 căng thẳng trong nhà · tuần 6 ốm · tuần 10 dự án gấp · tuần 18 dự án gấp · tuần 19 đi chơi xa · tuần 21 được thưởng · tuần 25 dự án gấp

| Tháng | Lãng phí/tuần | Giờ vàng/tuần | Công việc/tuần | Ngày ghi/tuần | Thu nhập |
|---|---|---|---|---|---|
| 1 | 30,8h | 4,7h | 40,8h | 3,0 | 11,3tr |
| 2 | 53,9h | 2,9h | 32,1h | 2,0 | 9,3tr |
| 3 | 25,1h | 3,7h | 58,0h | 3,0 | 13,3tr |
| 4 | 22,4h | 5,3h | 51,4h | 1,8 | 13,3tr |
| 5 | 24,5h | 4,2h | 49,4h | 2,5 | 14,1tr |
| 6 | 22,2h | 4,7h | 55,8h | 2,0 | 13,3tr |

### Sinh viên · Độc thân 22–27 · Thành phố tỉnh

**Tính cách:** Kỷ luật 46 · Tò mò về số của mình 26 · Gắn kết người thân 36 · Bốc đồng 71 · Lo âu 72
**App:** **bỏ ở tuần 1** · có đặt mục tiêu kèm khai nguồn · ghi 0 ngày
**Biến cố:** tuần 1 căng thẳng trong nhà · tuần 1 ốm · tuần 6 dự án gấp · tuần 7 ốm · tuần 8 căng thẳng trong nhà · tuần 9 ốm · tuần 12 dự án gấp · tuần 12 căng thẳng trong nhà · tuần 14 dự án gấp · tuần 18 đi chơi xa · tuần 21 dự án gấp · tuần 22 ốm · tuần 25 dự án gấp

| Tháng | Lãng phí/tuần | Giờ vàng/tuần | Công việc/tuần | Ngày ghi/tuần | Thu nhập |
|---|---|---|---|---|---|
| 1 | 65,5h | 1,4h | 26,7h | 0,0 | 2,1tr |
| 2 | 47,7h | 1,5h | 28,7h | 0,0 | 2,1tr |
| 3 | 68,6h | 1,2h | 27,7h | 0,0 | 2,1tr |
| 4 | 58,8h | 0,9h | 35,1h | 0,0 | 2,1tr |
| 5 | 36,7h | 2,7h | 28,6h | 0,0 | 2,1tr |
| 6 | 44,5h | 1,4h | 32,7h | 0,0 | 2,1tr |

### Freelancer sáng tạo · Độc thân 28–34 · Thị trấn / nông thôn

**Tính cách:** Kỷ luật 95 · Tò mò về số của mình 65 · Gắn kết người thân 45 · Bốc đồng 25 · Lo âu 80
**App:** còn dùng tới cuối · có đặt mục tiêu kèm khai nguồn · ghi 74 ngày
**Biến cố:** tuần 3 người thân ốm · tuần 3 dự án gấp · tuần 3 ốm · tuần 6 dự án gấp · tuần 7 ốm · tuần 8 mất khách / cắt giờ · tuần 11 dự án gấp · tuần 11 ốm · tuần 16 ốm · tuần 24 dự án gấp

| Tháng | Lãng phí/tuần | Giờ vàng/tuần | Công việc/tuần | Ngày ghi/tuần | Thu nhập |
|---|---|---|---|---|---|
| 1 | 28,2h | 2,2h | 42,7h | 3,5 | 8,9tr |
| 2 | 32,6h | 1,8h | 43,5h | 2,0 | 7,8tr |
| 3 | 45,5h | 1,6h | 30,1h | 2,5 | 6,0tr |
| 4 | 24,4h | 2,7h | 46,5h | 3,8 | 8,9tr |
| 5 | 24,5h | 2,8h | 43,1h | 3,8 | 8,9tr |
| 6 | 22,2h | 2,2h | 52,6h | 2,0 | 8,9tr |

### Tài xế công nghệ · Độc thân 28–34 · Thị trấn / nông thôn

**Tính cách:** Kỷ luật 97 · Tò mò về số của mình 56 · Gắn kết người thân 56 · Bốc đồng 24 · Lo âu 39
**App:** **bỏ ở tuần 14** · không đặt mục tiêu · ghi 32 ngày
**Biến cố:** tuần 3 ốm · tuần 4 dự án gấp · tuần 8 đi chơi xa · tuần 10 dự án gấp · tuần 14 dự án gấp · tuần 15 đi chơi xa · tuần 18 dự án gấp · tuần 21 căng thẳng trong nhà · tuần 22 căng thẳng trong nhà

| Tháng | Lãng phí/tuần | Giờ vàng/tuần | Công việc/tuần | Ngày ghi/tuần | Thu nhập |
|---|---|---|---|---|---|
| 1 | 12,7h | 3,1h | 64,0h | 2,3 | 6,3tr |
| 2 | 12,5h | 3,4h | 64,8h | 2,8 | 6,3tr |
| 3 | 12,3h | 2,8h | 78,1h | 2,8 | 6,3tr |
| 4 | 12,2h | 3,6h | 70,0h | 0,3 | 6,3tr |
| 5 | 12,0h | 2,9h | 78,9h | 0,0 | 6,3tr |
| 6 | 18,9h | 2,4h | 66,9h | 0,0 | 6,3tr |
