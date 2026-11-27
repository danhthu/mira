-- 009 — nhật ký trò chuyện: giữ lại từng câu người dùng gõ và Mira hiểu ra gì.
--
-- VÌ SAO CÓ
--
-- Để sau này huấn luyện một mô hình chạy tại chỗ. Mira đã bỏ hẳn đường gọi LLM (xem
-- `docs/12-mo-hinh-mira.md` §6) và sống bằng tầng luật. Tầng luật chạy được, nhưng nó
-- chỉ biết những gì có người gõ vào `parse-rules.json` — còn cách Founder thật sự nói thì
-- nằm trong chính những câu đã gõ.
--
-- Mỗi hàng ở đây là một cặp (câu người gõ → Mira hiểu ra gì). Đó đúng là dạng dữ liệu
-- cần để dạy một mô hình nhỏ làm việc của `parseSentence.ts`, mà không phải bịa ra một bộ dữ
-- liệu giả.
--
-- HÀNG QUÝ NHẤT LÀ HÀNG `nguon = 'chiu'`
--
-- Đó là những câu Mira KHÔNG đọc nổi. Cho tới giờ chúng chỉ sống trong file log dạng
-- văn bản, mà file log thì bị xoay vòng và không truy vấn được. Mỗi câu như vậy là một
-- lỗ trong bộ luật, và cũng là một mẫu huấn luyện đắt giá.
--
-- ĐÂY LÀ DỮ LIỆU RIÊNG TƯ NHẤT TRONG CẢ APP
--
-- Nhật ký đời sống viết bằng lời của chính người ta: chuyện con cái, chuyện tiền, chuyện
-- mệt mỏi. Nặng hơn mọi bảng khác, vì các bảng kia chỉ có con số còn bảng này có câu
-- chữ. Ba ràng buộc, không được nới:
--
--   1. KHÔNG BAO GIỜ rời khỏi máy chủ này. Không gửi đi đâu để "phân tích".
--   2. Huấn luyện thì huấn luyện TẠI CHỖ. Đẩy bảng này lên một dịch vụ đám mây là đem
--      nhật ký của một người đi cho người lạ đọc.
--   3. Xoá tài khoản là xoá sạch hàng ở đây — `ON DELETE CASCADE` lo việc đó.

CREATE TABLE IF NOT EXISTS chat_log (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES app_user (id) ON DELETE CASCADE,

  -- Nguyên văn câu người dùng gõ, KHÔNG cắt gọt, KHÔNG bỏ dấu.
  --
  -- Bỏ dấu ở đây là vứt đi đúng thứ cần học: dấu thanh, chữ viết tắt, lỗi gõ. "thẻ dục"
  -- sai một dấu mà vẫn phải hiểu được — mô hình chỉ học được điều đó nếu nhìn thấy
  -- nguyên bản.
  cau        TEXT NOT NULL,

  -- Ngày của NGƯỜI DÙNG, do client gửi lên (YYYY-MM-DD).
  --
  -- Khác `created_at`: máy chủ ở múi giờ nào là chuyện của máy chủ, còn "hôm nay" là hôm
  -- nay chỗ người đang gõ. Câu "hôm qua ngủ 7 tiếng" chỉ đọc đúng khi biết hôm nay của
  -- họ là ngày nào.
  ngay       DATE NOT NULL,

  -- 'luat' đọc được, 'chiu' không ai đọc nổi. ('ai' còn lại từ thời có LLM, không dùng.)
  nguon      TEXT NOT NULL CHECK (nguon IN ('luat', 'ai', 'chiu')),

  -- Toàn bộ `ParseResult` trả về cho client, nguyên dạng JSON.
  --
  -- JSONB chứ không phải cột tách sẵn: hình dạng ý chí còn đổi (hôm nay vừa thêm 'hoi'
  -- và 'nhac'), mà bảng này là kho dữ liệu thô. Tách cột thì mỗi lần đổi hợp đồng lại
  -- phải migrate, và dữ liệu cũ mất hình dạng cũ — đúng cái cần giữ.
  ket_qua    JSONB NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Đọc theo người và theo thời gian: "cho tôi mọi câu của tôi, mới nhất trước".
CREATE INDEX IF NOT EXISTS chat_log_user_time ON chat_log (user_id, created_at DESC);

-- Lọc riêng những câu Mira chịu — việc hay làm nhất khi vá luật hoặc gom dữ liệu học.
CREATE INDEX IF NOT EXISTS chat_log_chiu ON chat_log (user_id, created_at DESC) WHERE nguon = 'chiu';
