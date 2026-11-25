---
name: growth-analytics
description: Nạp số liệu thật vào Mira Growth OS từ Google Play Console, App Store Connect, GA4 (export CSV → CSV chuẩn → `metric import`), tính funnel, CPI, so với cột mốc targets.json, phân loại measured/estimated/unattributed và cập nhật dashboard. Dùng khi nói "nạp số", "import metrics", "số hôm qua", "cập nhật dashboard", "funnel", "CPI bao nhiêu", "so với cột mốc", "export Play Console", "GA4 export", "growth analytics", "load metrics". KHÔNG dùng để tạo link theo dõi (attribution-tracking), để viết báo cáo chữ (daily-reporting), hay để ước số cho đủ cột mốc — không có số thì ghi "chưa đo".
---

# Growth analytics — nạp số và đọc số

## Mục đích

Mọi quyết định của CGO dựa trên `metrics_daily`. Skill này là con đường duy nhất đưa số từ ngoài vào bảng đó, với nhãn chất lượng đúng. Số không nạp được = "chưa đo", không phải 0.

## Khi nào dùng

- Job `collect-metrics` (07:00) báo "thiếu số ngày …".
- Có file export mới từ Play Console / App Store Connect / GA4.
- CGO hỏi funnel, CPI, tiến độ so cột mốc trước khi lập kế hoạch hoặc review tuần.

## Đầu vào bắt buộc

- `growth/os/memory/CURRENT_STATE.md` (bảng Integration — nguồn nào đã nối), `config/channels.json` (kênh, platform, tên metric), `config/targets.json` (cột mốc).
- File export đặt ở `growth/os/analytics/imports/<nguồn>-<YYYY-MM-DD>.csv` (thư mục này là nơi duy nhất để file thô).
- Khuôn CSV chuẩn: `growth/os/analytics/csv-template.csv` (3 dòng ví dụ phải xoá trước khi import).

## Các bước thực thi

1. Kiểm thiếu gì: `node growth/os/bin/os.mjs run collect-metrics --force` → đọc dòng "thiếu số ngày". Ghi nhớ nguồn nào chưa nối (CURRENT_STATE) để không đi tìm số không tồn tại.
2. Export thủ công (không có API, tất cả là tài khoản Founder):
   - **Google Play Console** → Statistics → Store performance: chọn metric *Store listing visitors* và *Store listing acquisitions* (first-time installers), chia theo ngày, Export CSV. Acquisition → Store listing conversion nếu cần tỷ lệ. Cột ngày thường là `Date`, giá trị theo cột metric; không có kênh → channel = UNKNOWN, source = `play_console_csv` (CLI giữ quality=measured cho nguồn này). Nếu có report "Acquisition by UTM" (từ referrer), tách thêm dòng theo kênh với source `play_console_utm`.
   - **App Store Connect** → Analytics → Metrics: *Impressions*, *Product page views*, *First-time downloads*, Group by Date (và by Campaign nếu dùng `ct=`). Export → CSV. source = `asc_csv`; platform = ios; channel theo campaign name nếu khớp taxonomy, còn lại UNKNOWN.
   - **GA4** → Explore → Free form: dimensions `Date`, `Session source / medium`, `Event name`; metrics `Event count`, `Sessions`, `Views`. Export → CSV. Map `source/medium` sang channel bằng bảng `channels.json` (ví dụ `threads / social` → THREADS, `google / organic` → SEO, `(direct) / (none)` → DIRECT, không khớp → UNKNOWN). Event `appinstalled` → metric `pwa_installs`, platform `pwa`. Event `cta_click` → `clicks`. `page_view` → `pageviews`, platform `web`. source = `ga4_export`.
3. Chuyển sang CSV chuẩn `date,platform,channel,metric,value,source,quality,note`, lưu `growth/os/analytics/imports/<nguồn>-<ngày>-normalized.csv`. Luật mapping:
   - `date` dạng YYYY-MM-DD; `platform` ∈ android|ios|pwa|web|all; `metric` đúng tên trong `channels.json.metrics`.
   - `quality` luôn điền (để trống → CLI báo lỗi). measured = đọc thẳng từ nguồn; estimated = có phép tính, bắt buộc `note` ghi phép tính; unattributed = biết tổng nhưng không biết kênh.
   - Không có dấu phẩy trong `note` (importer tách bằng dấu phẩy, không xử lý ngoặc kép). Không ký tự xuống dòng.
4. Nạp: `node growth/os/bin/os.mjs metric import growth/os/analytics/imports/<file>-normalized.csv`. Importer idempotent theo khoá (date, platform, channel, metric, source) — nạp lại cùng file sẽ ghi đè, không nhân đôi. Một dòng lỗi thì CLI dừng tại dòng đó; sửa rồi chạy lại cả file.
5. Số lẻ không có file (ví dụ Founder nhắn "hôm qua 12 email waitlist"): `node growth/os/bin/os.mjs metric add --date 2026-10-20 --platform web --channel UNKNOWN --metric waitlist --value 12 --source founder_chat --note "Founder báo qua chat"`.
6. Kiểm tổng: `metric sum --metric installs --from 2026-10-13` · `metric sum --metric pwa_installs --from 2026-10-13` · `metric sum --metric waitlist --from 2026-10-13` · theo kênh `--channel THREADS`. Đối chiếu với tổng trên màn hình nguồn; lệch > 2% → tìm dòng sai trước khi báo.
7. Dashboard: `node growth/os/bin/os.mjs dashboard` → đọc `growth/os/dashboard/README.md` và `snapshot.json`.
8. Funnel và CPI (tính tay từ `metric sum`, ghi vào `growth/os/analytics/funnel-<YYYY-MM-DD>.md` theo khuôn dưới): pageviews → clicks (CTA) → store_visitors → installs; web: pageviews → waitlist, pageviews → pwa_installs. CPI = spend_usd (paid) ÷ installs paid; nếu installs paid = 0 ghi "n/a". Cost/waitlist tương tự.
9. So cột mốc: lấy `elapsed` và `milestone_next` trong snapshot.json; ghi chênh lệch tuyệt đối và % vào file funnel. Dự báo tuyến tính trong snapshot là `quality: estimated` — nhắc rõ khi trích.
10. Phát hiện có bằng chứng (ví dụ kênh X chuyển đổi gấp đôi) → `memory log --file LEARNINGS --text "..."`. Cập nhật task: `task update T-xxxx --status DONE --evidence growth/os/analytics/funnel-<date>.md --actual "nạp N dòng, installs tích luỹ M"`.

## Đầu ra

`growth/os/analytics/funnel-<YYYY-MM-DD>.md`:
```
# Funnel — <ngày>  (nguồn: play_console_csv / asc_csv / ga4_export / manual)
| Bước | Giá trị | Chất lượng | Tỷ lệ so bước trước |
| pageviews | … | measured | — |
| clicks (cta_click) | … | measured | …% |
| store_visitors | … | measured | …% |
| installs (A+iOS) | … | measured/unattributed | …% |
| pwa_installs | … | measured | …% của pageviews |
| waitlist | … | measured | …% của pageviews |
CPI paid: … (spend ÷ installs paid) · Cost/waitlist: …
Cột mốc: ngày <elapsed>/90, tích luỹ <total> / mốc kế <n> (<lệch>) · dự báo tuyến tính <x> (ước)
Chưa đo: <liệt kê metric chưa có nguồn>
```

## Kiểm chất lượng

- [ ] Mọi dòng có `quality`; mọi `estimated` có `note` nêu phép tính.
- [ ] Không có dòng `installs` channel=UNKNOWN quality=measured từ source khác `play_console_csv`/`asc_csv` (CLI tự ép unattributed — kiểm lại ý định).
- [ ] Waitlist không bao giờ cộng vào installs trong file funnel.
- [ ] Tổng sau import khớp màn hình nguồn (±2%).
- [ ] Số 0 trong dashboard được chú "chưa đo" nếu nguồn chưa nối.
- [ ] File thô và file normalized đều nằm trong `analytics/imports/`, tên có ngày.

## Khi lỗi / kẹt

- `channel không hợp lệ` / `platform phải là …`: sửa mapping, không thêm kênh mới (muốn thêm → DECISION_LOG).
- `date dạng YYYY-MM-DD`: export Play/ASC hay ra `Oct 20, 2026` hoặc `20/10/2026` — chuyển trước khi import.
- Nguồn chưa nối (chưa có app trên store, chưa có GA4): không ước installs; ghi task BLOCKED, `approval request --kind access --request "Tạo GA4 property cho blog/landing"` nếu chưa có.
- Số Meta "installs" không SDK → không nạp measured (xem paid-advertising).

## Agent liên quan

`growth-analytics` (chủ) · `growth-orchestrator` (đọc funnel) · `paid-acquisition` (spend) · `founder` (export file từ console).

## Công cụ dùng

CLI `os.mjs` (run collect-metrics, metric add/import/sum, dashboard, memory log, task update) · Read/Write/Edit cho CSV và file funnel · Play Console, App Store Connect, GA4 (thủ công).
