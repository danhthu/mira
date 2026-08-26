# Mira · Phase E — Ghi giờ vàng từ ngoài app

Tạo: 2026-08-25
Ứng với: nhóm E trong `PLAN.md`
Điều kiện trước: Phase A (widget đọc chung DB, cần schema ổn định), Phase C2 (widget không được hiện người đã xoá)

UC-14 và UC-15 chưa có gì. Đây là phần rủi ro kỹ thuật cao nhất của V1: cần rời khỏi Expo Go, viết native module cho hai nền tảng, và cho widget đọc được cùng file SQLite mà app dùng. R-063 đưa "ghi giờ vàng 3 chạm có widget" vào tiêu chí xong V1, nên không cắt được. Đặt sớm hơn Phase F để còn kịp đổi hướng nếu vướng.

Xong phase khi chạm avatar trên màn hình chính điện thoại là bắt đầu đếm, và gọi shortcut là có `timeEntry` 60 phút mà không mở app.

---

## E1 · Chuyển sang development build và mở đường cho native module

**Nguồn:** R-046, R-047 (cả hai đều cần native code, Expo Go không chạy được); `PROJECT.yaml` mục `ky_thuat.mobile.lenh_build` đang trống

`code/fe/package.json` không có script build thật, chưa cấu hình EAS. Widget iOS cần app extension, quick tile Android cần `TileService` — không thứ nào sống trong Expo Go.

Việc: cài `expo-dev-client`, chạy `npx expo prebuild` sinh thư mục `ios/` và `android/`, cấu hình `eas.json` cho profile `development`, dựng được một bản chạy trên máy thật. Chưa viết widget ở step này.

Cập nhật `PROJECT.yaml` trường `ky_thuat.mobile.lenh_build` bằng lệnh thật sau khi chạy được.

Ước lượng: lớn — nếu bắt đầu mà thấy vượt hai ngày, tách thành hai step: iOS trước, Android sau.

**Nghiệm thu:**
- [ ] `npx expo prebuild` chạy xong, sinh `ios/` và `android/`, không lỗi
- [ ] Cài được bản development lên một máy iOS thật và một máy Android thật, app mở tới màn Hôm nay
- [ ] `npx tsc --noEmit` và `npm test` vẫn sạch sau khi prebuild
- [ ] `PROJECT.yaml` trường `lenh_build` không còn trống

---

## E2 · Chia sẻ dữ liệu giữa app và tiến trình ngoài app

**Nguồn:** UC-14 bước 1 (widget cần biết 3 người hay gặp nhất), UC-15 bước 2 ("không cần mở app"); R-011 (dữ liệu ở trên máy, không có server làm trung gian)

Widget và shortcut chạy ở tiến trình khác, không truy cập trực tiếp file SQLite của app. Cần một lớp trung gian: App Group + shared container trên iOS, `ContentProvider` hoặc file trong external storage dùng chung trên Android.

Hướng đơn giản nhất và nên thử trước: app ghi ra một file snapshot nhỏ (3 người hay gặp nhất, id + tên + avatar) mỗi khi dữ liệu đổi; widget chỉ đọc file đó. Chiều ngược lại (widget/shortcut ghi giờ) đẩy vào một hàng đợi ghi ở shared container, app đọc và nạp vào SQLite ở lần mở kế tiếp.

Cửa sổ tính "hay gặp nhất" dùng đúng 7 ngày như Giờ vàng, theo A-004.

Ước lượng: lớn — tách theo nền tảng nếu cần.

**Nghiệm thu:**
- [ ] Ghi 3 `timeEntry` trong app → file snapshot ở shared container đổi nội dung, chứa đúng 3 người có tổng phút cao nhất trong 7 ngày
- [ ] Xoá mềm một người (C2) → người đó biến khỏi snapshot ở lần cập nhật kế tiếp
- [ ] Đẩy một mục vào hàng đợi ghi bằng tay, mở app → có `timeEntry` mới đúng số phút, `source = 'widget'`
- [ ] Cùng một mục trong hàng đợi được nạp hai lần → chỉ tạo một `timeEntry` (chống ghi trùng)

---

## E3 · Widget màn hình chính ba avatar

**Nguồn:** R-046, UC-14, A-004

Viết widget iOS (WidgetKit) và Android (App Widget) hiển thị 3 avatar từ snapshot ở E2. Chạm một avatar mở app qua deep link kèm `personId`, app bắt được thì gọi thẳng `startSession` — tương đương bước 3 của UC-02, không hỏi lại người dùng chọn ai.

Chưa có `person` nào thì widget hiện trạng thái trống, không avatar nào để chạm (A-001 mục 7).

Ước lượng: lớn

**Nghiệm thu:**
- [ ] Thêm widget lên màn hình chính iOS và Android → hiện đúng 3 avatar khớp snapshot
- [ ] Chạm một avatar → app mở, phiên đếm đã chạy với đúng người đó, tổng cộng 1 chạm (thoả R-048)
- [ ] Máy chưa có `person` nào → widget hiện trạng thái trống, chạm không crash
- [ ] Ghi thêm giờ cho người thứ tư đủ vượt người thứ ba → widget cập nhật lại thứ tự trong vòng một chu kỳ refresh

---

## E4 · Shortcut và quick tile ghi một giờ

**Nguồn:** R-047, UC-15, A-001 mục (8)

iOS: App Intent "Ghi 1 giờ với [người]" nhận tham số người, xuất hiện trong app Shortcuts.
Android: `TileService` cho quick tile, chạm là ghi cho người hay gặp nhất.

Cả hai ghi vào hàng đợi ở E2 với `minutes = 60`, `bucket = 'people'`, `source = 'widget'`. Không mở app.

Ước lượng: lớn

**Nghiệm thu:**
- [ ] Gọi shortcut từ Siri hoặc app Shortcuts, không mở Mira → mở app sau đó thấy `timeEntry` 60 phút đúng người, `source = 'widget'`
- [ ] Chạm quick tile trên Android, không mở Mira → tương tự
- [ ] Gọi shortcut 3 lần liên tiếp → có đúng 3 `timeEntry`, không nuốt, không nhân đôi
- [ ] Giờ vàng tuần này ở màn Hôm nay tăng đúng 1 giờ sau mỗi lần gọi (R-026)

---

## Cổng phase

```bash
cd code/fe && npx tsc --noEmit && npm test
```

Kiểm tay:
- [ ] Trên máy iOS thật: widget chạm 1 phát bắt đầu đếm, shortcut ghi được 60 phút khi app đang đóng
- [ ] Trên máy Android thật: cùng hai luồng trên
- [ ] Đếm số chạm cho một lượt ghi qua widget: tối đa 3 (R-048)
- [ ] Xoá một người rồi kiểm widget và shortcut: không còn gợi ý người đó
