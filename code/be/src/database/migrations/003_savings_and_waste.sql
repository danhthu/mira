-- Hai lệch spec phát hiện khi dựng tầng Core bên FE (2026-09-05).
--
-- 1. money.savings — `08-three-pillars.md §Trụ 2` cần 5 ô nhập, `02-data-model.md`
--    chỉ khai 4. Ô thiếu là "tiết kiệm + đầu tư/tháng", mà nó là số trừ cuối cùng
--    trong công thức bốc hơi: thu nhập − chi cố định − trả nợ − tiết kiệm. Không có
--    cột này thì bản ghi đẩy lên server rụng mất ô4 trong im lặng, và bốc hơi —
--    phát hiện quan trọng nhất của trụ Tài chính — không tính được.
--
-- 2. time_entry.bucket thiếu 'waste' — `02` khai 6 khoang, `08` cần ba nhóm
--    LÃNG PHÍ / Ý NGHĨA / CẦN THIẾT mà không khoang nào ánh xạ được nhóm lãng phí.
--    Thiếu nó thì hỏng hẳn công thức "giờ cần thiết = tỉnh − lãng phí − ý nghĩa",
--    và CHECK constraint sẽ từ chối mọi bản ghi lãng phí client đẩy lên.

ALTER TABLE money ADD COLUMN IF NOT EXISTS savings INTEGER NOT NULL DEFAULT 0;

ALTER TABLE time_entry DROP CONSTRAINT IF EXISTS time_entry_bucket_check;
ALTER TABLE time_entry ADD CONSTRAINT time_entry_bucket_check
  CHECK (bucket IN ('work', 'health', 'people', 'learn', 'rest', 'self', 'waste'));

-- expense.bucket cố ý KHÔNG đụng: cột đó hiện không có CHECK constraint nào
-- (kiểm bằng pg_constraint), thêm vào đây là siết thêm ngoài phạm vi hai lệch trên.
