# M7 · Không gian chung

## Trạng thái hiện tại

- Tạo được không gian dạng `pair` (đúng 2 người) và `circle` (2–6 người).
- Chọn thành viên từ danh sách `person` có sẵn; chọn module được chia sẻ trong
  bốn mục M7 nói tới: ngân sách giờ, ví, mục tiêu đồng hành, hũ khoảnh khắc.
- Danh sách không gian đã tạo hiện tên, thành viên, module chia sẻ.
- `db/repositories/spaceRepository.ts` mới: `findAllSpaces`, `createSpace`.

**Không feed, không like, không bình luận** — không có màn hình nào trong feature
này hiển thị hoạt động của người khác, và không có nút phản hồi nào.

## Giới hạn lớn nhất — đọc trước khi hứa gì với người dùng

**V1/V2 local-first, chưa có sync server.** Không gian chung hiện chỉ là cấu trúc
dữ liệu nằm trên máy người tạo. Không mời được người thật, không ai khác thấy nó,
không có gì được chia sẻ đi đâu. Cố tình **không** dựng luồng mời giả (mã mời, thẻ
"đang chờ chấp nhận", trạng thái online) — làm vậy là hứa một thứ chưa tồn tại.

"Thành viên" ở đây là các bản ghi `person` của chính người dùng, không phải tài
khoản người khác. Khi có sync, phần này phải làm lại chứ không nối thêm được.

## Quyết định đã chốt

- **Giới hạn thành viên cưỡng chế ở tầng UI** (`logic/spaceRules.ts`): `pair` đúng
  2, `circle` tối đa 6. Chưa đẩy xuống repository vì chưa có đường nào khác ghi
  vào bảng `space`; khi có sync thì phải chuyển thành ràng buộc thật.
- **Nhãn module chia sẻ mượn tên tab của chính module đó** (`vi.nav.today`,
  `vi.money.tabLabel`, `vi.goals.tabLabel`, `vi.nav.moments`) vì `vi.space.*` chưa
  có bộ tên riêng.
- **Chưa có nút xoá không gian.** `vi.space.*` không có key nào cho việc này, và
  không mượn `vi.settings.deleteButton` ('Xóa tất cả') vì nghĩa khác hẳn.

## Câu hỏi còn mở

- **Câu hỏi chung mỗi tuần chưa làm được — bị chặn hai lớp.** `i18n/vi.ts` chỉ có
  nhãn `vi.space.weeklyQuestion` ('Câu hỏi chung tuần này'), không có nội dung câu
  hỏi nào; bảng `space` cũng không có cột lưu câu hỏi hay câu trả lời. Cần chốt:
  câu hỏi lấy từ một bộ có sẵn xoay theo tuần (thì thêm `vi.space.weeklyQuestions`),
  hay người dùng tự viết (thì thêm cột vào `db/schema.ts`).
- **Thiếu key i18n**: `vi.space.removeSpace` (xoá một không gian), bộ nhãn module
  chia sẻ riêng cho M7, và một cặp lưu/huỷ — màn hình đang mượn `vi.today.save` và
  `vi.today.cancel`.
- M7 nói "chung ngân sách giờ, chung ví, chung hũ khoảnh khắc". Hiện `sharedModules`
  mới chỉ là danh sách chọn được lưu lại; chưa module nào đọc nó để đổi cách hiển
  thị. Chưa rõ nó nên làm gì khi vẫn còn local-first.

## Bước tiếp theo

- Chốt hướng cho câu hỏi chung tuần (i18n hay schema) rồi làm nốt.
- Thêm key i18n còn thiếu, bỏ phần mượn từ `vi.today` và `vi.nav`.
- Khi có sync server: thiết kế lại phần thành viên từ đầu, đừng nối vào cấu trúc
  `memberIds` trỏ vào `person` cục bộ hiện tại.
