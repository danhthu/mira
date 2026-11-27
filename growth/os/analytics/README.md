# Analytics — trạng thái integration & cách nạp số

**Trạng thái 2026-10-13: không có integration nào nối thật.** Lý do: chưa có app trên store, chưa có GA4 property, chưa có tài khoản ads trong repo. Mọi nguồn dưới đây có **đường nạp thủ công** (CSV) hoạt động ngay; API để sau khi có tài khoản.

| Nguồn | Cần | Cách lấy | Đường nạp | Trạng thái |
|---|---|---|---|---|
| Google Play Console | App đã publish; quyền Viewer | Statistics → chọn "Store listing acquisition" / "New users" → Export CSV; hoặc GCS bucket báo cáo (API chính thức: Play Developer Reporting API) | `metric import` sau khi map cột | Chưa có app |
| App Store Connect | App publish; role Sales/Analytics | App Analytics → Metrics → Impressions, Product Page Views, First-time downloads → Export; API: ASC Analytics Reports (cần key .p8) | `metric import` | Chưa có app |
| GA4 (blog/landing/PWA) | Property + gtag trong `growth/blog/src/components/BaseHead.astro` (cần approval code_change) | Reports → Export CSV; API: Data API với service account | `metric import` | Chưa tạo property |
| Search Console | Xác minh domain | Performance → Export | `metric add --metric impressions --channel SEO` | Chưa xác minh |
| Meta Ads | Tài khoản ads | Ads Manager → Export | `expense add` + `metric add --channel META_ADS` | Chưa có |
| Google Ads | Tài khoản ads | Reports → Export | như trên | Chưa có |
| Thủ công (waitlist từ ESP, PWA install đếm tay, số nền tảng social) | — | — | `metric add` | Sẵn sàng |

## Khuôn CSV chuẩn
`date,platform,channel,metric,value,source,quality,note` — xem `csv-template.csv`. Đặt file export gốc vào `analytics/imports/` (gitignore), file đã map đặt cùng tên `.mapped.csv` rồi `node growth/os/bin/os.mjs metric import analytics/imports/<file>.mapped.csv`.

## Mapping gợi ý
- Play "Store listing visitors" → `metric=store_visitors, platform=android, channel=UNKNOWN, source=play_console_csv`
- Play "Store listing acquisitions" / "New users" (first-time installers) → `installs`. Nếu export theo UTM source → map `utm_source` sang channel theo `channels.json`.
- ASC "Product Page Views" → `store_visitors, platform=ios`; "First-time downloads" → `installs`; theo Campaign (`ct`) → channel tương ứng.
- GA4 session theo `utm_source` → `pageviews`/`waitlist`/`clicks` với channel map; `appinstalled` → `pwa_installs, platform=pwa`.

## Trong app (first_open, session, retention)
**Không triển khai ở V1** — ràng buộc cứng #5 local-first. Nếu Founder duyệt sau này: đề xuất lớp buffer offline nhỏ (ghi sự kiện vào AsyncStorage, gửi theo lô khi có mạng, không PII, opt-in trong Settings) — ghi ở `docs/in-app-analytics-proposal.md` khi có yêu cầu, chưa viết để không tạo áp lực đổi ràng buộc.
