-- Tiền nhập theo TỪNG KHOẢN có danh mục, thay cho bảy ô gõ tay.
--
-- ─────────────────────── DỰNG Y KHUÔN MỤC THỜI GIAN, CÓ CHỦ Ý ───────────────────────
--
-- `money_category` là bản sao của `category`, `money_entry` là bản sao của `time_entry`.
-- Không nghĩ ra kiểu mới: hai màn này làm cùng một việc — ghi một khoản lẻ, gắn một cái
-- tên do người dùng đặt, rồi cộng lại. Giống nhau thì người dùng học một lần, và người
-- sửa mã đọc một lần.
--
-- Luật "CẤT ĐI, KHÔNG XOÁ" của danh mục thời gian giữ nguyên ở đây: khoản cũ còn trỏ về
-- danh mục, xoá là sửa lịch sử.
--
-- ─────────────────────── NĂM Ô DÒNG CHẢY, HAI Ô MỨC — KHÁC NHAU ───────────────────────
--
-- Năm ô **dòng chảy** (thu nhập, chi tiêu, đầu tư, lãng phí, trả nợ) là TỔNG của nhiều
-- lần trong tháng, nên chúng tách được thành từng khoản và cộng lại. Từ migration này,
-- năm cột ấy BIẾN MẤT khỏi bảng `money` — con số duy nhất là tổng các khoản.
--
-- Hai ô **mức** (dư nợ, tài sản ròng) là ảnh chụp tại một thời điểm: "tôi đang nợ 240
-- triệu" không phải tổng của nhiều lần nợ. Cộng dồn chúng là nhân đôi tài sản của người
-- ta mỗi lần họ khai lại. Nên hai cột ấy Ở LẠI bảng `money` và vẫn gõ tay.
--
-- ─────────────────────── SỐ CŨ KHÔNG ĐƯỢC MẤT ───────────────────────
--
-- Mỗi con số đang có trong năm cột dòng chảy được chuyển thành MỘT khoản, ngày mùng 1
-- của tháng đó, trong một danh mục tên "Số cũ". Chuyển xong mới xoá cột — cả file này
-- chạy trong một transaction (xem `runner.ts`), nên hoặc xong hết hoặc không đụng gì.

CREATE TABLE IF NOT EXISTS money_category (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES app_user (id),
  name        TEXT NOT NULL,
  -- Giống `category.bucket`: mỗi danh mục thuộc đúng một ô. Chỉ năm ô dòng chảy —
  -- hai ô mức không có khoản lẻ nên không có danh mục.
  cell        TEXT NOT NULL CHECK (
                cell IN ('netIncome', 'monthlyExpense', 'investment', 'wastedMoney', 'debtPayment')
              ),
  archived_at TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  deleted_at  TEXT
);

-- Trùng tên trong cùng một ô thì không phân biệt được khi chọn. Khác ô thì được:
-- "Xe" của chi tiêu khác "Xe" của đầu tư.
CREATE UNIQUE INDEX IF NOT EXISTS money_category_name_key
  ON money_category (user_id, cell, lower(name))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS money_category_user_idx
  ON money_category (user_id) WHERE deleted_at IS NULL AND archived_at IS NULL;

CREATE TABLE IF NOT EXISTS money_entry (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES app_user (id),
  -- YYYY-MM-DD. Tháng suy ra bằng `substr(date, 1, 7)`, không lưu riêng: hai chỗ ghi
  -- cùng một sự thật là hai chỗ lệch nhau được.
  date        TEXT NOT NULL,
  -- VND nguyên, luôn DƯƠNG. Dấu nằm ở chỗ ô, không nằm ở con số: thu nhập là vào, bốn
  -- ô kia là ra. Cho phép số âm là mở đường cho một khoản chi âm — không ai đọc nổi.
  amount      INTEGER NOT NULL CHECK (amount > 0),
  cell        TEXT NOT NULL CHECK (
                cell IN ('netIncome', 'monthlyExpense', 'investment', 'wastedMoney', 'debtPayment')
              ),
  -- Tuỳ chọn, giống danh mục của mục giờ. Bắt phân loại là thêm ma sát ghi.
  category_id TEXT REFERENCES money_category (id),
  note        TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  deleted_at  TEXT
);

CREATE INDEX IF NOT EXISTS money_entry_user_date_idx
  ON money_entry (user_id, date) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS money_entry_category_idx
  ON money_entry (category_id) WHERE category_id IS NOT NULL AND deleted_at IS NULL;

-- ─────────────────────── chuyển số cũ thành khoản ───────────────────────

WITH flow AS (
  SELECT m.user_id, m.month, v.cell, v.amount
  FROM money m
  CROSS JOIN LATERAL (VALUES
    ('netIncome',      m.net_income),
    ('monthlyExpense', m.monthly_expense),
    ('investment',     m.investment),
    ('wastedMoney',    m.wasted_money),
    ('debtPayment',    m.debt_payment)
  ) AS v(cell, amount)
  WHERE m.deleted_at IS NULL
    AND m.user_id IS NOT NULL
    AND v.amount IS NOT NULL
    AND v.amount > 0
),
cat AS (
  INSERT INTO money_category (id, user_id, name, cell, created_at, updated_at)
  SELECT
    gen_random_uuid()::text,
    f.user_id,
    'Số cũ',
    f.cell,
    to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  FROM (SELECT DISTINCT user_id, cell FROM flow) f
  RETURNING id, user_id, cell
)
INSERT INTO money_entry (id, user_id, date, amount, cell, category_id, note, created_at, updated_at)
SELECT
  gen_random_uuid()::text,
  f.user_id,
  f.month || '-01',
  f.amount,
  f.cell,
  c.id,
  'Số gõ tay trước khi tách thành từng khoản',
  to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
FROM flow f
JOIN cat c ON c.user_id = f.user_id AND c.cell = f.cell;

-- ─────────────────────── xoá năm cột dòng chảy ───────────────────────
--
-- Giữ lại là để hai chỗ cùng ghi một sự thật, và kho mã này đã bị chính cái đó cắn ba
-- lần. Số đã nằm trong `money_entry` ở trên rồi.

ALTER TABLE money DROP COLUMN IF EXISTS net_income;
ALTER TABLE money DROP COLUMN IF EXISTS monthly_expense;
ALTER TABLE money DROP COLUMN IF EXISTS investment;
ALTER TABLE money DROP COLUMN IF EXISTS wasted_money;
ALTER TABLE money DROP COLUMN IF EXISTS debt_payment;
