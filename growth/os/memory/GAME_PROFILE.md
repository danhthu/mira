# GAME_PROFILE — hồ sơ sản phẩm Mira

Cập nhật: 2026-10-13 từ commit b385e3b (code/fe chạm lần cuối ở 41f8032, 2026-08-31). Chi tiết: `growth/os/research/product-analysis-2026-10-13.md`

> Tên file giữ theo mẫu Growth OS gốc (viết cho game). Mira không phải game. Mọi mục dưới là **sự thật từ repo** trừ khi ghi "giả định".

## Mira là gì

App di động tiếng Việt, local-first, cho người đi làm 25–45 tuổi trả lời hai câu: *còn bao nhiêu giờ cho người quan trọng?* và *đã mua được bao nhiêu tự do?*

Ba chỉ số lõi (`docs/00-vision.md`):
1. **Giờ vàng** — giờ/tuần thật sự bên người quan trọng.
2. **Tỷ giá đời** — thu nhập ròng ÷ tổng giờ THẬT đổ vào công việc (kể cả kẹt xe, tăng ca, giờ hồi sức). Ví dụ xuyên suốt nội dung: lương 30 triệu, 60 giờ thật/tuần → ≈115.000đ/giờ; điện thoại 25 triệu = 217 giờ.
3. **Vốn tự do** — tài sản ròng ÷ chi tiêu tháng = số tháng sống được không cần đi làm.

## Vòng lặp cốt lõi (tương đương "core loop")

Nhập ≤ 60 giây/ngày (ràng buộc cứng #1) → thấy ba con số → ra quyết định ngoài app (nhận việc / mua đồ / về quê). Mira không cần người dùng mở app nhiều — "Mira cần bạn sống nhiều".

## Điểm bán độc nhất (USP) — chưa blog/app Việt nào làm cả ba

1. **Công cụ tính ra con số CỦA HỌ** thay vì bài khuyên.
2. **Nối hai mảng**: tiền quy ra giờ, giờ quy ra người thân.
3. **Giọng thành thật, tự phản biện**; cam kết: không streak, không thông báo trách móc, không bán dữ liệu, dữ liệu nằm trên máy.

## Mira KHÔNG phải

App năng suất · app kế toán · mạng xã hội · app fitness.

## Phiên bản & trạng thái phát hành

| Mục | Trạng thái (2026-10-13) |
|---|---|
| V1 scope | M1 Thời gian (Giờ vàng, Đồng hồ cát) + M5 Khoảnh khắc — miễn phí vĩnh viễn |
| Code FE | Khung Batify đã dọn 6/8 nợ; tsc 0 lỗi; jest 27/27. **Màn hình Giờ vàng / Đồng hồ cát / Khoảnh khắc theo spec V1 chưa tồn tại trong code** — hiện có TimeTracker, HabitTracker, Goal, Work, Emotion… của Batify. Mọi nội dung ra ngoài chỉ được nói về thứ chạy được (skill `product-analysis` lập bảng "Tính năng V1 ↔ code"). |
| Build native | **Chưa có** (EAS projectId có, chưa build; không có thư mục `android/` `ios/`) |
| `app.json` (nguyên văn, kiểm 2026-10-13) | `name: "DailyOps"`, `slug: "DailyOps"`, `version: "1.0.0"`, iOS `bundleIdentifier: "com.wai.dailyops"` — vẫn là vỏ Batify |
| Ngôn ngữ UI | Chủ yếu tiếng Anh (`lang/textString.ts`), không có file `vi`; tiếng Việt chỉ lẻ tẻ ở chuỗi dự phòng |
| Store | **Chưa lên** Google Play / App Store |
| Web/PWA | Chạy được (`npm run web:build`), chưa deploy công khai |
| Analytics trong app | **Không** (Sentry đã tắt theo ràng buộc #5) |
| Giá | Free V1; trả phí dự kiến 59k/tháng từ V2 (`docs/04-roadmap.md`) |

## Hình ảnh / thương hiệu

- `growth/brand/` trống (chỉ README). Blog dùng xanh đậm + vàng ấm (theo `image_prompt` trong bài: "deep green + warm gold accents").
- Logo, token màu: **chưa có** — việc của creative-studio.

## Vì sao người ta chia sẻ (giả định, cần kiểm bằng thử nghiệm)

- Con số gây sốc nhưng thật ("còn 68 lần gặp bố mẹ", "iPhone = 217 giờ") → chia sẻ ảnh kết quả máy tính.
- Giọng phản biện chính mình → tin cậy, dẫn link trong tranh luận cộng đồng.
- Rủi ro đã biết: hook "bố mẹ" gây tội lỗi → CTR cao, retention thấp (`docs/06-marketing-test.md` §8). Theo dõi tỷ lệ bình luận "nặng nề" > 10–15% là tín hiệu dừng.

## Đối tượng (tóm tắt — chi tiết ở AUDIENCE_PROFILE.md)

Người Việt đi làm 25–45, thu nhập trên trung bình (nhân vật 30 triệu = 3,3× bình quân, N-003), có con nhỏ hoặc bố mẹ ở xa, đang cân nhắc đổi việc / mua lớn / về quê.

## Màn hình thật trong code (kiểm 2026-10-13, commit b385e3b)

Đọc từ code, **chưa kiểm bằng mắt** (chưa chạy app). Toàn bộ là khung Batify, không có màn hình nào của Mira. Dữ liệu mẫu do `AppSetup/sample.ts` nạp ngẫu nhiên mỗi lần mở app (xem mục "Cảnh báo").

| Module | Màn hình (file) | Vào được từ app? | Làm gì (1 dòng) | Quay footage được? | Ghi chú |
|---|---|---|---|---|---|
| Welcome | `src/Welcome/Screens/Home.tsx` (Step1–6, StepFinish) | có (tuyến `Welcome`, lần đầu) | Onboarding 7 bước: giờ thức, giờ ngủ, số ngày làm việc, câu hỏi stress, gợi ý thói quen | kỹ thuật có, **không dùng** | Tiếng Anh; khác hẳn onboarding 4 bước của spec (không hỏi người quan trọng) |
| Home | `src/Home/Screens/Home.tsx` | có (tuyến `Home`) | Ngày hôm nay, câu động lực, task công việc/thói quen hôm nay, thẻ thời gian, cảm xúc, mục tiêu, nút "Trading Monitoring" | kỹ thuật có, **không dùng** | Lời chào tiếng Anh có lỗi chính tả; nút Trading không thuộc Mira |
| Main | `src/Main/TabScreen.tsx` | có, qua nút Work/Habit trên Home | Bottom tab 5 mục, `Discover` và `H` trỏ trùng Work/Habit | không | Tab trùng, `initialRouteName` mặc định `Tools` không tồn tại |
| Main | `src/Main/ToolsScreen.tsx` | **không** (không đăng ký tuyến) | Lưới 6 module + 4 vòng % số cứng | không | Có file, không vào được từ app |
| TimeTracker | `src/TimeTracker/Screens/{HomeContainer,Home,Add,StaticList,Statistic,Settings,Settings.Cat,Details,TimeUsedDetail}.tsx` | có (tuyến `TimeApp`), nhưng chỉ từ `Routing.ts`/thẻ thời gian trên Home | Drawer 5 mục; chia thời gian vào 6 nhóm (Working, Personal, Family, Relationship, Waste, Sleep & Relax) theo phần trăm | một phần: sau `initialize` có nhóm + Sleep 8h, Transport 1h; `sample()` rỗng | Gần nhất với ý "giờ" của Mira nhưng chưa có "người quan trọng", chưa có Giờ vàng; chưa audit ràng buộc #2 |
| HabitTracker | `src/HabitTracker/Screens/*` (HomeScreen, Add/*, Statistic/*, Settings, Template) | có (tab `HabitApp`, `HabitAppModal`) | Theo dõi thói quen hằng ngày, thống kê | có kỹ thuật (5 habit mẫu "Habit 0..4", 360 ngày) | Đã gỡ streak; tên mẫu giả |
| Work | `src/Work/Screens/*` (Home, Add, Statistic, Tools/Dashboard...) | có (tab `WorkApp`, `WorkAppModal`) | Quản lý công việc, lịch, backlog, thống kê trung tính | có kỹ thuật (4–10 việc/ngày × 1 năm, tên "Working n") | Không phải tính năng Mira; `Home_OLD.tsx` là bản cũ |
| Emotion | `src/Emotion/Screens/{Home/*,Detail,DailyMovitationString}.tsx` | có (tuyến `EmotionApp`, thẻ trên Home) | Chấm cảm xúc 3 lần/ngày, xem ngày/tuần/tháng/năm | có kỹ thuật (mẫu ngẫu nhiên 1 năm, mô tả "emotion _ ...") | Gần "Khoảnh khắc" nhất nhưng không gắn người/ảnh |
| Goal | `src/Goal/Screens/*` | có (`GoalApp`) | Mục tiêu ngắn/dài hạn, milestone | màn trống (không có mẫu) | Spec V1 nói "không mục tiêu" |
| Challenger | `src/Challenger/Screens/*` | có (`ChallengerApp`) | Thử thách liên kết thói quen/việc | màn trống | Ngoài scope V1 |
| Trading | `src/Trading/index.tsx` | có (nút trên Home, tuyến `Trading`) | Theo dõi thời gian xem giá chứng khoán | không | Tính năng gốc Batify, ngoài sản phẩm Mira |
| Common | `src/Common/Screens/{Profile,SettingScreen,Privacy,Term,HelpCenter,Reminder,...}.tsx` | chưa thấy tuyến vào từ Main | Hồ sơ, cài đặt, điều khoản | chưa xác nhận | Nhãn là khoá thô (`HelpAndFeedback`, `StatusStat`...) |
| Reminder | `src/Reminder/Screens/Home.tsx` | không | File rỗng 0 byte | không | |
| Me | `src/Me/index.tsx` | không | Chỉ hàm kiểm cập nhật OTA, không có màn hình | không | |

Kết luận cho creative-studio: **chưa có màn hình nào đủ tư cách là footage "Mira"** (sai ngôn ngữ, sai tên, dữ liệu giả, không có ba chỉ số lõi). Nội dung quảng bá nên dùng mockup hoặc hình minh hoạ từ bài viết cho tới khi có màn hình V1 thật.

## Tính năng V1 theo spec ↔ code (kiểm 2026-10-13)

| Tính năng (docs/05, docs/03) | Trạng thái | Bằng chứng (file/grep) | Nói ra ngoài được không |
|---|---|---|---|
| Onboarding 4 bước (chọn người quan trọng, tên, tần suất gặp) | chưa có | `Welcome/` hỏi giờ thức/ngủ, ngày làm việc, stress, gợi ý thói quen (Step2–6); không có bước chọn người | KHÔNG — chỉ nói "đang xây" |
| Hôm nay: "Hôm nay bạn có N giờ vàng", Bắt đầu, Ghi nhanh | chưa có | `Home/Screens/Home.tsx` là dashboard task/thói quen/cảm xúc | KHÔNG |
| Giờ vàng (công thức §1 docs/03) | chưa có | `grep -rniE "goldenHours\|lifeRate" code/fe/src` = 0 kết quả; không có `src/core/` | KHÔNG — chỉ nói "đang xây" |
| Tỷ giá đời (thu nhập ròng/giờ thật) | chưa có (ngoài V1 theo spec) | không có model thu nhập/chi tiêu trong `src` | KHÔNG |
| Vốn tự do | chưa có (ngoài V1) | như trên | KHÔNG |
| Đồng hồ cát (công thức §2, mặc định tắt) | chưa có | `grep hourglass` chỉ ra tên icon ở `Work/Screens/Add.tsx:130` | KHÔNG |
| Khoảnh khắc (dòng thời gian, ảnh, slideshow) | chưa có | `Emotion` có chấm cảm xúc, không có entity moment/ảnh/người | KHÔNG |
| Danh sách người quan trọng / Settings người | chưa có | không có entity "person" | KHÔNG |
| Giới nghiêm buổi tối, Ngày trắng | chưa có | không thấy trong `src` | KHÔNG |
| Xuất JSON / Xoá toàn bộ dữ liệu | chưa có | không có luồng export; `SettingScreen.tsx` gần như rỗng | KHÔNG |
| Widget màn hình chính, Shortcut, quick tile | chưa có | không có module widget; `app.json` không khai | KHÔNG |
| Theo dõi thời gian theo nhóm (Working/Family/Relationship...) | một phần, không phải Giờ vàng | `src/TimeTracker/*`, nhóm trong `Setup/initialize.ts` | KHÔNG nên nêu; nếu cần thì chỉ "sắp" và không gọi là Giờ vàng |
| Không streak / không badge / không màu đỏ trách móc | một phần | streak gỡ trong HabitTracker; còn `colors.error` 56 chỗ (chưa phân loại), nút đóng đỏ ở TimeTracker Home | có, kèm chữ "sắp" (đã dọn một phần, chưa audit hết) |
| Local-first, không analytics | một phần | Sentry init đã comment (`App.tsx`); lưu AsyncStorage; **nhưng** mỗi lần mở app xoá và nạp lại dữ liệu mẫu (`App.tsx` `setup`) | KHÔNG nói "dữ liệu an toàn trên máy" cho tới khi sửa lỗi này |
| Chạy iOS/Android | chưa có build | không có `android/` `ios/`; chưa lên store | KHÔNG |
| PWA / web build | có (chưa deploy công khai) | `package.json` `web:build`, `public/manifest.webmanifest`, `public/sw.js` | có, nhưng chưa có URL công khai nên chưa có gì để trỏ tới |
| Giao diện tiếng Việt | một phần nhỏ | `lang/textString.ts` tiếng Anh; vài chuỗi dự phòng tiếng Việt | KHÔNG |

## Cảnh báo cần Founder (phát hiện 2026-10-13, từ đọc code, chưa chạy thử)

1. **Mỗi lần mở app xoá dữ liệu người dùng** ở work/habit/emotion/time rồi nạp dữ liệu mẫu ngẫu nhiên: `App.tsx` hàm `setup` gọi tuần tự `app_clean()`, `app_initialize()`, `app_sample()` không điều kiện. Chặn mọi lời hứa "dữ liệu nằm trên máy của bạn" và mọi thử nghiệm với người dùng thật.
2. `app.json` còn `DailyOps` / `com.wai.dailyops` — cần `approval request --kind=code_change` trước khi lên store (chưa tạo).
3. `Trading` ("Trading Monitoring") hiện trên Home — tính năng không thuộc Mira.

## Điểm bán độc nhất (USP) — đã kiểm so với code

- USP 1 (công cụ ra con số của họ): **chưa có trong app** (giả định — chưa có trong code); dự kiến ở blog/công cụ web, 6 widget chưa build (PROJECT_CONTEXT).
- USP 2 (nối tiền ↔ giờ ↔ người thân): **chưa có trong code** (giả định).
- USP 3 (không streak, không bán dữ liệu, dữ liệu trên máy): đúng một phần — streak đã gỡ, Sentry tắt, không có server; nhưng lỗi xoá dữ liệu mỗi lần mở app (cảnh báo 1) làm câu "dữ liệu trên máy" chưa đáng tin để nói ra.
