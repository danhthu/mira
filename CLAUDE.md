# Mira — Chỉ dẫn cho Claude Code

## Đây là gì

Mira là ứng dụng di động giúp người dùng trả lời hai câu hỏi:

1. Tôi còn bao nhiêu thời gian cho những người quan trọng?
2. Tôi đã mua được bao nhiêu tự do?

Đọc `docs/` trước khi viết bất kỳ dòng code nào. Thứ tự đọc:
`00-vision.md` → `01-modules.md` → `02-data-model.md` → `03-formulas.md` → `04-roadmap.md` → `05-v1-spec.md`

## Trạng thái hiện tại

Chưa có code. Đây là repo tài liệu thiết kế. Việc đầu tiên là scaffold V1 theo `05-v1-spec.md`.

## Stack đã chọn

- **App**: React Native + Expo (SDK mới nhất), TypeScript strict
- **Local DB**: SQLite qua `expo-sqlite` + Drizzle ORM
- **State**: Zustand (không Redux)
- **Sync**: chưa làm ở V1. Kiến trúc phải local-first để cắm sync sau
- **Test**: Vitest cho logic thuần, không test UI ở V1

## Ràng buộc cứng — không được vi phạm

1. **Ngân sách nhập liệu**: tổng thao tác nhập của người dùng ≤ 60 giây/ngày trên toàn app. Mọi tính năng mới phải chứng minh nằm trong hạn mức, hoặc lấy dữ liệu tự động, hoặc không được làm.
2. **Giờ vàng không có giá**: tỷ giá đời (đ/giờ) chỉ áp cho chi tiêu và công việc. TUYỆT ĐỐI không quy đổi thời gian với con/bố mẹ/bạn đời ra tiền, ở bất kỳ đâu trong UI.
3. **Không streak, không badge, không thông báo gây tội lỗi.** Không dùng màu đỏ để báo người dùng làm chưa đủ.
4. **Đồng hồ cát mặc định TẮT.** Chỉ bật khi người dùng chủ động chọn trong Settings. Khi hiển thị, luôn kèm một hành động cụ thể, không bao giờ chỉ hiện con số trần.
5. **Local-first.** Dữ liệu nằm trên máy. Không gửi gì lên server ở V1.
6. **Không kết nối API ngân hàng.** Chi tiêu lấy từ SMS/notification, người dùng xác nhận 1 chạm.

## Quy ước code

- Toàn bộ logic tính toán (3 chỉ số, quy đổi) nằm trong `src/core/` — hàm thuần, không phụ thuộc React, phải có test.
- Không đặt số ma thuật trong UI. Mọi hằng số vào `src/core/constants.ts`.
- Tên biến tiếng Anh, chuỗi hiển thị tiếng Việt, gom hết vào `src/i18n/vi.ts`.
- Tiền lưu bằng số nguyên VND. Không dùng float cho tiền.
- Thời lượng lưu bằng phút (số nguyên), không dùng giờ thập phân.

## Cách làm việc mong muốn

- Trước khi code một màn hình, đọc lại phần tương ứng trong `05-v1-spec.md`.
- Làm từng module một, chạy được rồi mới sang cái tiếp.
- Khi thấy spec mâu thuẫn hoặc thiếu, hỏi lại thay vì tự suy diễn.
- Không tự ý thêm tính năng ngoài spec V1, kể cả khi thấy "sẽ hay hơn".
