# Product analysis — code/fe so với spec V1 (2026-10-13)

- Câu hỏi: App thật trong `code/fe` làm được gì, màn hình nào quay footage được, và còn thiếu gì so với `docs/05-v1-spec.md`?
- Kết luận: `code/fe` vẫn là khung Batify (giao diện tiếng Anh, dữ liệu mẫu ngẫu nhiên nạp lại mỗi lần mở app); **không có tính năng nào trong 3 chỉ số lõi của Mira** (Giờ vàng, Tỷ giá đời, Vốn tự do) và không có Đồng hồ cát hay Khoảnh khắc.
- Ảnh hưởng: aso-specialist (không viết mô tả store về tính năng chưa có), creative-studio (không quay app làm footage "Mira"), seo-content và social-growth (chỉ nói "đang xây" khi nhắc app), founder (3 quyết định ở mục 6).

Phương pháp: đọc code, grep. Chưa chạy app, chưa nhìn bằng mắt (ghi "chưa kiểm bằng mắt"). HEAD `b385e3b`; commit cuối chạm `code/fe` là `41f8032` (2026-08-31). Ngày kiểm 2026-10-13.

## 1. Trạng thái phát hành (đọc nguyên văn)

`code/fe/app.json`: `name: "DailyOps"`, `slug: "DailyOps"`, `version: "1.0.0"`, iOS `bundleIdentifier: "com.wai.dailyops"`, `buildNumber: "20241216"`, `hermesEnabled: false`; EAS projectId `44d730ea-9ac8-4870-95a6-4abc87182db2`; `updates.url` trỏ vào projectId đó. Không có thư mục `android/`, `ios/`, `dist/`. `eas.json` có profile development/preview/production nhưng chưa thấy build. Scripts có `web:build` (`expo export --platform web && node scripts/patch-pwa.mjs`), `web:serve`, `web:icons`. `public/` có `manifest.webmanifest`, `sw.js`, icon 192/512 (PWA). Sentry: `Sentry.init` nằm trong khối comment ở `App.tsx` (đã tắt), nhưng `@sentry/react-native` vẫn nằm trong `package.json`.

## 2. Điều hướng thật

`src/Main/MainScreen.tsx` đăng ký: Welcome, Home, TabScreen, EmotionApp, GoalApp, GoalAppModal, ChallengerApp, HabitAppModal, WorkAppModal, TimeApp, IconSelectionModal, RichEditorBottomModal, Trading.

- `initialRouteName={settings.is_first_init ? 'Home' : 'Welcome'}`; `App.tsx` đặt `is_first_init = true` ngay lần chạy đầu. Hệ quả đối với lần mở đầu chưa kiểm bằng mắt: có thể thấy Welcome, các lần sau vào Home.
- `TabScreen` chỉ vào được từ nút "Work" / "Habit" trên Home (`Router.Open(nav,'TabScreen',{screen:'WorkApp'|'HabitApp'})`). Tab có 5 mục, nhãn mặc định tiếng Việt (`Hôm nay`, `Công việc`, `Khám phá`, `Thói quen`, `Công cụ`), nhưng `Discover` và `H` trỏ lại cùng `WorkApp`/`HabitApp` Container, nên là tab trùng/mã thử. `initialRouteName` mặc định là `'Tools'` — không có tab nào tên đó.
- `ToolsScreen.tsx` (lưới 6 module, 4 vòng % cố định 80/90/80/80, nhãn Habit/Work/Time/Goal/Challenge/Emotion): **không được đăng ký ở tuyến nào** → không vào được. Nút "Emotion" trong đó còn trỏ nhầm sang `WorkApp`.
- `Home/Screens/Home.tsx` có component `Tools` với badge số cứng 5/3/3 nền `colors.error` (đỏ), nhưng lời gọi `<Tools/>` bị comment → không render.
- `Reminder/Screens/Home.tsx` rỗng 0 byte. `Me/index.tsx` chỉ chứa hàm kiểm cập nhật OTA (`expo-updates`), không có màn hình. `Work/Screens/Home_OLD.tsx` là bản cũ.

## 3. Hai phát hiện lớn về hành vi khởi động

1. **Mỗi lần mở app chạy `clean → initialize → sample`** (`App.tsx` `setup`, không có điều kiện). `clean` gọi `empty()` cho work, habit, habitTracker, habitTemplate, emotion, wish, timeCat, dailyActivity, timeData. Nghĩa là mọi dữ liệu người dùng nhập ở các module này bị xoá khi mở lại app. Mâu thuẫn trực tiếp với Definition of Done #6 (dữ liệu nằm trên máy, bền) và với lời hứa local-first. Chưa chạy thử, kết luận từ đọc code.
2. **Dữ liệu mẫu ngẫu nhiên** nạp sau clean: Work (4–10 việc/ngày suốt 1 năm, tên "Working n", 45 phút), Habit (5 habit "Habit 0..4", 360 ngày), Emotion (3 lần/ngày × 1 năm, `description: 'emotion _ <ngày>'`). TimeTracker `sample()` rỗng; `initialize` tạo 6 nhóm thời gian cứng (Working, Personal, Family, Relationship, Waste, "Sleep & Relax") và hoạt động Sleep 8h, Transport 1h. Goal, Challenger, Common không có mẫu → màn trống.

## 4. Ngôn ngữ giao diện

`lang/textString.ts` (150 dòng) là tiếng Anh; `lang/en.ts` chỉ spread lại; `getText` trả cùng bản. Không có file `vi`. Các thư mục `src/*/Text/en.ts` dài 0 dòng. Tiếng Việt xuất hiện lẻ tẻ dưới dạng fallback `text.x || 'Hôm nay'` (TabScreen, TimeTracker, Home) — kết quả là màn hình trộn Anh/Việt. Welcome hoàn toàn tiếng Anh ("Welcome to", "make your life happier!", "What time do you usually wake up"...). Màn Home hiển thị lời chào "Welcome my friend," và câu "Wishing you abundant energy and happines" (sai chính tả "happines"). Ngày định dạng `moment` mặc định tiếng Anh.

## 5. Bảng chi tiết

Xem GAME_PROFILE.md mục "Màn hình thật trong code" và "Tính năng V1 theo spec ↔ code" (bảng đầy đủ nằm ở đó, không lặp ở đây).

Grep chứng minh "chưa có": `grep -rniE "goldenHours|hourglass|lifeRate" code/fe/src` chỉ ra 1 kết quả, là `icon="hourglass"` ở `src/Work/Screens/Add.tsx:130` (tên icon, không phải tính năng). Không có thư mục `src/core/`, `src/db/`, `src/i18n/` mà spec yêu cầu. Không có file widget, shortcut, quick tile, export JSON, giới nghiêm, ngày trắng. `grep -rniE "streak|achievement"` trong `src` không còn kết quả hoạt động; `badge` chỉ còn ở khối `Tools` không render. Còn 56 chỗ dùng `colors.error`/`'red'`/`danger` (chưa phân loại từng chỗ; ví dụ nút đóng ở TimeTracker Home đỏ, vòng % ở `ToolsScreen` đỏ khi < 55).

## 6. Mâu thuẫn và việc cần Founder

- Mâu thuẫn tài liệu: `CLAUDE.md` code ghi "tsc 0 lỗi, jest 27/27" (chưa chạy lại ở lượt này); `docs/ui-text-inventory.md` nói tab có tên `search` và `H` — code thật là `Discover` và `H`. Tin code.
- Cần Founder duyệt (đã nêu quy trình, chưa tạo request): (a) `approval request --kind code_change` đổi `app.json` name/slug/bundleId sang Mira; (b) quyết định có gỡ chuỗi `clean/initialize/sample` khỏi mỗi lần khởi động không (rủi ro mất dữ liệu người dùng); (c) có gỡ `Trading` ("Trading Monitoring", nút hiện trên Home) khỏi build không.
- Task kiểm bằng mắt: chạy `npm run web:build`/`web:serve`, chụp từng màn hình trong bảng — chưa làm, cần Founder hoặc môi trường có trình duyệt.
