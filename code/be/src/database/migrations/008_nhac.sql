-- 008 — nhắc: hẹn giờ gợi người dùng quay lại ghi.
--
-- VÌ SAO CÓ
--
-- Giả lập 300 persona: giữ chân là chỗ thắt, không phải tính năng. Người ta không bỏ
-- Mira vì thiếu chức năng — họ bỏ vì đến tối thì quên mất là có cái app này. Một lời
-- nhắc đúng giờ rẻ hơn mọi tính năng mới.
--
-- NHẮC KHÔNG PHẢI THÔNG BÁO ĐẨY, VÀ ĐỪNG HỨA NHẦM
--
-- Bảng này lưu **ý định** của người dùng: mấy giờ, những thứ mấy. Nó không tự gửi gì cả.
-- Thông báo đẩy thật đòi service worker, Push API, khoá VAPID và một máy chủ luôn bật —
-- mà máy chủ Mira đang chạy trên laptop, tắt máy là tắt app. Hứa "nhắc" rồi im lặng là
-- cách nhanh nhất làm hỏng niềm tin vào mọi thứ khác.
--
-- Nên bản này nhắc **trong khung chat**: mở Mira ra thì lời nhắc đã quá giờ nằm sẵn
-- trong dòng trò chuyện, kèm nút bỏ qua. Đúng một việc, và làm được thật.
--
-- GIỜ LƯU THEO ĐỒNG HỒ NGƯỜI DÙNG, KHÔNG PHẢI MÁY CHỦ
--
-- "21:00" nghĩa là chín giờ tối **chỗ người dùng đang ngồi**. Máy chủ không biết họ ở
-- múi giờ nào, và cũng không cần biết: nó chỉ giữ chuỗi "21:00", còn việc so với bây giờ
-- là việc của client, nơi duy nhất biết mấy giờ thật. Đây cũng là lý do không có route
-- "nhắc nào tới hạn" — máy chủ trả lời được câu đó thì nó đã đoán sai múi giờ rồi.

CREATE TABLE IF NOT EXISTS nhac (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES app_user (id),
  -- HH:MM, 24 giờ. Chuỗi chứ không phải số phút: nó luôn được đọc và hiện nguyên cụm.
  gio        TEXT NOT NULL CHECK (gio ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  -- Thứ trong tuần theo ISO, giống hệt `nep.days`: 1 là thứ hai, 7 là chủ nhật.
  -- Cố ý dùng lại đúng quy ước đó. Hai cách đánh số thứ trong cùng một sản phẩm là một
  -- cái bẫy đặt sẵn cho người sửa sau.
  days       TEXT NOT NULL CHECK (days ~ '^[1-7]{1,7}$'),
  -- Lời nhắc. Rỗng thì màn hình dùng câu mặc định.
  loi        TEXT,
  bat        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS nhac_user_idx ON nhac (user_id) WHERE deleted_at IS NULL;

-- Ngày người dùng bấm "bỏ qua hôm nay". Giống `nep_bo_qua`, và vì cùng một lý do:
-- tắt hẳn một lời nhắc vì hôm nay bận là quyết định quá to cho một cái bấm.
CREATE TABLE IF NOT EXISTS nhac_bo_qua (
  nhac_id    TEXT NOT NULL REFERENCES nhac (id),
  user_id    TEXT NOT NULL REFERENCES app_user (id),
  date       TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (nhac_id, date)
);
