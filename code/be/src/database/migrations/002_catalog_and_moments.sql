-- 002 — chốt catalog nhóm việc và đổi hũ khoảnh khắc theo bản chốt 24/11/2026.
--
-- Ba quyết định sản phẩm dẫn tới migration này:
--   1. Bỏ khái niệm "Chỉ số Mira". Thời gian đọc thẳng theo nhóm việc, không gộp thành
--      một con số duy nhất. Sáu khoang cũ gom về bốn: work, family, personal, waste.
--      Nhóm `waste` là nguyên liệu cho luật khai nguồn nên bắt buộc phải có.
--   2. Khoảnh khắc không gắn người, không gắn nhãn, không phân loại. Một hạt chỉ còn
--      chữ, ngày, và kẹo hay muối. Hạt muối mang thêm ngày hỏi lại (42 ngày, hỏi một lần).
--   3. Năm ô tài chính được phép để trống. Ô chưa nhập hiện dấu hỏi xám, app không đoán hộ.
--
-- Chạy sau 001_initial.sql. Runner bọc mỗi file trong một transaction.

-- ─────────────────────────────────────────────────────── time_entry

ALTER TABLE time_entry DROP CONSTRAINT IF EXISTS time_entry_bucket_check;

-- health, learn, rest, self đều là giờ của riêng mình; people thành gia đình.
UPDATE time_entry SET bucket = 'family'   WHERE bucket = 'people';
UPDATE time_entry SET bucket = 'personal' WHERE bucket IN ('health', 'learn', 'rest', 'self');

ALTER TABLE time_entry
  ADD CONSTRAINT time_entry_bucket_check
  CHECK (bucket IN ('work', 'family', 'personal', 'waste'));

-- Giờ vàng không còn là một person_id mà là một lát cắt bên trong nhóm gia đình.
ALTER TABLE time_entry ADD COLUMN IF NOT EXISTS golden BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE time_entry SET golden = TRUE WHERE person_id IS NOT NULL AND bucket = 'family';
ALTER TABLE time_entry DROP COLUMN IF EXISTS person_id;

-- Nguồn 'calendar' chưa bao giờ được dùng và V1 không đọc lịch.
ALTER TABLE time_entry DROP CONSTRAINT IF EXISTS time_entry_source_check;
UPDATE time_entry SET source = 'manual' WHERE source = 'calendar';
ALTER TABLE time_entry
  ADD CONSTRAINT time_entry_source_check CHECK (source IN ('manual', 'widget'));

CREATE INDEX IF NOT EXISTS time_entry_date_idx ON time_entry (date) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────── moment

ALTER TABLE moment RENAME COLUMN occurred_at TO date;

ALTER TABLE moment DROP COLUMN IF EXISTS media_uri;
ALTER TABLE moment DROP COLUMN IF EXISTS media_type;
ALTER TABLE moment DROP COLUMN IF EXISTS person_ids;
ALTER TABLE moment DROP COLUMN IF EXISTS bucket;

-- Hạt cũ không biết vui hay nặng; mặc định là kẹo, người dùng sửa được.
ALTER TABLE moment ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'candy';
ALTER TABLE moment DROP CONSTRAINT IF EXISTS moment_kind_check;
ALTER TABLE moment ADD CONSTRAINT moment_kind_check CHECK (kind IN ('candy', 'salt'));

ALTER TABLE moment ADD COLUMN IF NOT EXISTS revisit_at TEXT;
ALTER TABLE moment ADD COLUMN IF NOT EXISTS revisit_answer TEXT;
ALTER TABLE moment DROP CONSTRAINT IF EXISTS moment_revisit_answer_check;
ALTER TABLE moment
  ADD CONSTRAINT moment_revisit_answer_check
  CHECK (revisit_answer IS NULL OR revisit_answer IN ('same', 'lighter', 'gone'));

-- Chỉ hạt muối mới có ngày hỏi lại, và chỉ hạt muối mới có câu trả lời.
ALTER TABLE moment DROP CONSTRAINT IF EXISTS moment_revisit_only_salt_check;
ALTER TABLE moment
  ADD CONSTRAINT moment_revisit_only_salt_check
  CHECK (kind = 'salt' OR (revisit_at IS NULL AND revisit_answer IS NULL));

CREATE INDEX IF NOT EXISTS moment_date_idx ON moment (date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS moment_revisit_idx ON moment (revisit_at)
  WHERE revisit_answer IS NULL AND deleted_at IS NULL;

-- ─────────────────────────────────────────────────────── money

-- Năm ô: thu nhập ròng, chi tiêu tháng, trả nợ mỗi tháng, dư nợ, tài sản ròng.
-- `net_worth` đã trừ nợ rồi; `debt_balance` chỉ để quy ra số tháng tự do bị giữ lại.
ALTER TABLE money ADD COLUMN IF NOT EXISTS debt_payment INTEGER;
ALTER TABLE money ADD COLUMN IF NOT EXISTS debt_balance INTEGER;
UPDATE money SET debt_balance = debt WHERE debt_balance IS NULL;
ALTER TABLE money DROP COLUMN IF EXISTS debt;

ALTER TABLE money ALTER COLUMN net_income      DROP NOT NULL;
ALTER TABLE money ALTER COLUMN monthly_expense DROP NOT NULL;
ALTER TABLE money ALTER COLUMN net_worth       DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS money_month_key ON money (month) WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────── goal

ALTER TABLE goal DROP CONSTRAINT IF EXISTS goal_tier_check;
UPDATE goal SET tier = 'long'    WHERE tier = 'identity';
UPDATE goal SET tier = 'quarter' WHERE tier = 'season';
ALTER TABLE goal
  ADD CONSTRAINT goal_tier_check CHECK (tier IN ('long', 'quarter', 'rhythm'));

ALTER TABLE goal RENAME COLUMN started_at TO started_on;
ALTER TABLE goal RENAME COLUMN expires_at TO expires_on;
ALTER TABLE goal RENAME COLUMN cost_minutes_per_week TO weekly_minutes;

-- Luật khai nguồn: mọi mục tiêu phải nói giờ của nó lấy từ nhóm nào.
ALTER TABLE goal ADD COLUMN IF NOT EXISTS source_bucket TEXT NOT NULL DEFAULT 'waste';
ALTER TABLE goal DROP CONSTRAINT IF EXISTS goal_source_bucket_check;
ALTER TABLE goal
  ADD CONSTRAINT goal_source_bucket_check
  CHECK (source_bucket IN ('work', 'family', 'personal', 'waste'));

-- Bỏ bớt luôn có bước hai: giờ vừa giải phóng chuyển sang mục tiêu nào.
ALTER TABLE goal ADD COLUMN IF NOT EXISTS ended_on TEXT;
ALTER TABLE goal ADD COLUMN IF NOT EXISTS handed_over_to TEXT REFERENCES goal (id);

-- `status` và `release_reason` của 001 bị thay bằng ended_on + handed_over_to:
-- một mục tiêu hoặc đang chạy, hoặc đã kết thúc, không có trạng thái thứ ba.
UPDATE goal SET ended_on = updated_at WHERE status IN ('expired', 'released') AND ended_on IS NULL;
ALTER TABLE goal DROP CONSTRAINT IF EXISTS goal_status_check;
ALTER TABLE goal DROP COLUMN IF EXISTS status;
ALTER TABLE goal DROP COLUMN IF EXISTS release_reason;

CREATE INDEX IF NOT EXISTS goal_active_idx ON goal (tier)
  WHERE ended_on IS NULL AND deleted_at IS NULL;
