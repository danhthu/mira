-- 003 — thói quen, đếm theo tuần, không có chuỗi ngày.
--
-- Mira vẫn hỗ trợ thói quen; thứ Mira không làm là biến nó thành trò chơi. Khác biệt
-- nằm ở mô hình dữ liệu chứ không phải ở giao diện:
--   - Lưu từng lần làm (`habit_check`), không lưu "chuỗi hiện tại" hay "chuỗi dài nhất".
--     Không có cột nào để đếm chuỗi thì không có cách nào hiện chuỗi.
--   - Không có cột điểm, huy hiệu, hạng.
--   - Bỏ một tuần không ghi gì vào đâu cả. Tuần sau đếm lại từ đầu, không nhắc, không hỏi.
--
-- `target_per_week` là trần mong muốn mỗi tuần, hiển thị dạng "tuần này đã 3/4 lần".

CREATE TABLE IF NOT EXISTS habit (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  target_per_week INTEGER NOT NULL CHECK (target_per_week BETWEEN 1 AND 7),
  started_on      TEXT NOT NULL,
  ended_on        TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  deleted_at      TEXT
);

CREATE INDEX IF NOT EXISTS habit_active_idx ON habit (started_on)
  WHERE ended_on IS NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS habit_check (
  id         TEXT PRIMARY KEY,
  habit_id   TEXT NOT NULL REFERENCES habit (id),
  date       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Một thói quen chỉ đánh dấu được một lần mỗi ngày: bấm hai lần không thành hai lần làm.
CREATE UNIQUE INDEX IF NOT EXISTS habit_check_once_a_day
  ON habit_check (habit_id, date);

CREATE INDEX IF NOT EXISTS habit_check_date_idx ON habit_check (date);
