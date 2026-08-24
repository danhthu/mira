-- Dữ liệu mẫu Mira — xóa và tạo lại mỗi lần chạy seed
-- Tương đương ngày tham chiếu: 2026-08-18

-- Xóa theo thứ tự phụ thuộc khóa ngoại
DELETE FROM moment;
DELETE FROM time_entry;
DELETE FROM person;

-- ─── PERSONS ────────────────────────────────────────────────────────────────

INSERT INTO person (id, name, role, birth_year, distance_km, dunbar_ring, desired_cadence, hourglass_enabled, created_at, updated_at)
VALUES
  -- Gia đình trong cùng nhà
  ('pid-bao-an-01',  'Bảo An',    'child',   2023, NULL, 5,  30, FALSE, '2026-07-01T08:00:00+07:00', '2026-07-01T08:00:00+07:00'),
  ('pid-linh-01',    'Linh',      'partner', NULL, NULL, 5,  30, FALSE, '2026-07-01T08:00:00+07:00', '2026-07-01T08:00:00+07:00'),
  -- Bố mẹ ở xa (Hà Nội, user ở TP.HCM)
  ('pid-bo-01',      'Bố',        'parent',  1960, 1700, 5,   2, FALSE, '2026-07-01T08:00:00+07:00', '2026-07-01T08:00:00+07:00'),
  ('pid-me-01',      'Mẹ',        'parent',  1963, 1700, 5,   2, FALSE, '2026-07-01T08:00:00+07:00', '2026-07-01T08:00:00+07:00'),
  -- Bạn thân
  ('pid-hung-01',    'Hùng',      'friend',  NULL, NULL, 15,  4, FALSE, '2026-07-01T08:00:00+07:00', '2026-07-01T08:00:00+07:00'),
  -- Bản thân
  ('pid-self-01',    'Bản thân',  'self',    NULL, NULL, 5,   7, FALSE, '2026-07-01T08:00:00+07:00', '2026-07-01T08:00:00+07:00');


-- ─── TIME ENTRIES (7 ngày gần nhất: 2026-08-12 → 2026-08-18) ───────────────
-- Bucket 'people' hoặc 'self' → tính vào giờ vàng

INSERT INTO time_entry (id, date, minutes, bucket, person_id, note, source, created_at, updated_at)
VALUES
  -- Thứ 2 (08-12)
  ('te-0812-01', '2026-08-12', 480, 'work',   NULL,           NULL,                       'manual', '2026-08-12T20:00:00+07:00', '2026-08-12T20:00:00+07:00'),
  ('te-0812-02', '2026-08-12',  60, 'people', 'pid-linh-01',  'Ăn tối cùng nhau',         'manual', '2026-08-12T20:30:00+07:00', '2026-08-12T20:30:00+07:00'),
  ('te-0812-03', '2026-08-12',  45, 'people', 'pid-bao-an-01','Kể chuyện trước khi ngủ',  'manual', '2026-08-12T21:00:00+07:00', '2026-08-12T21:00:00+07:00'),

  -- Thứ 3 (08-13) — làm thêm giờ
  ('te-0813-01', '2026-08-13', 540, 'work',   NULL,           'Deadline sprint',           'manual', '2026-08-13T20:30:00+07:00', '2026-08-13T20:30:00+07:00'),
  ('te-0813-02', '2026-08-13',  30, 'people', 'pid-bao-an-01','Chơi với con trước khi đi làm', 'manual', '2026-08-13T07:00:00+07:00', '2026-08-13T07:00:00+07:00'),

  -- Thứ 4 (08-14)
  ('te-0814-01', '2026-08-14', 480, 'work',   NULL,           NULL,                        'manual', '2026-08-14T20:00:00+07:00', '2026-08-14T20:00:00+07:00'),
  ('te-0814-02', '2026-08-14',  90, 'people', 'pid-linh-01',  'Cả nhà đi ăn tối ngoài',   'manual', '2026-08-14T20:30:00+07:00', '2026-08-14T20:30:00+07:00'),
  ('te-0814-03', '2026-08-14',  60, 'self',   'pid-self-01',  'Tập thể dục',               'manual', '2026-08-14T06:30:00+07:00', '2026-08-14T06:30:00+07:00'),

  -- Thứ 5 (08-15)
  ('te-0815-01', '2026-08-15', 480, 'work',   NULL,           NULL,                        'manual', '2026-08-15T20:00:00+07:00', '2026-08-15T20:00:00+07:00'),
  ('te-0815-02', '2026-08-15',  30, 'people', 'pid-bo-01',    'Gọi video với Bố',          'manual', '2026-08-15T21:00:00+07:00', '2026-08-15T21:00:00+07:00'),
  ('te-0815-03', '2026-08-15',  45, 'people', 'pid-bao-an-01','Tắm + đọc sách cùng con',   'manual', '2026-08-15T20:00:00+07:00', '2026-08-15T20:00:00+07:00'),

  -- Thứ 6 (08-16)
  ('te-0816-01', '2026-08-16', 420, 'work',   NULL,           'Về sớm',                    'manual', '2026-08-16T18:00:00+07:00', '2026-08-16T18:00:00+07:00'),
  ('te-0816-02', '2026-08-16', 120, 'people', 'pid-hung-01',  'Cà phê chiều',              'manual', '2026-08-16T16:00:00+07:00', '2026-08-16T16:00:00+07:00'),
  ('te-0816-03', '2026-08-16',  60, 'people', 'pid-linh-01',  'Nói chuyện tối',            'manual', '2026-08-16T21:00:00+07:00', '2026-08-16T21:00:00+07:00'),

  -- Thứ 7 (08-17)
  ('te-0817-01', '2026-08-17', 180, 'people', 'pid-bao-an-01','Đi công viên Tao Đàn',      'manual', '2026-08-17T18:00:00+07:00', '2026-08-17T18:00:00+07:00'),
  ('te-0817-02', '2026-08-17', 120, 'people', 'pid-linh-01',  'Đi siêu thị cùng vợ',      'manual', '2026-08-17T14:00:00+07:00', '2026-08-17T14:00:00+07:00'),
  ('te-0817-03', '2026-08-17',  90, 'self',   'pid-self-01',  'Đọc sách buổi sáng',        'manual', '2026-08-17T07:00:00+07:00', '2026-08-17T07:00:00+07:00'),

  -- Chủ nhật (08-18, hôm nay)
  ('te-0818-01', '2026-08-18',  60, 'people', 'pid-me-01',    'Gọi điện với Mẹ',           'manual', '2026-08-18T10:00:00+07:00', '2026-08-18T10:00:00+07:00'),
  ('te-0818-02', '2026-08-18',  90, 'people', 'pid-bao-an-01','Chơi xếp hình cùng con',    'manual', '2026-08-18T15:00:00+07:00', '2026-08-18T15:00:00+07:00'),
  ('te-0818-03', '2026-08-18',  45, 'self',   'pid-self-01',  'Thiền 45 phút',             'manual', '2026-08-18T06:30:00+07:00', '2026-08-18T06:30:00+07:00');

-- Kết quả dự kiến:
--   people: 60+45+30+90+30+45+120+60+180+120+60+90 = 930 phút
--   self:   60+90+45 = 195 phút
--   Tổng giờ vàng: 1125 phút = 18.8 giờ/tuần


-- ─── MOMENTS (2 tuần gần nhất) ──────────────────────────────────────────────

INSERT INTO moment (id, occurred_at, text, media_uri, media_type, person_ids, bucket, created_at, updated_at)
VALUES
  ('mom-01', '2026-08-10T19:30:00+07:00',
   'Bảo An lần đầu đọc được 10 chữ cái, chỉ vào từng chữ rồi nhìn bố cười',
   NULL, NULL, '["pid-bao-an-01"]', 'people',
   '2026-08-10T19:35:00+07:00', '2026-08-10T19:35:00+07:00'),

  ('mom-02', '2026-08-14T20:45:00+07:00',
   'Cả nhà ăn bún bò cùng nhau. Linh cười rất nhiều vì Bảo An đòi ăn thêm',
   NULL, NULL, '["pid-linh-01","pid-bao-an-01"]', 'people',
   '2026-08-14T21:00:00+07:00', '2026-08-14T21:00:00+07:00'),

  ('mom-03', '2026-08-16T17:00:00+07:00',
   'Hùng kể về startup mới đang làm. Nghe xong thấy mình cũng nên bắt đầu cái gì đó',
   NULL, NULL, '["pid-hung-01"]', 'learn',
   '2026-08-16T17:30:00+07:00', '2026-08-16T17:30:00+07:00'),

  ('mom-04', '2026-08-17T09:15:00+07:00',
   'Bảo An chạy ra ôm bố khi thấy bố từ đằng xa đi vào công viên',
   NULL, NULL, '["pid-bao-an-01"]', 'people',
   '2026-08-17T09:20:00+07:00', '2026-08-17T09:20:00+07:00'),

  ('mom-05', '2026-08-18T10:45:00+07:00',
   'Mẹ hỏi thăm sức khoẻ, kể chuyện bà nội mới khỏe hơn. Nghe giọng Mẹ thấy bình yên',
   NULL, NULL, '["pid-me-01"]', 'people',
   '2026-08-18T10:50:00+07:00', '2026-08-18T10:50:00+07:00');
