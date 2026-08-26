# Kiểm kê nguồn

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25. Nguồn lấy từ `PROJECT.yaml: nguon_yeu_cau`.

Cả sáu tài liệu là spec kỹ thuật/sản phẩm viết tay, có sẵn trong repo từ trước khi bộ quy trình này chạy — không có ngày ký riêng cho từng file, xếp cùng hạng thẩm quyền cao nhất vì đều là quyết định đã chốt của chủ dự án, không phải ghi chú nháp.

| Mã | Tên file | Loại | Ngày | Hạng | Cách đã đọc | Độ tin |
|---|---|---|---|---|---|---|
| S-001 | `docs/00-vision.md` | quyết định | — | 1 | trích trực tiếp | cao |
| S-002 | `docs/01-modules.md` | quyết định | — | 1 | trích trực tiếp | cao |
| S-003 | `docs/02-data-model.md` | quyết định | — | 1 | trích trực tiếp | cao |
| S-004 | `docs/03-formulas.md` | quyết định | — | 1 | trích trực tiếp | cao |
| S-005 | `docs/04-roadmap.md` | quyết định | — | 1 | trích trực tiếp | cao |
| S-006 | `docs/05-v1-spec.md` | quyết định | — | 1 | trích trực tiếp | cao |

## Ghi chú xếp hạng

Sáu nguồn cùng hạng 1. Khi hai nguồn cùng hạng nói khác nhau, luật "mới thắng cũ" không dùng được vì không có mốc thời gian riêng — mọi mâu thuẫn phát hiện được ghi thẳng vào `docs/dac-ta/cau-hoi.md`, không tự chọn bên.

Trong nhóm cùng hạng, **S-006 (`05-v1-spec.md`)** là tài liệu đặc tả riêng cho ranh giới V1 — khi mâu thuẫn nằm đúng ở câu hỏi "cái này có thuộc V1 không", ưu tiên đọc S-006 trước vì nó cụ thể hơn cho đúng câu hỏi đó, dù không đổi hạng thẩm quyền hình thức.

## Nguồn phụ, không thuộc `nguon_yeu_cau` chính thức

Hai file dưới đây được đọc thêm để đối chiếu ngữ cảnh mã nguồn hiện có, không dùng làm căn cứ bóc yêu cầu (không đưa mã S-xxx):

- `code/CLAUDE.md` — luật kiến trúc + ràng buộc cứng, khớp nội dung với S-001 và S-006, không phát sinh yêu cầu mới.
- `code/fe/HANDOFF.md`, `code/be/HANDOFF.md` — trạng thái implement thật trên đĩa, dùng ở `docs/dac-ta/truy-vet.md` để đối chiếu UC nào đã có code, không phải nguồn yêu cầu.
