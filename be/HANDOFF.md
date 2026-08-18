# HANDOFF — be/ backend scaffold

## Trạng thái hiện tại

Đã implement các thành phần nền tảng sau:

- **`src/shared/interfaces/IDatabase.ts`** — interface trung tâm cho database adapter. Tất cả truy vấn đi qua `IDatabase`, không phụ thuộc trực tiếp vào `pg`.
- **`src/database/PostgresAdapter.ts`** — implement `IDatabase` dùng `pg.Pool`. Hỗ trợ transaction (BEGIN/COMMIT/ROLLBACK với client riêng), queryOne, execute.
- **`src/database/migrations/001_initial.sql`** — toàn bộ 13 bảng theo `docs/02-data-model.md`. Schema đầy đủ từ đầu, kể cả các bảng V2–V5 chưa dùng.
- **`src/database/migrations/runner.ts`** — migration runner: tạo bảng `migrations`, đọc file `.sql` theo thứ tự alphabet, bỏ qua file đã chạy, wrap mỗi file trong transaction.
- **`src/database/queries/person.ts`** — SQL constants cho CRUD bảng `person`.
- **`src/database/queries/timeEntry.ts`** — SQL constants cho CRUD bảng `time_entry`.
- **`src/database/queries/moment.ts`** — SQL constants cho CRUD bảng `moment`.

## Cách chạy migrations

1. Copy `.env.example` thành `.env` và điền thông tin kết nối PostgreSQL.
2. Tạo database trước: `psql -U postgres -c "CREATE DATABASE mira_dev;"`
3. Cài dependencies: `npm install`
4. Chạy migration: `npm run migrate`

Migration sẽ in `[skip]` cho file đã chạy và `[done]` cho file mới. Nếu lỗi sẽ rollback và throw.

## Câu hỏi còn mở

1. **UUID v7**: runner và queries dùng `id TEXT` nhưng chưa có hàm sinh UUID v7. Agent xây repository cần chọn thư viện (ví dụ `uuid-v7` hoặc `uuidv7`) hoặc sinh ở tầng app.
2. **Nested transactions**: `PostgresClientAdapter.transaction()` hiện chỉ delegate lại `fn(this)` — không dùng SAVEPOINT. Nếu cần transaction lồng nhau thực sự thì phải mở rộng.
3. **Migration của các bảng V2–V5**: schema đã viết đầy đủ trong `001_initial.sql`, nhưng nên tách thành các file migration riêng theo version để rollback độc lập.
4. **Connection pooling config**: pool hiện dùng giá trị mặc định của `pg` (10 connections). Chưa expose `max`, `idleTimeoutMillis`, `connectionTimeoutMillis` qua env.
5. **SSL**: chưa hỗ trợ `DB_SSL` env var — cần thêm nếu deploy lên cloud (Supabase, RDS).

## Bước tiếp theo

Implement repositories để sử dụng queries:

- `src/database/repositories/PersonRepository.ts` — inject `IDatabase`, dùng `PERSON_QUERIES`, map row → entity.
- `src/database/repositories/TimeEntryRepository.ts` — tương tự với `TIME_ENTRY_QUERIES`.
- `src/database/repositories/MomentRepository.ts` — tương tự với `MOMENT_QUERIES`.

Mỗi repository nên nhận `IDatabase` qua constructor (dependency injection) để dễ test với mock adapter.
