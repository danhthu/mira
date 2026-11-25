---
name: attribution-tracking
description: Tạo và ghi sổ link theo dõi cho Mira — UTM cho web/landing/PWA (`os.mjs link`), Play Store referrer, App Store campaign link (pt/ct), sự kiện PWA appinstalled trên GA4 — và quy tắc gán kênh khi không rõ nguồn. Dùng khi nói "tạo link UTM", "link theo dõi", "tracking link", "link cho bài Threads", "referrer Play", "campaign link App Store", "gán kênh", "attribution", "UTM link", "đo PWA install". KHÔNG dùng để nạp số (growth-analytics) hay để quyết campaign (campaign-management).
---

# Attribution tracking — link theo dõi cho Mira

## Mục đích

Mỗi link ra ngoài phải mang kênh đúng taxonomy `config/channels.json` và có dòng trong sổ `growth/os/attribution/links.csv`, để khi số về (GA4, Play, ASC) còn truy được link nào sinh ra số đó. Không có link trong sổ = số về sẽ rơi vào UNKNOWN.

## Khi nào dùng

- Trước khi content K-xxxx chuyển APPROVED → PUBLISHED (content update cần `--utm`).
- Khi campaign (organic hoặc paid) cần `--tracking-link`.
- Khi gửi outreach đối tác, đăng vào cộng đồng, hoặc đặt link trong bio.

## Đầu vào bắt buộc

- URL đích thật (landing/blog/PWA). Domain hiện `https://mira.trady360.com` — chưa chốt, xem CURRENT_STATE; link tạo trước khi chốt domain phải ghi chú "domain tạm".
- Kênh đúng taxonomy: SEO, BLOG, FACEBOOK_ORGANIC, TIKTOK, YOUTUBE, REDDIT, THREADS, COMMUNITY, PARTNERSHIP, NEWSLETTER, META_ADS, GOOGLE_ADS, DIRECT, UNKNOWN.
- Tên campaign (slug không dấu, gạch ngang, ≤ 40 ký tự vì App Store `ct` cắt ở 40) và content (K-id hoặc tên nhóm/đối tác).

## Các bước thực thi

1. **Web UTM** (blog, landing, PWA):
   ```
   node growth/os/bin/os.mjs link --url https://mira.trady360.com/blog/ty-gia-doi --channel THREADS --campaign goc-c-tuan-3 --content K-0012
   ```
   CLI đặt `utm_source`/`utm_medium` từ taxonomy, `utm_campaign` = tên campaign, `utm_content` = content, `--term` tuỳ chọn (từ khoá Google Ads). Không gõ UTM tay.
2. **Play Store referrer** (chỉ khi app đã lên Play; package hiện trong `code/fe/app.json` còn là vỏ cũ — lấy package thật từ Founder):
   ```
   node -e "import('./growth/os/lib/attribution.mjs').then(m=>console.log(m.playReferrerLink({packageName:'<package>',channel:'COMMUNITY',campaign:'voz-tai-chinh',content:'thread-123'})))"
   ```
   Play chỉ gán được install khi app đọc Install Referrer API — V1 Mira không có SDK, nên referrer chỉ hiện ở Play Console "Acquisition by UTM" cho *store visitors*, không tới từng install.
3. **App Store campaign link** (khi có app iOS; cần Provider ID `pt` trong ASC → Users and Access → Keys/Provider):
   ```
   node -e "import('./growth/os/lib/attribution.mjs').then(m=>console.log(m.appStoreCampaignLink({appId:'<id>',providerToken:'<pt>',campaign:'goc-c-tuan-3'})))"
   ```
   Chỉ hiện trong App Analytics theo campaign, không gán tới người; iOS không có referrer.
4. **PWA install**: web build cần GA4 bắn event `appinstalled` (lắng `window.addEventListener('appinstalled')`). Đây là thay đổi `code/fe` → chưa làm nếu chưa có approval `code_change`; ghi `approval request --kind code_change --request "Thêm GA4 + event appinstalled vào web build" --ref T-xxxx`. Khi có, GA4 Explore lọc event `appinstalled` theo `session source/medium` → nạp `pwa_installs` (skill growth-analytics).
5. Ghi sổ: thêm một dòng vào `growth/os/attribution/links.csv` (header `id,channel,campaign,content,url,created_at,created_by`). `id` dạng L-0001 tăng dần; `created_by` = agent. Không có dấu phẩy trong `content`; URL giữ nguyên (đã encode).
6. Gắn link vào bản ghi tương ứng: `content update K-0012 --utm "<link>"` hoặc `campaign update C-0003 --tracking-link "<link>"`. Link paid phải có `utm_medium=cpc` — kiểm bằng mắt.
7. Nếu cần link ngắn cho bio/video: tạo link ngắn thủ công (Founder chọn dịch vụ) và ghi cả hai URL trong cùng dòng sổ (cột `url` là link dài; link ngắn ghi ở `content` dạng `K-0012 short:bit.ly/...`).

## Đầu ra

- Dòng mới trong `growth/os/attribution/links.csv`, ví dụ:
  `L-0001,THREADS,goc-c-tuan-3,K-0012,https://mira.trady360.com/blog/ty-gia-doi?utm_source=threads&utm_medium=social&utm_campaign=goc-c-tuan-3&utm_content=K-0012,2026-10-20,social-growth`
- Trường `utm` của content hoặc `tracking_link` của campaign đã cập nhật (xem bằng `content show K-0012` / `campaign show C-0003`).

## Quy tắc gán kênh (dùng khi nạp số)

- Có UTM khớp taxonomy → kênh đó, quality measured.
- Có UTM nhưng `utm_source` lạ (ví dụ `fb`, `ig`) → map về kênh gần nhất, quality `estimated`, note ghi source gốc; sửa link sai ở nguồn.
- Store install không có referrer/campaign → UNKNOWN; không chia theo "cảm giác" cho kênh nào. Ghi LEARNINGS nếu tỷ lệ UNKNOWN > 50% — đó là dấu hiệu thiếu link trong sổ.
- Trùng khung giờ đăng bài mà không có UTM (TikTok bio chẳng hạn) → có thể ghi `estimated` với note "cùng khung giờ post K-xxxx", không bao giờ measured.

## Hạn chế đã biết (ghi trong báo cáo khi trích số)

- UTM đo click vào store/landing, không đo install app. Install Android theo kênh chỉ có khi app tích hợp Install Referrer (V1: không).
- iOS không có referrer; `ct=` chỉ hiện tổng theo campaign trong App Analytics.
- SKAdNetwork chỉ có ý nghĩa khi vừa chạy ads vừa có SDK — Mira V1 không có cả hai, không nhắc tới trong proposal như thể sẽ có.
- PWA appinstalled chỉ đếm được khi GA4 đã có trên web build.

## Kiểm chất lượng

- [ ] Link sinh bằng `os.mjs link`, không gõ tay; kênh có trong taxonomy.
- [ ] `utm_campaign` ≤ 40 ký tự, không dấu, không khoảng trắng.
- [ ] Mỗi link đã có dòng trong `links.csv` và đã gắn vào K-id/C-id.
- [ ] Link paid có `utm_medium=cpc`; link organic không có.
- [ ] Domain tạm được ghi chú nếu chưa chốt.

## Khi lỗi / kẹt

- `channel không hợp lệ`: đổi sang kênh trong taxonomy; muốn kênh mới → DECISION_LOG + sửa channels.json (Founder).
- `Invalid URL`: thiếu `https://`.
- Không có package/app id/pt: app chưa lên store — chỉ tạo web UTM, ghi task BLOCKED cho phần store.
- Link không khớp taxonomy hoặc không rõ kênh → đọc lại `growth/os/attribution/README.md` (thứ tự nguồn tin, quy tắc UNKNOWN); không tự đoán kênh.

## Agent liên quan

`growth-analytics` (chủ sổ link, gán kênh) · `social-growth`, `community-partnerships`, `seo-content` (xin link trước khi đăng) · `paid-acquisition` (link cpc).

## Công cụ dùng

CLI `os.mjs link`, `node -e` gọi `lib/attribution.mjs` · Edit `links.csv` · `content update` / `campaign update`.
