-- 004 — tài khoản, và gắn mọi dữ liệu vào chủ của nó.
--
-- Quyết định sản phẩm ngày 25/11/2026: **bỏ ràng buộc local-first**. Dữ liệu không còn
-- nằm trong trình duyệt người dùng nữa mà nằm trên máy chủ này.
--
-- Hệ quả bắt buộc, không có đường vòng:
--   1. Phải có tài khoản. Không thì không biết dữ liệu của ai.
--   2. MỌI bảng dữ liệu phải có user_id, và MỌI câu truy vấn phải lọc theo nó.
--      Quên một chỗ là người này đọc được nhật ký của người kia.
--   3. Mật khẩu lưu bằng bcrypt, không bao giờ lưu dạng đọc được.
--
-- Chạy sau 003. Các bảng hiện đang rỗng nên thêm NOT NULL được thẳng.

CREATE TABLE IF NOT EXISTS app_user (
  id            TEXT PRIMARY KEY,
  -- Tên đăng nhập lưu dạng thường để "Danhthu" và "danhthu" là một người.
  username      TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  display_name  TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  deleted_at    TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS app_user_username_key
  ON app_user (lower(username)) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────── gắn chủ cho dữ liệu

ALTER TABLE time_entry  ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES app_user (id);
ALTER TABLE moment      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES app_user (id);
ALTER TABLE money       ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES app_user (id);
ALTER TABLE goal        ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES app_user (id);
ALTER TABLE habit       ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES app_user (id);
ALTER TABLE habit_check ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES app_user (id);

-- Chỉ mục luôn đặt user_id lên đầu: mọi câu đọc đều bắt đầu bằng "của ai".
CREATE INDEX IF NOT EXISTS time_entry_user_date_idx ON time_entry (user_id, date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS moment_user_date_idx     ON moment (user_id, date)     WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS goal_user_tier_idx       ON goal (user_id, tier)       WHERE ended_on IS NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS habit_user_idx           ON habit (user_id)            WHERE ended_on IS NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS habit_check_user_date_idx ON habit_check (user_id, date);

-- Mỗi tháng tiền là duy nhất TRONG MỘT NGƯỜI, không duy nhất toàn hệ thống.
DROP INDEX IF EXISTS money_month_key;
CREATE UNIQUE INDEX IF NOT EXISTS money_user_month_key
  ON money (user_id, month) WHERE deleted_at IS NULL;

-- Một thói quen chỉ đánh dấu một lần mỗi ngày — ràng buộc cũ vẫn đúng vì habit_id
-- đã thuộc về một người, nhưng giữ lại cho rõ.
-- (habit_check_once_a_day từ migration 003 giữ nguyên.)
