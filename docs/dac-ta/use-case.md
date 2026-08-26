# Use case — phạm vi V1

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25. Mọi UC dưới đây chỉ về yêu cầu đã có trong `docs/dac-ta/yeu-cau.md` — không UC nào bịa thêm hành vi ngoài bảng đó.
>
> Tác nhân duy nhất trong V1: **Người dùng** (chủ thiết bị). Ứng dụng local-first, một người một máy, không có vai trò thứ hai — xem `docs/dac-ta/phan-quyen.md`.

---

## UC-01 · Thiết lập người quan trọng lần đầu

**Tác nhân:** Người dùng
**Tiền điều kiện:** Vừa cài app, chưa có `person` nào trong DB
**Về yêu cầu:** R-014, R-015, R-016, R-017, R-019

**Luồng chính:**
1. Người dùng chọn một hoặc nhiều vai trò từ gợi ý: Con, Bố mẹ, Bạn đời, Bạn thân, Bản thân.
2. Với mỗi vai trò đã chọn, người dùng nhập tên trên một màn hình danh sách.
3. Với mỗi người, người dùng kéo slider chọn tần suất mong muốn gặp (lần/tháng), mặc định đã điền theo vai trò.
4. Người dùng xác nhận, hệ thống tạo bản ghi `person` cho từng người và điều hướng vào màn hình Hôm nay.

**Luồng phụ:**
- 1a. Người dùng không chọn vai trò nào → nút tiếp tục vẫn bấm được, bỏ qua bước 2-3, vào thẳng Hôm nay ở trạng thái rỗng.

**Luồng ngoại lệ:**
- Không có.

**Hậu điều kiện:** Có ít nhất 0 bản ghi `person`. Toàn bộ luồng (kể cả khi chọn đủ) hoàn thành dưới 90 giây.

---

## UC-02 · Ghi giờ vàng bằng bộ đếm

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `person`
**Về yêu cầu:** R-022, R-026, R-048

**Luồng chính:**
1. Người dùng chạm nút "Bắt đầu" trên màn hình Hôm nay.
2. Chọn một người từ danh sách.
3. Hệ thống bắt đầu đếm giờ chạy nền.
4. Người dùng chạm dừng khi kết thúc.
5. Hệ thống tạo `timeEntry` với `minutes` = thời gian đã đếm, `bucket` theo vai trò người được chọn, `source = 'manual'`.

**Luồng phụ:**
- Không có.

**Luồng ngoại lệ:**
- App bị đóng giữa lúc đang đếm → nối lại đếm khi mở lại (thời điểm bắt đầu lưu cục bộ), không mất phiên.

**Hậu điều kiện:** Một `timeEntry` mới được tạo. Giờ vàng tuần này cập nhật lại theo R-026.

---

## UC-03 · Ghi nhanh giờ vàng theo khoảng có sẵn

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `person`
**Về yêu cầu:** R-023, R-026, R-048

**Luồng chính:**
1. Người dùng chạm nút "Ghi nhanh".
2. Chọn một người.
3. Chọn khoảng thời gian: 30 phút / 1 giờ / 2 giờ / tự nhập.
4. Hệ thống tạo `timeEntry` ngay, không cần xác nhận thêm.

**Luồng phụ:**
- 3a. Chọn "tự nhập" → hiện ô nhập số phút, giới hạn ≥1 chạm để không vượt ngân sách 3 chạm ở R-048.

**Luồng ngoại lệ:** Không có.

**Hậu điều kiện:** Một `timeEntry` mới được tạo trong tối đa 3 chạm.

---

## UC-04 · Xem giờ vàng tuần này

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đang ở màn hình Hôm nay
**Về yêu cầu:** R-020, R-021, R-025, R-026, R-027, R-028, R-029

**Luồng chính:**
1. Hệ thống tính `goldenHoursPerWeek` theo R-026 từ dữ liệu 7 ngày qua.
2. Hiển thị dòng chính "Hôm nay bạn có N giờ vàng." với N làm tròn 1 chữ số thập phân.
3. Hiển thị danh sách người đã ở cùng hôm nay, avatar + số phút.

**Luồng phụ:**
- 1a. Tuần chưa đủ 7 ngày dữ liệu → hiện "đang tính, cần thêm N ngày" thay vì con số.
- 1b. Chưa từng ghi gì → hiện lời mời ghi lần đầu, không hiện "0 giờ".

**Luồng ngoại lệ:** Không có.

**Hậu điều kiện:** Không có — đây là UC chỉ đọc.

---

## UC-05 · Ghi khoảnh khắc nhanh

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đang ở màn hình Hôm nay hoặc Khoảnh khắc
**Về yêu cầu:** R-024, R-038, R-039

**Luồng chính:**
1. Người dùng gõ chữ vào ô luôn hiện, hoặc chạm nút ghi nổi để chọn ảnh/giọng.
2. Nhấn enter (hoặc gửi) — hệ thống tạo `moment` ngay, không hỏi thêm.

**Luồng phụ:**
- 1a. Chọn ảnh → gắn `mediaUri`, `mediaType = 'photo'`.
- 1b. Ghi giọng → gắn `mediaUri`, `mediaType = 'audio'`.

**Luồng ngoại lệ:** Không có.

**Hậu điều kiện:** Một `moment` mới, tổng thời gian thao tác dưới 15 giây. Không có điểm số hay streak nào bị ảnh hưởng — vì không tồn tại.

---

## UC-06 · Xem dòng thời gian khoảnh khắc

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `moment`
**Về yêu cầu:** R-035, R-037

**Luồng chính:**
1. Người dùng vào màn hình Khoảnh khắc.
2. Hệ thống hiển thị danh sách ngược theo thời gian, gộp theo tháng.
3. Cuối mỗi tháng có banner "Tháng N của bạn có X khoảnh khắc".
4. Chạm banner → xem lại dạng slideshow.

**Luồng phụ:** Không có.

**Luồng ngoại lệ:**
- Tháng không có khoảnh khắc nào → không hiện banner cho tháng đó.

**Hậu điều kiện:** Không có — UC chỉ đọc.

---

## UC-07 · Bật Đồng hồ cát cho một người

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `person` với vai trò con hoặc bố mẹ
**Về yêu cầu:** R-003, R-018, R-041

**Luồng chính:**
1. Người dùng vào Settings, chọn một người, bật công tắc Đồng hồ cát.
2. Hệ thống hỏi tuổi (và khoảng cách, nếu là bố mẹ ở xa), kèm câu giải thích lý do cần con số này và luôn tắt được.
3. Người dùng nhập, xác nhận → `person.hourglassEnabled = true`.

**Luồng phụ:**
- 2a. Người dùng từ chối nhập tuổi → không bật được Đồng hồ cát cho người đó, quay lại Settings.

**Luồng ngoại lệ:** Không có.

**Hậu điều kiện:** `person.hourglassEnabled = true` và có `birthYear` hoặc tuổi bố mẹ đã lưu.

---

## UC-08 · Xem card Đồng hồ cát

**Tác nhân:** Người dùng
**Tiền điều kiện:** Có ít nhất một `person` với `hourglassEnabled = true`
**Về yêu cầu:** R-004, R-005, R-006, R-030, R-031, R-032, R-033, R-034

**Luồng chính:**
1. Người dùng vào màn hình Đồng hồ cát.
2. Hệ thống hiển thị một card mỗi người đã bật, gồm nhịp gặp hiện tại và số lần/giờ còn lại (theo R-033 hoặc R-034 tuỳ vai trò), không dùng ngôn ngữ đếm ngược sinh tử.
3. Mỗi card có nút "Đặt lịch gọi" và nút "Ẩn card".
4. Người dùng chạm vào card → xem lịch sử gặp gỡ và nút "hẹn lần tới".

**Luồng phụ:**
- Chưa ai bật Đồng hồ cát → màn hình chỉ có một dòng giải thích và nút bật, không có card nào.

**Luồng ngoại lệ:** Không có.

**Hậu điều kiện:** Không có — UC chỉ đọc, trừ khi người dùng chạm "Ẩn card" (xem UC-07 biến thể tắt, không tách UC riêng vì cùng thao tác bật/tắt).

---

## UC-09 · Quản lý danh sách người quan trọng

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đang ở Settings
**Về yêu cầu:** R-040

**Luồng chính:**
1. Người dùng xem danh sách người đã thêm.
2. Thêm người mới, hoặc chạm một người để sửa tên/vai trò/nhịp gặp mong muốn, hoặc xoá.

**Luồng phụ:** Không có.

**Luồng ngoại lệ:**
- Xoá một người đang có `timeEntry`/`moment` gắn với họ → dữ liệu cũ giữ nguyên, chỉ `person` bị đánh dấu `deletedAt` (soft delete theo R-052), không xoá lịch sử.

**Hậu điều kiện:** Danh sách `person` cập nhật theo thao tác.

---

## UC-10 · Bật Giới nghiêm buổi tối

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đang ở Settings
**Về yêu cầu:** R-042

**Luồng chính:**
1. Người dùng bật công tắc Giới nghiêm, mặc định 21h.
2. Có thể đổi giờ.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Cấu hình giới nghiêm lưu vào Settings cục bộ.

---

## UC-11 · Bật Ngày trắng

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đang ở Settings
**Về yêu cầu:** R-043

**Luồng chính:**
1. Người dùng bật Ngày trắng, chọn một thứ trong tuần.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Cấu hình Ngày trắng lưu vào Settings cục bộ, mặc định vẫn tắt cho tới khi người dùng bật.

---

## UC-12 · Xuất dữ liệu ra JSON

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đang ở Settings
**Về yêu cầu:** R-012, R-044

**Luồng chính:**
1. Người dùng chạm "Xuất dữ liệu".
2. Hệ thống gom toàn bộ bảng thuộc V1 (`person`, `timeEntry`, `moment`) thành một file JSON, đưa qua luồng chia sẻ của hệ điều hành.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Một file JSON được tạo, không dữ liệu nào rời khỏi máy trừ khi người dùng tự chọn nơi lưu/chia sẻ.

---

## UC-13 · Xoá toàn bộ dữ liệu

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đang ở Settings
**Về yêu cầu:** R-013, R-045

**Luồng chính:**
1. Người dùng chạm "Xoá toàn bộ dữ liệu".
2. Hệ thống hỏi xác nhận một lần (thao tác không hồi phục được).
3. Xác nhận → xoá toàn bộ bảng cục bộ, quay về màn hình onboarding.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:**
- Người dùng huỷ ở bước xác nhận → không xoá gì.

**Hậu điều kiện:** DB cục bộ rỗng.

---

## UC-14 · Ghi giờ vàng qua widget màn hình chính

**Tác nhân:** Người dùng
**Tiền điều kiện:** Widget đã được thêm vào màn hình chính hệ điều hành
**Về yêu cầu:** R-046, R-048

**Luồng chính:**
1. Widget hiển thị 3 avatar người hay gặp nhất.
2. Người dùng chạm một avatar → hệ thống bắt đầu đếm ngay, tương đương bước 3 của UC-02.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:**
- Chưa có `person` nào → widget hiện trạng thái trống, không avatar nào để chạm.

**Hậu điều kiện:** Giống UC-02 khi hoàn tất phiên đếm.

---

## UC-15 · Ghi giờ vàng qua shortcut hệ điều hành

**Tác nhân:** Người dùng
**Tiền điều kiện:** Đã cấu hình iOS Shortcut hoặc Android quick tile
**Về yêu cầu:** R-047, R-048

**Luồng chính:**
1. Người dùng gọi shortcut "Ghi 1 giờ với [người]" từ ngoài app.
2. Hệ thống tạo `timeEntry` 60 phút cho người đó, không cần mở app.

**Luồng phụ:** Không có.
**Luồng ngoại lệ:** Không có.
**Hậu điều kiện:** Một `timeEntry` mới, tương đương UC-03 nhưng khởi tạo từ ngoài app.
