# HANDOFF — code/ monorepo

Cập nhật 24/11/2026. Dựng lại `code/` thành monorepo contract-first theo đúng cấu trúc
của Vessel360 (PUKATO) — repo tham chiếu mà Founder chỉ định.

## Cấu trúc

```
code/
  package.json      workspaces: contract, api-client, be, web
  contract/         nguồn sự thật cho kiểu dữ liệu + openapi.yaml
  api-client/       client gõ kiểu, dùng chung cho web và mọi client sau này
  be/               Fastify + PostgreSQL (tầng dữ liệu đã có từ trước)
  web/              Vite + React + react-router (màn hình V1)
  fe/               app Expo cũ — KHÔNG nằm trong workspaces, xem mục cuối
```

Chạy: `npm install` một lần ở `code/`, rồi `npm run dev` (web) hoặc `npm run dev:be` (API).
`.claude/launch.json` đã có sẵn hai cấu hình tương ứng.

## Ba quyết định sản phẩm đã vào mã

**1 · Bỏ khái niệm "Chỉ số Mira".** Thời gian đọc thẳng theo catalog nhóm việc; không có
chỉ số nào gộp bốn nhóm thành một con số. Sáu khoang cũ (`work|health|people|learn|rest|self`)
gom về bốn (`work|family|personal|waste`) trong migration `002_catalog_and_moments.sql`,
có remap dữ liệu cũ. Nhóm `waste` bắt buộc phải có vì nó là nguyên liệu của luật khai nguồn.

**2 · Khoảnh khắc không gắn người.** Một hạt chỉ còn **chữ · ngày · kẹo hay muối**.
Migration bỏ `person_ids`, `media_uri`, `media_type`, `bucket` khỏi bảng `moment`; thêm
`kind`, `revisit_at`, `revisit_answer`. Hạt muối được hẹn hỏi lại đúng 42 ngày **ngay lúc ghi**,
không tính lại khi đọc — đổi hằng số sau này cũng không làm sai lời hứa với hạt cũ.
Câu `UPDATE ... WHERE revisit_answer IS NULL` chính là thứ bảo đảm "hỏi một lần".

**3 · Ba sửa đổi theo vòng nghiên cứu N-200→N-208.**
- *N-203* — mục tiêu nói bằng thứ muốn thêm. Ô nhập gợi ý "Bạn muốn làm thêm điều gì?".
- *N-205* — buông phải có bước hai. `goal.handed_over_to` và màn kết thúc hỏi "số giờ này
  chuyển sang đâu?"; service từ chối trỏ sang mục tiêu đã kết thúc.
- *N-206* — khai nguồn từng mục tiêu một, ngay lúc tạo, không gộp một màn tổng.

## Local-first

`web/src/lib/store.ts` chọn kho dữ liệu. Mặc định là `local.ts` — ghi vào `localStorage`,
**không gọi API nào**. Đặt `VITE_API_BASE_URL` thì chuyển sang `@mira/api-client`.

Hai kho có cùng bề mặt hàm nên màn hình không biết mình đang chạy kho nào. Luật nghiệp vụ
(trần mục tiêu, 42 ngày, 90 ngày, mẫu số là giờ tỉnh) lấy hằng số từ `@mira/contract` nên
hai phía không lệch. Phần logic thì hiện vẫn viết hai lần — đó là nợ kỹ thuật đã biết,
chấp nhận để V1 giữ được ràng buộc cứng #5.

## Thói quen — có hỗ trợ, nhưng không có chuỗi ngày

Migration `003_habit.sql` thêm hai bảng: `habit` (tên, số lần mong muốn mỗi tuần 1–7) và
`habit_check` (từng lần đã làm, unique theo `habit_id + date`).

Khác biệt với một habit tracker thường nằm ở **mô hình dữ liệu**, không phải ở giao diện:
không có cột nào lưu chuỗi hiện tại hay chuỗi dài nhất, không có cột điểm hay huy hiệu.
Không có cột để đếm chuỗi thì không có cách nào hiện chuỗi. Service `habitWeek` chỉ đọc
đúng bảy ngày của tuần đang xem — không hàm nào nhìn ra ngoài tuần đó.

Bỏ một tuần không ghi vào đâu cả. Tuần sau đếm lại từ đầu, không nhắc, không hỏi.
Trần `HABIT_CAP = 5`, cùng dải "nhịp tuần 3–5" của tầng mục tiêu. Giao diện nằm ở tab
**Mục tiêu → Nhịp tuần** (`web/src/features/goal/HabitSection.tsx`).

## Module đã gỡ khỏi `code/fe`

Xoá hẳn `Trading` (1 file), `Challenger` (36 file) và `Emotion` (36 file), cùng toàn bộ
tham chiếu ở `MainScreen`, `ToolsScreen`, `Home`, `Work/Edit`, `Goal/ImageSelection`,
`Common/Screens/Profile` và ba file `AppSetup/`. `HabitTracker` **giữ lại**.

Hai section `ChallengeSection` và `StatusSection` trong `Profile.tsx` cũng bị gỡ: cả hai
vẽ lịch đánh dấu theo ngày, tức chuỗi ngày, trái ràng buộc cứng #3.

`npx tsc --noEmit` trong `code/fe` sạch sau khi gỡ.

## Triển khai — mira.joybit.one (24/11/2026)

Live tại **https://mira.joybit.one**, Cloudflare Workers static assets, cấu hình ở
`code/web/wrangler.toml`.

```
npm run build -w web     # từ code/
npx wrangler deploy      # từ code/web
```

**Vì sao Workers chứ không phải Pages,** dù yêu cầu ban đầu là Pages: tạo project Pages
trên tài khoản này trả lỗi API `8000000`, và đường Pages mới (đã gộp vào Workers) đòi
Vite ≥ 6 trong khi dự án đang dùng 5.4.11. Workers static assets là đường Cloudflare
khuyến nghị và cũng là cách Vessel360 phục vụ `vessel360.joybit.one` trên đúng zone này.
`custom_domain = true` khiến wrangler tự tạo bản ghi DNS và chứng chỉ.

`not_found_handling = "single-page-application"` lo phần BrowserRouter. **Không được thêm
`_redirects`**: Cloudflare từ chối deploy với lỗi "Infinite loop detected" vì nó chồng lên
cơ chế SPA sẵn có.

`code/web/public/_headers` đặt CSP `default-src 'self'` và `connect-src 'self'` — trang
không gọi được máy chủ nào khác ngoài chính nó, đúng lời hứa local-first ở tầng trình duyệt.
Hệ quả có chủ ý: beacon Web Analytics mà Cloudflare tự chèn **bị chặn**, và console in một
dòng CSP mỗi lần tải. Muốn hết dòng đó thì tắt auto-injection của Web Analytics trong
dashboard, đừng nới CSP.

Đã kiểm sau khi deploy: `/` trả 200; `/muc-tieu` trả 200 (SPA fallback chạy); ba header
bảo mật có mặt; app chạy thật trên 375×812.

## API qua Cloudflare Tunnel — đã chạy thật (25/11/2026)

Web ở `mira.joybit.one` gọi API ở **`https://mira-api.trady360.com`**, tunnel đưa về
`127.0.0.1:8787` trên máy cá nhân của Founder.

**Máy tắt là app tắt.** Đây không phải hạ tầng phát hành, chỉ là cách thử với dữ liệu thật
mà không phải thuê máy chủ. Khi có người dùng ngoài, phải đổi sang máy chủ thật.

### Chạy lại sau khi khởi động máy

```powershell
npm run dev:be --prefix code
cloudflared tunnel --config C:\Users\vtcte\.cloudflared\mira-api.yml run 67d142b6-cd1c-4654-9b9c-2efc08af2c91
```

Tunnel `mira-api`, UUID `67d142b6-cd1c-4654-9b9c-2efc08af2c91`, credentials ở
`~/.cloudflared/67d142b6-….json`.

### Ba chỗ phải sửa cùng lúc khi đổi tên miền API

Đổi một chỗ mà quên hai chỗ kia thì trang trắng, log không nói gì rõ:

| Chỗ | Nội dung |
|---|---|
| `code/web/.env.production` | `VITE_API_BASE_URL` — Vite nhúng vào mã lúc build |
| `code/web/public/_headers` | `connect-src` trong CSP — chỉ mở đúng gốc đó |
| `code/be/.env` | `CORS_ORIGINS` — phải có origin của web |

### Chống thử mật khẩu hàng loạt

`be/src/http/chanDoLuong.ts`: 8 lần sai trong 15 phút thì **429**, khoá theo
`IP + tên đăng nhập` (khoá theo IP không thì cả văn phòng chung mạng khoá lẫn nhau; khoá
theo tên không thì đổi tên là thoát). Đăng nhập được thì xoá đếm.

IP thật lấy từ `cf-connecting-ip` — qua tunnel thì `remoteAddress` luôn là `127.0.0.1`.

Bộ đếm nằm **trong bộ nhớ tiến trình**. Chạy nhiều tiến trình thì nó im lặng vô dụng; lúc
đó phải đổi sang Redis hoặc bảng CSDL.

### Đã kiểm end-to-end từ trang live

| Kiểm | Kết quả |
|---|---|
| `GET /health` qua tên miền | 200 `{"ok":true}` |
| Preflight OPTIONS từ `https://mira.joybit.one` | 204, `allow-origin` đúng một origin đó |
| Đăng nhập sai mật khẩu từ trang live | **401**, trang hiện "Sai tên đăng nhập hoặc mật khẩu" |
| Log `be` | thấy `host: mira-api.trady360.com`, bcrypt mất 375ms |

CSP chặn `static.cloudflareinsights.com/beacon.min.js` — đó là script đo lường Cloudflare tự
chèn. Không ảnh hưởng gì; để nguyên thì mất số liệu của Cloudflare, muốn có thì phải nới
`script-src`, và nới CSP chỉ để lấy số liệu là đổi hớ.

### Ba cái bẫy đã gặp, ghi lại để khỏi dẫm lại

1. **Tra tunnel theo tên trên máy này trả về sai tunnel.** `cloudflared tunnel info mira-api`
   trả về `756ed5a3…` tức tunnel `ant-zigzag-site`. **Luôn dùng UUID**, đừng dùng tên.

2. **Quick tunnel vô dụng trên máy này.** `cloudflared tunnel --url` chạy được và đăng ký
   thành công ở hkg11, nhưng cả PowerShell lẫn trình duyệt **không phân giải được**
   `*.trycloudflare.com` — bị chặn ở tầng DNS. Đừng mất thời gian với quick tunnel nữa.

3. **`cert.pem` chỉ gắn với `trady360.com`.** Đó là lý do API không nằm ở `joybit.one`.
   `cloudflared tunnel route dns … api-mira.joybit.one` tự nối đuôi zone và tạo nhầm
   `api-mira.joybit.one.trady360.com`. Muốn API ở `joybit.one` thì phải
   `cloudflared tunnel login` chọn zone đó trước.

### Việc dọn còn nợ — cần người bấm trong dashboard

Hai bản ghi rác trong zone `trady360.com`, `cloudflared` không có lệnh xoá DNS:

- **`api-mira.joybit.one.trady360.com`** — sinh ra do bẫy số 3, trỏ vào tunnel ant-zigzag.
- **`api-mira.trady360.com`** — đã tồn tại từ trước, không ai dùng. (Vì nó mà tên hiện tại
  phải là `mira-api`, không phải `api-mira`.)

Xoá ở Cloudflare dashboard → trady360.com → DNS.

## 25/11/2026 — BỎ RÀNG BUỘC LOCAL-FIRST ⚑

Quyết định của Founder. Ràng buộc cứng #5 (*"V1 local-first, không gửi gì lên server"*)
**không còn hiệu lực**. Dữ liệu nằm trên máy chủ, app đòi đăng nhập.

### Đã làm

**Migration `004_tai_khoan.sql`** — bảng `app_user` (bcrypt, chỉ mục duy nhất trên
`lower(username)`), và `user_id` thêm vào cả sáu bảng dữ liệu. Mọi chỉ mục đặt `user_id`
lên đầu. `money` đổi từ duy nhất theo tháng sang **duy nhất theo (người, tháng)**.

**Mọi câu SQL có `user_id = $n`.** Mọi phương thức repository nhận `userId` làm tham số
đầu. Đây là biên bảo mật của sản phẩm — quên một chỗ là người này đọc nhật ký người kia.

**`services/auth.ts`** — bcrypt 12 vòng, JWT ký HS256 qua `jose`, TTL 30 ngày.
Ba luật trong file đó không được nới: mật khẩu chỉ tồn tại dạng băm; sai tên và sai mật
khẩu trả **cùng một lỗi**; `userId` chỉ đến từ token đã xác minh.

**Bảng route mặc định đóng** — route nào không khai `cong_khai: true` đều đòi token.
Chỉ ba route mở: `/health`, `/auth/register`, `/auth/login`.

**`POST /import`** — nhập cả bộ, chạy trong một transaction (xoá + chèn, hoặc cả hai cùng
xong hoặc không gì đổi). Id trong file bị bỏ, máy chủ cấp id mới.

**Web đòi đăng nhập**: `App.tsx` không dựng router khi chưa có phiên. `lib/local.ts`
**đã xoá** — kho localStorage cũ giờ là nguồn sự thật thứ hai, nguy hiểm hơn là vô dụng.
`index.ts` từ chối khởi động nếu `JWT_SECRET` dưới 32 ký tự.

### Đã kiểm trên máy chủ thật

| Phép thử | Kết quả |
|---|---|
| Mật khẩu dưới 8 ký tự | 400 |
| Trùng tên (`DanhThu` vs `danhthu`) | 409 `username_taken` |
| Sai mật khẩu / không có tài khoản | **cùng một lỗi 401** |
| Gọi API không token | 401 |
| **B đọc dữ liệu của A** | rỗng hết |
| **B sửa/xoá/kết thúc bằng id của A** | 404 cả bốn đường |
| A đọc lại sau khi B thử | còn nguyên |
| Nhập cả bộ qua web | 692 mục giờ · 60 hạt · 6 tháng · 1 mục tiêu · 2 thói quen · 174 lần đánh dấu |

Tài khoản thử ở máy cá nhân: `danhthu`. 15 test đơn vị vẫn pass, bốn package typecheck sạch.

### CHƯA LÀM — và đây là thứ chặn

**Bản live `mira.joybit.one` chưa deploy bản này, và deploy bây giờ sẽ làm hỏng nó.**
Web giờ gọi API, mà API mới chỉ chạy ở `127.0.0.1:8787`. Khách vào trang sẽ thấy màn đăng
nhập rồi không đăng nhập được.

Phải chọn chỗ chạy máy chủ trước. Ba đường, theo thứ tự tôi khuyên:

1. **Fly.io** — đúng cách Vessel360 đang làm (`vessel360-api.fly.dev`), có sẵn `Dockerfile`
   và `fly.toml` để chép. Cần một Postgres thật (Supabase hoặc Fly Postgres).
2. **Cloudflare Tunnel** — hạ tầng đã dựng một nửa (tunnel `mira-api`, UUID
   `67d142b6-…`), còn thiếu bước `cloudflared tunnel login` chọn zone joybit.one. Nhưng
   máy chủ sẽ chạy trên máy cá nhân, tắt máy là app chết.
3. **Cloudflare Workers + Hyperdrive** — gọn nhất về vận hành nhưng phải viết lại tầng
   `pg` sang driver chạy được trên Workers.

Cũng chưa làm: đổi mật khẩu, quên mật khẩu, xoá tài khoản, giới hạn số lần đăng nhập sai.
Cả bốn đều cần trước khi có người dùng thật không phải Founder.

## Nợ kỹ thuật và chỗ còn treo

1. **Logic nghiệp vụ trùng ở `be/src/services/` và `web/src/lib/local.ts`.** Nếu sửa luật
   mà chỉ sửa một bên là lệch ngay. Cách dọn: tách thành package `@mira/rules` thuần hàm,
   cả hai cùng gọi. Chưa làm vì chưa cần.
2. **`be` chạy bằng ts-node, chưa có bundle production.** `tsconfig.json` để `noEmit` vì
   `@mira/contract` nằm ngoài `rootDir`. Khi cần deploy thật thì thêm esbuild giống
   `Vessel360/code/server/scripts/build.mjs`.
3. **`contract/openapi.yaml` viết tay, chưa sinh `schema.d.ts`.** Nguồn sự thật hiện là
   `contract/src/index.ts`; YAML phải sửa tay cho khớp. Vessel360 sinh ngược từ YAML —
   nếu theo hẳn thì nên chuyển.
4. **`code/fe` (Expo) chưa xoá.** Nó còn `HabitTracker`, `Challenger`, `Trading`, `Emotion` —
   bốn module ngoài spec, và `HabitTracker` chạy bằng chuỗi ngày, trái ràng buộc cứng #3.
   `web/` thay thế nó. Chưa xoá vì đó là quyết định của Founder, không phải của người viết mã.
5. **Bảng `weight_on_mind` trong migration 001 trùng cơ chế với hạt muối** (text + review_at +
   reviewed + still_heavy). Một trong hai phải bỏ trước khi làm M8.
6. **`docs/08-three-pillars.md` còn câu "chỉ ba nhóm, không phải sáu"** — đã sai sau quyết
   định giữ catalog. `docs/02-data-model.md` cũng còn enum sáu khoang cũ. Hai file cần sửa.

## Đã kiểm

- `npx tsc --noEmit` sạch cho cả bốn package.
- `npm test -w mira-be`: 15 test pass (mapper + repository, không cần Postgres thật).
- Chạy thật trên trình duyệt ở 375×812: ghi được hạt muối, ghi được giờ vàng, donut chia
  đúng catalog, trần quý chặn đúng ở 2/2 với câu "Mira không bán việc gỡ trần", màn kết thúc
  hiện đúng bước hai, hạn mục tiêu quý rơi vào 22/02/2027 (90 ngày).
## Postgres — đã dựng và đã chạy thật (24/11/2026)

PostgreSQL 17 local, database `mira_dev` tạo mới, cả ba migration đã apply sạch
(`001_initial`, `002_catalog_and_moments`, `003_habit`) — 16 bảng. `code/be/.env` đã ghi
và nằm trong `.gitignore`.

Schema kiểm bằng `\d`, đúng từng quyết định:
`time_entry` không còn `person_id`, có `golden`, CHECK bucket đúng bốn nhóm;
`moment` có `kind`/`revisit_at`/`revisit_answer` kèm ràng buộc *chỉ hạt muối mới có hẹn*;
`habit_check` có unique index `(habit_id, date)`.

Đã chạy API thật trên `127.0.0.1:8787` và kiểm từng luật:

| Luật | Kết quả |
|---|---|
| Hạt muối hẹn 42 ngày | ghi 24/11 → `revisitAt` 05/01/2027 |
| Hỏi một lần | trả lời lần hai → **409 `already_answered`** |
| Trần tầng quý | mục tiêu thứ 3 → **409 `tier_full`** |
| Mục tiêu quý hết hạn 90 ngày | tạo 24/11 → `expiresOn` 22/02/2027 |
| Luật khai nguồn | cần 420m, có 140m → `shortfallMinutes` 280 |
| Thói quen một lần mỗi ngày | bấm 2 lần cùng ngày → `done: 1` |
| Ô tài chính chưa nhập | thiếu `netWorth` → `freeCapitalMonths: null`, không đoán |
| Năm ô đủ | vốn tự do 9,5 tháng, mức dư 1,6%, nợ giữ 18,2 tháng |

Dữ liệu thử đã TRUNCATE sau khi kiểm; DB hiện trống.

**Lưu ý vận hành:** `.env` đang dùng mật khẩu mặc định của bản cài local. Trước khi có bất
kỳ máy chủ nào không phải máy cá nhân, phải đổi mật khẩu và tạo role riêng cho ứng dụng
thay vì dùng `postgres`.
