---
name: paid-advertising
description: Lập đề xuất, xin duyệt, dựng và theo dõi quảng cáo trả phí Meta Ads / Google Ads cho Mira trong trần 100 USD. Dùng khi người dùng nói "chạy ads", "đề xuất campaign trả phí", "test góc bằng Meta Ads", "Google Ads từ khoá công cụ", "ghi chi tiêu ads", "dừng campaign", "paid acquisition", "ad proposal", "campaign budget", hoặc khi agent paid-acquisition nhận task. KHÔNG dùng cho campaign organic (dùng campaign-management), cho việc tạo link theo dõi đơn lẻ (dùng attribution-tracking), hay khi chưa có landing + Founder chưa cho phép chi — khi đó chỉ dừng ở bước proposal.
---

# Paid advertising — Mira

## Mục đích

Paid ở Mira không mua install. Paid dùng để **đo góc nào bán được** (A tự do tài chính / B thời gian với người thân / C tỷ giá đời) với tổng ≤ 40 USD giai đoạn 3 và ≤ 30 USD giai đoạn 4 (`growth/os/config/budget.json`). Mọi đồng chi phải có campaign APPROVED bởi Founder trước, và số liệu ghi vào CLI phải là số thật từ Ads Manager.

## Khi nào dùng

- Task thuộc agent `paid-acquisition` với tiêu đề có chữ campaign/ads/proposal.
- Giai đoạn 3 Validation trở đi (ngày 31+), đã có landing live và tracking link.
- Founder hỏi "chạy thử ads được chưa" — trả lời bằng proposal, không phải bằng việc bật ads.

## Đầu vào bắt buộc

1. `growth/os/memory/PROJECT_CONTEXT.md`, `GROWTH_STRATEGY.md` (mục ràng buộc), `CHANNEL_STRATEGY.md` (META_ADS/GOOGLE_ADS), `config/budget.json`.
2. Landing URL đang live và tracking link (skill attribution-tracking). Không có landing → dừng ở proposal, ghi task BLOCKED.
3. Góc và hook định test: `docs/06-marketing-test.md` §2, §5. Hook 3 và 6 (bố mẹ/con) không được chạy paid trước khi có số organic và đã đọc bình luận.
4. Content id của creative (K-xxxx ở trạng thái APPROVED).

## Các bước thực thi

1. Kiểm trần còn lại: `node growth/os/bin/os.mjs budget`. Nếu `remaining_usd` − `reserve_usd` (30) < budget định xin → thu nhỏ hoặc dừng.
2. Viết proposal theo `templates/proposal.md` vào `growth/os/campaigns/<C-id>-proposal.md`. Tạm đặt tên file theo id dự kiến; sau bước 3 đổi tên cho khớp id thật. Proposal bắt buộc có 10 mục: kênh, mục tiêu, đối tượng, creative (K-id), budget, cap ngày, CPI kỳ vọng, giả định chuyển đổi, tiêu chí thành công, tiêu chí dừng.
3. Đăng ký campaign (tự động PENDING_APPROVAL vì kênh paid, CLI tự mở approval kind=budget):
   ```
   node growth/os/bin/os.mjs campaign add --name "Test góc C — Threads lookalike" --platform META_ADS --objective "đo CTR + cost/waitlist góc C" --audience "VN 25-40, quan tâm tài chính cá nhân" --budget-usd 20 --daily-cap-usd 3 --start-date 2026-11-12 --end-date 2026-11-18 --tracking-link "<link UTM>"
   ```
   CLI từ chối nếu budget > 30 hoặc cap > 5. Nếu `--tracking-link` chưa có, tạo trước: `node growth/os/bin/os.mjs link --url https://<landing> --channel META_ADS --campaign test-goc-c --content hook1`.
4. Gắn proposal vào task: `task update T-xxxx --status REVIEW --evidence growth/os/campaigns/C-0001-proposal.md`. Báo Founder qua mục CẦN FOUNDER của báo cáo ngày (`approval list` đã có dòng). Dừng ở đây, làm việc khác.
5. Chỉ khi Founder đồng ý bằng lời/chat, ghi: `node growth/os/bin/os.mjs campaign update C-0001 --status APPROVED --actor founder --note "Founder duyệt qua chat <ngày>"`. Không tự `--actor founder` khi chưa có câu đồng ý rõ ràng.
6. Dựng trong Ads Manager (thủ công — không có API, không có SDK). Checklist Meta: Campaign objective = Traffic (không chọn App Installs vì không có SDK) → Ad set: vị trí VN, tuổi theo proposal, cap ngày đúng `daily_cap_usd`, lịch đúng start/end → Ad: URL đích = tracking link từ bước 3, creative = file trong K-id. Google Ads: Search campaign, từ khoá nhóm "công cụ" trong `docs/06` §4, match phrase, URL cuối có UTM, giới hạn ngày = cap. Ghi ảnh chụp cấu hình vào `growth/os/campaigns/<C-id>-setup-<date>.md`.
7. Bật: `campaign update C-0001 --status RUNNING --note "bật trong Ads Manager <giờ>"`.
8. Mỗi ngày (job collect-metrics 07:00 chỉ nhắc, không tự lấy): mở Ads Manager, đọc Amount spent hôm qua rồi ghi:
   ```
   node growth/os/bin/os.mjs expense add --amount-usd 2.87 --campaign C-0001 --date 2026-11-13 --note "Meta Ads Manager, Amount spent, ad set C-hook1"
   node growth/os/bin/os.mjs metric add --date 2026-11-13 --platform web --channel META_ADS --metric spend_usd --value 2.87 --source ads_manager
   node growth/os/bin/os.mjs metric add --date 2026-11-13 --platform web --channel META_ADS --metric clicks --value 41 --source ads_manager
   node growth/os/bin/os.mjs metric add --date 2026-11-13 --platform web --channel META_ADS --metric impressions --value 3120 --source ads_manager
   ```
   Số "installs"/"app installs" Meta tự báo không có SDK → không ghi `installs` measured. Nếu muốn ước từ clicks × tỷ lệ landing→PWA đã đo, ghi `--metric pwa_installs --quality estimated --note "clicks 41 × 4% landing→PWA tuần trước"`.
9. Sau khi chi ≥ `min_spend_before_judging_usd` (8 USD), áp stop rules mỗi sáng: CTR < 1% · CPI > 1.5 USD · cost/waitlist > 1.0 USD → `campaign update C-0001 --status PAUSED --note "stop rule: <chỉ số>"` rồi tắt trong Ads Manager cùng lúc. Ghi DECISION_LOG.
10. Hết hạn hoặc hết budget: `campaign update C-0001 --status DONE --results "<spend, clicks, CTR, waitlist, CPI/ước>" --lessons "<1–3 dòng>"`; nếu campaign gắn experiment, chạy `experiment decide`. Cập nhật task DONE với evidence là file proposal + results.

## Đầu ra

| File / bản ghi | Khuôn |
|---|---|
| `growth/os/campaigns/<C-id>-proposal.md` | `templates/proposal.md` (10 mục) |
| `growth/os/campaigns/<C-id>-setup-<date>.md` | ảnh/ghi chú cấu hình Ads Manager, URL đích, cap |
| Bản ghi `campaigns`, `expenses`, `metrics_daily` | qua CLI, không sửa tay |
| Dòng `memory log --file DECISION_LOG` | khi PAUSED/STOPPED theo stop rule hoặc đổi góc |

## Kiểm chất lượng

- [ ] Proposal đủ 10 mục, CPI kỳ vọng có công thức (budget ÷ installs ước, nêu giả định).
- [ ] `budget_usd` ≤ 30, `daily_cap_usd` ≤ 5, tổng approved + spent ≤ 70 (giữ reserve 30).
- [ ] Có tracking link có `utm_medium=cpc`; URL đích trong Ads Manager trùng 100% với `tracking_link` trong DB.
- [ ] Không có hook 3/6 trong creative paid khi chưa có số organic.
- [ ] Mỗi ngày chạy có đúng 1 dòng `expense add` khớp Amount spent (sai số < 0.05 USD).
- [ ] Không có metric `installs` quality=measured từ nguồn `ads_manager`.
- [ ] Giọng creative: không "nên/phải/hãy", không dấu chấm than.

## Khi lỗi / kẹt

- `budget vượt trần` / `daily cap vượt trần`: thu nhỏ; nếu cần hơn, `approval request --kind budget --request "..."` — không sửa budget.json.
- `campaign chưa được duyệt` khi `expense add`: chưa có APPROVED thật — không ghi số bằng cách khác; hỏi lại Founder.
- `Vượt tổng ngân sách`: tắt ads ngay trong Ads Manager, ghi ALERTS qua `memory log --file DECISION_LOG`.
- Chi trong Ads Manager cao hơn cap (Meta có thể chi vượt ~25%/ngày): ghi số thật, ghi chú nguyên nhân, hạ cap ngày hôm sau.
- Không có landing/pixel: ghi task BLOCKED, `approval request --kind code_change` nếu cần GA4 trên landing.

## Agent liên quan

`paid-acquisition` (chủ) · `growth-analytics` (kiểm số, CPI) · `creative-studio` (creative K-id) · `growth-orchestrator` (quyết dừng/scale) · `founder` (duyệt).

## Công cụ dùng

CLI `os.mjs` (budget, campaign, expense, metric, link, approval, memory) · Ads Manager (thủ công, ngoài repo) · Read/Write cho proposal.
