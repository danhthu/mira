-- Đổi nốt hai cột khoá ngoại sang tiếng Anh, theo tên bảng đã đổi ở 011.
--
-- VÌ SAO TÁCH RA LÀM MIGRATION RIÊNG
--
-- 011 đã chạy xong trên máy đang phát triển. Thêm câu lệnh vào một file đã chạy thì bảng
-- `schema_migrations` vẫn báo "xong" và câu mới không bao giờ được thực thi — rồi lỗi chỉ
-- lộ ra khi có người cài mới.
--
-- VÌ SAO DÙNG KHỐI `DO` CHỨ KHÔNG PHẢI `ALTER ... IF EXISTS`
--
-- `IF EXISTS` của `ALTER TABLE` chỉ bỏ qua khi thiếu BẢNG, không bỏ qua khi thiếu CỘT.
-- Chạy lại trên một CSDL đã đổi tên rồi là lỗi "column does not exist" và migration gãy
-- giữa chừng. Khối `DO` dưới đây hỏi `information_schema` trước, nên chạy bao nhiêu lần
-- cũng được.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_entry' AND column_name = 'danh_muc_id'
  ) THEN
    ALTER TABLE time_entry RENAME COLUMN danh_muc_id TO category_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_entry' AND column_name = 'nep_id'
  ) THEN
    ALTER TABLE time_entry RENAME COLUMN nep_id TO routine_id;
  END IF;

  -- Nếp gắn vào một danh mục thì lấy tên, ô và cờ giờ vàng từ danh mục đó.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'routine' AND column_name = 'danh_muc_id'
  ) THEN
    ALTER TABLE routine RENAME COLUMN danh_muc_id TO category_id;
  END IF;
END
$$;
