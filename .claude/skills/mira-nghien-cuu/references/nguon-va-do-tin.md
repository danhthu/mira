# Nguồn và độ tin — luật chấm cho bối cảnh Việt Nam

Đọc file này lần chạy đầu tiên. Sau đó chỉ cần mở lại khi gặp một loại nguồn chưa biết xếp vào đâu.

## Vì sao cần luật riêng cho Việt Nam

Phần lớn nghiên cứu về thời gian, thu nhập theo giờ, và nghỉ hưu sớm đến từ Mỹ và Tây Âu. Bê thẳng số của họ vào bài viết cho người Việt là lỗi hay gặp nhất và khó thấy nhất, vì con số nào cũng có vẻ hợp lý.

Ba chỗ lệch cần luôn kiểm:

1. **Cơ cấu chi tiêu.** Tỷ trọng nhà ở trong chi tiêu hộ gia đình Mỹ khác hẳn Việt Nam. Mọi con số kiểu "quy tắc 30% thu nhập cho nhà ở" đều cần kiểm lại trước khi dùng.
2. **Định nghĩa "giờ làm việc".** Nhiều khảo sát quốc tế chỉ đếm giờ tại nơi làm, không đếm thời gian đi lại. Với Mira thì thời gian kẹt xe là phần cốt lõi của tỷ giá đời — nên một con số "44 giờ/tuần" từ nguồn quốc tế thường không so sánh được với con số Mira đang tính.
3. **Lãi suất và lạm phát.** Quy tắc 4% của FIRE dựa trên lịch sử thị trường chứng khoán Mỹ. Áp vào Việt Nam là một phép suy luận có giả định, không phải một sự thật — nếu dùng, phải ghi rõ đó là suy luận. Bài 09 và 13 trong `growth/content/vi/` đã đụng chuyện này.

## Ba bậc độ tin

### `cao`

- Tổng cục Thống kê Việt Nam (GSO), Bộ Lao động - Thương binh và Xã hội, Bảo hiểm Xã hội Việt Nam, Ngân hàng Nhà nước.
- Tổ chức quốc tế có phương pháp công khai: World Bank, ILO, OECD, IMF, UN.
- Bài báo trên tạp chí bình duyệt, hoặc preprint có tác giả và cơ quan rõ ràng.
- Văn bản pháp luật (Bộ luật Lao động và các văn bản hướng dẫn) khi câu hỏi là về quy định.

Điều kiện kèm theo: phải đọc được phương pháp và cỡ mẫu. Một báo cáo của cơ quan nhà nước mà không nói lấy số từ đâu thì tụt xuống `vừa`.

### `vừa`

- Báo lớn (VnExpress, Tuổi Trẻ, Thanh Niên, Vietnamnet, Nikkei Asia, Reuters) **khi bài có dẫn nguồn gốc**. Nếu bài chỉ nói "theo một khảo sát" mà không nói khảo sát nào — đó là `thấp`.
- Báo cáo doanh nghiệp có nêu phương pháp: Navigos, VietnamWorks, Anphabe, Adecco, Talentnet, Decision Lab, Q&Me, Nielsen.
- Sách của tác giả có chuyên môn, dẫn nguồn đầy đủ.

Cẩn thận với **lợi ích liên quan**: báo cáo lương của một công ty tuyển dụng có động cơ làm con số lương đẹp lên. Vẫn dùng được, nhưng ghi vào mục "Cẩn thận".

### `thấp`

- Blog cá nhân, bài mạng xã hội, diễn đàn, video, bình luận.
- Báo dẫn số không có nguồn gốc.
- Nội dung do AI sinh (ngày càng nhiều — cảnh giác với bài có cấu trúc đều tăm tắp, số tròn trịa, không tác giả).
- Trang tổng hợp số liệu không nói lấy từ đâu.

Số bậc `thấp` **không bao giờ là số chính trong một bài blog**. Công dụng duy nhất của nó: làm manh mối để đi tìm nguồn gốc. Nếu lần ra được nguồn gốc, ghi nguồn gốc và bỏ trang trung gian đi.

Ngoại lệ: ở lane phản biện và lane SEO, nguồn `thấp` có giá trị riêng — một luồng bình luận cho thấy người thật đang nghĩ gì và nói bằng từ ngữ nào. Ở đó nó là **dữ liệu về dư luận**, không phải bằng chứng về sự thật. Ghi rõ phân biệt này.

## Kiểm tuổi của số

Ghi năm của số liệu, không chỉ ngày đăng bài. Một bài đăng năm 2026 dẫn số khảo sát 2019 thì đó là số 2019.

Ngưỡng thực dụng:
- Lương, chi phí sống, giá cả: quá 2 năm là cần cân nhắc, quá 4 năm thì phải nói rõ trong bài là số cũ.
- Giờ làm, cơ cấu thời gian, thói quen: quá 5 năm vẫn thường dùng được, đổi chậm.
- Nghiên cứu tâm lý học về thời gian và hạnh phúc: tuổi ít quan trọng hơn, nhưng kiểm xem có nằm trong nhóm bị khủng hoảng lặp lại (replication crisis) không — tâm lý học xã hội trước 2015 có một loạt kết quả nổi tiếng sau này không lặp lại được.

## Khi số cần cho bài mà tìm không ra

Chuyện này xảy ra thường xuyên với số liệu Việt Nam. Có ba lối, xếp theo thứ tự ưu tiên:

1. **Tìm số thành phần rồi tự tính**, ghi rõ là số suy ra kèm phép tính. Ví dụ: không có "thời gian đi làm trung bình ở TP.HCM" nhưng có số quãng đường trung bình và tốc độ trung bình giờ cao điểm → nhân ra được, và ghi rõ đây là suy ra.
2. **Dùng số quốc tế làm mốc so sánh**, nói thẳng trong bài là số nước ngoài, không giả vờ là số Việt Nam.
3. **Nói là không có số.** Đây là lựa chọn hợp lệ và thường là lựa chọn trung thực nhất. Ghi vào mục "Đã tìm nhưng không ra" để lần sau khỏi moi lại.

Điều không được làm: nặn ra một con số nghe hợp lý rồi trình bày như số có nguồn.

## Ghi nguồn thế nào để ba tháng sau còn dùng được

URL chết liên tục. Với phát hiện quan trọng (`⚑` hoặc độ tin `cao` mà chắc chắn sẽ dùng), chép nguyên câu chứa con số vào file — một câu, trong ngoặc kép, kèm nguồn. Đủ để sau này xác minh lại, không đủ nhiều để thành vấn đề bản quyền.

Nếu nguồn là PDF hay báo cáo dài, ghi số trang.
