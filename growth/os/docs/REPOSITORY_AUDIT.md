# REPOSITORY_AUDIT — Mira, 2026-10-13

Kiểm kê trước khi dựng Growth OS. Mọi mục là quan sát trực tiếp từ repo (nhánh `laptop`, 31 commit, remote `github.com/danhthu/mira`).

## 1. Sản phẩm & mã nguồn

| Mục | Quan sát |
|---|---|
| Loại | App di động tiếng Việt (không phải game như mẫu gốc). Đo Giờ vàng / Tỷ giá đời / Vốn tự do. |
| Stack FE | React Native + Expo 51 / RN 0.74 / React 18, `pullstate`, `AsyncStorage`, jest. `code/fe/package.json` name `batify` v1.0.1. |
| Nguồn gốc | `code/fe` thay bằng app Batify ngày 2026-08-27, đang dọn cho khớp 6 ràng buộc cứng (`code/CLAUDE.md`). |
| Build | `npm run web:build` (expo export web + PWA patch) chạy được. **Không có** build native; `eas.json` có profile nhưng chưa build. |
| `app.json` | name `DailyOps`, slug `DailyOps`, iOS bundle `com.wai.dailyops`, Android không có `package`, EAS projectId `44d730ea…`. → **Phải đổi trước khi lên store.** |
| Phát hành | Chưa có trên Google Play / App Store. Không có link store trong repo. |
| Analytics trong app | Sentry đã comment (ràng buộc #5). Không GA4/Firebase. Có `expo-updates` OTA. |
| Backend | `code/be` Node + Postgres, ngoài phạm vi V1, không liên quan growth. |
| Test | jest 27/27, tsc 0 lỗi (theo PLAN.md E1). |

## 2. Website / nội dung

| Mục | Quan sát |
|---|---|
| Blog | Astro 7 ở `growth/blog`, `site: https://mira.trady360.com`, `base: /blog`, có sitemap + RSS, font Atkinson local. Có `apps/blog/dist` (untracked, build cũ). |
| Landing | `growth/blog/src/pages/index.astro` hero + 3 bài mới nhất. **Không có** form email, không widget máy tính. `growth/site/` trống. |
| Bài viết | 91 draft `growth/content/vi/01–91`, 88 đã mirror sang `growth/blog/src/content/blog/`, tất cả `draft: true`, `content-queue.json` 91 dòng `pending`. |
| Ảnh | Mỗi bài có `image_prompt`, ảnh chưa sinh. `tools/admin` (Express + Gemini Imagen) để duyệt/sinh ảnh — cần GEMINI_API_KEY. |
| Widget | 6+4 công cụ tính được mô tả trong bài, **chưa build** cái nào. |
| Thương hiệu | `growth/brand/` trống. `growth/tracking.yaml` trống. |
| Domain / ESP / GA4 | Chưa chốt / chưa có / chưa có (HANDOFF "Dữ liệu còn thiếu"). |

## 3. Tài liệu marketing sẵn có (tài sản lớn)

- `docs/06-marketing-test.md`: 3 góc A/B/C, landing copy, cụm từ khoá, 6 hook video, lịch 3 tuần, ngưỡng quyết định (CTR >1,5%, email >8%, <25k/email, thử công cụ >30%, ≥4/10 phỏng vấn).
- `docs/07-blog-120-days.md`: nhịp tuần, 4 giai đoạn, bối cảnh cạnh tranh.
- `docs/nguon/nghien-cuu/INDEX.md`: 11 phát hiện có nguồn (N-001…N-011).
- `growth/content/HANDOFF.md`: quy trình publish, luật anti-AI.

## 4. Claude Code & công cụ

| Mục | Quan sát |
|---|---|
| `.claude/` | `launch.json` (Expo web, đường dẫn cũ `trady360\mira` — sai thư mục hiện tại), `settings.local.json`, skill `mira-nghien-cuu` (research 4 lane, có lịch xoay vòng, có khuôn file). Không có `agents/`. |
| CI | Không có `.github/workflows`. |
| Runtime | Node 24.20 (có `node:sqlite`), Python 3.12, gh CLI, không có `claude` CLI trong PATH (chạy trong desktop app). |
| MCP/skill khả dụng | scheduled-tasks (desktop), telegram-report-bot, viet-nhu-nguoi, deep-research, built-in browser, Chrome. Không có MCP Google Play / ASC / GA4 / Meta. |
| Quy ước repo | Không commit lên `main`; commit/branch tiếng Anh; `PROJECT.yaml` cấm tự động commit/push/gửi khách. |

## 5. Kết luận cho thiết kế

1. Không có install nào để đo cho tới khi có store hoặc PWA công khai → giai đoạn 1 chạy bằng **waitlist + PWA + nội dung**.
2. Tài sản rẻ nhất chưa khai thác: 91 bài + 10 công cụ tính chỉ cần build + 1 landing có form.
3. Mọi integration analytics là **CSV import thủ công** cho tới khi có app/property — không giả vờ nối API.
4. Hệ thống phải chạy không dependency mới, không CI: SQLite built-in + CLI node + scheduled task.
