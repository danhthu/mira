-- Hai ô tiền mới: Đầu tư và Lãng phí.
--
-- VÌ SAO LÀ HAI CỘT RIÊNG, KHÔNG PHẢI MỘT PHẦN CỦA monthly_expense
--
-- Vòng dòng tiền vẽ thu nhập làm cái vòng và các khoản ra làm lát cắt. Nếu lãng phí nằm
-- trong chi tiêu rồi lại được vẽ thành lát riêng thì nó bị đếm hai lần: tổng các lát vượt
-- quá vòng, và con số "còn lại" ở giữa vòng sai. Nên ba khoản ra phải rời nhau:
--
--   monthly_expense + investment + wasted_money + debt_payment  ≤  net_income
--
-- KHÁC NHAU GIỮA HAI Ô MỚI
--
-- `wasted_money` là tiền MẤT. `investment` là tiền CHUYỂN sang net_worth — nó rời tay
-- nhưng không rời người. Nên "mức dư tháng này" trừ lãng phí mà không trừ đầu tư; luật
-- đó nằm ở `services/money.ts`, không nằm ở đây.
--
-- INTEGER, giống năm ô cũ. VND nguyên, không số thập phân. Cho phép NULL: ô chưa nhập
-- hiện dấu hỏi xám, app không đoán hộ và không ghi số 0 thay người dùng.

ALTER TABLE money ADD COLUMN IF NOT EXISTS investment   INTEGER;
ALTER TABLE money ADD COLUMN IF NOT EXISTS wasted_money INTEGER;
