# GA4 plan — 3 event cho blog và PWA (T-0019)

Ngày soạn: 2026-10-13 · Tác giả: growth-analytics · Trạng thái: **đề xuất, chưa gắn gì**. Mọi đoạn code dưới đây chỉ nằm trong plan; sửa `growth/blog` và `code/fe` cần approval `code_change` (đã yêu cầu kèm T-0019), tạo property cần approval `access`.

Hiện trạng đọc từ repo:
- `growth/blog/src/components/BaseHead.astro` là nơi duy nhất dùng chung cho `<head>` của mọi trang blog (index.astro gọi `<BaseHead>`), chưa có script nào ngoài font Google.
- `astro.config.mjs`: `site: https://mira.trady360.com`, `base: '/blog'`. Domain chưa chốt.
- Blog chưa có nút nào dẫn ra store, PWA hay form waitlist. Nút duy nhất là `.hero-cta` "Đọc blog" (link nội bộ) và các link bài viết. Vì vậy `cta_click` và `waitlist_submit` chỉ có số khi các CTA đó được tạo; plan này định nghĩa hợp đồng để CTA nào ra đời cũng đo được.
- `code/fe/scripts/patch-pwa.mjs` chèn khối `<head>` vào `dist/index.html` sau `expo export`; script bỏ qua nếu thấy `rel="manifest"`. Đây là chỗ phù hợp nhất để gắn GA4 cho web build mà không đụng mã app native hay mã React.

## 1. Property và stream

| Mục | Đề xuất |
|---|---|
| Property | 1 property GA4 tên "Mira", múi giờ Asia/Ho_Chi_Minh, tiền tệ USD |
| Stream 1 | Web — "Mira blog", URL `https://mira.trady360.com/blog` (ghi chú "domain tạm" tới khi chốt tên miền) |
| Stream 2 | Web — "Mira PWA", URL gốc của web build (chưa rõ chạy ở `mira.trady360.com/` hay subdomain; Founder xác nhận) |
| Không tạo | Stream iOS/Android. App native không gắn gì (local-first, ràng buộc #5) |
| Data retention | 2 tháng (mức thấp nhất) |
| Google signals | Tắt. Ad personalization tắt. Không bật User-ID, không bật Demographics |
| Enhanced measurement | Blog: bật page views, scrolls, outbound clicks; tắt site search, video, file downloads. PWA: bật mỗi page views, **tắt "Page changes based on browser history events"** để route nội bộ của app không bị ghi lại thành URL |
| Cross-domain | Chỉ cần nếu blog và PWA khác domain: khai báo cả hai trong Configure tag settings, để UTM không mất khi chuyển từ blog sang PWA |

Một property chung cho phép nhìn blog sang PWA trong cùng báo cáo; tách bằng chiều "Data stream" hoặc hostname.

## 2. Bảng event

Ba event tuỳ chỉnh. Page view, session, UTM (`session source/medium/campaign/content`) do GA4 tự thu từ query string, không cần mã thêm. `appinstalled` không nằm trong danh sách tên dành riêng của GA4.

| Event | Khi nào bắn | Tham số | Map sang `channels.json` |
|---|---|---|---|
| `cta_click` | Người dùng bấm phần tử có `data-cta` (nút mở store, mở PWA, hoặc nút dẫn tới form waitlist) | `cta_name` (slug, vd `hero-install`, `post-footer-pwa`), `widget` (nơi đặt: `hero`, `post-footer`, `calculator-ty-gia`, `header`), `target` (`store` hoặc `pwa` hoặc `waitlist`) | `clicks` khi `target` là `store` hoặc `pwa` (khớp định nghĩa "click vào link ra store/app"). `target=waitlist` không nạp vào `clicks`, chỉ dùng cho tỷ lệ bước phễu |
| `waitlist_submit` | **Sau khi** form báo gửi thành công (ESP trả OK), không bắn lúc bấm nút | `widget`, `cta_name`. Tuyệt đối không gửi email, tên, hay bất kỳ giá trị người dùng nhập | `waitlist` |
| `appinstalled` | Trình duyệt phát `appinstalled` trên web build | `platform_hint` (`pwa`) | `pwa_installs` (platform=`pwa`). Không cộng vào `waitlist`; cộng vào `installs` theo định nghĩa trong PROJECT_CONTEXT, khi Founder đã xác nhận định nghĩa |

Quy ước tham số: giá trị chữ thường, không dấu, gạch ngang, tối đa 40 ký tự. Tham số tuỳ chỉnh phải đăng ký làm custom dimension (event-scoped): `cta_name`, `widget`, `target` (3 trên 50 hạn mức miễn phí).

Tên Key event (đánh dấu "Key event" trong Admin): `waitlist_submit` và `appinstalled`. `cta_click` không đánh dấu, tránh làm số chuyển đổi phình.

## 3. Mã đề xuất (chỉ nằm ở đây, chưa gắn)

### 3.1 BaseHead.astro — thêm ngay trước `<!-- Primary Meta Tags -->`

Measurement ID lấy từ biến môi trường lúc build. Nếu biến rỗng thì **không in gì**, nên có thể merge trước khi property tồn tại mà không gửi dữ liệu.

Phần frontmatter thêm một dòng:

```astro
const GA4_ID = import.meta.env.PUBLIC_GA4_ID;
```

Phần markup:

```astro
{GA4_ID && (
  <>
    <script is:inline async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}></script>
    <script is:inline define:vars={{ GA4_ID }}>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', GA4_ID, {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_flags: 'SameSite=Lax;Secure',
      });

      // Một listener cho mọi CTA: <a data-cta="hero-install" data-widget="hero" data-target="store">
      document.addEventListener('click', function (e) {
        var el = e.target.closest && e.target.closest('[data-cta]');
        if (!el) return;
        gtag('event', 'cta_click', {
          cta_name: el.getAttribute('data-cta'),
          widget: el.getAttribute('data-widget') || 'unknown',
          target: el.getAttribute('data-target') || 'unknown',
        });
      });
    </script>
  </>
)}
```

Ghi chú:
- `anonymize_ip: true` ở GA4 là tham số tương thích, không có tác dụng thêm: GA4 vốn không lưu IP. Vẫn để để rõ ý định và khi rà soát thấy ngay.
- Không đặt `user_id`, không đặt `client_id` thủ công, không gửi query string tuỳ ý ngoài UTM.
- Với link ra ngoài (store), GA4 có thể huỷ request khi trang rời đi. Thêm `transport_type: 'beacon'` vào lệnh `gtag('event', ...)` cho CTA có `target=store`. Nếu cần chắc hơn thì dùng `event_callback`, nhưng đừng chặn điều hướng.

### 3.2 CTA (trong trang/ component bất kỳ, khi CTA ra đời)

```html
<a class="hero-cta" href="https://mira.trady360.com/?utm_source=blog&utm_medium=referral&utm_campaign=hero&utm_content=hero-install"
   data-cta="hero-install" data-widget="hero" data-target="pwa">Dùng thử trên web</a>
```

Link bắt buộc tạo bằng `node growth/os/bin/os.mjs link --url ... --channel ... --campaign ...` (không gõ UTM tay). Link nội bộ từ blog sang PWA dùng `utm_source=blog&utm_medium=referral` (kênh BLOG). Không đặt `data-cta` lên link nội bộ giữa các bài.

Form waitlist (khi có ESP): sau khi nhận phản hồi thành công

```js
gtag('event', 'waitlist_submit', { widget: 'post-footer', cta_name: 'waitlist-footer' });
```

Gọi trong nhánh thành công của `fetch`, không gọi trên sự kiện `submit`. Không đưa giá trị input vào bất kỳ tham số nào.

### 3.3 PWA web build — qua `code/fe/scripts/patch-pwa.mjs`

Chỉ tác động `dist/index.html` của web export; không đụng `App.tsx`, không đụng mã React Native, không đụng build iOS/Android.

Thêm vào `TAGS` một khối có điều kiện theo biến môi trường `GA4_PWA_ID` lúc chạy script; nếu rỗng thì không chèn. Dùng marker riêng (`id="ga4-pwa"`) vì marker `rel="manifest"` hiện tại sẽ khiến script bỏ qua bản đã vá:

```html
<script id="ga4-pwa" async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX', {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: location.origin + location.pathname + location.search.split('&').filter(function (p) { return /^\??utm_/.test(p) || /^utm_/.test(p); }).join('&')
  });
  window.addEventListener('appinstalled', function () {
    gtag('event', 'appinstalled', { platform_hint: 'pwa', transport_type: 'beacon' });
  });
</script>
```

(`G-XXXXXXX` được script thay bằng `process.env.GA4_PWA_ID` khi build. Dòng `page_location` chỉ giữ tham số `utm_*` để không rò query tuỳ ý của app; Founder/dev có thể bỏ dòng này nếu app không dùng query.)

Nếu stream PWA dùng chung measurement ID với blog thì dùng cùng một ID; tách theo hostname trong GA4.

### 3.4 Điều không làm (local-first)

- Không gắn gtag, Firebase, hay SDK nào vào bundle React Native; không gắn vào build native.
- Không ghi dữ liệu trong app (giờ vàng, chi tiêu, thu nhập, tên người) vào bất kỳ event nào. Ba event ở trên chỉ mang tham số tĩnh do mình đặt.
- Không bắn `first_open`, `session` trong app: giữ nguyên quy định "không ghi, không ước".
- Không bật Google signals, không remarketing, không User-ID.
- Chỉ web build. Người dùng cài PWA vẫn mở trang web đã gắn tag, nhưng chỉ ba event này và page view đi ra ngoài.

## 4. Export GA4 sang CSV chuẩn cho `metric import`

Khuôn đích (xem `csv-template.csv`): `date,platform,channel,metric,value,source,quality,note`. Tên file gốc: `analytics/imports/ga4-<YYYY-MM-DD>.csv` (bản gốc không sửa tay; bản đã map là `ga4-<YYYY-MM-DD>.mapped.csv`).

Cách xuất: GA4 → Explore → Free form. Dimensions: Date, Session source / medium, Event name, Hostname. Metrics: Event count, Sessions. Lọc Event name trong `page_view`, `cta_click`, `waitlist_submit`, `appinstalled`. Với `cta_click` thêm dimension `target` (custom). Export CSV.

| Cột GA4 / điều kiện | Cột đích | Quy tắc |
|---|---|---|
| Date (YYYYMMDD) | `date` | Đổi sang YYYY-MM-DD |
| Hostname | `platform` | Host của blog hoặc landing: `web`. Host của PWA: `pwa` |
| Session source / medium | `channel` | Tra `utm_source/utm_medium` trong `channels.json`: `blog / referral` BLOG, `google / organic` SEO, `google / cpc` GOOGLE_ADS, `facebook / social` FACEBOOK_ORGANIC, `facebook / cpc` META_ADS, `threads / social` THREADS, `newsletter / email` NEWSLETTER, `(direct) / (none)` DIRECT. Tổ hợp lạ hoặc `(not set)` thành `UNKNOWN`, `quality=unattributed`. Source lạ nhưng đoán gần đúng (vd `fb`): kênh gần nhất, `quality=estimated`, ghi source gốc ở `note` |
| Event name = `page_view`, Event count | `metric=pageviews`, `value` | |
| Sessions | `metric=sessions`, `value` | |
| Event name = `cta_click` và `target` thuộc `store`, `pwa` | `metric=clicks`, `value` = Event count | `target=waitlist` bỏ khỏi `clicks` |
| Event name = `waitlist_submit` | `metric=waitlist` | Không cộng vào `installs` |
| Event name = `appinstalled` | `metric=pwa_installs`, `platform=pwa` | |
| (hằng) | `source` | `ga4` |
| (hằng) | `quality` | `measured` khi channel đến từ UTM khớp taxonomy; `unattributed` cho UNKNOWN; `estimated` cho source đoán |
| (tuỳ) | `note` | Ví dụ `GA4 Explore, số có thể thấp hơn thực tế do ad-block` |

Nạp: `node growth/os/bin/os.mjs metric import growth/os/analytics/imports/ga4-<date>.mapped.csv`, rồi `metric sum --metric waitlist --from --to` đối chiếu với tổng ESP (nguồn xác nhận cho waitlist).

Quy tắc đối chiếu: số waitlist trong ESP là chuẩn; GA4 thấp hơn thì ghi chênh lệch trong báo cáo tuần, không bù số.

## 5. Hạn chế đã biết

| Hạn chế | Hệ quả | Cách xử |
|---|---|---|
| Ad-block / trình duyệt chặn (Brave, uBlock, Firefox ETP) chặn `googletagmanager.com` | GA4 đếm thấp, thường 10 đến 30% người dùng công nghệ chặn; không có số đo chính xác cho Mira | Ghi "cận dưới" trong báo cáo; waitlist lấy số ESP làm chuẩn |
| Consent: mục tiêu là người Việt, chưa có luật bắt buộc banner như EU, nhưng GA4 đặt cookie `_ga` | Cần dòng nói rõ trong trang chính sách quyền riêng tư, giọng điềm đạm | Founder duyệt câu chữ. Mở rộng: Consent Mode v2 mặc định `analytics_storage: granted` chỉ khi Founder muốn; mặc định `denied` sẽ làm số giảm mạnh. Đây là quyết định của Founder, ghi DECISION_LOG |
| `appinstalled` không tồn tại trên iOS Safari (không có `beforeinstallprompt`/`appinstalled`); "Thêm vào Màn hình chính" không bắn gì | `pwa_installs` chỉ phản ánh Chromium trên Android/desktop, thiếu hẳn iOS | Không ước số iOS. Ghi rõ "chưa đo được iOS PWA" ở báo cáo. Có thể phát hiện mở ở chế độ standalone (`navigator.standalone`) như tín hiệu phụ, **không** cộng vào installs |
| `appinstalled` có thể bắn trên desktop và có thể bắn lại sau khi gỡ rồi cài lại | Không hoàn toàn là "cài lần đầu" | Ghi `note`; nếu có số trùng rõ ràng thì để estimated |
| UTM trên PWA: người dùng mở link blog sang PWA nhưng lúc cài thì có thể đã qua nhiều phiên | `appinstalled` rơi vào `(direct)`, kênh UNKNOWN | Giữ UNKNOWN, không chia kênh. Kênh chỉ gán khi cài trong cùng phiên có UTM |
| Ngưỡng ẩn số nhỏ, độ trễ 24 đến 48 giờ ở báo cáo chuẩn | Số ngày gần nhất chưa đủ | Nạp số sau 48 giờ; ngày thiếu ghi vào ALERTS |
| Tên miền chưa chốt | Đổi domain là đổi stream, cắt lịch sử | Ghi "domain tạm"; chốt tên miền trước khi tạo stream thật nếu được |
| Không có CTA, form hoặc ESP trên blog hiện tại | `cta_click` và `waitlist_submit` sẽ là 0 cho tới khi các phần đó được build | 0 = chưa đo, không phải 0 thật; tạo task riêng cho CTA/form |

## 6. Checklist Founder, khoảng 15 phút

Thực hiện sau khi approval `access` (tạo property) và `code_change` được duyệt.

1. (3 phút) Vào analytics.google.com, tạo property "Mira", múi giờ Asia/Ho_Chi_Minh, tiền tệ USD.
2. (2 phút) Thêm Web stream "Mira blog" với URL blog; chép Measurement ID dạng `G-XXXXXXXXXX`. Thêm Web stream "Mira PWA" nếu PWA khác host (không thì dùng chung ID).
3. (2 phút) Admin → Data collection: tắt Google signals; Data retention 2 tháng; tắt các mục Demographics nếu hiện.
4. (2 phút) Enhanced measurement của stream PWA: tắt "Page changes based on browser history events".
5. (2 phút) Admin → Custom definitions: tạo 3 custom dimension phạm vi Event: `cta_name`, `widget`, `target`.
6. (1 phút) Admin → Events: đánh dấu `waitlist_submit` và `appinstalled` là Key event (khi event đã xuất hiện lần đầu; có thể phải quay lại sau).
7. (1 phút) Đưa Measurement ID cho dev: biến môi trường `PUBLIC_GA4_ID` khi build blog, `GA4_PWA_ID` khi chạy `patch-pwa`.
8. (1 phút) Thêm email của growth-analytics hoặc người xuất báo cáo với vai trò Viewer; không cấp Editor.
9. (1 phút) Sau khi deploy, mở blog bằng link có `?utm_source=test&utm_medium=test`, vào GA4 → Reports → Realtime, kiểm thấy 1 người dùng và event `page_view`. Xoá dữ liệu test bằng lọc Internal traffic hoặc ghi chú ngày test trong `note`.
10. Báo lại: Measurement ID, domain thật. growth-analytics cập nhật `analytics/README.md` (trạng thái GA4) và bảng Integration trong CURRENT_STATE.

## Việc cần làm tiếp (không thuộc plan này)

- Task riêng: tạo CTA ra PWA/store và form waitlist trên blog/landing (hiện chưa có), dùng đúng thuộc tính `data-cta`/`data-widget`/`data-target`.
- Quyết định Founder: mức consent mặc định (mục 5); định nghĩa `appinstalled` có cộng vào `installs` chưa.
- Sau khi có số: bảng phễu `pageviews` → `clicks` → `waitlist` / `pwa_installs` theo kênh, chỉ tính tỷ lệ khi mẫu ≥ 100.
