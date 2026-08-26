# PLAN — Mira V1

Bảng theo dõi tổng. Chi tiết từng step nằm trong `plans/`, mã step khớp nhau giữa hai chỗ.

Trạng thái: ⬜ chưa làm · 🟨 đang làm · ✅ xong. Chỉ skill `quy-trinh-code` được đổi ⬜ thành ✅, và chỉ sau khi build pass cùng có file debug kèm theo.

Mốc trạng thái code lấy ngày 2026-08-25. Những gì đã chạy được — công thức giờ vàng và đồng hồ cát nối thật, ba màn chính hoạt động, xuất JSON, xoá toàn bộ dữ liệu, 62 unit test cho `src/core/` — không có mặt trong bảng này. Bảng chỉ ghi phần còn thiếu.

## Sprint V1

### A · Bền vững trạng thái và cột dữ liệu còn thiếu

Chi tiết: [`plans/mira-v1-a-ben-vung-trang-thai.md`](plans/mira-v1-a-ben-vung-trang-thai.md)

| Mã | Việc | Nguồn | Ước | Trạng thái |
|---|---|---|---|---|
| A1 | Persist Settings qua lần khởi động lại | UC-10, UC-11, R-042, R-043 | nhỏ | ⬜ |
| A2 | Nối lại phiên đếm khi app bị đóng giữa chừng | UC-02 luồng ngoại lệ, A-001(2) | nhỏ | ⬜ |
| A3 | Thêm `targetWeeklyHours`, `lifeExpectancy`, `daysPerVisit` vào `person` | R-033, R-034, A-003, A-005 | vừa | ⬜ |
| A4 | Chốt nơi nhập `daysPerVisit` | R-034 | nhỏ | ⬜ |

### B · Màn chi tiết Đồng hồ cát

Chi tiết: [`plans/mira-v1-b-chi-tiet-dong-ho-cat.md`](plans/mira-v1-b-chi-tiet-dong-ho-cat.md) · cần A3, A4 xong trước

| Mã | Việc | Nguồn | Ước | Trạng thái |
|---|---|---|---|---|
| B1 | Dựng stack cho tab Đồng hồ cát | UC-08 bước 4, R-032 | nhỏ | ⬜ |
| B2 | Lịch sử gặp gỡ trong màn chi tiết | R-032 | vừa | ⬜ |
| B3 | Nút "hẹn lần tới" | R-032, R-004 | nhỏ | ⬜ |
| B4 | Ô nhập giờ/tuần mong muốn, hiện `hoursIfMore` | A-003, R-033 | vừa | ⬜ |
| B5 | Sửa `lifeExpectancy` và `daysPerVisit` từng người | A-005, R-034 | vừa | ⬜ |

### C · Quản lý người quan trọng cho trọn

Chi tiết: [`plans/mira-v1-c-quan-ly-nguoi.md`](plans/mira-v1-c-quan-ly-nguoi.md) · chạy song song được với B

| Mã | Việc | Nguồn | Ước | Trạng thái |
|---|---|---|---|---|
| C1 | Sửa tên, vai trò, nhịp gặp của một người | UC-09, R-040 | vừa | ⬜ |
| C2 | Xoá mềm một người, giữ nguyên lịch sử | UC-09 luồng ngoại lệ, R-052, A-001(4) | vừa | ⬜ |
| C3 | Hỏi nhịp gặp khi thêm người từ Settings | R-016, R-040 | nhỏ | ⬜ |
| C4 | Đổi stepper thành slider ở bước chọn nhịp gặp | R-016, UC-01 | nhỏ | ⬜ |

### D · Khoảnh khắc cho đủ ba dạng

Chi tiết: [`plans/mira-v1-d-khoanh-khac.md`](plans/mira-v1-d-khoanh-khac.md) · chạy song song được với B và C

| Mã | Việc | Nguồn | Ước | Trạng thái |
|---|---|---|---|---|
| D1 | Ghi khoảnh khắc bằng giọng | R-038, UC-05 luồng phụ 1b | vừa | ⬜ |
| D2 | Phát lại khoảnh khắc giọng trong dòng thời gian | R-035, R-038 | nhỏ | ⬜ |
| D3 | Gắn người liên quan khi ghi khoảnh khắc | R-035, UC-05 | vừa | ⬜ |
| D4 | Banner tháng chạm được, mở slideshow | R-037, UC-06 | vừa | ⬜ |
| D5 | Sửa lỗi nút Lưu khoá khi khoảnh khắc chỉ có ảnh | UC-05 luồng phụ 1a, R-038 | nhỏ | ⬜ |

### E · Ghi giờ vàng từ ngoài app

Chi tiết: [`plans/mira-v1-e-nhap-nhanh-ngoai-app.md`](plans/mira-v1-e-nhap-nhanh-ngoai-app.md) · cần A và C2 xong trước

Phần rủi ro kỹ thuật cao nhất của V1 — phải rời Expo Go, viết native cho hai nền tảng. Ba step ước "lớn", tách nhỏ theo nền tảng nếu chạm mốc hai ngày.

| Mã | Việc | Nguồn | Ước | Trạng thái |
|---|---|---|---|---|
| E1 | Chuyển sang development build, mở đường cho native module | R-046, R-047 | lớn | ⬜ |
| E2 | Chia sẻ dữ liệu giữa app và tiến trình ngoài app | UC-14, UC-15, R-011, A-004 | lớn | ⬜ |
| E3 | Widget màn hình chính ba avatar | R-046, UC-14, A-001(7) | lớn | ⬜ |
| E4 | Shortcut iOS và quick tile Android ghi một giờ | R-047, UC-15, A-001(8) | lớn | ⬜ |

### F · Kiểm thử và đối chiếu định nghĩa xong

Chi tiết: [`plans/mira-v1-f-kiem-thu-nghiem-thu.md`](plans/mira-v1-f-kiem-thu-nghiem-thu.md) · cần A đến E xong trước

| Mã | Việc | Nguồn | Ước | Trạng thái |
|---|---|---|---|---|
| F1 | Test cho tầng repository | R-049, R-050, R-052 | vừa | ⬜ |
| F2 | Test luồng cho các use case ghi dữ liệu | UC-02, UC-03, UC-05, UC-09, R-048 | vừa | ⬜ |
| F3 | Rà chuỗi hiển thị, chốt chỗ lệch R-020 với R-026 | R-008, R-020, R-026, R-005, R-007 | nhỏ | ⬜ |
| F4 | Chạy thật trên iOS và Android | R-051, R-063 | nhỏ | ⬜ |
| F5 | Đối chiếu 8 tiêu chí định nghĩa xong V1 | R-063 | nhỏ | ⬜ |

## Hai mảng không nằm trong bảng trên

**`code/be`** — theo `PROJECT.yaml` mục `ghi_chu_quyet_dinh`, backend Postgres nằm ngoài phạm vi V1 (R-011 và R-055 nói rõ V1 không đồng bộ server) nhưng người dùng chọn vẫn xây song song. Việc của `code/be` không chặn bất kỳ step nào ở trên, và đang có nhánh làm riêng — không chia việc ở đây để tránh hai bản kế hoạch cho cùng một thứ. Điều kiện duy nhất: `code/be` không được đổi hợp đồng dữ liệu mà `code/fe` đang dùng.

**V2 trở đi** — M2 Tài chính, M6 Kết nối và phần còn lại của roadmap (R-058 đến R-062) chưa duyệt. Bộ `docs/dac-ta/*-v2.md` đã có nhưng chưa qua điểm dừng nào. Ba file `src/core/{lifeRate,freedomCapital,expenseConversion}.ts` đã có sẵn code V2, đã chốt là giữ nguyên, không phát triển thêm trong vòng V1. Chia việc chi tiết cho V2 để sau khi V1 đóng.

## Điểm cần người quyết trước khi code

Hai chỗ trong đặc tả còn mờ hoặc mâu thuẫn, không tự quyết được:

1. **`daysPerVisit` nhập ở đâu** — R-034 cần con số này nhưng không tài liệu nào nói nơi nhập. Code hiện hardcode 2. Xem step A4.
2. **Dòng chính màn Hôm nay** — R-020 viết "Hôm nay bạn có N giờ vàng", R-026 lại tính theo cửa sổ 7 ngày, còn `i18n/vi.ts` đang viết "Tuần này bạn có N giờ vàng". Ba bản, phải chốt một. Xem step F3.
