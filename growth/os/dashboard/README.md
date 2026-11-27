# Mira Growth — Dashboard (2026-10-13)

| Mục | Giá trị |
|---|---|
| Installs tổng / mục tiêu | 0 / 1000 (0%) |
| Android · iOS · PWA | 0 · 0 · 0 |
| Organic · Paid · Không rõ | 0 · 0 · 0 |
| Waitlist | 0 |
| Retained D7 | 0 |
| Ngân sách chi / trần | 0 / 100 USD |
| Task DONE / tổng | 13 / 26 |
| Nội dung PUBLISHED | 0 |
| Thử nghiệm mở | 1 |
| Dự báo ngày 90 (ước) | 0 |

## Installs theo kênh
| Kênh | Đo | Ước | Không gán |
|---|---|---|---|
| (chưa có) | | | |

## Chuỗi ngày (installs)
- chưa có

## Chờ Founder
- [#1 code_change] Gắn GA4 gtag + 3 event vào growth/blog BaseHead.astro và web build PWA theo growth/os/analytics/ga4-plan.md — không đụng app native
- [#2 code_change] code/fe/App.tsx:89-91 xoá toàn bộ dữ liệu và nạp mẫu giả mỗi lần mở — chặn thử nghiệm người thật và trái cam kết local-first. Đề nghị bọc trong cờ dev hoặc gỡ.
- [#3 code_change] growth/blog: 88 bài mirror không có draft:true và site không lọc draft → deploy bây giờ sẽ đăng công khai cả 88 bài chưa duyệt. Đề nghị: thêm draft:true cho bài chưa APPROVED + lọc draft trong getCollection (index, blog list, rss, sitemap) TRƯỚC lần deploy đầu.
- [#4 code_change] Đổi code/fe/app.json: name/slug DailyOps → Mira, thêm android.package, đổi ios.bundleIdentifier com.wai.dailyops → <đề xuất>; Founder chốt tên và bundle id. Đề xuất: com.trady360.mira (hoặc vn.mira.app); chi tiết growth/os/aso/play-listing-2026-10-13.md
- [#5 publish] Gửi 5 thư outreach đầu tiên (growth/os/content/outreach/) tới: Thảo Thảo (The Slow Reader), Vũ Hồng Khanh, Ngân Jones (Chuyện của Ngân), Nguyễn Anh Ngọc (NgocDenRoi), Minh Pham (Career and Life Diary). Founder gửi tay. Lưu ý: Minh Pham chưa có kênh công khai (cần xác nhận), NgocDenRoi chưa đo quy mô blog. Danh sách: growth/os/research/outreach-2026-10-13.csv
- [#6 code_change] Thay growth/blog/src/pages/index.astro bằng growth/os/content/landing-index.astro.proposal (landing + form waitlist chưa nối ESP). Lưu ý: form chưa lưu email, không deploy công khai trước khi nối ESP.

_Sinh bởi `node growth/os/bin/os.mjs dashboard`. Số 0 khi chưa nạp dữ liệu nghĩa là "chưa đo"._
