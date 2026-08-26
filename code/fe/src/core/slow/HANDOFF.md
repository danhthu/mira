# M12 Sống chậm (lớp da)

## Trạng thái hiện tại

Lớp da không có màn hình riêng. Toàn bộ là hàm thuần + hook để module khác gọi.

- `logic/quiet.ts` — `isWhiteDay`, `isWithinCurfew`, `isMomentOnly`. Có test.
- `logic/friction.ts` — `nextMorningAfter`, `canAddGoalAt`. Có test.
- `logic/solarTerm.ts` — `getSolarTermAt`, bảng `SOLAR_TERMS` 24 tiết khí. Có test.
- `logic/constants.ts` — `MORNING_HOUR = 6`.
- `hooks/useQuietMode.ts` — cờ im lặng + một câu giải thích, đọc từ `settingsStore`.
- `hooks/useSeasonRhythm.ts` — tiết khí hiện tại + lời mời làm việc ngoài trời.
- `hooks/useLifeCountdown.ts` — `useLifeCountdownEnabled()`, mặc định false.
- `index.ts` — mặt tiền công khai, module khác chỉ nên import từ đây.

`settingsStore` đã persist qua `@react-native-async-storage/async-storage` +
zustand `persist`. Ba trường được lưu: `curfewHour`, `whiteDayOfWeek`,
`lifeCountdownEnabled`. `onboardingComplete` cố tình không lưu vì `App.tsx` tính
lại từ số person trong SQLite mỗi lần mở app.

## Quyết định đã chốt

- **Giới nghiêm vắt qua nửa đêm.** Cửa sổ im lặng là `[curfewHour, 6h)`, nên
  01:00 vẫn là đang giới nghiêm. Nếu chỉ so `hour >= curfewHour` thì app lại ồn
  lên đúng lúc nửa đêm — trái với ý nghĩa của tính năng.
- **`MORNING_HOUR = 6` dùng chung** cho cả giới nghiêm lẫn ma sát cố ý, đặt trong
  `features/slow/logic/constants.ts` chứ không trong `core/constants.ts`: `core/`
  là tầng công thức ba chỉ số lõi, không biết gì về cấu hình im lặng.
- **Ma sát cố ý lấy mốc "sáng gần nhất sau lúc thêm"**, không cứng là "ngày hôm
  sau". Thêm mục tiêu lúc 01:00 thì chờ tới 06:00 cùng ngày, không phải chờ 29
  tiếng. Vẫn đúng tinh thần "ngủ một đêm rồi hãy quyết".
- **Bảng tiết khí là bảng xấp xỉ**, sai số ±1 ngày tuỳ năm nhuận. Mốc thật là lúc
  kinh độ mặt trời qua bội số 15°, tính đúng cần lịch thiên văn. Mira dùng tiết
  khí chỉ để gợi một việc ngoài trời, không tính toán gì, nên lệch một ngày không
  đổi kết quả nào.
- **Hook không có timer.** Tính lại mỗi lần render từ giờ máy. Lớp này chỉ ẩn bớt
  giao diện, không đẩy thông báo nào, nên không cần biết chính xác giây nào cửa
  sổ giới nghiêm mở ra. Thêm timer là thêm một thứ chạy nền để app nói nhiều hơn
  — ngược hẳn với M12.

## Câu hỏi còn mở

1. **Thiếu chuỗi hiển thị cho 24 tiết khí.** `i18n/vi.ts` chỉ có
   `slow.seasonTitle` và `slow.seasonAction`. Chưa có tên từng tiết khí, cũng
   chưa có gợi ý hoạt động ngoài trời riêng cho từng tiết. `getSolarTermAt` vì
   vậy trả về `SolarTermId` (`'lapXuan'`, `'haChi'`…) chứ không trả chuỗi. Cần bổ
   sung vào `vi.slow` hai bảng 24 khoá theo `SolarTermId` — người giữ `i18n/vi.ts`
   quyết, module này không tự thêm.
2. **Chưa có nút bật/tắt Đếm ngược đời người.** `settingsStore.lifeCountdownEnabled`
   đã có và mặc định `false` đúng ràng buộc cứng #4, nhưng màn Cài đặt thuộc
   module khác nên chưa có hàng điều khiển. Cũng chưa có khoá i18n cho hàng đó.
3. **Import rule vs. lớp da.** `code/CLAUDE.md` cấm `features/X` import
   `features/Y`, mà M12 lại sinh ra để module khác gọi. Hiện chưa ai gọi nên chưa
   vi phạm, `scripts/soi-cau-truc.sh` vẫn sạch. Khi M3 dùng `canAddGoalAt`, phải
   chọn một trong hai: dời `logic/` của lớp da xuống `core/`, hoặc ghi một ngoại
   lệ hẹp cho `features/slow` vào `code/CLAUDE.md` và script soi. Không tự quyết.
4. **Lá thư Chủ nhật** (`slow.letter*` trong i18n) chưa làm — cần AI, ngoài phạm
   vi đợt này.

## Bước tiếp theo

- Chốt câu hỏi 3 trước khi M3 gọi `canAddGoalAt`.
- Bổ sung 24 khoá tên tiết khí + 24 gợi ý ngoài trời vào `vi.slow`, rồi map trong
  `useSeasonRhythm`.
- Thêm hàng bật/tắt Đếm ngược đời người vào màn Cài đặt (thuộc module settings).
- Gắn `useQuietMode` vào màn Hôm nay: khi `momentOnly` là true thì chỉ giữ ô ghi
  khoảnh khắc, ẩn phần còn lại, và hiện `notice`.
