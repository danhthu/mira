---
name: task-orchestration
description: Quy trình CGO (growth-orchestrator) lập kế hoạch ngày cho Mira Growth OS — đọc CURRENT_STATE + dashboard + `status`, sinh task từ chiến lược/sprint, chấm Priority Score, gán agent, phát hiện trùng/quá hạn/kẹt, giao việc bằng Agent tool, review đầu ra, ghi kế hoạch ngày. Dùng khi nói "lập kế hoạch ngày", "hôm nay làm gì", "ưu tiên task", "giao việc cho agent", "task nào quá hạn", "cgo-plan", "task orchestration", "daily plan", "assign tasks", hoặc khi scheduled task `cgo-plan` gọi. KHÔNG dùng để tự làm deliverable chuyên môn (bài, listing, proposal) hay để chi tiền/publish.
---

# Task orchestration — kế hoạch ngày của CGO

## Mục đích

Mỗi sáng CGO chọn 3–7 việc có điểm ưu tiên cao nhất, gán đúng agent, bỏ việc kẹt sang BLOCKED kèm approval, rồi giao và kiểm. Điểm ưu tiên do CLI tính `(impact × confidence × urgency) / effort`; CGO chịu trách nhiệm 4 tham số đầu vào thật.

## Khi nào dùng

- Job `cgo-plan` 08:00 hằng ngày; hoặc Founder hỏi "hôm nay hệ thống làm gì".
- Sau weekly plan (Thứ Hai) để tách backlog sprint thành task ngày.
- Khi một agent báo xong (task REVIEW) cần review.

## Đầu vào bắt buộc

1. `growth/os/memory/PROJECT_CONTEXT.md`, `CURRENT_STATE.md` (giai đoạn, kẹt chờ Founder), `GROWTH_STRATEGY.md` (giai đoạn hiện tại, mốc), `DECISION_LOG.md` (đừng quyết lại).
2. `growth/os/dashboard/README.md` (chạy `node growth/os/bin/os.mjs dashboard` nếu cũ hơn hôm nay).
3. `node growth/os/bin/os.mjs status` · `task list --status IN_PROGRESS` · `task list --status REVIEW` · `task list --status BLOCKED` · `task overdue` · `approval list`.
4. Sprint hiện tại: `growth/os/sprints/S<n>.md` và `task list --sprint S<n>`.

## Chấm Priority Score (hướng dẫn 4 tham số)

| Tham số | 1 | 3 | 5 |
|---|---|---|---|
| impact (1–5) | không đổi số installs/waitlist tuần này | gỡ một phụ thuộc hoặc +vài install | mở kênh mới hoặc gỡ nút thắt chặn ≥ 2 agent |
| urgency (1–5) | làm tháng sau cũng được | có hạn trong sprint | chặn việc khác hôm nay / mốc trong 3 ngày |
| effort (1–5) | < 1 giờ agent | nửa ngày | > 1 ngày hoặc cần Founder nhiều bước |
| confidence (0–1) | 0.3 = giả định [A]/[H] chưa kiểm | 0.6 = có tiền lệ trong LEARNINGS | 0.9 = việc cơ học, đầu ra chắc |

Không cho điểm cao để đẩy việc mình thích; task phụ thuộc Founder chưa quyết → urgency thật nhưng trạng thái BLOCKED, không READY.

## Các bước thực thi

1. Đọc đầu vào, viết 3 dòng "hôm nay ở đâu": ngày x/90, tích luỹ vs mốc kế, nút thắt lớn nhất.
2. Dọn tồn: task REVIEW → mở `evidence`, so với `expected`; đạt → `task update T-xxxx --status DONE --evidence <path> --actual "..."`; không đạt → `--status IN_PROGRESS --note "<thiếu gì>"`. Quá hạn (`task overdue`) → gia hạn có lý do (`--deadline`) hoặc CANCELLED kèm `--note`. BLOCKED → kiểm `approval list`; nếu đã APPROVED/REJECTED thì mở lại hoặc huỷ. Task IN_PROGRESS > 2 ngày không có history mới (`task history T-xxxx`) → coi là kẹt, hỏi agent hoặc trả READY.
3. Sinh task mới từ sprint/giai đoạn: mỗi việc kiểm `task dup --title "..."` trước; rồi
   ```
   node growth/os/bin/os.mjs task add --title "Soạn 7 post Threads góc C tuần 3" --agent social-growth --impact 4 --confidence 0.6 --urgency 4 --effort 2 --deadline 2026-10-26 --expected "file growth/os/content/social/K-xxxx-*.md x7, mỗi file có hook+CTA+utm, content ở REVIEW" --sprint S1 --status READY [--deps T-0004] [--needs-approval]
   ```
   `--expected` phải kiểm được bằng file hoặc số. `--status READY` chỉ khi deps DONE và không chờ Founder (mặc định BACKLOG).
4. Chọn 3–7 task READY điểm cao nhất (`task list --status READY` đã sắp theo priority). Cân: không giao > 2 task cùng lúc cho một agent; morning (seo-content, market-intelligence, creative-studio) và afternoon (social-growth, community-partnerships, aso-specialist) theo jobs.json.
5. Giao việc: gọi Agent tool với `subagent_type` = tên agent trong `.claude/agents/`, prompt gồm: task id, `task show T-xxxx` nguyên văn, file memory cần đọc (bảng "Ai đọc gì"), skill cần dùng, và yêu cầu kết thúc bằng `task update T-xxxx --status REVIEW --evidence <path>`. Trước khi gọi: `task update T-xxxx --status IN_PROGRESS --note "giao <agent>"`. Việc cần Founder → không gọi agent; `approval request --kind <kind> --request "..." --ref T-xxxx` và `--status BLOCKED`.
6. Review đầu ra agent khi về: đọc evidence thật (mở file), kiểm giọng Mira (không nên/phải/hãy, không "!"), kiểm số có nguồn; rồi DONE hoặc trả lại (bước 2).
7. Ghi kế hoạch ngày vào `growth/os/reports/daily/<YYYY-MM-DD>-plan.md` (khuôn dưới; `templates/daily-plan.md`). File này khác báo cáo tối `<date>.md`.
8. Phát hiện mới → `memory log --file LEARNINGS`; đổi hướng → `memory log --file DECISION_LOG`. Đóng task điều phối của chính mình (nếu có) với evidence là file plan.

## Đầu ra

`growth/os/reports/daily/<YYYY-MM-DD>-plan.md`:
```
# Kế hoạch ngày <date> — ngày <n>/90
Vị trí: installs <total>/<mốc kế> · waitlist <n> · nút thắt: …
## Hôm nay (theo priority)
| # | Task | Agent | Score | Deadline | Expected |
## Kẹt — cần Founder
- T-xxxx → approval #n (<kind>): …
## Dọn tồn
- T-xxxx DONE/ trả lại / gia hạn — lý do
## Không làm hôm nay và vì sao
```

## Kiểm chất lượng

- [ ] Mọi task mới: đủ 4 tham số, `--deadline`, `--expected` kiểm được, agent trong 10 tên hợp lệ, đã `task dup`.
- [ ] Không task READY nào phụ thuộc quyết định Founder chưa có.
- [ ] Mỗi task giao đi có `task update --status IN_PROGRESS` trước khi gọi agent.
- [ ] Task REVIEW từ hôm qua đã được xử lý hết.
- [ ] `task overdue` = 0 hoặc mỗi dòng có lý do trong history.
- [ ] Plan không chứa việc chi tiền/publish chưa duyệt.

## Khi lỗi / kẹt

- `Trùng với T-xxxx`: dùng task cũ (đổi deadline/agent) thay vì `--force`.
- `còn phụ thuộc chưa xong`: giữ BACKLOG, ghi deps vào plan.
- `agent không hợp lệ`: xem danh sách trong `growth/os/lib/tasks.mjs` AGENTS.
- Agent tool trả về không có evidence: trả task về IN_PROGRESS với note, không DONE hộ.
- Nhiều hơn 7 việc điểm cao: cắt theo giai đoạn (GROWTH_STRATEGY) và nút thắt; phần còn lại BACKLOG, nêu trong "Không làm hôm nay".

## Agent liên quan

`growth-orchestrator` (chủ) · tất cả 8 agent chuyên môn (nhận task) · `founder` (approval).

## Công cụ dùng

CLI `os.mjs` (status, dashboard, task add/list/show/history/update/overdue/dup, approval list/request, memory log) · Agent tool (giao việc) · Read memory/evidence · Write plan.
