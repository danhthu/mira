---
name: memory-management
description: Luật ghi và dọn memory của Mira Growth OS trong growth/os/memory — nhãn [F]/[A]/[H], chỉ-thêm cho DECISION_LOG và LEARNINGS qua `memory log`, khối AUTO trong CURRENT_STATE qua `memory state`, cập nhật tay phần còn lại, gom cuối ngày, dọn giả định đã bị bác, không nạp toàn bộ memory vào mỗi agent. Dùng khi nói "ghi memory", "cập nhật CURRENT_STATE", "gom phát hiện", "ghi quyết định", "ghi learning", "dọn memory", "memory-consolidate", "memory management", "update memory", "log decision". KHÔNG dùng để viết báo cáo (daily-reporting) hay để đổi chiến lược mà chưa có dòng DECISION_LOG.
---

# Memory management — ghi gì, ở đâu, nhãn gì

## Mục đích

Memory là thứ duy nhất sống qua các phiên. Nó chỉ có giá trị khi phân biệt được điều đã biết với điều đang đoán, và khi mỗi phiên chỉ đọc phần mình cần. Skill này giữ hai thứ đó.

## Khi nào dùng

- Job `memory-consolidate` 18:15 hằng ngày.
- Ngay sau một quyết định đổi hướng, một experiment decide, một task DONE có phát hiện.
- Cuối weekly review / monthly review (dọn nhãn).

## Bản đồ memory (`growth/os/memory/`)

| File | Chủ | Cách ghi | Ai đọc |
|---|---|---|---|
| PROJECT_CONTEXT.md | CGO | tay, hiếm khi đổi | mọi agent |
| CURRENT_STATE.md | CGO | khối AUTO bằng `memory state`; phần còn lại tay | CGO, growth-analytics |
| GROWTH_STRATEGY.md | CGO | tay, sau DECISION_LOG | CGO, paid-acquisition |
| CHANNEL_STRATEGY.md | CGO | tay, mục "Kết quả" mỗi tuần | social, community, seo, paid |
| AUDIENCE_PROFILE.md, GAME_PROFILE.md, COMPETITOR_INTELLIGENCE.md | agent chuyên môn | tay, có nhãn | theo bảng "Ai đọc gì" trong PROJECT_CONTEXT |
| DECISION_LOG.md | mọi agent | **chỉ thêm** qua `memory log --file DECISION_LOG` | CGO |
| LEARNINGS.md | mọi agent | **chỉ thêm** qua `memory log --file LEARNINGS` | CGO, social, creative |

Không nạp toàn bộ thư mục vào một agent: prompt giao việc chỉ liệt kê file theo bảng "Ai đọc gì". Agent cần thêm thì mở thêm, không mặc định đọc hết.

## Nhãn

- **[F]** sự thật có nguồn — kèm N-xxx (`docs/nguon/nghien-cuu/INDEX.md`), X-xxx, T-xxx, hoặc metric có ngày.
- **[A]** giả định — chưa có bằng chứng, dùng để làm việc; phải nêu cách kiểm.
- **[H]** giả thuyết cần thử nghiệm — có X-id khi đã mở.
Mọi câu khẳng định trong AUDIENCE_PROFILE, CHANNEL_STRATEGY, COMPETITOR_INTELLIGENCE, GAME_PROFILE đều mang một nhãn. Không nhãn = [A].

## Các bước thực thi (gom cuối ngày)

1. Thu thập: `task list --status DONE` (lọc `updated_at` hôm nay), `experiment list` (decided hôm nay), `audit --limit 50`, `approval list --status APPROVED` và `--status REJECTED`. Mở evidence của task DONE có `actual` nhắc tới số.
2. Ghi LEARNINGS cho mỗi phát hiện **có bằng chứng** (khuôn: phát hiện — bằng chứng id/số — hệ quả):
   ```
   node growth/os/bin/os.mjs memory log --file LEARNINGS --actor growth-orchestrator --text "Post Threads có con số cụ thể trong câu đầu cho CTR 1.4% vs 0.6% (K-0012 vs K-0013, 2.200 hiển thị) — ưu tiên hook số cho tuần sau"
   ```
   Không có bằng chứng → không ghi LEARNINGS; đưa vào AUDIENCE_PROFILE/CHANNEL_STRATEGY với nhãn [H].
3. Ghi DECISION_LOG cho mỗi quyết định đổi hướng, kể cả quyết định "không làm" (khuôn: quyết định — lý do — ảnh hưởng). Founder quyết qua chat → ghi với `--actor founder` và nguồn "qua chat <ngày>". Approval REJECTED cũng là quyết định.
4. Cập nhật khối AUTO: `node growth/os/bin/os.mjs memory state` — thay thế đúng phần giữa `<!-- AUTO:BEGIN -->` và `<!-- AUTO:END -->` trong CURRENT_STATE từ snapshot; không sửa tay trong khối này.
5. Cập nhật tay CURRENT_STATE (Edit từng mục, giữ tiêu đề): "Giai đoạn", "Đang chạy / vừa xong" (3–6 dòng gần nhất, bỏ dòng cũ hơn 7 ngày), "Kẹt — cần Founder" (đồng bộ với `approval list`), "Integration" (nguồn vừa nối/ngắt), "Hạn chế attribution". File này là ảnh chụp, không phải nhật ký — dài quá 60 dòng là dấu hiệu phải dọn.
6. Dọn nhãn: với mỗi experiment decided hôm nay, tìm [H] tương ứng trong AUDIENCE_PROFILE/CHANNEL_STRATEGY → đổi [H] thành [F] kèm X-id và số, hoặc gạch ngang (`~~…~~ bác bởi X-0001`) nếu bị bác. Giả định [A] có LEARNINGS trái ngược → gạch tương tự. Không xoá dòng (giữ dấu vết), chỉ gạch kèm lý do.
7. Đồng bộ chiến lược: nếu DECISION_LOG hôm nay đổi thứ tự kênh/mốc/ràng buộc → sửa đúng bảng trong GROWTH_STRATEGY hoặc CHANNEL_STRATEGY, thêm "(DECISION_LOG YYYY-MM-DD)" cuối dòng sửa. Ngược lại không chạm.
8. Kiểm mâu thuẫn: số trong CURRENT_STATE phần tay khác snapshot → sửa phần tay. Hai file nói ngược nhau về một sự thật → ghi vào `growth/content/HANDOFF.md` mục mâu thuẫn (theo CLAUDE.md gốc), không tự chọn một bên.
9. Nếu có task cho việc này: `task update T-xxxx --status DONE --evidence growth/os/memory/CURRENT_STATE.md --actual "ghi n LEARNINGS, m DECISION_LOG, dọn k nhãn"`.

## Đầu ra

- Dòng mới cuối `LEARNINGS.md` / `DECISION_LOG.md` dạng `- **YYYY-MM-DD** (actor) …` (CLI tự thêm ngày, actor).
- `CURRENT_STATE.md` với khối AUTO ngày hôm nay và phần tay ≤ 60 dòng.
- Nhãn trong hồ sơ cập nhật; dòng bị bác gạch ngang kèm X-id/N-id.

## Kiểm chất lượng

- [ ] Không sửa/xoá dòng cũ trong DECISION_LOG, LEARNINGS (chỉ thêm, chỉ qua CLI để có audit).
- [ ] Mỗi dòng LEARNINGS có ít nhất một id (T/X/K/C/N) hoặc metric + ngày.
- [ ] Khối AUTO có ngày hôm nay; không có chữ sửa tay bên trong.
- [ ] "Kẹt — cần Founder" khớp `approval list` (không liệt kê việc đã duyệt).
- [ ] Mọi [H] có X-id khi đã mở thử nghiệm; mọi [F] có nguồn.
- [ ] GROWTH_STRATEGY/CHANNEL_STRATEGY chỉ đổi khi có DECISION_LOG cùng ngày hoặc trước.
- [ ] Prompt giao việc cho agent liệt kê file memory cụ thể, không "đọc hết growth/os/memory".

## Khi lỗi / kẹt

- `--file DECISION_LOG|LEARNINGS`: tên file khác hai tên này không ghi được qua CLI — đúng thiết kế; file khác sửa tay.
- `memory state` báo không tìm thấy khối AUTO: CLI tự thêm khối vào cuối; di chuyển lên đầu file bằng Edit.
- Phát hiện chưa chắc là sự thật hay giả định: ghi [H] kèm "cách kiểm: …", không ghi LEARNINGS.
- Hai agent ghi LEARNINGS trùng ý: giữ cả hai (chỉ-thêm), ghi một dòng tổng hợp ở weekly review nếu cần.

## Agent liên quan

`growth-orchestrator` (gom, dọn nhãn, chiến lược) · mọi agent (ghi LEARNINGS/DECISION_LOG sau task) · `market-intelligence`, `aso-specialist` (hồ sơ có nhãn) · `founder` (quyết định qua chat → ghi với actor founder).

## Công cụ dùng

CLI `os.mjs` (memory log, memory state, task list/update, experiment list, approval list, audit) · Read/Edit các file memory · `growth/content/HANDOFF.md` cho mâu thuẫn.
