# Kiểm kê nguồn — V2

> Sinh bởi skill `phan-tich-yeu-cau`, 2026-08-25. Vòng G1 cho phạm vi V2 (M2 Tài chính + M6 Kết nối con người). Nguồn dùng ở đây là cùng bộ sáu tài liệu đã kiểm kê ở `docs/nguon/kiem-ke.md` — không lặp lại bảng, chỉ ghi phần khác khi đọc lại với lăng kính V2.

## Nguồn dùng để bóc yêu cầu V2

Năm trên sáu nguồn gốc mang nội dung cho V2, mã giữ nguyên S-001 đến S-005:

| Mã | Tên file | Phần dùng cho V2 |
|---|---|---|
| S-001 | `docs/00-vision.md` | Ba chỉ số lõi (Tỷ giá đời, Vốn tự do), rủi ro đã biết mục 2-3 |
| S-002 | `docs/01-modules.md` | Bảng M2 Tài chính, dòng mô tả M6 Kết nối con người |
| S-003 | `docs/02-data-model.md` | Bảng `workLoad`, `money`, `expense`, cột "bảng nào thuộc phiên bản nào" |
| S-004 | `docs/03-formulas.md` | Mục 2 Tỷ giá đời, mục 3 Vốn tự do, mục 4 Quy đổi chi tiêu |
| S-005 | `docs/04-roadmap.md` | Dòng V2, mốc kiểm chứng cuối V2, mục kiếm tiền |

**S-006 (`05-v1-spec.md`) không dùng làm nguồn nội dung ở vòng này** — đúng chỉ dẫn được giao, tài liệu này tự nhận "V1 không tài chính" nên không đặc tả gì cho V2. Chỉ đọc để biết ranh giới: hai chỗ V1 đã hoãn (Q-003 gốc: Đồng bộ lịch, Chi phí ẩn) quay lại làm điều kiện tiên quyết bị thiếu cho một tính năng M6 — ghi chú ở `docs/dac-ta/cau-hoi-v2.md` mã Q-013.

## Nguồn phụ, không thuộc `nguon_yeu_cau` chính thức

Đối chiếu mã nguồn hiện có theo đúng yêu cầu của vòng này, không dùng làm căn cứ bóc yêu cầu:

- `code/fe/src/core/lifeRate.ts`, `freedomCapital.ts`, `expenseConversion.ts`, `constants.ts` — implement một phần công thức S-004 mục 2-4, có test đi kèm trong `code/fe/src/core/__tests__/`. Đối chiếu chi tiết ở mục "Đối chiếu code hiện có" trong `docs/dac-ta/yeu-cau-v2.md`.
- `code/be/src/entities/Money.ts`, `Expense.ts`, `WorkLoad.ts`, `Person.ts` — đối chiếu với bảng `money`, `expense`, `workLoad`, `person` trong S-003.

## Ghi chú xếp hạng

Giữ nguyên luật đã lập ở `kiem-ke.md`: năm nguồn cùng hạng 1, mới thắng cũ không áp dụng được vì không có mốc thời gian riêng, mâu thuẫn cùng hạng thành câu hỏi. Không phát hiện mâu thuẫn trực tiếp giữa hai nguồn hạng 1 ở vòng này — phần lớn vấn đề tìm được thuộc loại "thiếu hẳn" (mục 2 trong tám loại nhập nhằng) chứ không phải mâu thuẫn, vì M6 chỉ được viết trong đúng một câu ở S-002 và không nguồn nào khác nhắc lại để đối chiếu.
