-- Đổi tên bảng và cột sang tiếng Anh.
--
-- VÌ SAO ĐỔI CẢ TÊN TRONG CSDL, KHÔNG CHỈ TÊN TRONG MÃ
--
-- Một lược đồ nửa Anh nửa Việt bắt người đọc phải dịch ngược ở mỗi câu truy vấn:
-- `SELECT loi FROM nhac` nằm ngay cạnh `reminder.text` bên TypeScript, và mỗi lần đọc
-- là một lần phải nhớ hai cái đó là một. Chỗ dễ sai nhất của kho mã này từ trước tới giờ
-- đều là "một thứ, hai tên".
--
-- AN TOÀN: `ALTER TABLE ... RENAME` giữ nguyên dữ liệu, khoá chính, chỉ mục và ràng buộc.
-- Không có bản ghi nào bị đụng tới.
--
-- `IF EXISTS` ở mọi câu: bỏ qua gọn gàng khi bảng không còn tên cũ nữa.

-- ─────────────────────────────────────────────────────── nếp → routine
ALTER TABLE IF EXISTS nep         RENAME TO routine;
ALTER TABLE IF EXISTS nep_bo_qua  RENAME TO routine_skip;
ALTER TABLE IF EXISTS routine_skip RENAME COLUMN nep_id TO routine_id;

-- ─────────────────────────────────────────────────────── danh mục → category
ALTER TABLE IF EXISTS danh_muc RENAME TO category;

-- ─────────────────────────────────────────────────────── nhắc → reminder
ALTER TABLE IF EXISTS nhac        RENAME TO reminder;
ALTER TABLE IF EXISTS nhac_bo_qua RENAME TO reminder_skip;
ALTER TABLE IF EXISTS reminder_skip RENAME COLUMN nhac_id TO reminder_id;

-- `gio` là giờ trên ĐỒNG HỒ (HH:MM), không phải thời lượng — nên `at`, không phải `hours`.
ALTER TABLE IF EXISTS reminder RENAME COLUMN gio TO at;
ALTER TABLE IF EXISTS reminder RENAME COLUMN loi TO text;
ALTER TABLE IF EXISTS reminder RENAME COLUMN bat TO enabled;

-- ─────────────────────────────────────────────────────── nhật ký chat
ALTER TABLE IF EXISTS chat_log RENAME COLUMN cau     TO sentence;
ALTER TABLE IF EXISTS chat_log RENAME COLUMN ngay    TO date;
ALTER TABLE IF EXISTS chat_log RENAME COLUMN nguon   TO source;
ALTER TABLE IF EXISTS chat_log RENAME COLUMN ket_qua TO result;

-- Ràng buộc CHECK của cột `source` còn ghi 'luat' và 'chiu'. Từ vựng mới là 'rules' và
-- 'unparsed' — xem `Intent` bên hợp đồng. Dòng cũ giữ nguyên chữ cũ: chúng là lịch sử,
-- và lúc gom dữ liệu để huấn luyện thì phải biết có hai đời từ vựng.
ALTER TABLE IF EXISTS chat_log DROP CONSTRAINT IF EXISTS chat_log_nguon_check;
ALTER TABLE IF EXISTS chat_log DROP CONSTRAINT IF EXISTS chat_log_source_check;
ALTER TABLE IF EXISTS chat_log
  ADD CONSTRAINT chat_log_source_check
  CHECK (source IN ('rules', 'ai', 'unparsed', 'luat', 'chiu'));
