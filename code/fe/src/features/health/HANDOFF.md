# M4 Thân thể

## Trạng thái hiện tại

- `screens/HealthScreen.tsx` — một thẻ nhập cho hôm nay với đúng ba mục:
  giấc ngủ (số giờ), số bước, năng lượng tự chấm 1–5. Một nút xác nhận lưu cả ba.
  Bên dưới là bảng bảy ngày gần nhất; chưa có dữ liệu thì hiện `DataState`.
- `db/repositories/healthRepository.ts` — `findHealthByDate`, `findRecentHealth`, `upsertHealth`.

## Quyết định đã chốt

- **Đúng ba thứ, không hơn.** Không calo, không cân nặng, không BMI, không chấm
  điểm cơ thể — `00-vision.md` ghi rõ Mira không phải app fitness.
- **Nhập tay trước, chưa đồng bộ HealthKit/Google Fit.** `01-modules.md` nói nên
  đồng bộ, nhưng việc đó cần native module nằm ngoài đợt này.
- **Một ngày một bản ghi** (`upsertHealth` ghi đè theo `date`), vì người dùng nhập
  rải rác trong ngày: ngủ ghi lúc sáng, số bước ghi lúc tối.
- **Lưu phút nguyên.** Ô nhập nhận số giờ (chấp nhận cả `7,5`), quy ra phút bằng
  `Math.round(hours * MINUTES_IN_HOUR)` trước khi ghi.
- **Không màu cảnh báo.** Ngủ ít hiển thị y như ngủ nhiều; ô trống hiện `—`, không
  hiện chữ nhắc nhở. Chip năng lượng chỉ đổi màu để cho biết đang chọn cái nào.

## Câu hỏi còn mở

1. **Thiếu key i18n** (không tự thêm theo yêu cầu):
   - nhãn nút lưu → đang mượn `vi.common.ok` ("OK").
   - đơn vị/placeholder cho ô số giờ ngủ và ô số bước → đang để trống, chỉ có nhãn.
   - tiêu đề cho khối nhập của hôm nay → đang bỏ trống.
2. `vi.health.sleepGuardTitle` và `vi.health.sleepGuardHint` đã có chuỗi nhưng chưa
   dùng: "bảo vệ giấc ngủ" cần đọc lịch ngày mai, chưa có tích hợp calendar.
3. Màn Cài đặt xoá-toàn-bộ-dữ-liệu chưa xoá bảng `health`.
4. Giao điểm "ngủ × khoảnh khắc" trong `01-modules.md` chưa dựng — cần dữ liệu vài
   tuần và một hàm ở `core/`.

## Bước tiếp theo

1. Bổ sung các key `vi.health.*` liệt kê ở trên.
2. Nối `health` vào luồng xoá dữ liệu ở Cài đặt.
3. Đồng bộ HealthKit/Google Fit thay cho nhập tay ngủ và bước (giữ năng lượng là tự chấm).
