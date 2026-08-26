# Chỉ mục phát hiện nghiên cứu

> Sinh và duy trì bởi skill `mira-nghien-cuu`. Mỗi dòng là một phát hiện có mã `N-xxx`.
> Đọc file này **trước** mỗi lần chạy để không lặp lại việc đã làm.

Thư mục này khác `docs/nguon/kiem-ke*.md`: kiểm kê là bảng nguồn **đặc tả nội bộ** do skill
`phan-tich-yeu-cau` sinh; ở đây là **nguồn ngoài** tìm về từ internet. Hai loại không trộn.

## Quy ước

- Mã `N-xxx` chạy liên tục, không reset theo ngày hay theo lane. Số mới = số lớn nhất + 1.
- Cột **Tin**: `cao` / `vừa` / `thấp` theo `.claude/skills/mira-nghien-cuu/references/nguon-va-do-tin.md`.
- Dấu `⚑` trong cột Tiêu đề: phát hiện chạm vào ba rủi ro đã biết trong `docs/00-vision.md`,
  hoặc lật ngược một con số đang dùng trong bài đã draft.

## Bảng phát hiện

| Mã | Ngày | Lane | Tiêu đề | Tin | File |
|---|---|---|---|---|---|
| N-001 | 25/08/2026 | nguyen-lieu | Thu nhập bình quân lao động quý I/2026: 9,0 triệu đ/tháng | cao | [file](2026-08-25-nguyen-lieu.md) |
| N-002 | 25/08/2026 | nguyen-lieu | Thu nhập bình quân quý II/2026 giữ 9 triệu, giảm nhẹ so quý I | vừa | [file](2026-08-25-nguyen-lieu.md) |
| N-003 | 25/08/2026 | nguyen-lieu | ⚑ Nhân vật "lương 30 triệu" = 3,33 lần bình quân, không phải người trung bình | cao | [file](2026-08-25-nguyen-lieu.md) |
| N-004 | 25/08/2026 | nguyen-lieu | ⚑ Giờ làm bình quân 42,5 h/tuần; gần 29% làm trên 48 giờ | vừa | [file](2026-08-25-nguyen-lieu.md) |
| N-005 | 25/08/2026 | nguyen-lieu | ⚑ Tỷ giá đời ở mặt bằng chung ≈49.000đ/giờ, không phải 115.000đ/giờ | cao | [file](2026-08-25-nguyen-lieu.md) |
| N-006 | 25/08/2026 | nguyen-lieu | Chi tiêu bình quân đầu người 2024: gần 3 triệu đ/tháng (46.995 hộ) | cao | [file](2026-08-25-nguyen-lieu.md) |
| N-007 | 25/08/2026 | nguyen-lieu | TP.HCM: 10 km mất 30 phút 14 giây | vừa | [file](2026-08-25-nguyen-lieu.md) |
| N-008 | 25/08/2026 | nguyen-lieu | Đề xuất giảm giờ làm khu vực tư 48 → 44 giờ/tuần từ 2026 | vừa | [file](2026-08-25-nguyen-lieu.md) |
| N-009 | 25/08/2026 | nguyen-lieu | ILO: 2.320 giờ làm/năm, khu vực FDI 51 giờ/tuần (số cũ) | vừa | [file](2026-08-25-nguyen-lieu.md) |
| N-010 | 25/08/2026 | nguyen-lieu | Hai con số giờ làm chính thức nói ngược nhau (mâu thuẫn N-004 ↔ N-009) | — | [file](2026-08-25-nguyen-lieu.md) |
| N-011 | 26/08/2026 | nguyen-lieu | Thu nhập ↔ hạnh phúc tuyến tính theo log; chỉ 20% kém hạnh phúc nhất mới phẳng (n=33.391) | cao | [file](2026-08-26-nguyen-lieu.md) |
| N-012 | 26/08/2026 | nguyen-lieu | Phân tích lại: mức phẳng ở ~200.000 USD, không phải 100.000 (mâu thuẫn N-011) | vừa | [file](2026-08-26-nguyen-lieu.md) |
| N-013 | 26/08/2026 | nguyen-lieu | ⚑ Mua thời gian tăng hài lòng (d=0,24); gần một nửa trong 818 triệu phú không mua | cao | [file](2026-08-26-nguyen-lieu.md) |
| N-014 | 26/08/2026 | nguyen-lieu | ⚑ Ăn lương theo giờ → tình nguyện ít hơn 36% và kém vui hơn khi tình nguyện | vừa | [file](2026-08-26-nguyen-lieu.md) |
| N-015 | 26/08/2026 | nguyen-lieu | Cập nhật N-008: 44 giờ/tuần chưa thành luật, trình Quốc hội dự kiến 10/2026 | vừa | [file](2026-08-26-nguyen-lieu.md) |
| N-016 | 26/08/2026 | nguyen-lieu | World Happiness Report 2026: Việt Nam hạng 45/147, điểm 6,428 | vừa | [file](2026-08-26-nguyen-lieu.md) |

## Hướng đã moi mà rỗng

Ghi ở đây sau khi một hướng rỗng **ba lần** — để lần sau khỏi đâm lại bức tường đó.

| Hướng | Lane | Số lần thử | Ghi chú |
|---|---|---|---|
| Phân vị thu nhập VN (30 triệu = top bao nhiêu %) | nguyen-lieu | 1 | Chỉ có số bình quân, không có trung vị/phân vị. Chưa thử dữ liệu vi mô VHLSS qua World Bank/ILO |
| Thời gian đi làm (commute) trung bình chính thức của VN | nguyen-lieu | 2 | Nhiều khả năng không tồn tại khảo sát chính thức. Chỉ suy được từ dữ liệu giao thông |
| Trang TomTom Traffic Index cho TP.HCM (số trực tiếp) | nguyen-lieu | 1 | Fetch được trang nhưng nội dung số bị cắt. Chưa thử file PDF báo cáo |
| Báo cáo Điều tra lao động việc làm 2024 bản đầy đủ | nguyen-lieu | 1 | Landing page không có số; cần tải PDF từ nso.gov.vn |
| Bài gốc trên pnas.org (Whillans 2017, Killingsworth 2023) | nguyen-lieu | 2 | pnas.org trả HTTP 403. **Đã có lối vòng**: dùng pmc.ncbi.nlm.nih.gov |
| Bản PDF gốc DeVoe & Pfeffer 2007 (số 36% tình nguyện) | nguyen-lieu | 1 | Trang Rotman có PDF nhưng là bài khác. Chưa thử tra qua DOI |
