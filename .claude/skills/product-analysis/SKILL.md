---
name: product-analysis
description: Phân tích sản phẩm Mira từ chính mã nguồn và spec trong repo (code/fe, docs/) để cập nhật GAME_PROFILE.md — tính năng thật đang chạy, màn hình quay footage được, USP, điểm còn thiếu so với spec. Dùng khi nói "phân tích sản phẩm", "app đang có gì", "tính năng nào đã làm", "màn hình nào quay được", "cập nhật hồ sơ sản phẩm", "product analysis", "feature inventory", "what does the app actually do". KHÔNG dùng để đề xuất tính năng mới, sửa code/fe, hay phân tích đối thủ (việc của market-research).
---

# product-analysis — hồ sơ sản phẩm từ sự thật trong repo

## Mục đích

Giữ `growth/os/memory/GAME_PROFILE.md` khớp với **code đang chạy**, không phải với spec mơ ước. Mọi skill nội dung (ASO, video, social) đọc file này để biết được phép nói gì về app. Nếu file này sai, cả hệ thống nói dối người dùng.

Luật duy nhất không được vi phạm: **không giả định tính năng không có trong code.** Spec `docs/05-v1-spec.md` mô tả Giờ vàng, Đồng hồ cát, Khoảnh khắc; nhưng `code/fe/src/` hiện là khung port từ Batify (TimeTracker, HabitTracker, Goal, Work, Challenger, Emotion). Hai thứ đó khác nhau — ghi rõ cái nào là "có trong code", cái nào là "trong spec, chưa có".

## Khi nào dùng

- Đầu sprint, hoặc sau mỗi commit lớn vào `code/fe` (đọc `git log --oneline -20 -- code/fe`).
- Trước khi chạy `app-store-optimization`, `short-video-production`, `viral-content-creation`.
- Khi một skill khác hỏi "màn hình X có thật không" mà GAME_PROFILE chưa trả lời được.

## Đầu vào bắt buộc

1. `growth/os/memory/PROJECT_CONTEXT.md`, `growth/os/memory/GAME_PROFILE.md` (bản hiện tại — để diff, không viết lại từ đầu).
2. `docs/00-vision.md`, `docs/05-v1-spec.md`, `docs/03-formulas.md`, `docs/04-roadmap.md`.
3. `code/CLAUDE.md` (ràng buộc cứng), `code/docs/ui-text-inventory.md` (kiểm kê điều hướng có sẵn, ngày 31/8/2026 — kiểm lại trước khi tin).
4. `code/fe/app.json`, `code/fe/package.json`, `code/fe/lang/*`.

## Các bước thực thi

1. **Ghi task**:
   `node growth/os/bin/os.mjs task add --title="Cập nhật GAME_PROFILE từ code" --agent=market-intelligence --impact=4 --confidence=0.9 --urgency=3 --effort=2 --deadline=<YYYY-MM-DD> --expected="GAME_PROFILE.md có bảng màn hình + bảng tính năng theo trạng thái"` rồi `task update T-xxxx --status=IN_PROGRESS`.
2. **Kiểm kê màn hình thật.** Chạy `ls code/fe/src/*/Screens` và đọc `code/fe/src/Main/MainScreen.tsx`, `code/fe/src/Main/TabScreen.tsx` để biết tuyến nào thật sự được đăng ký. Màn hình có file nhưng không nằm trong navigator → ghi "có file, không vào được từ app".
3. **Với mỗi module** (`src/<Module>/Screens/*.tsx`): đọc màn hình Home/Container, ghi 1 dòng nó làm gì, chuỗi hiển thị lấy từ `code/fe/lang/`, có dữ liệu mẫu để quay không (màn trống thì không quay được).
4. **Đối chiếu với spec.** Lập bảng tính năng V1 từ `docs/05-v1-spec.md` (onboarding 4 bước, Hôm nay, Đồng hồ cát, Khoảnh khắc, Settings) và ba công thức `docs/03-formulas.md`; đánh dấu từng dòng: `có trong code` / `một phần` (ghi file) / `chưa có`. Grep để chứng minh: `grep -rn "goldenHours\|hourglass\|lifeRate" code/fe/src`.
5. **Trạng thái phát hành.** Đọc `app.json` (tên, bundle id, version), kiểm `npm run web:build` có trong scripts, có thư mục `android/`/`ios/` không, EAS projectId. Ghi nguyên văn, kèm ngày.
6. **USP và điểm thiếu.** USP chỉ được viết lại khi code chứng minh được; nếu USP vẫn dựa trên spec, giữ nhãn **(giả định — chưa có trong code)**.
7. **Cập nhật GAME_PROFILE.md** bằng Edit từng mục, giữ cấu trúc cũ, thêm dòng `Cập nhật: <ngày> từ commit <sha>` ở đầu file. Không xoá mục "giả định" cũ — chuyển sang "đã kiểm: đúng/sai".
8. **Ghi memory nếu có phát hiện đổi hướng**, ví dụ phát hiện app chưa có màn hình nào của Mira thật:
   `node growth/os/bin/os.mjs memory log --file=LEARNINGS --text="<ngày> product-analysis: ... (bằng chứng: file ...)"`.
9. **Đóng task**: `task update T-xxxx --status=DONE --evidence=growth/os/memory/GAME_PROFILE.md --actual="<1 dòng>"`.

## Đầu ra

File duy nhất được sửa: `growth/os/memory/GAME_PROFILE.md`. Hai bảng bắt buộc thêm/cập nhật:

```markdown
## Màn hình thật trong code (kiểm <ngày>, commit <sha>)

| Module | Màn hình (file) | Vào được từ app? | Làm gì (1 dòng) | Quay footage được? | Ghi chú |
|---|---|---|---|---|---|
| TimeTracker | `src/TimeTracker/Screens/Home.tsx` | có (tuyến TimeApp) | ... | có, cần nhập 3–5 bản ghi trước | chuỗi còn tiếng Anh ở ... |

## Tính năng V1 theo spec ↔ code

| Tính năng (docs/05) | Trạng thái | Bằng chứng (file/grep) | Nói ra ngoài được không |
|---|---|---|---|
| Giờ vàng (công thức §1 docs/03) | chưa có | `grep goldenHours` = 0 kết quả | KHÔNG — chỉ nói "đang xây" |
```

Cột "Nói ra ngoài được không" là cột các skill khác dùng: `có` / `có, kèm chữ "sắp"` / `KHÔNG`.

## Kiểm chất lượng

- [ ] Mỗi dòng "có trong code" dẫn được tới một file tồn tại (đã `ls`/`Read`, không đoán từ tên thư mục).
- [ ] Không có tính năng nào ghi "có" chỉ vì spec hoặc blog nói vậy.
- [ ] Bảng màn hình liệt kê đủ module trong `ls code/fe/src/*/Screens`.
- [ ] `app.json` được trích đúng nguyên văn (tên vỏ `DailyOps` còn hay đã đổi).
- [ ] Mục USP phân biệt "đã kiểm" và "giả định".
- [ ] Không chạm `code/`, không tạo file ngoài `growth/os/memory/`.
- [ ] Task DONE có `--evidence`.

## Khi lỗi / kẹt

- Code mâu thuẫn với `code/docs/ui-text-inventory.md` → tin code. Skill này không ghi vào `code/`, nên ghi mâu thuẫn vào GAME_PROFILE mục "Mâu thuẫn tài liệu cần Founder xác nhận".
- Không chạy được app để xác nhận màn hình có render → ghi "chưa kiểm bằng mắt" ở cột Ghi chú, tạo task cho Founder: `task add --title="Chạy app, chụp màn hình X" --agent=founder ...`.
- Phát hiện cần đổi `app.json` (tên vỏ Batify) → không sửa; `approval request --kind=code_change --request="Đổi name/slug/bundleId trong code/fe/app.json sang Mira" --ref=T-xxxx`.

## Agent liên quan

market-intelligence (chủ), aso-specialist và creative-studio (người đọc), founder (xác nhận mâu thuẫn).

## Công cụ dùng

Read, Grep, Glob, Bash (`ls`, `git log`, `grep`), Edit (chỉ GAME_PROFILE.md), CLI `os.mjs`. Không WebSearch — nguồn sự thật là repo.
