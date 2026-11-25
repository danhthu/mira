-- 006 — nếp: khai một luật thay vì ghi từng ngày.
--
-- GỐC RỄ CỦA VẤN ĐỀ, ghi rõ vì nó đã cắn một lần rồi.
--
-- Ngày 25/11/2026 Founder nói "ngủ 23h–6h, xem như repeat". Đó là **một luật**. Script
-- nhập liệu lại lưu thành **28 sự kiện**, và màn Cá nhân thành 28 dòng "Ăn tối 30m"
-- giống hệt nhau. Gom lại lúc hiển thị (N-225→N-230) chữa được phần nhìn, nhưng không
-- chữa phần gốc: người dùng vẫn phải ghi tay mỗi ngày một việc họ làm mỗi ngày.
--
-- MÔ HÌNH: LUẬT + NGOẠI LỆ, KHÔNG PHẢI LUẬT THAY CHO DỮ LIỆU
--
-- Lịch (RFC 5545) lưu RRULE rồi vá bằng EXDATE. Ngân hàng giữ từng giao dịch rồi suy ra
-- nếp. Mira lấy **cả hai nửa**, mỗi nửa cho đúng việc của nó:
--
--   `nep`         là luật người dùng khai. Một hàng, không phải ba trăm.
--   `time_entry`  vẫn là sự thật từng ngày. Mỗi ngày nếp chạy thì sinh một hàng thật,
--                 sửa được, xoá được, xuất ra file được như mọi hàng khác.
--   `nep_bo_qua`  là EXDATE: ngày người dùng nói "hôm nay không".
--
-- Lưu luật thay cho dữ liệu thì mọi câu truy vấn thống kê phải tự bung luật ra, và
-- CalConnect đã cảnh báo chuyện đó phình to hơn cả lưu từng ngày. Lưu cả hai thì chỉ có
-- đúng một chỗ phải cẩn thận: chỗ sinh hàng.
--
-- `time_entry.nep_id` cho biết hàng nào do nếp sinh ra. Cần nó để hai việc: biết ngày nào
-- đã sinh rồi mà không sinh lại, và để màn hình phân biệt được số người gõ với số máy
-- suy ra.

CREATE TABLE IF NOT EXISTS nep (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES app_user (id),
  title      TEXT NOT NULL,
  bucket     TEXT NOT NULL CHECK (bucket IN ('work', 'family', 'personal', 'waste')),
  minutes    INTEGER NOT NULL CHECK (minutes > 0 AND minutes <= 1440),
  golden     BOOLEAN NOT NULL DEFAULT FALSE,
  -- Thứ trong tuần, ISO: 1 là thứ hai, 7 là chủ nhật. "1234567" là mỗi ngày.
  -- Lưu thành chuỗi chứ không thành bảy cột boolean: nó luôn được đọc cả cụm, chưa bao
  -- giờ phải lọc theo một thứ riêng lẻ.
  days       TEXT NOT NULL CHECK (days ~ '^[1-7]{1,7}$'),
  started_on TEXT NOT NULL,
  ended_on   TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS nep_user_idx ON nep (user_id) WHERE deleted_at IS NULL;

-- Ngày người dùng từ chối. Tương đương EXDATE của RFC 5545.
CREATE TABLE IF NOT EXISTS nep_bo_qua (
  nep_id     TEXT NOT NULL REFERENCES nep (id),
  user_id    TEXT NOT NULL REFERENCES app_user (id),
  date       TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (nep_id, date)
);

ALTER TABLE time_entry ADD COLUMN IF NOT EXISTS nep_id TEXT REFERENCES nep (id);

-- Một nếp sinh tối đa một hàng mỗi ngày. Chỉ mục này là thứ thật sự chặn sinh trùng;
-- kiểm trước khi ghi vẫn lọt khi hai tab cùng mở.
CREATE UNIQUE INDEX IF NOT EXISTS time_entry_nep_ngay_key
  ON time_entry (nep_id, date)
  WHERE nep_id IS NOT NULL AND deleted_at IS NULL;

-- `source` thêm giá trị 'nep'. Hàng do nếp sinh ra **không phải** 'manual': manual là
-- thứ người dùng ngồi gõ. Lẫn hai loại vào nhau là dữ liệu nói dối về độ tin của chính
-- nó, đúng món nợ đã ghi ở N-230.
ALTER TABLE time_entry DROP CONSTRAINT IF EXISTS time_entry_source_check;
ALTER TABLE time_entry ADD CONSTRAINT time_entry_source_check
  CHECK (source IN ('manual', 'calendar', 'widget', 'nep'));
