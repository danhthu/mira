# Attribution — cách gán nguồn và giới hạn thật

## Taxonomy
`growth/os/config/channels.json`. Mỗi kênh có `utm_source`/`utm_medium` cố định. `UNKNOWN` là mặc định khi không gán được — **không bao giờ** "chia đều" UNKNOWN cho các kênh.

## Ba loại link

| Đích | Lệnh | Gán được gì |
|---|---|---|
| Web (blog, landing, PWA) | `node growth/os/bin/os.mjs link --url <url> --channel THREADS --campaign hook-c-1 --content post-12` | GA4 session → pageview, cta_click, waitlist, appinstalled (PWA) theo UTM |
| Google Play | `node -e "import('./growth/os/lib/attribution.mjs').then(m=>console.log(m.playReferrerLink({packageName:'<package>',channel:'BLOG',campaign:'bai-03'})))"` | Play Console "Acquisition → UTM" báo installs theo utm_source/campaign (tổng hợp, có độ trễ, có ngưỡng ẩn số nhỏ) |
| App Store | `appStoreCampaignLink({appId, providerToken, campaign})` | App Analytics "Campaigns" báo impressions/product page views/downloads theo `ct` — tổng hợp, chỉ người đồng ý chia sẻ dữ liệu |

Ghi mỗi link vào `growth/os/attribution/links.csv`.

## Điều UTM KHÔNG làm được
- Không nhận diện từng install app. Web UTM dừng ở lúc rời trang sang store.
- iOS không có install referrer. Chỉ có campaign link tổng hợp.
- PWA: `appinstalled` chỉ đếm được khi GA4 có trên web build (cần approval code_change vì nằm trong `code/fe` web export hoặc patch-pwa).
- Meta/Google "installs" tự báo không có SDK/SKAdNetwork = ước tính của họ → ghi `quality=estimated`.
- Installs từ Play/ASC không có UTM → `channel=UNKNOWN`, `quality=measured` (số đúng, nguồn không rõ).

## Thứ tự nguồn tin khi mâu thuẫn
1. Play Console / App Store Connect (số install thật).
2. GA4 trên web của mình (waitlist, cta_click).
3. Ads Manager (clicks/spend thật; conversions = ước).
4. Số nền tảng social (views/likes) — chỉ để xếp hạng nội dung, không để kể công install.

## Ước tính được phép
Khi một ngày có installs UNKNOWN và chỉ một kênh đẩy traffic rõ rệt (ví dụ 1 bài viral), được ghi thêm dòng `quality=estimated` cho kênh đó kèm `--note "N cta_click từ THREADS cùng ngày, giả định 20% cài"`. Số measured giữ nguyên ở UNKNOWN. Báo cáo in hai số riêng.
