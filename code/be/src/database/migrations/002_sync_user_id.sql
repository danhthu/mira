-- Hợp đồng 09-sync-contract.md yêu cầu server phân vùng dữ liệu theo header X-User-Id,
-- nhưng 001_initial.sql chưa có cột nào giữ giá trị đó. Thêm với DEFAULT để dữ liệu
-- đã có thuộc về 'local-dev'. Index (user_id, updated_at) phục vụ pull theo watermark.

ALTER TABLE person ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS person_sync_idx ON person (user_id, updated_at);

ALTER TABLE time_entry ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS time_entry_sync_idx ON time_entry (user_id, updated_at);

ALTER TABLE work_load ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS work_load_sync_idx ON work_load (user_id, updated_at);

ALTER TABLE money ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS money_sync_idx ON money (user_id, updated_at);

ALTER TABLE expense ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS expense_sync_idx ON expense (user_id, updated_at);

ALTER TABLE goal ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS goal_sync_idx ON goal (user_id, updated_at);

ALTER TABLE moment ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS moment_sync_idx ON moment (user_id, updated_at);

ALTER TABLE health ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS health_sync_idx ON health (user_id, updated_at);

ALTER TABLE mood ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS mood_sync_idx ON mood (user_id, updated_at);

ALTER TABLE weight_on_mind ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS weight_on_mind_sync_idx ON weight_on_mind (user_id, updated_at);

ALTER TABLE item ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS item_sync_idx ON item (user_id, updated_at);

ALTER TABLE space ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS space_sync_idx ON space (user_id, updated_at);

ALTER TABLE letter ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'local-dev';
CREATE INDEX IF NOT EXISTS letter_sync_idx ON letter (user_id, updated_at);
