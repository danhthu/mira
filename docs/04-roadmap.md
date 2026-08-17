# 04 — Lộ trình

Thứ tự dưới đây **không phải** thứ tự ưu tiên. Là **thứ tự phụ thuộc kỹ thuật**.

Mục tiêu không tính được "giá" nếu chưa có tỷ giá đời. Lá thư không viết được nếu chưa có dữ liệu. Bật sai thứ tự thì module ra đời trong trạng thái rỗng và người dùng thấy nó vô dụng.

| Giai đoạn | Tháng | Module bật | Phụ thuộc |
|---|---|---|---|
| **V1** | 1–3 | M1 Thời gian (Giờ vàng, Đồng hồ cát) · M5 Khoảnh khắc | Không phụ thuộc gì |
| **V2** | 4–6 | M2 Tài chính (3 chỉ số + quy đổi) · M6 Kết nối | Cần `person` và `timeEntry` từ V1 |
| **V3** | 7–9 | M3 Mục tiêu · M7 Không gian chung (2 người) | Cần tỷ giá đời từ V2 để tính giá mục tiêu |
| **V4** | 10–12 | M12 Lá thư Chủ nhật · M4 Thân thể · lớp Sống chậm | Cần ≥6 tháng dữ liệu để AI viết hay |
| **V5** | Năm 2 | M8 Tâm trí · M9 Di sản · M10 Học hỏi · M11 Đồ đạc · Nhịp mùa | Lớp làm dày cho người ở lại |

## Cột mốc kiểm chứng

Trước khi sang giai đoạn sau, phải đạt:

- **Cuối V1**: 50 người dùng thật, ≥30% còn ghi ở tuần thứ 4. Nếu không đạt, vấn đề nằm ở nhập liệu, không phải ở thiếu tính năng — đừng thêm module để chữa.
- **Cuối V2**: ≥15% người dùng nhập đủ 3 số tài chính. Nếu thấp hơn, phần tài chính phải làm nhẹ đi chứ không làm sâu thêm.
- **Cuối V3**: ≥20% người dùng mời được người thứ hai vào không gian chung. Đây là chỉ số tăng trưởng duy nhất đáng theo dõi.
- **Cuối V4**: ≥40% lá thư được đánh dấu "hữu ích". Nếu thấp, lá thư đang nhạt — sửa prompt hoặc bỏ.

## Kiếm tiền

- **Miễn phí vĩnh viễn**: toàn bộ M1 + M5. Dữ liệu của người dùng thì miễn phí — đây là lời hứa đạo đức, ghi rõ trong app.
- **Trả phí** ~59k/tháng hoặc 490k/năm: M2 tài chính · lá thư Chủ nhật · không gian chung · Thước phim cuối năm.
- **Một lần**: sách ảnh in cuối năm.

## Ước lượng thực tế

Đội 3 người (1 mobile, 1 backend/data, 1 design kiêm sản phẩm): **14–20 tháng** cho tới hết V4. Con số 6 tháng là ảo tưởng. Lập kế hoạch theo con số thật.
