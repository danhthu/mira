-- 007 — danh mục tự đặt, nằm BÊN TRONG bốn ô.
--
-- Founder chọn hướng này ngày 25/11/2026, sau khi cân với hai hướng kia.
--
-- VÌ SAO KHÔNG THAY HẲN BỐN Ô
--
-- Bốn ô không phải bốn cái nhãn. Chúng đang gánh ba thứ, và thứ nào cũng là lời hứa của
-- sản phẩm chứ không phải chi tiết kỹ thuật:
--
--   `golden` chỉ có nghĩa bên trong `family`. Giờ vàng là trụ của Mira.
--   Mục tiêu rút giờ từ `waste`. Đó là luật khai nguồn: muốn 4h mỗi tuần thì phải cắt 4h
--   từ đâu đó, không lấy từ hư không.
--   Màn Sáu tháng phán tuần vui hay nặng theo từng ô: gia đình tăng là vui, lãng phí
--   tăng là nặng.
--
-- Thả cho người dùng tự định nghĩa toàn bộ danh sách thì ba thứ trên phải hỏi lại người
-- dùng từng cái một — "danh mục này tăng là tin vui hay tin xấu?" — và hỏi như vậy là
-- bắt người ta làm việc của người thiết kế.
--
-- MÔ HÌNH
--
-- Mỗi danh mục thuộc đúng một ô. Donut vẫn bốn lát; bấm vào lát thì thấy danh mục bên
-- trong. Mọi công thức giữ nguyên vì chúng chỉ nhìn `bucket`.
--
-- `golden` ở đây là **mặc định của danh mục**, không phải luật cứng: "Chơi với con" lúc
-- nào cũng là giờ vàng, khai một lần khỏi tick lại. Mục lẻ vẫn ghi đè được.
--
-- Danh mục là **tuỳ chọn**. Mục giờ không có danh mục vẫn hợp lệ, vẫn chỉ cần một ô.
-- Bắt buộc phân loại là thêm ma sát ghi, mà giảm ma sát mới là đòn bẩy +39%.

CREATE TABLE IF NOT EXISTS danh_muc (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES app_user (id),
  name        TEXT NOT NULL,
  bucket      TEXT NOT NULL CHECK (bucket IN ('work', 'family', 'personal', 'waste')),
  -- Mặc định giờ vàng cho danh mục này. Chỉ có nghĩa khi bucket là 'family'.
  golden      BOOLEAN NOT NULL DEFAULT FALSE,
  -- Cất đi chứ không xoá: mục giờ cũ vẫn trỏ về nó, và lịch sử không được đổi.
  archived_at TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  deleted_at  TEXT
);

-- Trùng tên trong cùng một ô thì không phân biệt được khi chọn. Khác ô thì được:
-- "Đi lại" của công việc khác "Đi lại" của gia đình.
CREATE UNIQUE INDEX IF NOT EXISTS danh_muc_ten_key
  ON danh_muc (user_id, bucket, lower(name))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS danh_muc_user_idx
  ON danh_muc (user_id) WHERE deleted_at IS NULL AND archived_at IS NULL;

ALTER TABLE time_entry ADD COLUMN IF NOT EXISTS danh_muc_id TEXT REFERENCES danh_muc (id);
ALTER TABLE nep        ADD COLUMN IF NOT EXISTS danh_muc_id TEXT REFERENCES danh_muc (id);

CREATE INDEX IF NOT EXISTS time_entry_danh_muc_idx
  ON time_entry (danh_muc_id) WHERE danh_muc_id IS NOT NULL AND deleted_at IS NULL;
