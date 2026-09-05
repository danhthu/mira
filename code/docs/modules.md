# Checklist tạo và sửa module — code/

> Sinh bởi skill `cau-truc-du-an`, 2026-08-25. Cập nhật đường dẫn 2026-09-05 cho khớp cây thật sau khi app đổi sang khung Batify — xem [`structure.md`](structure.md). Áp dụng cho cả feature ở `code/fe/src/` và các lớp trong `code/be/src/`.

## Tạo feature mới ở code/fe

1. Đọc use case tương ứng trong `docs/dac-ta/use-case.md` — mọi feature phải khớp ít nhất một UC, không tạo trước khi có UC.
2. Grep `code/fe/src/Common/` xem component/hook/util mình định viết đã có chưa.
3. Tạo `code/fe/src/<TenFeature>/` (viết hoa, theo quy ước hiện có) với `Screens/`, và `Entities/`/`Components/`/`Models/`/`Text/` nếu cần — không bắt buộc đủ cả năm, chỉ tạo thư mục con nào thật sự dùng (`Emotion/` có gần đủ, `Trading/` chỉ một file, đều hợp lệ).
4. Viết `HANDOFF.md` cho feature theo đúng khuôn trong `code/CLAUDE.md` mục "Handoff protocol".
5. Nối vào `src/Main/MainScreen.tsx` nếu là màn hình cấp cao nhất, và khai route trong `Router/`.
6. Đặt chuỗi hiển thị vào `<TenFeature>/Text/` (chuỗi riêng) hoặc `lang/` (chuỗi dùng chung) — không inline string trong JSX.
7. Chạy `npm test` và `npx tsc` (script `ts:check`) trong `code/fe`.
8. Chạy `scripts/soi-cau-truc.sh` — không được thêm import chéo feature mới.

## Sửa feature đã có ở code/fe

1. Đọc mã nguồn hiện tại trước, đừng đoán theo tên file.
2. "Thêm" nghĩa là thêm vào cái đang có, không thay thế toàn bộ, trừ khi được bảo thay.
3. Sửa đúng lớp theo loại thay đổi: công thức tính sai → sửa `core/`; hiển thị sai → sửa `components/`; chữ sai → sửa `i18n/vi.ts`; cách lấy dữ liệu sai → sửa `hooks/` hoặc `store/`.
4. Không import từ feature khác. Cần dùng chung thì chuyển phần đó lên `shared/` trước, không import thẳng.
5. Không thêm chức năng ngoài phạm vi UC đang sửa — CLAUDE.md gốc đã cấm rõ ("không tự ý thêm tính năng ngoài spec V1").

## Thêm hàm mới vào code/fe/src/core

1. Đọc công thức tương ứng trong `docs/03-formulas.md` trước — không tự suy công thức.
2. Viết hàm thuần, không import React/db/store.
3. Viết test cùng lúc, phủ mọi "Biên" ghi trong `03-formulas.md` cho công thức đó (ví dụ: `lifeRate` phải test cả trường hợp `realWorkHours = 0`, thu nhập thụ động, nhiều nguồn thu).
4. Không viết hàm cho module ngoài phạm vi phiên bản đang làm mà không hỏi trước — ba file `lifeRate.ts`, `freedomCapital.ts`, `expenseConversion.ts` hiện có thuộc V2, đã được ghi nhận là ngoại lệ đã duyệt, không phải tiền lệ để tự thêm module V2/V3 khác mà không hỏi.

## Thêm entity/DTO mới vào code/be

1. Đọc `docs/02-data-model.md` — entity phải khớp đúng một bảng trong đó, không tự thêm cột không có nguồn.
2. Entity vào `entities/<Ten>.ts`, thuần TypeScript, không import gì từ `database/` hay `shared/`.
3. Union type/enum entity cần cho DTO dùng lại → đặt ở `shared/types/`, không import ngược từ `shared/dtos/` vào `entities/` (xem vi phạm đang mở trong `docs/structure.md`, sửa theo đúng hướng này khi được duyệt).
4. DTO vào `shared/dtos/<Ten>Dto.ts`, chỉ khai kiểu, không có logic.
5. Câu SQL viết tay vào `database/queries/<ten>.ts` dạng hằng số — không rải SQL ở nơi khác.
6. Chạy `npm run build` (tương ứng `code/be/package.json`, hiện là `tsc`).
7. Chạy `scripts/soi-cau-truc.sh`.

## Đặt tên

| Thứ | Quy ước | Ví dụ thật trong repo |
|---|---|---|
| Thư mục feature | camelCase (không phải kebab-case — khác quy ước mặc định của skill, giữ theo đúng convention có sẵn) | `hourglass`, `moments` |
| File component/screen | PascalCase | `HourglassCard.tsx`, `TodayScreen.tsx` |
| File hàm thuần trong `core/` | camelCase, trùng tên hàm chính | `goldenHours.ts` |
| Entity | PascalCase số ít, khớp tên bảng viết hoa chữ cái đầu | `Person.ts` ↔ bảng `person` |
| Migration SQL | `NNN_<viec_lam>.sql`, số tăng dần | `001_initial.sql` |

Ghi chú: quy ước đặt tên thư mục camelCase ở đây khác với khuyến nghị mặc định kebab-case của skill `cau-truc-du-an` — giữ nguyên vì đây là quy ước có sẵn trước khi bộ quy trình này chạy, đổi lúc này sẽ phải rename hàng loạt file đã có mã nguồn tham chiếu, không đáng.
