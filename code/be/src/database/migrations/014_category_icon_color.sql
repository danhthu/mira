-- Hình và màu cho từng danh mục, cả thời gian lẫn tiền.
--
-- ─────────────────────── VÌ SAO ───────────────────────
--
-- Trước migration này, biểu tượng gắn vào **Ô** chứ không vào danh mục: mọi dòng chi tiêu
-- mang cùng một cái hoá đơn, mọi dòng công việc mang cùng một cái cặp. Danh sách hai mươi
-- dòng vì thế không quét được bằng mắt — phải đọc chữ từng dòng.
--
-- Money Lover làm ngược lại và đó là lý do danh sách của họ đọc nhanh: mỗi danh mục một
-- hình, một màu, cố định. "Ăn uống" lúc nào cũng là cái bát xanh.
--
-- ─────────────────────── LƯU KHOÁ, KHÔNG LƯU HEX ───────────────────────
--
-- `color` giữ khoá bảng màu ('work', 'family', …) chứ không giữ '#2a52b5'. Lưu hex thì
-- đổi bảng màu một cái là mọi danh mục cũ kẹt màu cũ, và không gì chặn được một màu chữ
-- trắng trên nền trắng. Khoá thì máy chủ kiểm được và `check-colors` gác được tương phản.
--
-- `icon` giữ khoá trong bộ icon của web, cũng vì vậy.
--
-- CHECK đặt ở đây chứ không chỉ ở tầng dịch vụ: tầng dịch vụ chặn API, còn CHECK chặn cả
-- mấy script nạp tay — mà phiên trước vừa có một lần dữ liệu tự biến mất không rõ nguồn.
--
-- ─────────────────────── CŨ VẪN CHẠY ───────────────────────
--
-- Hai cột đều NULL được, và danh mục có từ trước giữ NULL. Giao diện rơi về hình của ô
-- đúng như cũ. Không ép một hình mặc định cho mọi danh mục cũ: đoán hộ người dùng rằng
-- "Số cũ" trông như cái bát là đoán sai ngay lần đầu.

ALTER TABLE category ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE category ADD COLUMN IF NOT EXISTS color TEXT;

ALTER TABLE money_category ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE money_category ADD COLUMN IF NOT EXISTS color TEXT;

-- Ràng buộc màu. Danh sách phải khớp `CATEGORY_COLORS` trong contract.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'category_color_key'
  ) THEN
    ALTER TABLE category ADD CONSTRAINT category_color_key CHECK (
      color IS NULL OR color IN ('work','family','personal','waste','red','navy','candy','salt')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'money_category_color_key'
  ) THEN
    ALTER TABLE money_category ADD CONSTRAINT money_category_color_key CHECK (
      color IS NULL OR color IN ('work','family','personal','waste','red','navy','candy','salt')
    );
  END IF;
END $$;

-- Hình thì KHÔNG ràng buộc bằng CHECK.
--
-- Bộ icon sẽ còn thêm hình dài dài, và mỗi lần thêm mà phải viết một migration chỉ để sửa
-- một CHECK thì người ta sẽ ngừng thêm. Tầng dịch vụ kiểm theo `CATEGORY_ICONS`, còn một
-- khoá lạ lọt xuống CSDL thì giao diện rơi về hình của ô — xấu một dòng, không hỏng gì.
