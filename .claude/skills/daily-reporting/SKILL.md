---
name: daily-reporting
description: Sinh và hoàn thiện báo cáo ngày của Mira Growth OS — chạy `os.mjs run daily-report` (phần số, khuôn trong lib/report.mjs), rồi CGO điền PHÁT HIỆN / VIỆC TIẾP THEO / CẦN FOUNDER từ số thật, gửi Telegram nếu Founder bật. Dùng khi nói "báo cáo ngày", "daily report", "điền phát hiện", "tóm tắt hôm nay cho Founder", "gửi báo cáo Telegram", "daily-report-insights", "end of day report". KHÔNG dùng cho báo cáo tuần/tháng (weekly-growth-review), KHÔNG dùng để nạp số (growth-analytics) — báo cáo chỉ đọc số đã có trong DB.
---

# Daily reporting — báo cáo ngày cho Founder

## Mục đích

Founder đọc một file mỗi tối, 2 phút, biết: đang ở đâu so mốc, kênh nào động đậy, cần quyết gì. Phần số do script sinh và không sửa tay; phần chữ do CGO điền và chỉ nói điều số chứng minh được.

## Khi nào dùng

- Job `daily-report` 20:00 (script) rồi `daily-report-insights` 20:10 (Claude) theo `growth/os/scheduler/jobs.json`.
- Founder hỏi "hôm nay thế nào" ngoài giờ — chạy cùng quy trình với `--force`.

## Đầu vào bắt buộc

- Số đã nạp cho hôm nay/hôm qua (skill growth-analytics). Thiếu số thì báo cáo ghi "chưa đo", không đi ước.
- `growth/os/memory/CURRENT_STATE.md` (kẹt chờ Founder), `task list --status DONE` hôm nay, `task list --status BLOCKED`, `experiment list --open`, `approval list`.
- Kế hoạch sáng `growth/os/reports/daily/<date>-plan.md` (để so "định làm" với "đã làm").

## Khuôn báo cáo (giữ nguyên, do `lib/report.mjs` sinh)

`growth/os/reports/daily/<YYYY-MM-DD>.md` gồm các mục theo thứ tự: MỤC TIÊU · THỰC TẾ · NGUỒN · HIỆU QUẢ KÊNH · NGÂN SÁCH · THỰC THI · PHÁT HIỆN · DỰ BÁO · VIỆC TIẾP THEO · CẦN FOUNDER. Không thêm/bớt/đổi tên mục. Chỉ ba chỗ CGO sửa chữ: 4 dòng trong PHÁT HIỆN (kênh tốt nhất, kém nhất, phát hiện chính, nút thắt chính), 3 dòng VIỆC TIẾP THEO, và có thể thêm dòng vào CẦN FOUNDER (không xoá dòng approval do script sinh).

## Các bước thực thi

1. Sinh phần số: `node growth/os/bin/os.mjs run daily-report`. Job idempotent — nếu đã chạy OK hôm nay trả `SKIPPED`; cần sinh lại dùng `run daily-report --force` hoặc `report daily`. Lưu ý: sinh lại sẽ **ghi đè phần chữ đã điền** — làm bước này trước, điền chữ sau.
2. Có thể đưa 3 ưu tiên ngay từ CLI để khỏi sửa tay: `node growth/os/bin/os.mjs report daily --next "Nạp số GA4 ngày 20|Review 7 post Threads K-0012..18|Xin approval GA4 landing"` (ngăn bằng `|`). Phần PHÁT HIỆN vẫn phải sửa tay (CLI không nhận insights).
3. Đọc file vừa sinh cùng `growth/os/dashboard/README.md`. Kiểm từng số có nguồn: số trong THỰC TẾ/HIỆU QUẢ KÊNH đến từ metrics_daily; số có chữ "ước"/"không gán" giữ nguyên nhãn khi trích.
4. Điền PHÁT HIỆN (Edit đúng 4 dòng):
   - Kênh tốt nhất/kém nhất: script đã điền theo installs; nếu installs toàn 0 thì so theo waitlist/clicks và ghi rõ "theo clicks vì chưa có install".
   - Phát hiện chính: một câu có số + nguồn + so sánh (hôm qua, tuần trước, hoặc mốc). Không có gì mới → "không có phát hiện mới có bằng chứng; hôm nay chủ yếu <việc>".
   - Nút thắt chính: việc đang chặn nhiều task nhất (từ BLOCKED/approval), nêu id.
5. Điền VIỆC TIẾP THEO: 3 ưu tiên cho ngày mai, mỗi dòng có task id hoặc "(tạo sáng mai)", agent, kết quả kiểm được. Lấy từ `task list --status READY` xếp theo priority; không liệt kê việc chờ Founder ở đây (để ở CẦN FOUNDER).
6. CẦN FOUNDER: giữ dòng approval do script sinh; thêm tối đa 3 dòng cho việc chưa thành approval nhưng chặn tiến độ (ví dụ "ngày có build store"), mỗi dòng kết bằng câu hỏi có/không hoặc lựa chọn.
7. Rà giọng: không "nên/phải/hãy", không dấu chấm than, không "tuyệt vời/đáng kinh ngạc", số 0 chưa đo không gọi là "kênh chết".
8. Gửi Telegram (chỉ khi `CURRENT_STATE.md` bảng Integration ghi Telegram đã cấu hình và Founder bật): gọi skill `telegram-report-bot:send-telegram-report` với tóm tắt ≤ 12 dòng: ngày x/90, installs tổng/mốc, waitlist, chi/100, 1 phát hiện, 3 ưu tiên, số approval chờ. Chưa cấu hình → bỏ qua, ghi một dòng "Telegram: chưa nối" cuối file.
9. Ghi dấu: phát hiện chính có bằng chứng → `memory log --file LEARNINGS --text "..."`; nếu task `daily-report-insights` tồn tại trong DB → `task update T-xxxx --status DONE --evidence growth/os/reports/daily/<date>.md --actual "điền 3 mục"`.

## Đầu ra

- `growth/os/reports/daily/<YYYY-MM-DD>.md` đã có đủ 10 mục, 4 dòng PHÁT HIỆN và 3 dòng VIỆC TIẾP THEO không còn "(CGO điền)".
- `growth/os/dashboard/README.md` + `snapshot.json` cập nhật (job daily-report tự chạy dashboard).
- Tin Telegram (nếu bật), ví dụ:
  ```
  Mira · ngày 8/90 · installs 0/50 (mốc ngày 14) · waitlist 23 · chi 0/100 USD
  Phát hiện: Threads K-0012 góc C 1.4% CTR (n=1.100) — cao nhất tuần
  Mai: 1) T-0021 nạp GA4 2) T-0019 7 post góc C 3) T-0023 outreach 5 newsletter
  Chờ Founder: #3 access GA4 · #4 code_change appinstalled
  ```

## Kiểm chất lượng

- [ ] Phần số không bị sửa tay; chạy lại `report daily` sẽ ra cùng số.
- [ ] Mỗi câu trong PHÁT HIỆN có số và nguồn (metric/K-id/X-id/T-id).
- [ ] 3 ưu tiên có id/agent/kết quả kiểm được; không trùng việc BLOCKED.
- [ ] CẦN FOUNDER khớp `approval list` + tối đa 3 dòng thêm.
- [ ] Không bịa: không có số nào trong phần chữ mà không tra được trong DB hoặc file evidence.
- [ ] Giọng Mira.

## Khi lỗi / kẹt

- `run daily-report` FAILED sau 3 lần (xem `runs`, `growth/os/logs/<date>.log`, `logs/ALERTS.md`): chạy `report daily` trực tiếp để thấy lỗi; thường do `targets.json`/`channels.json` hỏng JSON.
- File báo cáo bị ghi đè mất phần chữ: điền lại từ plan sáng + task list; lần sau điền chữ sau cùng.
- Không có số nào cả ngày: báo cáo vẫn gửi, PHÁT HIỆN ghi "chưa có số đo — nguồn chưa nối (xem CURRENT_STATE)", ưu tiên 1 ngày mai là gỡ nguồn số.
- Skill Telegram lỗi/thiếu cấu hình: không chặn báo cáo; ghi vào CẦN FOUNDER "bật Telegram?".

## Agent liên quan

`growth-orchestrator` (điền chữ) · `growth-analytics` (số phải nạp trước 20:00) · `founder` (đọc, quyết).

## Công cụ dùng

CLI `os.mjs` (run daily-report, report daily --next, dashboard, task list, approval list, experiment list, memory log) · Edit file báo cáo · Skill `telegram-report-bot:send-telegram-report`.
