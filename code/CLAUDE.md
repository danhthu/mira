# Mira — Chỉ dẫn cho Claude Code

## Đây là gì

Mira là ứng dụng di động giúp người dùng trả lời hai câu hỏi:

1. Tôi còn bao nhiêu thời gian cho những người quan trọng?
2. Tôi đã mua được bao nhiêu tự do?

Ba chỉ số lõi:
- **Giờ vàng**: giờ/tuần thực sự bên người quan trọng
- **Tỷ giá đời**: thu nhập ròng theo giờ (sau kẹt xe/tăng ca/chi phí)
- **Vốn tự do**: tài sản ÷ chi tiêu tháng = tháng sống được mà không cần làm

Đọc `../docs/` trước khi viết bất kỳ dòng code nào: `00-vision.md` → `01-modules.md` → `02-data-model.md` → `03-formulas.md` → `04-roadmap.md` → `05-v1-spec.md`.

---

## Đợt reset 2026-08-27 — đọc trước khi làm bất cứ gì ở fe/

Ngày 2026-08-27, `code/fe` bị thay hoàn toàn bằng app "Batify" gốc (commit `d633408`, nhánh `feat/port-batify-modules`): ~103 màn hình, 14 module, giữ nguyên không dọn lint/type/i18n. Quyết định của chủ dự án: **dùng Batify làm khung xuất phát, dọn dần cho khớp 6 ràng buộc cứng bên dưới** — không quay lại kiến trúc `features/`/`shared/`/`core`/SQLite cũ.

**Stack thật của fe/ bây giờ** (không phải mục "Stack" cũ bên dưới — mục đó mô tả kiến trúc đã bị thay, giữ lại để biết lịch sử):
- React Native + Expo 51 / RN 0.74 / React 18 (không phải bản SDK mới nhất)
- State: `pullstate` — mỗi domain có 1 `Store` instance global (vd. `store/configStore.ts`)
- Lưu trữ: `AsyncStorage` qua `Common/Repositories/Repo.ts` — `class Repository<T>` generic (CRUD + `registerDataChanged`), mỗi module tự new instance (`new HabitTrackerRepository('habit_tracker')`). Không SQLite, không Drizzle.
- Navigation: `@react-navigation` (stack + tab lồng nhau theo module), bọc qua `Router/index.ts` (`Router.Open/Replace/...`)
- Domain model: `class-validator` + `class-transformer` (decorator trên entity, vd. `HabitTracker/Entities/Habit.ts`)
- Test: `jest` (không phải Vitest) — **hiện KHÔNG chạy được**, xem "Nợ kỹ thuật" bên dưới.

**Cấu trúc thư mục thật** — vẫn là feature-based, chỉ khác quy ước tên. Chi tiết đầy đủ ở [`docs/structure.md`](docs/structure.md):
```
fe/libs,lang,theme,store,hook/   ← hạ tầng: component gốc, i18n, token, pullstate
fe/src/Common/                    ← lớp dùng chung (vai trò của shared/ cũ)
fe/src/<Feature>/                 ← Challenger, Emotion, Goal, HabitTracker, Reminder,
                                     TimeTracker, Trading, Welcome, Work
                                     mỗi feature tự có Entities/ Screens/ Components/
                                     Models/ Setup/ Text/
fe/src/Main,Home/                 ← composition root: được phép ghép nhiều feature
```

**Luật import (chốt 2026-09-05):**
1. `Common/` không import feature — lớp dùng chung phải nằm dưới.
2. Feature không import feature khác. Cần dùng chung thì đưa xuống `Common/`.
3. Composition root (`Main/`, `Home/`) được import feature — đó là việc của nó.
4. Không vòng lặp giữa hai feature.

`scripts/soi-cau-truc.sh` soi bốn luật này và **thoát mã 2 nếu thư mục cần soi không tồn tại** — bản cũ soi `features/`/`core/` đã bị xoá nên in "sạch" rỗng suốt nhiều đợt kiểm. Trạng thái 2026-09-05: 36 vi phạm, 35 tự biến mất khi cắt module theo `PLAN.md`, nợ thật 1 chỗ (`Common/Screens/Profile.tsx` — màn hình đặt nhầm tầng).

**Chưa có tầng `core/`.** Công thức thuần của mô hình 3 trụ (vốn tự do, bốc hơi, tỷ giá đời) cần tầng riêng có test, không import React. Thêm `src/Core/` khi bắt đầu xây trụ Tài chính.

### Nợ kỹ thuật — trạng thái 2026-08-27 (đợt dọn multi-agent, xem PLAN.md)

Khảo sát 2026-08-27 tìm thấy các chỗ Batify vi phạm trực tiếp "Ràng buộc cứng" bên dưới. Cùng ngày đã dọn xong 6/8 mục bằng 4 agent song song + fix tay:

1. ✅ **Streak** (vi phạm #3) — gỡ sạch khỏi `HabitTracker/` (UI lẫn hàm tính nội bộ trong `habitRepository.ts`, không còn ai gọi nên xoá luôn, không phải chỉ ẩn).
2. ✅ **Point/Level/Achievement Score** (vi phạm #3) — gỡ khỏi `Work/Screens/Tools/Dashboard.tsx` (giữ lại `Summary` trung tính) và `Work/Screens/Statistic.tsx`/`StatisticScore.tsx` (điểm to + sao cam giả rating, phát hiện thêm ngoài khảo sát ban đầu — cũng đã gỡ).
3. ✅ **Màu đỏ báo "chưa đủ"** (vi phạm #3) — `HabitTracker/Screens/Statistic/StatisticSumary.tsx` đổi `colors.error` sang xám trung tính; `Work/Screens/Statistic.tsx`/`StatisticScore.tsx` cũng có ngưỡng tương tự, đã sửa cùng lúc.
4. ✅ **Sentry** (vi phạm #5 local-first) — `Sentry.init()` ở `App.tsx` đã comment lại cho V1, giữ code để bật lại khi cần.
5. ✅ **`npm test`** — xoá `jest.config.js` rỗng, sửa tên `tests/jet-setup.ts` → `jest-setup.ts`. Chạy được **27/27 pass** (kể cả 2 test từng fail vì fixture/expectation sai, không phải lỗi hệ thống — đã sửa).
6. ✅ **`npx tsc`** — 141 lỗi → **0 lỗi**.
7. ⬜ `Reminder/Screens/Home.tsx` rỗng 0 byte — module chưa hoàn thiện, chưa biết có nằm trong scope V1 không. Chưa xử lý.
8. ⬜ `Trading/` (theo dõi thói quen xem giá chứng khoán) là tính năng gốc của Batify, không thuộc sản phẩm Mira — cân nhắc gỡ hẳn hay giữ lại như module riêng. Chưa xử lý.

Ràng buộc #2 (Giờ vàng không có giá) và #4 (Đồng hồ cát) — #2 chưa audit hết `TimeTracker/`, #4 chưa tồn tại trong Batify (cần xây mới đúng ràng buộc ngay từ đầu, không phải dọn). Cả hai chưa nằm trong đợt này.

---

## Stack (kiến trúc cũ — không còn áp dụng cho fe/, xem mục reset ở trên; vẫn áp dụng cho be/)

**Backend (be/)**: Node.js + TypeScript strict, PostgreSQL (raw SQL, không ORM), `pg` library. Không đổi — `code/be` không bị đụng trong đợt reset.

---

## Kiến trúc — bắt buộc tuân theo

### App (FE)

Xem mục "Đợt reset 2026-08-27" ở trên cho cây thư mục và bốn luật import, hoặc [`docs/structure.md`](docs/structure.md) cho bản đầy đủ.

### Backend (BE)

```
be/src/shared/      ← interfaces + DTOs + SQL row types (không có implementation)
be/src/entities/    ← domain objects (pure TypeScript, không phụ thuộc gì)
be/src/database/    ← PostgreSQL adapter + raw SQL queries
```

**Dependency rule (cứng):**
- `shared/` → không import từ `entities/` hoặc `database/`
- `entities/` → không import từ `database/` hoặc `shared/`
- `database/` → chỉ import từ `shared/`

**Hai ngoại lệ hẹp, chỉ cho `import type`** (chốt 2026-08-25). Luật trên nhắm vào phụ thuộc lúc chạy; `import type` bị xoá khi biên dịch nên không tạo phụ thuộc nào:
- `entities/` được `import type` từ `shared/types/enums.ts` — và chỉ file đó. Các union type (`PersonRole`, `TimeBucket`…) cần dùng chung giữa entity và DTO, để mỗi bên tự khai thì hai bản sẽ lệch nhau.
- `database/` được `import type` từ `entities/`. Mapper có việc là biến row thành entity, nên buộc phải gọi tên kiểu entity ở đầu ra; không có chỗ hợp lệ nào khác đặt nó.

Ngoài hai chỗ này, mọi `import` khác (kể cả type) vẫn theo đúng luật trên. `scripts/soi-cau-truc.sh` kiểm tự động.

**IDatabase interface** sống trong `be/src/shared/interfaces/IDatabase.ts`. Mọi code dùng DB phải đi qua interface này, không gọi trực tiếp `pg`.

---

## Anti-AI rules — không được vi phạm

1. **Không `any`**: dùng `unknown` + type guard hoặc generic có ràng buộc. Nếu phải cast, viết comment giải thích tại sao.
2. **Không defensive code vô nghĩa**: không check `if (arr === null)` khi contract đảm bảo không null; không try-catch rỗng; không fallback tùy tiện.
3. **Không comment thừa**: không comment những gì tên biến/hàm đã nói. Comment chỉ khi WHY không hiển nhiên.
4. **Không scaffold rỗng**: không `// TODO: implement`, không `throw new Error('not implemented')` trong code production, không hàm trả về `undefined` mà không có lý do.
5. **Không backward-compat giả**: không alias cũ sang tên mới, không export tên đã bỏ với comment `// deprecated`.
6. **Không tính năng ngoài spec V1**: kể cả khi thấy "sẽ hay hơn". Hỏi trước khi thêm.
7. **Không hardcode credentials**: DB credentials vào `.env`, không bao giờ commit `.env`.
8. **Không float cho tiền**: lưu VND bằng `number` nguyên (integer). Không `1_500_000.5`.
9. **Không giờ thập phân**: lưu thời lượng bằng phút nguyên. Không `1.5h`.

---

## Ngôn ngữ

| Thứ | Ngôn ngữ |
|---|---|
| Tên biến, hàm, type, file, folder | Tiếng Anh |
| Comment trong code | Tiếng Việt (giải thích WHY) |
| Chuỗi hiển thị trong UI | Tiếng Việt, gom vào `src/i18n/vi.ts` |
| Error message (throw, console.error) | Tiếng Anh |
| Tên commit, branch, PR | Tiếng Anh |
| HANDOFF.md | Tiếng Việt |

---

## Handoff protocol

Mỗi feature folder **phải có** `HANDOFF.md` với format:

```markdown
# <Tên feature>

## Trạng thái hiện tại
[Đang làm gì, xong đến đâu]

## Quyết định đã chốt
[Những lựa chọn kỹ thuật quan trọng và lý do]

## Câu hỏi còn mở
[Gì chưa rõ, cần hỏi lại]

## Bước tiếp theo
[Cụ thể, có thể bắt tay làm ngay]
```

---

## Ràng buộc cứng — không được vi phạm

1. **Ngân sách nhập liệu**: tổng thao tác nhập của người dùng ≤ 60 giây/ngày.
2. **Giờ vàng không có giá**: tỷ giá đời chỉ áp cho chi tiêu và công việc. Tuyệt đối không quy đổi thời gian với con/bố mẹ/bạn đời ra tiền.
3. **Không streak, không badge, không thông báo gây tội lỗi.** Không dùng màu đỏ để báo người dùng làm chưa đủ.
4. **Đồng hồ cát mặc định TẮT.** Chỉ bật khi người dùng chủ động chọn. Khi hiển thị, luôn kèm một hành động cụ thể.
5. **Local-first.** Dữ liệu nằm trên máy. Không gửi gì lên server ở V1.
6. **Không kết nối API ngân hàng.** Chi tiêu lấy từ SMS/notification, người dùng xác nhận 1 chạm.

---

## Quy ước code

- Mọi hằng số vào `fe/src/core/constants.ts` (fe) hoặc `be/src/shared/constants.ts` (be). Không số ma thuật trong code.
- Toàn bộ logic tính toán nằm trong `src/core/` — hàm thuần, phải có test.
- Mỗi screen trước khi viết: đọc lại phần tương ứng trong `05-v1-spec.md`.
- Làm từng module một, chạy được rồi mới sang cái tiếp.
- Khi thấy spec mâu thuẫn hoặc thiếu, ghi vào HANDOFF.md "Câu hỏi còn mở" và dùng option safe nhất.

---

## Cách làm việc

- Không tự ý thêm tính năng ngoài spec V1.
- Không commit thẳng lên `main`.
- Mỗi module xong phải cập nhật HANDOFF.md của module đó.
- DB credentials lấy từ `.env`. File `.env.example` commit được, `.env` không commit.
