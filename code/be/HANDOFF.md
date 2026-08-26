# HANDOFF — be/ backend

## Trạng thái hiện tại

Tầng dữ liệu đã chạy được từ đầu tới cuối: có adapter, có SQL, có mapper, có repository, có test.

Nền tảng (làm trước đó):

- **`src/shared/interfaces/IDatabase.ts`** — interface trung tâm cho database adapter. Mọi truy vấn đi qua đây, không code nào gọi thẳng `pg` ngoài adapter.
- **`src/database/PostgresAdapter.ts`** — implement `IDatabase` bằng `pg.Pool`, có transaction (BEGIN/COMMIT/ROLLBACK trên client riêng).
- **`src/database/migrations/001_initial.sql`** — đủ 13 bảng theo `docs/02-data-model.md`, kể cả bảng V2–V5 chưa dùng.
- **`src/database/migrations/runner.ts`** — chạy file `.sql` theo thứ tự alphabet, bỏ qua file đã chạy, mỗi file một transaction.
- **`src/database/queries/{person,timeEntry,moment}.ts`** — hằng SQL cho CRUD ba bảng V1.
- **`src/entities/*.ts`** — 13 interface thuần, `readonly`, union type thay enum.
- **`src/shared/dtos/`**, **`src/shared/types/rows.ts`**, **`src/shared/types/enums.ts`** — DTO, kiểu hàng SQL, union type dùng chung.

Mới thêm lần này:

- **`src/database/mappers/{person,timeEntry,moment}.ts`** — `toPerson`, `toTimeEntry`, `toMoment`: đổi snake_case sang camelCase, giữ nguyên `null`, parse `person_ids` từ chuỗi JSON thành mảng. File moment còn có `parsePersonIds`/`serializePersonIds` cho chiều ngược lại.
- **`src/database/repositories/{PersonRepository,TimeEntryRepository,MomentRepository}.ts`** — nhận `IDatabase` qua constructor. Có `findAll`, `findById`, `create`, `update`, `softDelete`; thêm `findByDate`, `findByPersonId`, `findByDateRange` cho time entry và `findByDateRange`, `findByBucket` cho moment, bám đúng những câu SQL đã có sẵn.
- **`src/database/id.ts`** — `newId()` bọc `v7()` của package `uuid`.
- **`src/shared/constants.ts`** — mặc định `dunbar_ring = 50`, `hourglass_enabled = false`, `source = 'manual'`.
- **`src/database/mappers/__tests__/mappers.test.ts`** và **`src/database/repositories/__tests__/repositories.test.ts`** — 13 test, chạy bằng vitest, không cần Postgres thật (repository test dùng một `FakeDatabase` implement `IDatabase`).
- `package.json`: thêm `uuid`, devDependency `vitest`, script `"test": "vitest run"`.

## Cách chạy

1. Copy `.env.example` thành `.env`, điền thông tin kết nối PostgreSQL.
2. `psql -U postgres -c "CREATE DATABASE mira_dev;"`
3. `npm install`
4. `npm run migrate` — in `[skip]` cho file đã chạy, `[done]` cho file mới; lỗi thì rollback rồi throw.
5. `npm test` và `npx tsc --noEmit` để kiểm trước khi commit.

## Quyết định đã chốt

- **UUID v7 sinh ở backend**, không để tầng gọi truyền id vào. Dùng package `uuid` (hàm `v7()`) giống `code/fe`, id sắp xếp được theo thời gian nên index khoá chính không phân mảnh như v4. Bản cài ở be là `uuid@14`, fe đang `uuid@11` — khác major nhưng `v7()` giữ nguyên chữ ký; không cần `@types/uuid` vì package tự kèm type.
- **`update()` đọc trước rồi ghi đè.** Các câu `UPDATE` trong `queries/` liệt kê cột cố định, trong khi DTO cho phép gửi lên một phần. Repository gọi `findById` trước, trộn DTO lên bản ghi hiện tại rồi mới `UPDATE` — đổi lại một round trip, nhưng không phải ghép chuỗi SQL động. `undefined` nghĩa là giữ nguyên, `null` tường minh nghĩa là xoá giá trị.
- **`PERSON_QUERIES.update` được mở rộng** thêm `birth_year`, `distance_km`, `dunbar_ring` — trước đó thiếu ba cột này nên `UpdatePersonDto` có khai mà không sửa được.
- **`person_ids` lưu chuỗi JSON**, không dùng kiểu mảng riêng của Postgres, để cùng một mã xử lý dùng được cho SQLite bên fe.
- **`update()` và `softDelete()` trả `null`** khi không tìm thấy bản ghi, thay vì throw. Tầng API sau này tự quyết trả 404 hay bỏ qua.
- **Test không cần DB.** Mapper là hàm thuần nên test trực tiếp; repository test dùng `FakeDatabase` nạp sẵn hàng trả về và ghi lại tham số truyền xuống, đủ để kiểm phần sinh id, điền mặc định và trộn DTO.

## Câu hỏi còn mở

1. **Hướng phụ thuộc `database/` → `entities/`.** `code/CLAUDE.md` viết "`database/` chỉ import từ `shared/`", nhưng mapper thì buộc phải nhắc tới kiểu entity ở đầu ra, mà `shared/` lại không được import `entities/` và `entities/` không được import `rows.ts`. Nghĩa là theo luật viết nguyên văn thì mapper không có chỗ nào hợp lệ để đặt. Đã chọn cách nhẹ nhất: mapper và repository chỉ `import type` từ `entities/` — kiểu bị xoá lúc biên dịch nên không có phụ thuộc runtime, đúng tinh thần ngoại lệ đã duyệt cho `entities/ → shared/types/enums`. `scripts/soi-cau-truc.sh` vẫn báo 0 vi phạm. Cần chốt lại câu chữ trong `code/CLAUDE.md`: hoặc ghi nhận ngoại lệ này, hoặc đổi luật thành "`database/` được import `shared/` và `entities/`" (entities là tầng thấp nhất, không phụ thuộc gì).
2. **Nested transaction**: `PostgresClientAdapter.transaction()` vẫn chỉ `fn(this)`, chưa dùng SAVEPOINT. Repository hiện chưa dùng transaction nên chưa vướng, nhưng thao tác ghi nhiều bảng sau này sẽ cần.
3. **Tách migration cho bảng V2–V5**: giờ nằm chung `001_initial.sql`, muốn rollback riêng từng version thì phải tách file.
4. **Config pool và SSL**: `pg` đang dùng mặc định (10 connection), chưa expose `max`, `idleTimeoutMillis`, `connectionTimeoutMillis`, chưa có `DB_SSL` — cần trước khi deploy lên Supabase hoặc RDS.
5. **Trùng `updated_at` khi soft delete**: `softDelete` gán cùng một timestamp cho `deleted_at` và `updated_at`, và không chặn xoá lại bản ghi đã xoá. Chưa rõ có cần chặn không.

## Bước tiếp theo

1. Repository cho các bảng còn lại khi module V2 bắt đầu (`work_load`, `money`, `expense`) — viết SQL vào `queries/` trước, đừng nhét SQL vào repository.
2. Test chạy thật với Postgres: dựng một database tạm trong CI, chạy migration rồi chạy repository trên đó, để bắt lỗi CHECK constraint và kiểu cột mà `FakeDatabase` không thấy được.
3. Tầng API (REST hoặc tRPC) khi FE cần đồng bộ. V1 là local-first nên chưa gấp.
4. Chốt câu hỏi 1 ở trên rồi sửa lại `code/CLAUDE.md` và `code/docs/structure.md` cho khớp thực tế (hai file đó ngoài phạm vi `code/be/`, chưa đụng tới).
