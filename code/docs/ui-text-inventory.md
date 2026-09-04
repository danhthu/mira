# Kiểm kê text label và cấu trúc giao diện — Mira FE

Tạo bởi: skill `tai-lieu-ky-thuat` (vai Kiến trúc sư giải pháp + Chuyên gia dữ liệu) · 31/8/2026
Nguồn: nhánh `feat/port-batify-modules`, commit `bc06b64` · `code/fe/lang/*` · `code/fe/src/Main/*` · quét toàn bộ `*.tsx` trong `code/fe/src`
Đối chiếu: kho `sdvico/mkn-3` commit `4fe53fa` (`fe-admin`, `app-owner`)

---

## 1 · Phạm vi

Tài liệu kiểm kê ba thứ: (a) cấu trúc điều hướng của app di động Mira, (b) toàn bộ chuỗi hiển thị và nơi chúng cư trú, (c) bảng so sánh kiến trúc i18n giữa Mira và hai frontend của mkn-3. Tài liệu KHÔNG đề xuất thiết kế lại điều hướng và KHÔNG kiểm kê backend.

## 2 · Cấu trúc giao diện

### 2.1 Điều hướng hai tầng

Tầng gốc là stack navigator tại `src/Main/MainScreen.tsx`. Stack đăng ký 13 tuyến:

| Tuyến | Loại | Module đích |
|---|---|---|
| `TabScreen` | tab container | `src/Main/TabScreen.tsx` |
| `Home` | screen | `src/Home` |
| `Welcome` | screen | `src/Welcome` |
| `WorkAppModal` | modal | `src/Work` |
| `HabitAppModal` | modal | `src/HabitTracker` |
| `GoalApp` / `GoalAppModal` | screen + modal | `src/Goal` |
| `EmotionApp` | screen | `src/Emotion` |
| `ChallengerApp` | screen | `src/Challenger` |
| `TimeApp` | screen | `src/TimeTracker` |
| `Trading` | screen | `src/Trading` |
| `IconSelectionModal` | modal | chọn biểu tượng |
| `RichEditorBottomModal` | modal | soạn thảo |

Tầng hai là bottom-tab tại `src/Main/TabScreen.tsx`, 6 tab: `HomeScreen`, `WorkApp`, `HabitApp`, `Discover`, `search`, `H`.

`Vấn đề mở — nguồn mâu thuẫn:` hai tab `search` và `H` không khớp quy ước đặt tên PascalCase của bốn tab còn lại, và không có nhãn trong `textString.common.tabar` (chỉ khai 5 nhãn: profile, timeTracker, habitTracker, challenge, home — trong đó `timeTracker` và `profile` không ứng với tab nào đang đăng ký). Cần xác nhận tab nào là thật, tab nào là mã thử.

### 2.2 Điều hướng lập trình

`code/fe/Router/index.ts` bọc `navigation.navigate` bằng đối tượng `Router` với quy ước: `params.mode == 'modal'` tự nối hậu tố `Modal` vào tên tuyến. Tên tuyến khai kiểu `ROUTER_NAME = string` — không phải union type, nên trình biên dịch KHÔNG bắt được tên tuyến sai chính tả.

`Khuyến nghị —` chuyển `ROUTER_NAME` thành union của 13 tên tuyến đã đăng ký; chi phí một dòng, chặn được cả lớp lỗi điều hướng chạy mới biết.

### 2.3 Module theo thư mục

11 module nghiệp vụ dưới `src/`: `Home`, `Work`, `HabitTracker`, `TimeTracker`, `Goal`, `Emotion`, `Challenger`, `Me`, `Reminder`, `Trading`, `Welcome`; cộng `Common` (màn hình dùng chung), `Controls`, `Assets`, `Main`. Mỗi module vào qua `Screens/Container.tsx` tự đăng ký stack con của nó.

## 3 · Kiểm kê chuỗi hiển thị

### 3.1 Nơi cư trú

| Nơi | Số lượng | Ghi chú |
|---|---|---|
| `lang/textString.ts` | 150 dòng, ~110 khoá | Nguồn chính, tiếng Anh |
| `lang/en.ts` | re-export | `enString = { ...textString }` — hai "ngôn ngữ" là một |
| Chuỗi cứng trong props JSX | 23 chuỗi / 18 vị trí | Lẫn Việt–Anh: `"Chọn"`, `"Xem Giá"`, `"Cập nhật mục tiêu"`, `"Nhập thời gian mục tiêu (phút)"` cạnh `"Write something ..."`, `"New Time"` |
| Chuỗi cứng trong thân JSX | 5 | Gồm 4 chuỗi placeholder `Screen A/B/C/D` |

124 trên 193 tệp `.tsx` dùng `useText()`/`textString` — độ phủ i18n xấp xỉ 64% số tệp.

### 3.2 Nhóm khoá trong `textString`

| Nhóm | Nội dung | Trạng thái |
|---|---|---|
| `common` | nút chung (save/edit/delete/addNew), thứ trong tuần, mức ưu tiên, nhãn tab | Nhiều giá trị chưa phải chuỗi hiển thị: `'newHabit'`, `'help_center'`, `'notgood'` — khoá và giá trị trùng nhau |
| `repeat` `goal` `reminder` `plan` `tag` `checkList` | tiêu đề + phụ đề các khối cấu hình thói quen | Hoàn chỉnh |
| `profile_screen` | mục màn hình cá nhân | 10/11 giá trị là khoá lặp lại (`'HelpAndFeedback': 'HelpAndFeedback'`) — chưa viết chuỗi thật |
| `welcome_Q` `welcome_Recomments` `welcome_finish` | luồng onboarding | Hoàn chỉnh; `welcome_Recomments` nhúng biểu thức nội suy dạng `{$.wakeup.minut+15>60?...}` trong chuỗi — `TBD — cần xác nhận` cơ chế nào đánh giá biểu thức này |
| `smart_goal` | mô tả phương pháp SMART | Chuỗi HTML nhúng trong TS |
| `common.error.habit_day_greater` | thông báo lỗi | Giá trị rỗng `''` |

### 3.3 Cơ chế chọn ngôn ngữ

`lang/index.ts` đọc `configStore.lang`, trả `enString` khi `'en'`, ngược lại trả `textString`. Vì `enString` sao chép nguyên `textString`, việc đổi ngôn ngữ hiện KHÔNG đổi bất kỳ chuỗi nào. `useLocale()` trả cứng `'en'`.

## 4 · Bảng so sánh với mkn-3

| Tiêu chí | Mira `code/fe` | mkn-3 `fe-admin` | mkn-3 `app-owner` |
|---|---|---|---|
| Kiến trúc từ điển | 1 tệp `textString.ts` toàn app | Tách theo feature: shared + 10 bundle, 3 namespace (`translation`, `trip-ui`, `vphc-ui`) | 1 tệp `vi.ts`/`en.ts`, kiểm hình dạng bằng `typeof vi` |
| Ngôn ngữ chính | Tiếng Anh | Tiếng Việt | Tiếng Việt |
| Ngôn ngữ thứ hai | Không có thật (`en.ts` sao chép nguồn) | `en.ts` đủ, TypeScript ép khớp khoá | `en.ts` đủ, TypeScript ép khớp khoá |
| Thư viện | Tự viết (`useText()`) | i18next (`useTranslation`, `addResourceBundle`) | i18next |
| Số nhiều | Không có cơ chế | Hậu tố `_one`/`_other` | Hậu tố `_other` |
| Nội suy biến | Hàm `for(text)` + biểu thức `{$...}` tự chế trong chuỗi | `{{var}}` chuẩn i18next | `{{var}}` chuẩn i18next |
| Chuỗi cứng trong JSX | 28 (23 props + 5 thân), lẫn Việt–Anh | 0 — lint `lint:styles` cưỡng chế, CI chặn | 0 — lint `lint:ui` cưỡng chế, CI chặn |
| Khoá chưa có chuỗi thật | ~15 (khoá = giá trị) + 1 giá trị rỗng | Không phát hiện | Không phát hiện |
| Enum backend → nhãn | Không áp dụng (chưa nối BE) | Luật 2: BE trả mã, FE dịch — `useEnumLabel()` | Cùng luật, dịch tại `vi.ts` |
| Chú thích thuật ngữ trong từ điển | Không | Trỏ về bảng thuật ngữ `growth/rules/02-giao-dien.md` | Cùng nguồn, kèm luật 19/20/22 |

### Kết luận so sánh

mkn-3 cưỡng chế bằng máy (lint + CI) nên giữ được 0 chuỗi cứng trên hai frontend; Mira dựa vào kỷ luật tay nên rò 28 chuỗi và để từ điển tiếng Anh thứ hai thành bản sao rỗng. Khoảng cách không nằm ở số lượng khoá mà ở **ba cơ chế mkn-3 có, Mira chưa có**: lint cấm chuỗi hiển thị trong JSX, kiểm hình dạng từ điển bằng kiểu, và quy ước số nhiều/nội suy theo chuẩn thư viện thay vì tự chế.

## 5 · Danh sách cần xử lý

| Nhãn | Mục |
|---|---|
| `Vấn đề mở` | Tab `search` và `H` — thật hay mã thử (mục 2.1) |
| `TBD — cần xác nhận` | Cơ chế đánh giá biểu thức `{$.wakeup...}` trong `welcome_Recomments` (mục 3.2) |
| `TBD — cần xác nhận` | `common.error.habit_day_greater` giá trị rỗng — thông báo dự kiến là gì |
| `Khuyến nghị` | `ROUTER_NAME` thành union type (mục 2.2) |
| `Khuyến nghị` | Đưa 28 chuỗi cứng về `textString`, thêm lint cấm chuỗi hiển thị trong JSX theo mẫu `lint:ui` của app-owner |
| `Khuyến nghị` | Viết chuỗi thật cho ~15 khoá đang lặp khoá làm giá trị (`profile_screen`, một phần `common`) |
