# Mira · Phase B — Màn chi tiết Đồng hồ cát

Tạo: 2026-08-25
Ứng với: nhóm B trong `PLAN.md`
Điều kiện trước: Phase A (cần ba cột mới ở A3, và câu trả lời của A4 trước khi làm B5)

Bước 4 của UC-08 — "chạm vào card → xem lịch sử gặp gỡ và nút hẹn lần tới" — chưa có gì. Card hiện tại chỉ đọc được, không chạm vào đâu. Đây cũng là chỗ A-003 và A-005 chỉ định để nhập `targetWeeklyHours` và `lifeExpectancy`, nên cả ba việc gom về một màn hình. Xong phase khi chạm được vào card, thấy lịch sử, sửa được hai con số, và `hoursIfMore` hiện ra thật.

---

## B1 · Dựng stack cho tab Đồng hồ cát

**Nguồn:** UC-08 bước 4, R-032; `code/fe/src/navigation/RootNavigator.tsx` (hiện chỉ có bottom tab, không stack nào)

`RootNavigator` đang là bottom tab phẳng, không đường nào push màn con. Bọc tab `Hourglass` bằng một native stack riêng: màn gốc là `HourglassScreen` hiện tại, màn thứ hai là `PersonDetailScreen` mới trong `features/hourglass/screens/`. Truyền `personId` qua route param, không truyền cả object `Person` (màn chi tiết tự đọc lại từ repository để luôn thấy dữ liệu mới nhất).

Khai kiểu route param vào `shared/types/index.ts` cạnh `MainTabParamList`, đừng khai rải rác.

Chỉ dựng khung điều hướng và màn trống ở step này. Nội dung là B2–B5.

Ước lượng: nhỏ

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Chạm một card Đồng hồ cát → mở màn mới, tiêu đề hiện đúng tên người đó
- [ ] Bấm back → quay lại danh sách card, không mất trạng thái
- [ ] Nút "Đặt lịch gọi" và "Ẩn card" trên card vẫn bấm được, không bị nuốt sự kiện bởi vùng chạm mới

---

## B2 · Lịch sử gặp gỡ trong màn chi tiết

**Nguồn:** R-032 ("mở lịch sử gặp gỡ từ `timeEntry` và `moment` liên quan"), UC-08 bước 4

Trong `PersonDetailScreen`, gộp hai nguồn thành một danh sách xếp ngược thời gian:
- `timeEntry` có `personId` khớp — hiện ngày và số phút
- `moment` có `personIds` chứa id người đó — hiện chữ và ảnh nếu có

`momentRepository` hiện chưa có hàm lọc theo `personId` (`personIds` lưu dạng chuỗi JSON), cần thêm. Bỏ qua bản ghi có `deletedAt`.

Rỗng thì hiện một dòng mời ghi, không hiện "0 lần gặp" — cùng tinh thần R-029, và R-007 cấm mọi thứ trông như báo thiếu.

Ước lượng: vừa

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Ghi 2 `timeEntry` và 1 `moment` gắn cùng một người → màn chi tiết hiện đủ 3 mục, mục mới nhất ở trên
- [ ] `moment` gắn người khác không lọt vào danh sách
- [ ] Người chưa có bản ghi nào → hiện dòng mời ghi, không có số 0 và không có màu đỏ nào

---

## B3 · Nút "hẹn lần tới"

**Nguồn:** R-032, R-004 ("Đồng hồ cát hiển thị thì luôn kèm một hành động cụ thể")

Thêm nút "Hẹn lần tới" ở màn chi tiết, mở Calendar hệ điều hành y hệt cách `handleScheduleCall` trong `HourglassScreen.tsx` đang làm — tách hàm đó ra `shared/utils/` để hai chỗ dùng chung, đừng chép lại.

Chuỗi nút viết theo R-008: sentence case, không dấu chấm than, không "hãy".

Ước lượng: nhỏ

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Không còn hàm mở lịch nào bị chép hai bản — `grep -rn "calshow://" code/fe/src` chỉ ra đúng một file
- [ ] Bấm "Hẹn lần tới" trên máy thật → mở app Lịch, không crash
- [ ] Máy không có app lịch → rơi về link web, không văng Alert lỗi trắng màn

---

## B4 · Ô nhập giờ/tuần mong muốn và con số `hoursIfMore`

**Nguồn:** A-003 trong `docs/dac-ta/gia-dinh.md`, R-033

Với `person` vai trò `child`, thêm ô nhập "giờ mỗi tuần mong muốn" ở màn chi tiết, mặc định điền sẵn bằng `currentWeeklyHours` đang tính (đúng A-003). Lưu vào cột `targetWeeklyHours` thêm ở A3, truyền vào `calculateHourglass` để `hoursIfMore` có giá trị.

Hiển thị `hoursIfMore` dưới dạng đối chiếu với `hoursLeft`, viết theo R-005 — nói về số giờ ở cùng nhau, không nói về số năm còn lại. Cần thêm chuỗi mới vào `i18n/vi.ts`.

Ước lượng: vừa

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] `npm test` vẫn pass — `core/hourglass.ts` không được sửa, nó đã đúng
- [ ] Con 10 tuổi, đang 7 giờ/tuần, nhập mục tiêu 14 → màn hình hiện đúng 2912 và 5824 (khớp ca test `hourglass.test.ts` dòng 33-34)
- [ ] Không nhập gì → không hiện dòng `hoursIfMore` nào, chỉ hiện `hoursLeft`
- [ ] Thoát ra vào lại màn chi tiết → giá trị vừa nhập vẫn còn (đã ghi DB, không phải state)
- [ ] Không chuỗi nào trên màn này chứa "còn N năm" (R-005)

---

## B5 · Sửa `lifeExpectancy` và `daysPerVisit` cho từng người

**Nguồn:** A-005 trong `docs/dac-ta/gia-dinh.md`, R-034; câu trả lời của step A4 cho phần `daysPerVisit`

Với `person` vai trò `parent`, thêm hai ô ở màn chi tiết: tuổi thọ dự kiến (rỗng nghĩa là dùng `DEFAULT_LIFE_EXPECTANCY`) và số ngày mỗi lần gặp. Ghi vào hai cột thêm ở A3, truyền vào `calculateHourglass`.

Bỏ hằng `DEFAULT_DAYS_PER_VISIT` khỏi `HourglassScreen.tsx` cùng ghi chú tạm của nó — giá trị mặc định về `core/constants.ts` cho thống nhất một chỗ.

Đừng làm step này trước khi A4 có câu trả lời. Nếu người dùng chọn chỗ khác cho `daysPerVisit`, sửa mô tả step rồi mới code.

Ước lượng: vừa

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] `grep -rn "DEFAULT_DAYS_PER_VISIT" code/fe/src/features` không ra kết quả nào
- [ ] Bố mẹ 60 tuổi, gặp 12 lần/năm, 2 ngày mỗi lần, để trống tuổi thọ → card hiện 216 lần gặp (78−60=18 năm × 12)
- [ ] Sửa tuổi thọ thành 85 → card cập nhật thành 300 lần gặp, không cần khởi động lại app
- [ ] Thoát ra vào lại → giá trị 85 vẫn còn

---

## Cổng phase

```bash
cd code/fe && npx tsc --noEmit && npm test
```

Kiểm tay:
- [ ] Chạm card con → thấy lịch sử, nhập mục tiêu giờ/tuần, thấy `hoursIfMore`, bấm "Hẹn lần tới" mở được lịch
- [ ] Chạm card bố mẹ → thấy lịch sử, sửa được tuổi thọ và ngày mỗi lần, số lần gặp đổi theo
- [ ] Đọc lại toàn bộ chuỗi hai màn hình: không chuỗi nào đếm ngược theo năm sống, không chuỗi nào có dấu chấm than (R-005, R-008)
