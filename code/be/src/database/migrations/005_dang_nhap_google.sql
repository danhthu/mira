-- 005 — đăng nhập bằng Google, và bỏ đăng ký bằng mật khẩu.
--
-- Quyết định ngày 25/11/2026: vào Mira bằng Google, như PUKATO. Không còn màn tạo tài
-- khoản. Lần đầu đăng nhập Google thì tài khoản tự sinh ra.
--
-- BA THAY ĐỔI, MỖI CÁI MỘT LÝ DO:
--
--   `password_hash` cho phép NULL. Người vào bằng Google **không có** mật khẩu. Để NOT
--   NULL thì phải nhét một chuỗi rác vào, và chuỗi rác đó sớm muộn sẽ có người thử
--   bcrypt với nó. Không có mật khẩu thì ghi là không có.
--
--   `email` — khoá để nhận ra người quay lại. Google trả email đã xác minh; đó là thứ
--   duy nhất nối một lần đăng nhập với lần trước. Chỉ mục duy nhất đặt trên lower(email)
--   vì Gmail không phân biệt hoa thường.
--
--   `google_sub` — id người dùng bên Google, không đổi kể cả khi họ đổi email. Lưu để
--   sau này đối chiếu được; hiện chưa dùng để tra.
--
-- Tài khoản cũ (`danhthu`) không có email và vẫn đăng nhập bằng mật khẩu — chỉ mục duy
-- nhất có WHERE email IS NOT NULL nên nhiều hàng email rỗng vẫn sống chung được.

ALTER TABLE app_user ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE app_user ADD COLUMN IF NOT EXISTS email      TEXT;
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS google_sub TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS app_user_email_key
  ON app_user (lower(email))
  WHERE email IS NOT NULL AND deleted_at IS NULL;

-- Người không có mật khẩu lẫn email thì không có đường nào vào được. Chặn ngay ở CSDL,
-- vì một hàng như vậy là tài khoản chết mà không ai phát hiện ra.
ALTER TABLE app_user DROP CONSTRAINT IF EXISTS app_user_co_duong_vao;
ALTER TABLE app_user ADD CONSTRAINT app_user_co_duong_vao
  CHECK (password_hash IS NOT NULL OR email IS NOT NULL);
