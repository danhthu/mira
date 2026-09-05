# PLAN — Mira, dọn Batify cho khớp ràng buộc cứng

Thay toàn bộ PLAN.md cũ (2026-08-25, viết cho kiến trúc `features/shared/core` đã bị xoá ngày 2026-08-27). Bối cảnh và bằng chứng đầy đủ nằm ở `code/CLAUDE.md` mục "Đợt reset 2026-08-27".

Trạng thái: ⬜ chưa làm · 🟨 đang làm · ✅ xong.

## Quyết định đã chốt (không hỏi lại)

- ~~**Không sync FE↔BE ở V1.**~~ **Đảo ngược 2026-09-05.** Ràng buộc cứng #5 đổi thành "offline-first, sync tuỳ chọn" — xem `PROJECT.yaml` → `ghi_chu_quyet_dinh` và `docs/09-sync-contract.md`. `code/be` từ ngoài phạm vi thành phần của V1: thêm tầng HTTP (Hono) + endpoint đồng bộ, chạy trên Postgres 18 local (`mira_dev`, đã có đủ 13 bảng). Xem nhóm F bên dưới.
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

## F · Đồng bộ offline-first (mở 2026-09-05)

Hợp đồng: [`docs/09-sync-contract.md`](docs/09-sync-contract.md). Hai phía làm song song theo cùng một hợp đồng.

| Mã | Việc | Trạng thái |
|---|---|---|
| F1 | BE: tầng HTTP Hono + `GET /health` | ✅ |
| F2 | BE: `SyncRepository` tổng quát cho 13 bảng (không viết 13 repository riêng) | ✅ |
| F3 | BE: `POST /sync/push` — upsert theo `updatedAt`, transaction cả batch, idempotent | ✅ |
| F4 | BE: `GET /sync/pull` — watermark, trả cả bản xoá mềm, phân trang | ✅ |
| F5 | FE: hàng đợi gửi đi (outbox) móc vào `Repo.ts`, ghi cục bộ không chờ mạng | ✅ |
| F6 | FE: vòng sync push→pull, backoff, chạy khi mở app/foreground/sau ghi | ✅ |
| F7 | FE: công tắc bật/tắt + trạng thái đồng bộ (không màu đỏ) | ✅ |
| F8 | Kiểm chứng đầu-cuối FE↔BE với Postgres thật | ✅ |
| F9 | PWA: xác nhận offline thật trên Chrome (pane review chặn service worker) | ⬜ |

**F8 — kết quả kiểm chứng 2026-09-05** (chạy tay, server BE thật + Postgres thật, 12/12 đạt): đẩy 2 bản ghi có khoá ngoại · máy thứ hai kéo về đủ · tiếng Việt có dấu không hỏng · số nguyên không thành chuỗi · boolean giữ kiểu · watermark không kéo lại bản đã có · sửa ở máy B thì máy A thấy · bia mộ lan sang máy kia kèm `deletedAt` · gửi lại không nhân đôi.

**Nợ đã biết, không được quên:**
- Định danh mới chỉ là header `X-User-Id`, **chưa phải xác thực thật** — bắt buộc thay trước khi mở ra ngoài localhost.
- Phân trang pull thiếu tiebreaker `(updated_at, id)`: nếu số bản ghi trùng y hệt một `updatedAt` vượt `limit` thì hoặc mất bản ghi hoặc lặp vô hạn. BE đang vá bằng cách trả trọn nhóm cùng mốc (chấp nhận vượt `limit`) — đúng nhưng chưa phải lời giải sạch.
- Mỗi vòng sync kéo về đúng thứ client vừa đẩy lên (server không loại trừ thay đổi của chính client). Vô hại vì LWW bỏ qua, nhưng tốn mạng.
- `Common/Screens/Profile.tsx:185` điều hướng tới route `'SettingScreen'` trong khi `Container.tsx` đăng ký tên `'Setting'` — lỗi có sẵn, chưa sửa.

## G · Đưa app từ 5,4 lên trên 9 điểm (mở 2026-09-05)

Bảng điểm và lý do: artifact "Chấm điểm màn hình" + "Lên chín điểm". Chia hai đợt, agent trong cùng đợt chạy song song và **sở hữu tập file rời nhau**; đợt sau cần đợt trước xong.

### Đợt 1 — nền móng

| Mã | Agent sở hữu | Việc | Trạng thái |
|---|---|---|---|
| G1 | `src/Core/**`, `src/Common/Entities/**`, `Repositories/index.ts`, `scripts/soi-cau-truc.sh` | Tầng hàm thuần có test (công thức 03 + 08) · entity `Person`/`Money`/`TimeEntry` theo `02-data-model.md` · `MetricState` 3 trạng thái · luật kiến trúc cho `Core/` | 🟨 |
| G2 | `App.tsx`, `AppSetup/**`, `src/Main/**` | Gỡ vòng tự huỷ dữ liệu · bỏ đăng ký Work/Habit/Challenger/Trading khỏi navigator · dọn tab giả | 🟨 |
| G3 | `theme/**`, `lang/**`, `src/*/Text/**` | Design token không có đỏ/cam · gom chuỗi về tiếng Việt · rà giọng theo `00-vision.md` · script soi màu viết cứng | 🟨 |

### Đợt 2 — tính năng (cần đợt 1)

| Mã | Agent sở hữu | Việc | Trạng thái |
|---|---|---|---|
| G4 | `src/Person/**`, `src/Welcome/**` | Onboarding 4 bước theo `05-v1-spec.md` · màn người quan trọng | ⬜ |
| G5 | `src/Home/**` | Màn Hôm nay = 4 con số, không biểu đồ · ghi giờ ý nghĩa 1 chạm · ghi lãng phí 1 chạm · ô khoảnh khắc | ⬜ |
| G6 | `src/Money/**` | 5 ô nhập/tháng · bốc hơi · 4 nấc giàu · quy đổi giờ đời | ⬜ |
| G7 | `src/Hourglass/**`, `src/Common/Screens/{SettingScreen,Container}.tsx` | Đồng hồ cát opt-in mặc định tắt · Cài đặt đủ 7 mục theo spec | ⬜ |

**Cổng chín điểm — 12 ô, thiếu một ô là chưa chín.** Xem artifact "Lên chín điểm". Ô số 12 (≥30% của 50 người còn ghi ở tuần 4) không thuộc phạm vi agent — cần người dùng thật.

## Câu hỏi còn mở (không chặn V1, ghi lại để quyết sau)

- `Reminder/Screens/Home.tsx` rỗng 0 byte — có thuộc scope V1 không.
- `Trading/` (theo dõi thói quen xem giá chứng khoán) là tính năng gốc Batify, không thuộc sản phẩm Mira — giữ hay gỡ.
- Ràng buộc #2 "Giờ vàng không có giá" chưa audit hết `TimeTracker/`.
- Ràng buộc #4 "Đồng hồ cát" chưa tồn tại trong Batify, cần xây mới.
