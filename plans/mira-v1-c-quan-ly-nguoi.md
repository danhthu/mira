# Mira · Phase C — Quản lý người quan trọng cho trọn

Tạo: 2026-08-25
Ứng với: nhóm C trong `PLAN.md`
Điều kiện trước: không có (chạy song song được với Phase B)

UC-09 nói ba việc: thêm, sửa, xoá. `SettingsScreen.tsx` hiện chỉ làm được "thêm", và ô thêm cũng không hỏi nhịp gặp mong muốn — nghĩa là người thêm từ Settings sẽ không có `desiredCadence`, kéo theo card Đồng hồ cát của họ tính ra 0 lần gặp. Xong phase khi UC-09 chạy đủ ba nhánh và không đường nào tạo ra `person` thiếu dữ liệu.

---

## C1 · Sửa thông tin một người

**Nguồn:** UC-09 bước 2 ("chạm một người để sửa tên/vai trò/nhịp gặp mong muốn"), R-040

Trong `features/settings/`, cho chạm vào `PersonSettingRow` mở một màn (hoặc sheet) sửa: tên, vai trò, nhịp gặp mong muốn. Ghi qua `personRepository`, cập nhật `updatedAt` theo R-052.

Đổi vai trò kéo theo hệ quả: `child` ↔ `parent` đổi luôn nhánh công thức Đồng hồ cát (R-033 vs R-034). Nếu đổi sang `child` mà chưa có `birthYear` thì tắt `hourglassEnabled` về `false` — đúng tinh thần A-006, không để card trống hoặc lỗi.

Ước lượng: vừa

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Sửa tên một người → tên đổi ở cả Settings, màn Hôm nay và card Đồng hồ cát
- [ ] Sửa nhịp gặp từ 2 lên 4 lần/tháng → card Đồng hồ cát của người đó đổi từ "Gặp 24 lần/năm" thành "Gặp 48 lần/năm"
- [ ] Đổi vai trò một người đang bật Đồng hồ cát sang `child` khi chưa có năm sinh → công tắc Đồng hồ cát tự về tắt, card biến mất khỏi danh sách
- [ ] `updatedAt` của bản ghi đổi sau khi sửa

---

## C2 · Xoá mềm một người, giữ nguyên lịch sử

**Nguồn:** UC-09 luồng ngoại lệ, R-052; A-001 mục (4) trong `docs/dac-ta/gia-dinh.md`

Thêm thao tác xoá trong màn sửa ở C1. Xoá là set `deletedAt`, không `DELETE FROM`. `timeEntry` và `moment` gắn với người đó giữ nguyên, không đụng tới.

Kiểm lại toàn bộ truy vấn trong `db/repositories/` xem đã lọc `deletedAt IS NULL` chưa — nếu chỗ nào quên, người đã xoá vẫn hiện ra ở màn Hôm nay hoặc danh sách chọn người.

Hỏi xác nhận một lần trước khi xoá, cùng kiểu với luồng xoá toàn bộ dữ liệu ở R-045.

Ước lượng: vừa

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Xoá một người đang có 3 `timeEntry` → người biến mất khỏi Settings, Hôm nay, danh sách chọn khi "Bắt đầu" và "Ghi nhanh", card Đồng hồ cát
- [ ] Xuất JSON sau khi xoá (R-044) → 3 `timeEntry` cũ vẫn còn trong file, `person` tương ứng có `deletedAt` khác `null`
- [ ] Bấm xoá rồi chọn Huỷ ở hộp xác nhận → không mất gì
- [ ] `grep -rn "deletedAt" code/fe/src/db/repositories` cho thấy mọi hàm `findAll*`/`find*By*` đều có điều kiện lọc

---

## C3 · Hỏi nhịp gặp mong muốn khi thêm người từ Settings

**Nguồn:** R-016, R-040; `SettingsScreen.tsx` hàm `handleAddPerson`

Luồng "Thêm người" ở Settings hiện chỉ hỏi tên và vai trò, không hỏi `desiredCadence`. Onboarding thì có hỏi (UC-01 bước 3). Hai đường tạo `person` ra hai kết quả khác nhau, và người thiếu `desiredCadence` sẽ tính ra `visitsPerYear = 0` trong `HourglassScreen.tsx`.

Thêm ô nhịp gặp vào luồng thêm người, mặc định điền sẵn theo vai trò đúng như R-016 (con: hằng ngày, bố mẹ: 2 lần/tháng). Dùng chung một hằng mặc định với `CadenceScreen.tsx`, đặt ở `core/constants.ts`.

Ước lượng: nhỏ

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Thêm một người vai trò `parent` từ Settings, không chạm ô nhịp gặp → bản ghi có `desiredCadence = 2`
- [ ] Bật Đồng hồ cát cho người vừa thêm → card hiện "Gặp 24 lần/năm", không hiện 0
- [ ] Bảng mặc định theo vai trò chỉ tồn tại một bản trong repo — `grep -rn "desiredCadence" code/fe/src` không thấy hai nơi tự khai giá trị mặc định

---

## C4 · Đổi stepper thành slider ở bước chọn nhịp gặp onboarding

**Nguồn:** R-016 ("bằng slider"), UC-01 bước 3

`CadenceScreen.tsx` đang dùng nút +/- thay vì slider. Lệch nhỏ so với R-016 nhưng vẫn là lệch, và slider trực tiếp phục vụ R-019 (onboarding dưới 90 giây) — kéo một phát nhanh hơn bấm mười lần.

Dùng `@react-native-community/slider`. Giữ nguyên phần mặc định theo vai trò.

Ước lượng: nhỏ

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Màn chọn nhịp gặp hiện slider kéo được, không còn nút +/-
- [ ] Kéo tới hai đầu → không ra giá trị âm, không ra giá trị vượt trần đã đặt
- [ ] Bấm bỏ qua không chạm slider → vẫn lưu đúng giá trị mặc định theo vai trò

---

## Cổng phase

```bash
cd code/fe && npx tsc --noEmit && npm test
```

Kiểm tay:
- [ ] Đi trọn UC-09: thêm một người, sửa tên và nhịp gặp, xoá người đó — cả ba nhánh chạy được từ Settings
- [ ] Sau khi xoá, xuất JSON kiểm tra lịch sử `timeEntry`/`moment` còn nguyên
- [ ] Chạy lại onboarding từ máy sạch, bấm đồng hồ đo: dưới 90 giây (R-019)
