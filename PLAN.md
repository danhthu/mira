# PLAN — Mira, dọn Batify cho khớp ràng buộc cứng

Thay toàn bộ PLAN.md cũ (2026-08-25, viết cho kiến trúc `features/shared/core` đã bị xoá ngày 2026-08-27). Bối cảnh và bằng chứng đầy đủ nằm ở `code/CLAUDE.md` mục "Đợt reset 2026-08-27".

Trạng thái: ⬜ chưa làm · 🟨 đang làm · ✅ xong.

## Quyết định đã chốt (không hỏi lại)

- **Không sync FE↔BE ở V1.** Ràng buộc cứng #5 "local-first, không gửi gì lên server ở V1" đã có sẵn trong `code/CLAUDE.md` từ trước đợt reset — Batify hiện dùng `AsyncStorage` cục bộ, đúng hướng, không cần nối `code/be`. `code/be` tiếp tục xây song song, không chặn V1 (quyết định cũ, xem `PROJECT.yaml` → `ghi_chu_quyet_dinh`).
- **Offline mode**: app vốn đã offline-first vì mọi dữ liệu qua `AsyncStorage`, không gọi API nghiệp vụ nào. Việc cần làm là đảm bảo hai chỗ gọi mạng hiện có (Sentry, `expo-updates` OTA check) không làm app treo/lỗi khi mất mạng — không phải xây offline mode từ đầu.
- **PWA**: `npm run web:build` đã chạy được, sinh `manifest.webmanifest` + `sw.js` + icon 192/512 (xác nhận 2026-08-27). Việc còn lại là xác nhận phục vụ qua tunnel không lỗi, không phải xây lại.
- **Sentry**: tắt hẳn cho V1 (không phải xoá code — comment lại, giải thích lý do, dễ bật lại khi cần).

## A · Hạ tầng & build

| Mã | Việc | Trạng thái |
|---|---|---|
| A1 | Tắt `Sentry.init()` trong `App.tsx` cho V1 | ✅ |
| A2 | Sửa jest config trùng lặp (`jest.config.js` rỗng vs khối `jest` trong `package.json`) + sửa tên `tests/jet-setup.ts` | ✅ |
| A3 | Xác nhận `npm test` chạy được, đếm pass/fail thật | ✅ |
| A4 | Xác nhận PWA phục vụ được qua `web:serve` / tunnel, không lỗi console | ✅ |
| A5 | Đảm bảo mất mạng không làm app crash (Sentry đã tắt ở A1; kiểm `expo-updates` trong `Me/index.tsx` có bọc lỗi mạng chưa) | ✅ |

## B · Gỡ vi phạm ràng buộc #3 trong `HabitTracker/`

| Mã | Việc | Trạng thái |
|---|---|---|
| B1 | Bỏ hiển thị streak khỏi `StatisticOverall.tsx`, `StatisticSumary.tsx`, `DataRecord.tsx` | ✅ |
| B2 | Bỏ ngưỡng màu đỏ theo % hoàn thành ở `StatisticSumary.tsx:108-112` | ✅ |
| B3 | Dọn lỗi tsc trong phạm vi `HabitTracker/` | ✅ |

## C · Gỡ vi phạm ràng buộc #3 trong `Work/`

| Mã | Việc | Trạng thái |
|---|---|---|
| C1 | Gỡ hoặc thay tab Dashboard point/level (`Work/Screens/Tools/Dashboard.tsx`, `Home.tsx`, `HomeContainer.tsx`) | ✅ |
| C2 | Dọn lỗi tsc trong phạm vi `Work/` | ✅ |

## D · Dọn lỗi kiểu ở các module còn lại

| Mã | Việc | Trạng thái |
|---|---|---|
| D1 | Dọn lỗi tsc ở mọi module NGOÀI `HabitTracker/`, `Work/`, `App.tsx`, jest config (đã có B3/C2/A2 lo riêng) | ✅ |

## E · Chốt

| Mã | Việc | Trạng thái |
|---|---|---|
| E1 | Chạy `tsc`/`jest`/build web lần cuối, cập nhật `code/CLAUDE.md` mục nợ kỹ thuật | ✅ |
| E2 | Viết tài liệu giới thiệu tổng kết cho chủ dự án xem lại | ✅ |

## Câu hỏi còn mở (không chặn V1, ghi lại để quyết sau)

- `Reminder/Screens/Home.tsx` rỗng 0 byte — có thuộc scope V1 không.
- `Trading/` (theo dõi thói quen xem giá chứng khoán) là tính năng gốc Batify, không thuộc sản phẩm Mira — giữ hay gỡ.
- Ràng buộc #2 "Giờ vàng không có giá" chưa audit hết `TimeTracker/`.
- Ràng buộc #4 "Đồng hồ cát" chưa tồn tại trong Batify, cần xây mới.
