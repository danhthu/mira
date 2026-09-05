# Mira · Phase A — Bền vững trạng thái và cột dữ liệu còn thiếu

Tạo: 2026-08-25
Ứng với: nhóm A trong `PLAN.md`
Điều kiện trước: không có

Hiện có ba chỗ trạng thái sống trong RAM rồi biến mất khi tắt app, và bảng `person` thiếu ba cột mà công thức Đồng hồ cát cần. Phase này dọn hết phần nền đó, vì mọi phase sau đều đọc từ đây. Xong phase khi: tắt app mở lại, giới nghiêm/ngày trắng/phiên đếm đang chạy đều còn nguyên, và `person` có đủ cột cho `calculateHourglass`.

---

## A1 · Persist Settings qua lần khởi động lại

**Nguồn:** UC-10 hậu điều kiện, UC-11 hậu điều kiện, R-042, R-043; `code/fe/HANDOFF.md` mục "Settings persistence"

`code/fe/src/store/settingsStore.ts` đang là Zustand thuần in-memory: `curfewHour`, `whiteDayOfWeek`, `onboardingComplete` mất sạch sau restart. Thêm `@react-native-async-storage/async-storage`, bọc store bằng `persist` middleware của Zustand với `createJSONStorage`. Đặt tên khoá rõ ràng (`mira-settings`) và khai `version: 1` để sau còn migrate được.

`onboardingComplete` vẫn giữ nguyên cách xác định từ DB khi khởi động (đếm `person`) — persist chỉ để tránh nháy màn onboarding một nhịp trước khi DB trả lời.

Ước lượng: nhỏ

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Đặt giới nghiêm 22h, tắt hẳn app, mở lại → Cài đặt vẫn hiện 22:00
- [ ] Chọn Ngày trắng = Chủ nhật, tắt app, mở lại → vẫn là Chủ nhật
- [ ] Chưa từng chạm gì → `curfewHour` đọc ra 21, `whiteDayOfWeek` đọc ra `null` (đúng mặc định R-042/R-043)

---

## A2 · Nối lại phiên đếm giờ khi app bị đóng giữa chừng

**Nguồn:** UC-02 luồng ngoại lệ; A-001 mục (2) trong `docs/dac-ta/gia-dinh.md`

`code/fe/src/features/today/store/todayStore.ts` giữ `activeSession` trong RAM. Đóng app lúc đang đếm là mất phiên, trái đúng luồng ngoại lệ của UC-02. Persist riêng nhánh `activeSession` (dùng `partialize` để không ghi cả `personsWithTime`/`allPersons` xuống đĩa — hai mảng đó luôn nạp lại từ DB).

`startedAt` đã là chuỗi ISO nên serialize được nguyên trạng. Khi khôi phục, màn Hôm nay hiển thị lại dòng "Đang tính giờ với …" và nút Dừng.

Ước lượng: nhỏ

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Bấm "Bắt đầu" chọn một người, đợi 2 phút, kill app, mở lại → màn Hôm nay vẫn hiện phiên đang chạy với đúng tên người đó
- [ ] Bấm Dừng sau khi khôi phục → `timeEntry` tạo ra có `minutes` tính từ `startedAt` gốc, không phải từ lúc mở lại app
- [ ] Sau khi Dừng, kill app mở lại → không còn phiên nào treo

---

## A3 · Thêm ba cột `person` mà công thức Đồng hồ cát đang thiếu

**Nguồn:** R-033, R-034; A-003 và A-005 trong `docs/dac-ta/gia-dinh.md`

`code/fe/src/db/schema.ts` bảng `person` không có `targetWeeklyHours`, `lifeExpectancy`, `daysPerVisit`. Hệ quả đang thấy trong code: `calculateHourglass` nhận `targetWeeklyHours?` nhưng không nơi nào truyền vào nên `hoursIfMore` không bao giờ tính; `HourglassScreen.tsx` hardcode `DEFAULT_DAYS_PER_VISIT = 2` kèm ghi chú tự nhận là tạm.

Thêm ba cột nullable vào `person` trong schema Drizzle, cộng migration tăng dần (không sửa đè migration cũ). Chưa gắn giao diện ở step này — chỉ cột và repository đọc/ghi được.

`lifeExpectancy` để `null` nghĩa là dùng `DEFAULT_LIFE_EXPECTANCY` trong `core/constants.ts`, không ghi cứng 78 xuống DB, để sau đổi hằng số thì người chưa tự chỉnh vẫn theo giá trị mới.

Ước lượng: vừa

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] `npm test` trong `code/fe` vẫn 62/62 pass (step này không được đụng `src/core/`)
- [ ] Mở app trên máy đã có dữ liệu cũ → không mất `person` nào, ba cột mới đọc ra `null`
- [ ] Gọi hàm cập nhật trong `personRepository` set `lifeExpectancy = 85` rồi đọc lại → trả về 85

---

## A4 · Chốt nơi nhập `daysPerVisit`

**Nguồn:** R-034 (công thức cần `daysPerVisit`); `code/fe/src/features/hourglass/screens/HourglassScreen.tsx` dòng ghi chú `DEFAULT_DAYS_PER_VISIT`

Không tài liệu nào trong `docs/dac-ta/` nói người dùng nhập `daysPerVisit` ở đâu — A-003 và A-005 chỉ chốt chỗ cho `targetWeeklyHours` và `lifeExpectancy`. Đây là điểm mờ thật, không phải chuyện code.

Việc của step này: viết một dòng câu hỏi vào `docs/dac-ta/cau-hoi.md` (mã Q tiếp theo còn trống) và ghi giả định tương ứng vào `docs/dac-ta/gia-dinh.md`, đề xuất đặt cùng chỗ với `lifeExpectancy` theo A-005 cho nhất quán. Chờ người dùng xác nhận rồi mới làm B5.

Ước lượng: nhỏ

**Nghiệm thu:**
- [ ] `docs/dac-ta/cau-hoi.md` có thêm đúng một mã Q mới về `daysPerVisit`, kèm phương án đề xuất
- [ ] `docs/dac-ta/gia-dinh.md` có dòng giả định tương ứng, cột "hệ quả nếu sai" điền cụ thể
- [ ] B5 trong `plans/mira-v1-b-chi-tiet-dong-ho-cat.md` được cập nhật theo câu trả lời trước khi bắt tay làm

---

## Cổng phase

```bash
cd code/fe && npx tsc --noEmit && npm test
```

Kiểm tay:
- [ ] Đặt giới nghiêm + ngày trắng, kill app, mở lại → cả hai còn nguyên
- [ ] Bắt đầu một phiên đếm, kill app giữa chừng, mở lại → phiên còn chạy, dừng ra đúng số phút
- [ ] Cài đè lên bản có dữ liệu cũ → không mất `person`, `timeEntry`, `moment` nào
