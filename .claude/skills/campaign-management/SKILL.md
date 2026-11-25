---
name: campaign-management
description: Quản vòng đời campaign của Mira — organic lẫn paid — từ DRAFT → PENDING_APPROVAL → APPROVED → RUNNING → PAUSED/STOPPED → DONE, gắn assets (content K-id), tracking link, ghi results/lessons, kiểm audit và ngân sách. Dùng khi nói "tạo campaign", "chiến dịch tuần này", "campaign đang chạy", "tạm dừng campaign", "đóng campaign", "campaign results", "campaign lifecycle", "kiểm audit", "budget còn bao nhiêu". KHÔNG dùng để viết proposal/dựng ads (paid-advertising), để tạo một link lẻ (attribution-tracking), hay để quản content đơn lẻ (content pipeline).
---

# Campaign management — vòng đời campaign

## Mục đích

Campaign là đơn vị gom nhiều content, một tracking link, một khoảng ngày và một kết quả. Organic cũng là campaign (ví dụ "Threads tuần 3 góc C") để số về theo `utm_campaign` có chỗ đổ, và để cuối campaign có `results` + `lessons` thay vì rải rác.

## Khi nào dùng

- Weekly plan (Thứ Hai) mở campaign organic cho tuần/2 tuần.
- paid-advertising đã có proposal và cần theo dõi trạng thái.
- Có việc ra ngoài kéo dài > 3 ngày với nhiều content cùng mục tiêu (outreach đối tác, loạt bài cộng đồng).

## Đầu vào bắt buộc

- `growth/os/memory/CHANNEL_STRATEGY.md` (nhịp, luật kênh), `config/channels.json` (platform hợp lệ, cờ paid), `config/budget.json` (trần).
- Danh sách content K-id định gắn (`content list --channel THREADS --status APPROVED`).
- Tracking link (skill attribution-tracking) — tạo trước khi `campaign add` để điền `--tracking-link`.

## Trạng thái và ai được chuyển

| Từ → đến | Ai | Điều kiện CLI |
|---|---|---|
| (tạo) → DRAFT | agent | kênh organic |
| (tạo) → PENDING_APPROVAL | CLI tự | kênh `paid: true`; CLI mở approval kind=budget |
| PENDING_APPROVAL → APPROVED | `--actor founder` | chỉ khi Founder đồng ý rõ ràng |
| DRAFT/APPROVED/PAUSED → RUNNING | agent | paid phải APPROVED hoặc PAUSED trước |
| RUNNING → PAUSED | agent/CGO | stop rule, hết content, chờ số |
| RUNNING/PAUSED → STOPPED | CGO | huỷ trước hạn; ghi DECISION_LOG |
| → DONE | CGO | có `--results` và `--lessons` |

Organic bỏ qua PENDING_APPROVAL/APPROVED (DRAFT → RUNNING). Mọi đổi trạng thái tự ghi `audit_log`.

## Các bước thực thi

1. Tạo:
   ```
   node growth/os/bin/os.mjs link --url https://mira.trady360.com/cong-cu/ty-gia-doi --channel THREADS --campaign threads-t3-goc-c --content K-0012
   node growth/os/bin/os.mjs campaign add --name "Threads tuần 3 — góc C" --platform THREADS --objective "30 clicks ra landing, 5 waitlist" --audience "25-40, đang cân nhắc đổi việc" --start-date 2026-10-27 --end-date 2026-11-02 --tracking-link "<link vừa tạo>"
   ```
   Paid thêm `--budget-usd` (≤ 30) `--daily-cap-usd` (≤ 5); CLI tự PENDING_APPROVAL.
2. Gắn assets: CLI không có cờ `--assets`; ghi danh sách K-id vào `growth/os/campaigns/<C-id>.md` (khuôn dưới) và vào `--note` khi update: `campaign update C-0002 --note "assets: K-0012,K-0013,K-0014"`. Mỗi content gắn ngược bằng `content update K-0012 --utm "<link>"`.
3. Chạy: `campaign update C-0002 --status RUNNING --note "post đầu 27/10 20:00"`. Content đăng theo nhịp CHANNEL_STRATEGY; mỗi post `content update K-xxxx --status PUBLISHED --url <url>`.
4. Theo dõi giữa chừng (midweek): `campaign show C-0002` (có `spent_usd`), `metric sum --metric clicks --channel THREADS --from <start>`; so với `objective`. Paid: so `spent_usd` với `budget_usd`, và stop rules trong budget.json.
5. Tạm dừng/dừng: `campaign update C-0002 --status PAUSED --note "<lý do, số>"`; STOPPED thêm `memory log --file DECISION_LOG`.
6. Đóng:
   ```
   node growth/os/bin/os.mjs campaign update C-0002 --status DONE --results "7 post, 3.100 hiển thị, 41 clicks (1.3%), 6 waitlist; chi 0 USD" --lessons "post 20h tốt hơn 12h; hook số cụ thể > hook câu hỏi"
   ```
   Lessons có bằng chứng → `memory log --file LEARNINGS`. Cập nhật mục "Kết quả" kênh trong CHANNEL_STRATEGY (skill memory-management).
7. Kiểm ngân sách và dấu vết: `node growth/os/bin/os.mjs budget` (approved_usd + spent_usd ≤ 70 để giữ reserve 30) và `node growth/os/bin/os.mjs audit --limit 50` — mỗi RUNNING/PAUSED/DONE của campaign phải có dòng audit `campaign.<STATUS>`; hành động ngoài CLI (đăng tay) phải có `memory log` kèm URL.
8. Đóng task: `task update T-xxxx --status DONE --evidence growth/os/campaigns/C-0002.md --actual "<results 1 dòng>"`.

## Đầu ra

`growth/os/campaigns/<C-id>.md` (paid dùng thêm `<C-id>-proposal.md` của paid-advertising):
```
# <C-id> <tên> — <platform> — <start → end>
Mục tiêu: … · Tracking link: … · Trạng thái: …
## Assets
| K-id | Hook | Ngày đăng | URL | utm_content |
## Nhật ký trạng thái (từ `audit`)
- YYYY-MM-DD RUNNING — ghi chú
## Số (từ metric sum, ghi nguồn + chất lượng)
## Results / Lessons (chép từ DB khi DONE)
```

## Kiểm chất lượng

- [ ] `platform` đúng taxonomy; paid có budget/cap trong trần và trạng thái không vượt cổng duyệt.
- [ ] Có tracking link trước RUNNING; mọi K-id gắn có `utm` trùng `utm_campaign`.
- [ ] Objective là số kiểm được (clicks, waitlist, installs), không phải "tăng nhận diện".
- [ ] DONE có cả `results` và `lessons`; lessons có số đi kèm.
- [ ] Audit có đủ dòng cho mỗi lần đổi trạng thái; không có campaign RUNNING quá `end_date` 3 ngày.
- [ ] Không content nào PUBLISHED khi chưa APPROVED (CLI chặn, nhưng kiểm lại `content list --status PUBLISHED`).

## Khi lỗi / kẹt

- `campaign trả phí phải APPROVED trước khi RUNNING`: chờ Founder; không đổi platform sang organic để lách.
- `Chỉ founder được APPROVED`: đúng thiết kế — chỉ dùng `--actor founder` sau câu đồng ý rõ ràng của Founder, ghi `--note` nguồn đồng ý.
- `budget vượt trần`: chia thành campaign nhỏ hơn hoặc `approval request --kind budget`.
- Campaign chạy mà số về 0: kiểm sổ link (`growth/os/attribution/links.csv`) và nguồn số đã nối chưa (CURRENT_STATE) trước khi kết luận kênh kém.

## Agent liên quan

`growth-orchestrator` (mở/đóng, STOP) · `social-growth`, `community-partnerships`, `seo-content` (campaign organic) · `paid-acquisition` (paid) · `growth-analytics` (số) · `founder` (APPROVED).

## Công cụ dùng

CLI `os.mjs` (campaign add/list/show/update, link, content update, budget, audit, expense, memory log, task update) · Write `growth/os/campaigns/<C-id>.md`.
