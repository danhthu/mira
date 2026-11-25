---
name: weekly-growth-review
description: Nhịp tuần và tháng của Mira Growth OS với bốn chế độ — plan (Thứ Hai: mục tiêu tuần, backlog, gán agent), midweek (Thứ Tư: nút thắt, đổi ưu tiên), review (Thứ Sáu: `run weekly-report`, phân tích kênh, quyết experiment, kế hoạch tuần sau), monthly (tiến độ, ngân sách, dự báo, đề xuất tái phân bổ qua approval). Dùng khi nói "kế hoạch tuần", "review tuần", "giữa tuần", "sprint mới", "báo cáo tuần", "tổng kết tháng", "tái phân bổ ngân sách", "weekly plan", "weekly review", "midweek", "monthly review", "sprint planning". KHÔNG dùng cho báo cáo ngày (daily-reporting) hay để tự duyệt ngân sách — tái phân bổ chỉ là approval request.
---

# Weekly growth review — plan · midweek · review · monthly

## Mục đích

Ngày thì chạy, tuần thì lái. Bốn chế độ chia sẻ một nguyên tắc: so số thật với mốc, đổi ưu tiên bằng task trong DB, đổi chiến lược bằng DECISION_LOG, đổi tiền bằng approval.

## Khi nào dùng

Theo `growth/os/scheduler/jobs.json`: `weekly-plan` T2 08:30 → chế độ **plan** · `midweek-review` T4 14:00 → **midweek** · `weekly-report` T6 17:00 (script) + `weekly-review` T6 17:15 → **review** · `monthly-review` ngày 1, 09:00 → **monthly**. Chế độ do prompt gọi chỉ định; không có thì suy từ thứ trong tuần (ngày thật, không đoán).

## Đầu vào bắt buộc

- `growth/os/memory/CURRENT_STATE.md`, `GROWTH_STRATEGY.md` (giai đoạn, mốc), `CHANNEL_STRATEGY.md` (mục "Kết quả" từng kênh), `DECISION_LOG.md`, `LEARNINGS.md`.
- `node growth/os/bin/os.mjs dashboard` → `growth/os/dashboard/snapshot.json` (elapsed, installs, forecast, milestone_next).
- Báo cáo tuần gần nhất `growth/os/reports/weekly/<date>.md`; sprint hiện tại `growth/os/sprints/S<n>.md`.
- `config/targets.json` (mốc), `config/budget.json` (phase_allocation, reserve).

## Chế độ plan (Thứ Hai)

1. Đọc báo cáo tuần trước (mục Kế hoạch tuần sau) và `task list --sprint S<n-1>` còn dở → chuyển sang sprint mới (`task update T-xxxx --sprint S<n> --deadline ...`) hoặc CANCELLED có note.
2. Đặt mục tiêu tuần = phần mốc kế chia theo số tuần còn lại tới mốc, ghi rõ là mục tiêu dẫn đường (waitlist/pwa_installs khi chưa có store). Ví dụ mốc ngày 14 = 50 PWA + 100 waitlist, còn 1 tuần → tuần này 50/100.
3. Viết `growth/os/sprints/S<n>.md` theo `templates/sprint.md`: mục tiêu số, 3 nút thắt, backlog ≤ 15 việc theo kênh ưu tiên GROWTH_STRATEGY, gán agent, deps.
4. Nạp backlog vào DB (skill task-orchestration, mỗi việc `task dup` rồi `task add ... --sprint S<n>`); việc chờ Founder → BLOCKED + `approval request`.
5. Mở campaign organic tuần (skill campaign-management) và experiment cần chạy tuần này (growth-experimentation). Cập nhật "Giai đoạn" trong CURRENT_STATE (phần tay).

## Chế độ midweek (Thứ Tư)

1. `status`, `task list --status IN_PROGRESS`, `task list --status BLOCKED`, `task overdue`, `metric sum` các chỉ số tuần (`--from <Thứ Hai>`).
2. So tiến độ với mục tiêu tuần trong `S<n>.md`: mỗi chỉ số ghi đạt x/y (%). Dưới 40% ở giữa tuần → tìm nút thắt: thiếu số (nguồn chưa nối), thiếu duyệt (approval PENDING quá 2 ngày), thiếu người (agent có > 2 task IN_PROGRESS), thiếu asset.
3. Đổi ưu tiên bằng CLI: `task update T-xxxx --urgency 5` (CLI tính lại score), `--agent` khác, hoặc hoãn `--status BACKLOG --note "hoãn vì ..."`. Không đổi mục tiêu tuần giữa tuần — ghi vào phần "Rủi ro" của sprint file.
4. Ghi mục `## Midweek <date>` vào cuối `growth/os/sprints/S<n>.md`: tiến độ, nút thắt, 3 thay đổi ưu tiên (task id), việc cần Founder trong 48h.

## Chế độ review (Thứ Sáu)

1. Phần số: `node growth/os/bin/os.mjs run weekly-report` (SKIPPED nếu đã chạy → `report weekly`). File `growth/os/reports/weekly/<date>.md` có: Tổng, Kênh tuần này, Nội dung đã đăng, Thử nghiệm đã quyết, Task xong, Ngân sách, Kế hoạch tuần sau (trống), Cần Founder. Giữ khuôn.
2. Phân tích kênh: với mỗi kênh có số, ghi installs/waitlist/clicks tuần này so tuần trước, chất lượng (đo/ước/không gán), và một câu "giữ / tăng / giảm / chưa kết luận (n nhỏ)". Cập nhật mục "Kết quả" của kênh trong `CHANNEL_STRATEGY.md` bằng số + ngày. Kênh có > 50% số ở "không gán" → việc tuần sau là sửa link, không phải kết luận kênh.
3. Quyết thử nghiệm: `experiment list --open` → mọi X quá `end_date` phải `experiment decide` (skill growth-experimentation). Chưa đủ mẫu → INCONCLUSIVE kèm "mở lại?".
4. Điền "Kế hoạch tuần sau" trong báo cáo tuần: mục tiêu số tuần sau, 3–5 việc lớn, 1 thử nghiệm, việc chờ Founder. Đây là đầu vào của chế độ plan Thứ Hai.
5. Đổi thứ tự kênh/góc trong GROWTH_STRATEGY chỉ khi có số ≥ 1 tuần và mẫu đủ: `memory log --file DECISION_LOG` trước, sửa file sau. Dự báo tuyến tính lệch mốc > 30% → nêu trong Cần Founder kèm 2 phương án.
6. Gửi Founder: tóm tắt ≤ 15 dòng qua `telegram-report-bot:send-telegram-report` nếu bật; luôn ghi LEARNINGS cho phát hiện có số.

## Chế độ monthly (ngày 1)

1. Tổng hợp 4 báo cáo tuần + `dashboard` vào `growth/os/reports/monthly/<YYYY-MM>.md` (`templates/monthly.md`): tiến độ vs mốc, kênh theo installs/waitlist/CPI, nội dung đã đăng, thử nghiệm đã quyết, ngân sách chi vs `phase_allocation`, dự báo ngày 90 (tuyến tính của snapshot + một kịch bản điều chỉnh có giả định ghi rõ).
2. Đề xuất tái phân bổ (chỉ là đề xuất): `node growth/os/bin/os.mjs approval request --kind budget --request "Chuyển 10 USD từ phase4_scaling sang phase3_validation để chạy thêm 1 test góc C trên Meta; lý do: CTR 1.6% (n=3.100), cost/waitlist 0.7 USD" --ref C-xxxx`. Không sửa `budget.json`; Founder sửa và ghi DECISION_LOG.
3. Đề xuất sửa mốc nếu build store trễ: cũng qua approval request, nêu mốc cũ/mới.
4. Dọn memory tháng (skill memory-management): giả định [A] bị bác → gạch, [H] đã kiểm → [F] kèm X-id.

## Đầu ra

| Chế độ | File |
|---|---|
| plan | `growth/os/sprints/S<n>.md` + task `--sprint S<n>` trong DB |
| midweek | mục `## Midweek <date>` trong `S<n>.md`; task đã đổi ưu tiên |
| review | `growth/os/reports/weekly/<date>.md` (phần Kế hoạch tuần sau điền); CHANNEL_STRATEGY "Kết quả"; experiment decisions |
| monthly | `growth/os/reports/monthly/<YYYY-MM>.md`; approval request budget nếu có |

## Kiểm chất lượng

- [ ] Mục tiêu tuần là số, có đơn vị và nguồn mốc; waitlist không cộng vào installs.
- [ ] Mỗi kết luận kênh ghi n và chất lượng số; n nhỏ ghi "chưa kết luận".
- [ ] Không experiment nào quá hạn còn mở sau review.
- [ ] Mọi thay đổi chiến lược có dòng DECISION_LOG cùng ngày.
- [ ] Tái phân bổ/mốc chỉ ở dạng approval request, `budget.json`/`targets.json` không bị sửa.
- [ ] Giọng Mira trong mọi file gửi Founder.

## Khi lỗi / kẹt

- `run weekly-report` SKIPPED/FAILED: `report weekly --date <Thứ Sáu>`; xem `runs`, `logs/ALERTS.md`.
- Không có số cả tuần: review vẫn chạy với trọng tâm "vì sao chưa có số" (nguồn nào, approval nào), kế hoạch tuần sau đặt gỡ nguồn số lên đầu.
- Sprint file chưa có: tạo từ template, số sprint = số tuần kể từ 2026-10-13.
- Founder không phản hồi approval > 7 ngày: giữ BLOCKED, nêu lại trong Cần Founder với hậu quả cụ thể (mốc nào trượt).

## Agent liên quan

`growth-orchestrator` (chủ) · `growth-analytics` (số tuần) · `paid-acquisition` (CPI, đề xuất budget) · 8 agent (nhận backlog) · `founder` (duyệt tái phân bổ, mốc).

## Công cụ dùng

CLI `os.mjs` (run weekly-report, report weekly, dashboard, status, task *, experiment list/decide, approval request, metric sum, memory log) · Read/Write/Edit sprint, báo cáo, memory · Skill telegram-report-bot (tuỳ chọn).
