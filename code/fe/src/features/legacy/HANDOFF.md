# Di sản (M9)

## Trạng thái hiện tại

- `screens/LegacyScreen.tsx`: hai phần trên một `ScrollView`.
  - **Thư gửi mình một năm sau** — viết, cất đi, mỗi thẻ hiện `vi.legacy.sealedUntil(ngày mở)`. Trước ngày mở, phần thân thư không được render (không phải ẩn bằng style — không có trong cây React).
  - **Hộp để lại cho con** — ảnh và lời nhắn, lưu vào bảng `moment` với `kind = 'legacy'`. `personIds` vẫn ghi danh sách người có `role = 'child'` nhưng chỉ để biết mục này dành cho ai, KHÔNG còn là điều kiện lọc. Nút `addToBox` bị vô hiệu khi chưa có ai vai trò con.
- `letterSeal.ts`: `letterOpenDate`, `isLetterSealed`, `formatDayMonthYear` — hàm thuần, có test ở `letterSeal.test.ts` (7 ca).
- `db/repositories/letterRepository.ts`: `findAllLetters`, `createLetter`, `softDeleteLetter`.

## Quyết định đã chốt

- **Cột `kind` trên `moment` và `letter` (2026-08-25, người dùng duyệt).** Ba module cùng ghi vào `moment` (Khoảnh khắc, Học hỏi, hộp di sản) và hai module cùng ghi vào `letter` (M9, M12) mà không có gì phân biệt. Hệ quả cũ: hộp lọc theo `personIds`, nên **mọi khoảnh khắc thường có gắn tên con tự động lọt vào hộp để lại cho con** dù người dùng không hề chọn. Giá trị: `moment` | `learn` | `legacy` cho `moment`; `yearLetter` | `eulogy` | `sunday` cho `letter`. `bucket` giữ nguyên nghĩa cũ là khoang thời gian, không dùng thay `kind`.
- **`kind` là bắt buộc trong `CreateMomentDto` / `CreateLetterDto`.** Để `optional` thì một màn hình mới quên khai là hàng lại rơi vào diện không phân loại; bắt buộc thì trình biên dịch chỉ ra ngay mọi chỗ ghi.
- **Đọc lọc qua `findMomentsByKind` / `findLettersByKind` trong repository**, không lọc bằng `.filter()` ở màn hình. Luật "`kind` NULL đọc như `moment`" nằm đúng một chỗ.
- **Nạp lại dữ liệu cũ (migration):** hàng `moment` có `bucket = 'learn'` được điền `kind = 'learn'` — trước đây Học hỏi là nơi duy nhất ghi như vậy nên dấu hiệu này chắc chắn. Toàn bộ thư cũ được điền `kind = 'yearLetter'` — M9 là module duy nhất từng ghi vào `letter`. **Cố tình KHÔNG đoán hàng nào là `legacy`**: dấu hiệu duy nhất còn lại (có gắn tên con) chính là cái lỗi đang sửa, dùng nó để nạp lại thì lại đẩy khoảnh khắc thường vào hộp một lần nữa. Hệ quả cần biết: mục người dùng đã bỏ vào hộp **trước** đợt này giờ nằm ở tab Khoảnh khắc chứ không ở hộp. Không hàng nào bị xoá.
- **Ngày mở thư = ngày viết thật, không phải đầu tuần (PH-09).** Trước đây `weekStart(new Date())` làm thư viết Chủ nhật mở sớm 6 ngày, và hai thư cùng tuần có chung ngày mở. Nay `weekStart` lưu `todayYMD()` — ngày viết theo giờ máy. Chọn cột này chứ không phải `createdAt` vì `createdAt` là ISO theo UTC: viết lúc 0h30 giờ Việt Nam thì `slice(0,10)` ra ngày hôm trước. Với `letter`, `weekStart` đọc là "ngày lá thư thuộc về" — với `yearLetter` là ngày viết, với `sunday` (M12) sẽ là đầu tuần thật. `letterSeal.ts` và 7 test của nó không phải sửa.
- **Thư dùng bảng `letter`, hộp dùng bảng `moment`.** Bảng `letter` chỉ có `weekStart · body · userReaction`; nó hợp với một khối chữ. Bảng `moment` đã có sẵn `mediaUri` + `mediaType (photo|audio)` + `personIds`, đúng ba thứ mà "ảnh, giọng, lời nhắn để lại cho con" cần. Tạo cột mới cho hộp là thừa khi `moment` đã đủ.
- **Hộp để lại cho con dùng chung bảng `moment` nhưng là một kho riêng.** Vẫn một bảng, một sổ cái theo `docs/00-vision.md`, nhưng `kind` quyết định màn hình nào được hiện hàng nào. Bỏ cách hiểu cũ "mục trong hộp cũng xuất hiện ở tab Khoảnh khắc": di sản để lại cho con là chỗ người dùng phải chủ động chọn bỏ vào, không phải một lát cắt tự suy ra từ dữ liệu khác.
- **Không có nút xoá thư trên màn hình.** `softDeleteLetter` có sẵn trong repository cho phần Cài đặt → Xoá dữ liệu, nhưng một lá thư đang niêm phong mà xoá được bằng một chạm thì việc niêm phong mất nghĩa.
- `letterSeal.ts` đặt trong feature chứ không ở `core/` vì đợt này không được chạm `core/`.

## Câu hỏi còn mở

1. **Điếu văn tự viết (1 lần/năm) chưa làm.** Chỗ trong lược đồ đã có (`letter.kind = 'eulogy'`), còn thiếu màn hình và chuỗi i18n. Không còn vướng lược đồ nữa.
2. **Có nên cho người dùng chuyển một khoảnh khắc thường vào hộp không?** Sau đợt sửa này, mục bỏ vào hộp trước đây (nhận nhầm qua `personIds`) nằm ở tab Khoảnh khắc. Nếu có nút "bỏ vào hộp" trên từng khoảnh khắc thì người dùng tự đưa lại được — nhưng đó là tính năng mới, cần duyệt trước.
3. **Thiếu chuỗi i18n**: chưa có nhãn chung `save`/`cancel` (đang mượn `vi.moments.save` / `vi.moments.cancel`), chưa có câu giải thích khi chưa có ai vai trò con nên nút `addToBox` bị mờ.
4. Ghi âm giọng nói: `moment.mediaType` có `'audio'` nhưng màn hình mới chỉ chọn ảnh.

## Bước tiếp theo

1. Làm điếu văn 1 lần/năm trên `letter.kind = 'eulogy'`.
2. Thêm nhãn i18n cho hai chỗ ở mục 3.
3. Chuyển `letterSeal.ts` sang `core/` khi được phép sửa `core/`, giữ nguyên bộ test.
