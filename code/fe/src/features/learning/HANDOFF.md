# Học hỏi (M10)

## Trạng thái hiện tại

- `screens/LearningScreen.tsx`: một `SectionList` các ghi chú học hỏi, gộp theo năm, mới nhất trước. Nút `+` mở ô nhập, lưu xong hiện ngay trong danh sách.
- Không có repository riêng: màn hình dùng `db/repositories/momentRepository.ts` đã có.

## Quyết định đã chốt — chỗ quan trọng nhất của module này

`docs/02-data-model.md` không có bảng nào cho M10, và `db/schema.ts` nằm ngoài phạm vi sửa của đợt này.

**Chốt: mọi ghi chú của M10 lưu vào bảng `moment` với `kind = 'learn'`** (và `bucket = 'learn'` giữ nguyên nghĩa khoang thời gian).

Cập nhật 2026-08-25: `moment` đã có cột `kind`. Màn hình đọc bằng `findMomentsByKind('learn')` chứ không lọc `bucket` nữa — `bucket` là khoang thời gian, dùng nó để nhận diện module là nhập nhằng hai khái niệm. Ghi chú cũ được migration điền `kind = 'learn'` dựa trên `bucket = 'learn'`, không mất cái nào.

Lý do:

- `moment` đã có đúng ba thứ cần: `text`, `occurredAt`, `bucket`. Enum `bucket` đã sẵn giá trị `'learn'` — nó có mặt ở đó chính vì việc học là một trong sáu loại thời gian mà app đã công nhận.
- Ghi chú học hỏi vào `moment` thì nó tự động nằm trong `capitalLedger` (`docs/02-data-model.md`) cùng với mọi giao dịch khác. Đúng tinh thần "sổ cái duy nhất" của `docs/00-vision.md`.
- `bucket = 'learn'` không đụng Giờ vàng: `GOLDEN_BUCKETS` trong `core/constants.ts` chỉ nhận `'people'` và `'self'`.

**Đã cân nhắc và loại bỏ: lưu sách vào bảng `item`.**

Bảng `item` (`name · price · purchasedAt · useCount · releasedAt`) hợp với một cuốn sách giấy, và "giá mua ÷ số lần đọc" cũng chạy được. Nhưng `item` không có cột phân loại, nên M11 sẽ đếm sách vào "Đang sở hữu N món" mà không cách nào tách ra, còn M10 thì không lọc được cuốn nào là sách. Một con số sai ở hai màn hình để đổi lấy một nhãn — không đáng.

**Không đề xuất thêm bảng mới.** Với `moment` thì phần "ý tưởng chợt nghĩ" chạy đủ, không cần lược đồ mới.

## Câu hỏi còn mở

1. **Chưa tách được ba mục trong spec — cố ý hoãn.** `vi.learning.booksReading` và `vi.learning.skillsLearning` vẫn chưa dùng tới. Cột `kind` mới chỉ nói hàng này thuộc module Học hỏi, chưa nói nó là sách hay kỹ năng hay ý tưởng; tách ba mục cần thêm một trục phân loại nữa (`learnBook` / `learnSkill` / `learnIdea`, hoặc một cột con) **và** một ô chọn loại trong màn nhập. Đợt này không làm vì: (a) nó là tính năng mới chứ không phải sửa lỗi, cần duyệt theo luật "không tính năng ngoài spec V1"; (b) thêm một bước chọn vào ô nhập ăn vào ngân sách 60 giây/ngày, phải cân nhắc riêng.
2. **"Tôi đã đổi ý về gì" đang là bản đọc lại, không phải bản tóm tắt.** Mỗi năm đã khép lại có dòng phụ `vi.learning.changedMyMind` trên đầu nhóm ghi chú của năm đó. Bản tóm tắt do máy viết thì lại mâu thuẫn với `docs/01-modules.md`: lá thư Chủ nhật là "output AI duy nhất của toàn hệ thống". Cần chốt lại xem M10 có được sinh chữ hay không.
3. **Thiếu chuỗi i18n**: chưa có nhãn chung `save`/`cancel` (đang mượn `vi.moments.save` / `vi.moments.cancel`).
4. ~~Ghi chú học hỏi cũng hiện ở tab Khoảnh khắc.~~ Đã xong: M4 đọc `findMomentsByKind('moment')` nên ghi chú học hỏi không lọt sang nữa.

## Bước tiếp theo

1. Xin duyệt trục phân loại con cho Sách / Kỹ năng / Ý tưởng (mục 1) rồi mới dựng ba mục.
2. Chốt mục 2 trước khi viết bất kỳ dòng tổng kết nào.
