# M6 · Kết nối con người

## Trạng thái hiện tại

Đã làm xong bốn phần của M6 trong `01-modules.md`, trừ phần nhắc ngày quan trọng.

- **Vòng tròn Dunbar 5/15/50** — `logic/relationship.ts::groupByRing` gom người theo
  cột `person.dunbarRing`. Vòng nào không có ai thì không hiện tiêu đề.
- **Nhiệt kế quan hệ** — với mỗi người, lấy `timeEntry` có `bucket = 'people'` mới
  nhất qua `findEntriesByPersonId`, đếm số ngày tới hôm nay. Hiện
  `vi.connect.lastMet(n)` hoặc `vi.connect.neverMet`.
- **Gợi ý một cuộc hẹn mỗi tuần** — `pickMeetingSuggestion` chọn người có
  `daysSinceLastMet - expectedIntervalDays` lớn nhất và dương. Hiện dưới câu hỏi
  `vi.connect.suggestMeeting` kèm một cái tên, không phải mệnh lệnh.
- **Nhật ký gặp gỡ 1 dòng** — chạm vào một người mở ô nhập một dòng, lưu thành
  `timeEntry` bucket `people` với `note` là dòng đó.

Trạng thái rỗng dùng `DataState`.

## Quyết định đã chốt

- **Không sắp thứ tự trong vòng theo số ngày chưa gặp.** `groupByRing` giữ nguyên
  thứ tự trả về từ `findAllPersons`. Sắp theo số ngày sẽ biến màn hình thành bảng
  xếp hạng ai thân hơn ai — M6 cấm.
- **Không có thang màu.** Số ngày chưa gặp dùng đúng một màu `textSecondary` dù là
  2 ngày hay 300 ngày. Đó là dữ kiện, không phải cảnh báo.
- **`desiredCadence` hiểu là lần/tháng**, khớp với `DEFAULT_CADENCE` trong
  `core/constants.ts` và cách `HourglassScreen` nhân 12 ra lần/năm. Khoảng cách
  mong muốn = `DAYS_IN_MONTH / desiredCadence`.
- **Nhật ký gặp gỡ vẫn phải chọn thời lượng.** Bảng `time_entry` bắt buộc có
  `minutes`. Thay vì ô nhập số, dùng ba lựa chọn một chạm 30 phút / 1 giờ / 2 giờ
  (mặc định 1 giờ) để giữ ngân sách nhập ≤ 60 giây/ngày.
- **Người chưa gặp lần nào không được đưa vào gợi ý.** Không có mốc nào thì không
  suy ra được khoảng cách nào. Hệ quả: máy mới cài, chưa ghi gì, thì thẻ gợi ý
  chưa hiện — đúng, vì lúc đó không có gì để gợi.
- **`logic/relationship.ts` import `../../../core/constants` bằng đường dẫn tương
  đối**, không dùng alias `@/`: vitest trên Windows không phân giải được alias
  (xem `vitest.config.ts`). Các module logic thuần khác trong `features/` cũng vậy.

## Câu hỏi còn mở

- **Thiếu key i18n cho ô nhập và nút lưu.** Màn hình đang mượn `vi.today.save`,
  `vi.today.cancel`, `vi.today.duration*` và dùng `vi.connect.logMeeting` làm luôn
  placeholder. Nếu muốn chữ riêng, cần thêm `vi.connect.notePlaceholder`,
  `vi.connect.save`, `vi.connect.cancel` — chưa tự thêm vào `i18n/vi.ts`.
- **Phần "nhắc ngày quan trọng" của M6 chưa làm.** Bảng `person` chỉ có
  `birthYear`, không có ngày/tháng, nên không tính được ngày kỷ niệm nào. Cần
  quyết: thêm cột, hay bỏ phần này khỏi V1.
- Gợi ý hẹn trong `01-modules.md` nói dựa trên "lịch trống + ngân sách còn dư".
  V1 chưa đọc lịch hệ thống và chưa có ngân sách giờ theo người, nên hiện chỉ dựa
  trên khoảng cách so với `desiredCadence`.

## Bước tiếp theo

- Thêm bộ key i18n riêng cho ô nhật ký rồi bỏ phần mượn từ `vi.today`.
- Chốt hướng cho "nhắc ngày quan trọng" trước khi động vào `db/schema.ts`.
