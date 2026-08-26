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

## Stack

**App (fe/)**: React Native + Expo (SDK mới nhất), TypeScript strict, SQLite qua `expo-sqlite` + Drizzle ORM, Zustand, Vitest cho logic thuần.

**Backend (be/)**: Node.js + TypeScript strict, PostgreSQL (raw SQL, không ORM), `pg` library.

---

## Kiến trúc — bắt buộc tuân theo

### App (FE)

```
fe/src/features/<name>/   ← mỗi feature là một folder độc lập
fe/src/shared/            ← thứ DUY NHẤT được import giữa các feature
fe/src/core/              ← hàm thuần, không phụ thuộc React, phải có test
fe/src/db/                ← SQLite schema + Drizzle migrations + repositories
fe/src/i18n/vi.ts         ← mọi chuỗi hiển thị, không inline string trong JSX
fe/src/store/              ← Zustand (không Redux)
```

**Import rule (cứng):**
- `features/X` → **chỉ được** import từ `shared/`, `core/`, `db/`, `i18n/`, `store/`
- `features/X` → **không bao giờ** import từ `features/Y`
- `core/` → không import React, không import `db/`, không import `store/`

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
