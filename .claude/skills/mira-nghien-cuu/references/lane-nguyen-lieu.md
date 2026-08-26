# Lane: nguyên liệu blog (Thứ Hai, Tư, Sáu)

## Mục tiêu

Tìm số liệu và nghiên cứu thật để 92 bài blog trong `growth/content/vi/` đứng được trên nguồn, thay vì trên số ước chừng.

Theo `growth/content/HANDOFF.md`, các bài đã draft đang dùng một ví dụ xuyên suốt: người lương 30 triệu/tháng, làm thật 60 giờ/tuần → tỷ giá đời ≈115.000đ/giờ; điện thoại 25 triệu = 217 giờ. Con số đó tính đúng công thức trong `docs/03-formulas.md`, nhưng **các đầu vào của nó (30 triệu, 60 giờ) hiện chưa có nguồn ngoài**. Đó là lỗ hổng đáng vá đầu tiên.

## Bảy nhóm câu hỏi, moi lần lượt

Mỗi lần chạy chọn **một hoặc hai nhóm**, đào cho tới nơi. Đừng rải mỏng cả bảy nhóm trong một ngày — file sẽ loãng và nhóm nào cũng dở dang.

Xoay nhóm dựa trên file lane gần nhất: nhóm nào lâu chưa đụng thì tới lượt.

### 1. Thu nhập và giờ làm thật ở Việt Nam
- Thu nhập bình quân người lao động theo quý/năm, tách theo khu vực và nhóm ngành (GSO công bố đều).
- Số giờ làm thực tế so với 48 giờ theo luật. Tỷ lệ làm thêm giờ, giờ làm thêm trung bình.
- Chênh lệch TP.HCM / Hà Nội / tỉnh.
- Bài liên quan: tuần 1 (tỷ giá đời), tuần 6 (chi phí ẩn của công việc).

### 2. Thời gian đi lại
- Quãng đường và thời gian đi làm trung bình ở TP.HCM, Hà Nội, Đà Nẵng.
- Tốc độ trung bình giờ cao điểm. Xu hướng nhiều năm.
- Đây là nhóm hay phải tự suy ra từ số thành phần — ghi rõ phép tính.
- Bài liên quan: bài 04 (`gio-ket-xe-co-phai-gio-lam-viec`), tuần 6.

### 3. Chi phí sống và cơ cấu chi tiêu hộ gia đình
- Chi tiêu bình quân đầu người theo tháng, tách theo nhóm: ăn uống, nhà ở, đi lại, giáo dục, y tế.
- Giá thuê nhà, học phí, chi phí nuôi một đứa trẻ tới 18 tuổi.
- Cần cho **vốn tự do** — mẫu số của công thức chính là chi tiêu tháng.
- Bài liên quan: tuần 2, tuần 3.

### 4. Tiết kiệm, đầu tư, nghỉ hưu sớm
- Tỷ lệ tiết kiệm hộ gia đình Việt Nam. Lãi suất tiền gửi nhiều năm. Lạm phát.
- Lợi suất dài hạn của các kênh phổ biến ở Việt Nam (gửi ngân hàng, vàng, VN-Index, bất động sản).
- Quy tắc 4% có hợp Việt Nam không — đây là câu hỏi mở, bài 09 và 13 đang treo nó.
- Bài liên quan: tuần 2, tuần 9.

### 5. Thời gian với con và với bố mẹ
- Nghiên cứu về thời gian cha mẹ dành cho con theo lứa tuổi, và thời điểm con bắt đầu dành thời gian cho bạn bè nhiều hơn cho gia đình.
- Tuổi thọ trung bình Việt Nam theo giới, số năm sống khoẻ.
- Tỷ lệ sống xa gia đình, tần suất về quê.
- **Nhóm rủi ro cao** theo `docs/blog-system-playbook.html` — mọi phát hiện ở đây phải kèm ghi chú về cách trình bày sao cho không gây tội lỗi. Xem `docs/00-vision.md` rủi ro số 1.
- Bài liên quan: tuần 4, tuần 5.

### 6. Nghiên cứu học thuật về thời gian, tiền, và hạnh phúc
- Đánh đổi thời gian ↔ tiền và ảnh hưởng lên mức hài lòng với cuộc sống.
- "Time famine", "time affluence" — nhóm khái niệm này có tài liệu tốt.
- Ngưỡng thu nhập mà thêm tiền không còn tăng hạnh phúc — chủ đề này có tranh cãi học thuật rõ ràng, tìm cả hai phía.
- Kiểm khủng hoảng lặp lại: kết quả nổi tiếng trước 2015 trong tâm lý học xã hội cần kiểm xem có lặp lại được không.
- Bài liên quan: các bài trụ cột (`pillar`) mọi tuần.

### 7. Kiểm chứng ngược các con số đã dùng trong bài
Mở một bài draft bất kỳ chưa được kiểm, moi từng con số trong đó, hỏi: số này từ đâu ra? Có nguồn không? Còn đúng không?

Nhóm này chán nhưng giá trị cao nhất — sửa một con số sai trước khi publish rẻ hơn nhiều so với sau.

## Cái gì tính là một phát hiện tốt ở lane này

Tốt: một con số cụ thể, có cơ quan công bố, có năm, có phương pháp, dùng được ngay cho một bài đã biết tên.

Không tốt: một nhận định chung chung kiểu "người Việt ngày càng bận rộn hơn". Không đo được thì không đưa vào bài được.

Cũng tốt: phát hiện rằng **không tồn tại** số liệu cho một câu hỏi. Ghi vào "Đã tìm nhưng không ra" — nó bảo người viết bài rằng chỗ đó phải nói vòng, đừng phát biểu chắc.

## Bẫy hay gặp ở lane này

- **Số quốc tế đội lốt số Việt Nam.** Kiểm nguồn gốc mọi con số nghe quá gọn.
- **Trung bình che mất phân bố.** "Thu nhập bình quân X triệu" nói rất ít về người đọc bài. Nếu tìm được trung vị hoặc phân vị thì giá trị hơn hẳn — ghi chú luôn.
- **Số danh nghĩa với số thực tế.** Thu nhập tăng 8% mà lạm phát 4% thì tăng thật 4%. Ghi rõ số nào là số nào.
- **Số theo tháng, quý, năm trộn lẫn.** Ghi rõ đơn vị thời gian.
