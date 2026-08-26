# Tài liệu tham khảo — "Mira" trong repo Batify (trước khi xoá)

> Trích xuất ngày 2026-08-25, trước khi xoá `F:\Danh Thu\github\Batify` theo yêu cầu dọn ổ đĩa F.
> Đây là tài liệu **lưu trữ tham khảo**, không phải spec đang dùng. Không nhầm với `docs/00-vision.md` → `docs/08-three-pillars.md` của dự án Mira hiện tại (repo `danhthu/mira`).

---

## 0 · Đây là gì, vì sao trùng tên

`F:\Danh Thu\github\Batify` là một repo GitHub riêng (`danhthu/Batify.git`, 391 commit). Repo này **ban đầu là một sản phẩm khác tên "Riso"** (thấy trong lịch sử commit: "feat: rename app to Riso + full Cloudflare deploy setup", `deploy.sh` còn ghi "Riso — manual deploy script"). Tại commit `31824d0` ("Add Mira project spec and initial structure", khoảng đầu tháng 5/2026), toàn bộ code Riso bị thay thế bằng một sản phẩm mới cũng đặt tên **"Mira"** — độc lập hoàn toàn với dự án Mira đang làm ở `danhthu/mira` (khác remote, khác kiến trúc, khác phạm vi tính năng).

**Đây là sự trùng tên ngẫu nhiên hoặc tái dùng tên cũ của chính bạn** — không phải cùng một dòng phát triển. Batify/mira là bản concept trưởng thành hơn nhiều về mặt kiến trúc (monorepo, backend đầy đủ, pitch deck investor) nhưng phạm vi sản phẩm khác — 4 trục (thời gian/cảm xúc/tài chính/mục tiêu) thay vì 3 chỉ số lõi (giờ vàng/tỷ giá đời/vốn tự do) của dự án hiện tại.

---

## 1 · Tổng quan sản phẩm

| | |
|---|---|
| **Tên** | Mira — "hệ thống phản chiếu cá nhân" |
| **Tagline** | "Nhìn lại · Điều chỉnh · Tiếp tục" |
| **Core loop** | Log hằng ngày → tích luỹ dữ liệu → pattern nổi lên → người dùng tự điều chỉnh |
| **4 trục theo dõi** | Thời gian, Cảm xúc, Tài chính, Mục tiêu |
| **Phiên bản spec** | v1.0 · 2026-04-29 (spec.md), App Map v1.0 · 2026-05-01, PitchDeck v1.0 · 2026-05-14 |
| **Nền tảng** | iOS + Android (React Native + Expo), mobile-only, Vietnamese-first |
| **Trạng thái theo PLAN.md** | Toàn bộ task ✅ trừ `CORE-03` (Cross-platform tooling cleanup) — đã xác nhận có code thật khớp claim (7 feature folder ở cả `apps/mobile/src/features/` và `apps/api/src/features/`) |

### Triết lý thiết kế (giữ nguyên xuyên suốt mọi tài liệu)
- Không streak, không điểm, không huy hiệu, không gamification giả.
- Pattern/insight chỉ hiện khi đủ dữ liệu có ý nghĩa thống kê (≥15 bản ghi, ≥15 ngày — trạng thái ACTIVE).
- Người dùng quyết định hành động — Mira chỉ cho thấy, không coaching/khuyến nghị AI.
- Local-first: dữ liệu chính nằm trên máy (SQLite), cloud sync là opt-in + mã hoá E2E.
- Không kết nối/bán dữ liệu cho bên thứ ba, không quảng cáo.

Đáng chú ý: **những nguyên tắc "không streak/badge/thông báo gây tội lỗi" và "local-first" trùng gần như nguyên văn với ràng buộc cứng trong `CLAUDE.md` của dự án Mira hiện tại** — có thể đây là triết lý gốc bạn đã giữ xuyên suốt qua nhiều lần thử sản phẩm, đáng note lại nếu muốn giữ nhất quán thương hiệu cá nhân.

---

## 2 · Kiến trúc kỹ thuật

```
mira/  (Turborepo + pnpm monorepo)
├── apps/
│   ├── mobile/     React Native + Expo — features/, shared/, ui/, core/
│   └── api/        Cloudflare Workers + Hono — features/, shared/, adapters/
├── packages/
│   ├── contracts/    Zod schemas dùng chung BE↔FE (nguồn sự thật duy nhất)
│   ├── ui-tokens/    Design tokens (màu/font/spacing)
│   └── adapter-types/
└── supabase/         Postgres migrations + seed (RLS bật trên mọi bảng)
```

### Stack
| Layer | Lựa chọn |
|---|---|
| Mobile | React Native + Expo SDK 51+ |
| State | Zustand + TanStack Query |
| Storage local | expo-sqlite + MMKV |
| Edge API | Cloudflare Workers + Hono (deploy qua Wrangler) |
| Validation | Zod (shared schema client + edge) |
| Database | Supabase (Postgres 15 + RLS + Auth + Storage) |
| Auth | Supabase Auth (Apple/Google/magic link) |
| Monitoring | Sentry + PostHog |
| CI/CD | GitHub Actions + EAS Build + Wrangler Deploy |
| Test | Vitest + Testing Library + Detox |

### Adapter pattern — điểm kiến trúc đáng học nhất
Toàn bộ data access đi qua interface `Adapter`, chọn implementation bằng biến môi trường `ADAPTER_MODE` (`mock` ↔ `supabase`). Route handler **không bao giờ** import Supabase/mock trực tiếp — luôn gọi qua `c.get('adapter').<feature>.<method>()`. Mock adapter seed sẵn 7 kịch bản lifecycle xác định (`user-new-1`, `user-active-1`, `user-churning-1`...) để test không cần kết nối DB thật.

**Vì sao đáng học cho dự án Mira hiện tại**: dự án hiện tại (`code/be`) dùng raw SQL + `pg` trực tiếp, chưa có lớp adapter tách biệt mock/thật — nếu sau này cần thêm sync/cloud (dự án hiện đang "chưa làm sync ở V1" theo CLAUDE.md), pattern này là ví dụ có sẵn để tham khảo khi tới lúc.

---

## 3 · Bảy tính năng

| Module | Chức năng | Điểm khác biệt được nêu |
|---|---|---|
| **Home** | Dashboard tổng hợp 4 trục, widget grid 2×2 | Chỉ hiện insight khi dữ liệu đủ ý nghĩa |
| **Thời gian** | Log session, donut chart 4 danh mục (làm việc/ngủ/cá nhân/lãng phí) | Phân tách work core/secondary |
| **Tài chính** | Thu/chi/đầu tư/lãng phí, ngân sách theo danh mục | Có trục "lãng phí" riêng, không gộp chung "chi tiêu" |
| **Mục tiêu** | Goal (core/secondary/habit) + milestone + habit streak + challenge N-ngày | Ba cấp phân loại mục tiêu |
| **Cảm xúc** | 3 slot/ngày (sáng/trưa/tối), 5 mức emoji, heatmap 3 tuần | Không chỉ hỏi "hôm nay thế nào" một lần |
| **Trading** | Trade journal — symbol, entry/exit, P&L, R-multiple, tag tâm lý (FOMO/PLAN/REVENGE/NEWS/EMOTION), rule compliance | Dark theme riêng (#1A2538); P&L luôn đi kèm rule compliance |
| **Tôi / Profile** | Process bar (habit rate, goal alignment, waste control), achievements, settings, export data | Không leaderboard, không social feed |

### 7 trạng thái vòng đời (lifecycle states) — áp dụng cho mọi feature
| State | Điều kiện | UI |
|---|---|---|
| NEW | 0 bản ghi | Onboarding card |
| SETUP | Vừa đăng ký | Skeleton + CTA |
| EARLY | 1–4 bản ghi hoặc <5 ngày | Badge "ĐANG XÂY" |
| LEARNING | 5–14 bản ghi, 5–14 ngày | Badge "TẠM THỜI", ẩn insight |
| ACTIVE | ≥15 bản ghi, ≥15 ngày | Đầy đủ editorial + insight |
| STRUGGLE | Chỉ số giảm rõ | Banner hỗ trợ màu cam |
| CHURNING | Không hoạt động ≥7 ngày | Dim 62% + banner chào lại |

**Ý tưởng đáng cân nhắc cho dự án hiện tại**: khung 7-lifecycle-state này là cách xử lý "màn hình rỗng/dữ liệu ít" có hệ thống, rõ ràng hơn cách làm rời rạc thường thấy. Dự án Mira hiện tại (V1, 3 chỉ số) có thể không cần đủ 7 state, nhưng ít nhất 3 trạng thái đầu (NEW/SETUP/EARLY — chưa đủ dữ liệu để tính tỷ giá đời/vốn tự do đáng tin) là vấn đề thật sẽ gặp và chưa thấy xử lý trong `05-v1-spec.md` hiện tại.

---

## 4 · Bản đồ màn hình (28 màn hình)

```
🔐 Auth Stack: /onboarding (3 slide) → /login → /setup (4 bước)
📱 Main (Bottom Tab): Nhà · Thời gian · Tài chính · Mục tiêu · Tôi
   + Cảm xúc, Trading (mở từ Dashboard widget, không nằm trong tab chính)
```

| Nhóm | Số màn hình |
|---|---|
| Auth/Onboarding | 4 |
| Dashboard | 1 |
| Thời gian | 3 |
| Tài chính | 4 |
| Mục tiêu | 5 |
| Cảm xúc | 3 |
| Trading | 4 |
| Tôi/Settings | 4 |
| **Tổng** | **28** |

---

## 5 · Design system

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--bg` | #F2F0EC | Nền (warm off-white) |
| `--ink` | #18202E | Chữ chính |
| `--slate` | #1E3A5F | Brand primary |
| `--green` | #0D9E6E | On-track |
| `--red` | #D94452 | Lãng phí, thiếu |
| `--amber` | #C97F00 | Đang chờ |
| `--blue` | #2563EB | Onboarding |
| `--orange` | #E8720B | Challenge, churning |
| `--violet` | #6D4ED8 | Chỉ dùng cho Cảm xúc |

Typography: **Fraunces** (display serif) + **Plus Jakarta Sans** (body) + **IBM Plex Mono** (luôn dùng cho số/%/tiền/P&L — cùng nguyên tắc `tabular-nums` mà báo cáo Content Ops của dự án hiện tại cũng đang áp dụng).

---

## 6 · Business model & pitch deck (đáng tham khảo cho product hiện tại)

- **Đối tượng mục tiêu**: 24–35 tuổi, thành phố lớn, đã từng thử và bỏ ít nhất một app journal/habit.
- **Đối thủ được liệt kê**: Day One (tiếng Anh, western prompt), Notion (quá phức tạp), Daylio (quá đơn giản), Money Lover (chỉ tài chính, không reflection).
- **Định giá**: Free 7 ngày → Pro 99.000đ/tháng (không annual upsell, không popup chặn quota, không "AI coaching" premium ẩn).
- **Unit economics dự kiến**: churn <5%/tháng, LTV ~1.8M VND, CAC mục tiêu <200K VND (content-led, không paid ads giai đoạn đầu — khác chiến lược 06-marketing-test.md của dự án hiện tại vốn có track paid-ads).
- **Traction tại thời điểm viết deck (5/2026)**: 12 bài blog dài đã publish + 24 script TikTok, 3 người dùng beta thân cận, API 25+ endpoint hoàn chỉnh, mobile 28 màn hình.
- **Ask**: pre-seed/angel $50K–$100K, dùng 70% product / 20% distribution / 10% infra+legal.

**So sánh với dự án hiện tại**: `docs/06-marketing-test.md` của dự án hiện tại có kế hoạch paid-ads test 3 tuần rõ ràng hơn (ngưỡng CTR/CPV/email cụ thể) — pitch deck Batify/mira lại mạnh hơn ở phần định vị đối thủ + business model + unit economics, hiện dự án hiện tại chưa có tài liệu tương đương.

---

## 7 · Khung tổ chức Growth/Ops (chỉ là scaffold, chưa có nội dung thật)

`growth/{analytics,campaign,community,content,seo,social}/README.md` và `ops/{crm,incident,internal-workflow,monitoring,support}/README.md` — toàn bộ đều dạng thư mục "Workforce" template rỗng (chỉ có tiêu đề + link ngược về workforce), không có quy trình thật đã viết. Không có gì để tái sử dụng nội dung, nhưng **cấu trúc phân loại 6 nhóm growth / 5 nhóm ops** có thể tham khảo khi `growth/` của dự án hiện tại (hiện chỉ có `blog/`, `content/`, `site/`, `brand/`) cần mở rộng thêm nhóm sau này.

---

## 8 · Kết luận — điều gì đáng mang sang dự án Mira hiện tại

1. **Khung lifecycle state cho dữ liệu ít** (NEW→SETUP→EARLY→LEARNING→ACTIVE→STRUGGLE→CHURNING) — vấn đề thật, dự án hiện tại chưa có thiết kế tương đương cho "chưa đủ dữ liệu để tính tỷ giá đời/vốn tự do đáng tin".
2. **Adapter pattern** (mock ↔ thật, qua interface) — hữu ích khi `code/be` cần thêm môi trường test không phụ thuộc Postgres thật.
3. **Nguyên tắc thương hiệu nhất quán**: không streak/badge/gamification, local-first, không bán dữ liệu — bạn đã giữ triết lý này qua ít nhất 2 lần làm sản phẩm "Mira" độc lập, đáng ghi lại như một nguyên tắc cá nhân xuyên suốt thay vì chỉ nằm trong CLAUDE.md một dự án.
4. **Pitch deck structure** (Problem → Solution → Differentiators → Market → Traction → Tech → Team → Business Model → Roadmap → Ask) — dự án hiện tại chưa có tài liệu tương đương, có thể tái dùng khung này khi cần gọi vốn/trình bày sau này.
5. **Không có gì về nội dung blog/TikTok đáng copy trực tiếp** — 12 bài + 24 script của Batify/mira viết cho sản phẩm 4-trục khác, giọng/số liệu không khớp 3 chỉ số của dự án hiện tại.

---

*Toàn bộ thư mục `F:\Danh Thu\github\Batify` đã bị xoá sau khi tài liệu này được tạo — đây là bản ghi lại duy nhất còn sót của nội dung đó.*
