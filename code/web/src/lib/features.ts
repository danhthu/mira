/**
 * Công tắc tính năng của phía web.
 *
 * ⚠ `GIO_VANG` ở đây PHẢI bằng `gioVang` trong `code/be/src/services/parse-rules.json`.
 *
 * Hai bản vì `be` cố ý không có phụ thuộc runtime nào vào gói `contract` (xem chú thích
 * trong `code/be/tsconfig.json`) — nên không có chỗ nào đặt một hằng số dùng chung cho
 * cả hai. Để hai bản tự trôi khỏi nhau thì máy chủ thôi gắn cờ vàng trong khi giao diện
 * vẫn hỏi "mục này có vàng không": giao diện hiện một khái niệm đã chết.
 *
 * Nên có `__tests__/features.test.test.ts` đọc thẳng file JSON của `be` và so. Trong một
 * monorepo nằm chung ổ đĩa thì đó là cách rẻ nhất để một sự thật không thành hai.
 */

/**
 * Giờ vàng — phần giờ Gia đình mà người ta thật sự có mặt, không vừa ngồi cùng vừa nhìn
 * điện thoại.
 *
 * **Tạm tắt theo quyết định của Founder ngày 25/11/2026.**
 *
 * Tắt nghĩa là: không màn nào còn nói chữ "giờ vàng", bộ đọc câu thôi gắn cờ, và ô đầu
 * màn Nhật ký hiện **giờ Gia đình** thay vì phần vàng của nó.
 *
 * Cột `golden` dưới CSDL vẫn nguyên, mục cũ vẫn giữ cờ cũ, nếp cũ vẫn giữ cờ cũ. Bật lại
 * là đổi hằng số này cùng với `gioVang` trong file luật — không phải viết lại gì.
 */
export const GOLDEN_HOURS = false;
