# Truy vết hai chiều — UC ↔ R

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25. Đây là bảng bắt lỗi quan trọng nhất của vòng G1 — soát cả hai chiều trước khi coi G1 xong.

## Chiều 1 — mỗi UC về R nào

| UC | Tên | Về yêu cầu |
|---|---|---|
| UC-01 | Thiết lập người quan trọng lần đầu | R-014, R-015, R-016, R-017, R-019 |
| UC-02 | Ghi giờ vàng bằng bộ đếm | R-022, R-026, R-048 |
| UC-03 | Ghi nhanh giờ vàng theo khoảng có sẵn | R-023, R-026, R-048 |
| UC-04 | Xem giờ vàng tuần này | R-020, R-021, R-025, R-026, R-027, R-028, R-029 |
| UC-05 | Ghi khoảnh khắc nhanh | R-024, R-038, R-039 |
| UC-06 | Xem dòng thời gian khoảnh khắc | R-035, R-037 |
| UC-07 | Bật Đồng hồ cát cho một người | R-003, R-018, R-041 |
| UC-08 | Xem card Đồng hồ cát | R-004, R-005, R-006, R-030, R-031, R-032, R-033, R-034 |
| UC-09 | Quản lý danh sách người quan trọng | R-040, R-052 |
| UC-10 | Bật Giới nghiêm buổi tối | R-042 |
| UC-11 | Bật Ngày trắng | R-043 |
| UC-12 | Xuất dữ liệu ra JSON | R-012, R-044 |
| UC-13 | Xoá toàn bộ dữ liệu | R-013, R-045 |
| UC-14 | Ghi giờ vàng qua widget | R-046, R-048 |
| UC-15 | Ghi giờ vàng qua shortcut hệ điều hành | R-047, R-048 |

**Kiểm tra "UC có, R không":** tám chi tiết luồng phụ/ngoại lệ trong `use-case.md` không truy được về một R cụ thể (ví dụ: nối lại bộ đếm khi app bị đóng giữa chừng ở UC-02, hỏi xác nhận trước khi xoá dữ liệu ở UC-13). Đây đúng là "máy tự bịa" theo nghĩa của skill — không có nguồn nào nói chi tiết đó. Không xoá khỏi UC vì thiếu chúng thì UC không dùng được thật, nhưng **không được coi là đã có yêu cầu** — chuyển thành giả định, xem `docs/dac-ta/gia-dinh.md` mã A-002.

## Chiều 2 — mỗi R về UC nào (hoặc lý do không cần UC)

| R | Về UC | Nếu không có UC, vì sao |
|---|---|---|
| R-001 | — | Ràng buộc chéo, áp cho mọi UC ghi liệu (UC-01, 02, 03, 05, 07), không phải hành vi của riêng UC nào |
| R-002 | — | Ràng buộc "không được làm gì", không phải hành vi cần màn hình |
| R-003 | UC-07 | |
| R-004 | UC-08 | |
| R-005 | UC-08 | |
| R-006 | UC-08 | |
| R-007 | — | Ràng buộc thiết kế toàn app, không riêng UC nào |
| R-008 | — | Ràng buộc văn phong toàn app |
| R-009 | — | Ràng buộc lưu trữ, không phải UI |
| R-010 | — | Ràng buộc lưu trữ, không phải UI |
| R-011 | — | Ràng buộc kiến trúc |
| R-012 | UC-12 | |
| R-013 | UC-13 | |
| R-014 | UC-01 | |
| R-015 | UC-01 | |
| R-016 | UC-01 | |
| R-017 | UC-01 | |
| R-018 | UC-07 | |
| R-019 | UC-01 | |
| R-020 | UC-04 | |
| R-021 | UC-04 | |
| R-022 | UC-02 | |
| R-023 | UC-03 | |
| R-024 | UC-05 | |
| R-025 | UC-04 | |
| R-026 | UC-02, UC-03, UC-04 | |
| R-027 | UC-04 | |
| R-028 | UC-04 | |
| R-029 | UC-04 | |
| R-030 | UC-08 | |
| R-031 | UC-08 | |
| R-032 | UC-08 | |
| R-033 | UC-08 | |
| R-034 | UC-08 | |
| R-035 | UC-06 | |
| R-036 | — | Chi tiết UI (nút nổi) của UC-05, gộp vào không tách UC riêng — nêu lại ở đây để không mất dấu |
| R-037 | UC-06 | |
| R-038 | UC-05 | |
| R-039 | UC-05 | |
| R-040 | UC-09 | |
| R-041 | UC-07 | |
| R-042 | UC-10 | |
| R-043 | UC-11 | |
| R-044 | UC-12 | |
| R-045 | UC-13 | |
| R-046 | UC-14 | |
| R-047 | UC-15 | |
| R-048 | UC-02, UC-03, UC-14, UC-15 | |
| R-049 | — | Ràng buộc kỹ thuật (kiến trúc `core/`), không phải UC người dùng thấy |
| R-050 | — | Ràng buộc kỹ thuật (test), kiểm ở cổng G4/G5 không phải UC |
| R-051 | — | Phi chức năng nền tảng, không phải UC |
| R-052 | UC-09 | Cũng áp chéo cho mọi bảng, chỉ UC-09 là nơi người dùng thấy rõ nhất (xoá person nhưng giữ lịch sử) |
| R-053 | — | Ràng buộc schema, quyết định kỹ thuật khi build `db/schema.ts` |
| R-054 | — | Ràng buộc phạm vi — định nghĩa cái không có, không phải UC |
| R-055 | — | Ràng buộc phạm vi |
| R-056 | — | Ràng buộc phạm vi |
| R-057 | — | Ràng buộc phạm vi |
| R-063 | — | Tổng hợp DoD, đã trải hết trong 15 UC ở trên, không phải một UC riêng |
| R-064 | — | Chỉ số đo sau ra mắt, không phải hành vi trong app |
| R-058–R-062 | — | Roadmap V2+, chưa bóc UC ở vòng này theo đúng phạm vi được giao |

**Kiểm tra "R có, UC không" ngoài bảng trên:** không còn dòng nào bỏ trống lý do — mọi R không về UC đều có cột giải thích, không phải bị bỏ sót.
