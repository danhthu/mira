# Nguyên liệu blog — 26/08/2026

> Chạy bởi skill `mira-nghien-cuu`. Lane: nguyen-lieu. Số truy vấn đã dùng: 14.
> Thứ Tư — đúng lịch xoay vòng. Nhóm câu hỏi đã moi: **nhóm 6** (nghiên cứu học thuật về
> thời gian, tiền, hạnh phúc — ưu tiên số 4 trong đề xuất của file 25/08), và **một việc
> kiểm chứng tồn đọng** (đề xuất 44 giờ/tuần ở N-008 đã thành luật chưa).

## Tóm tắt ba dòng

Tìm được **bằng chứng thực nghiệm trực tiếp cho rủi ro số 2 trong `00-vision.md`** — quy đổi thời gian ra tiền làm hỏng quan hệ: người ăn lương theo giờ tình nguyện ít hơn 36% so với người ăn lương tháng, và chỉ cần *nhắc* ai đó nhớ mức lương giờ của họ trước một sự kiện thiện nguyện là đủ để kéo mức hạnh phúc của họ trong sự kiện đó xuống. Đây là phát hiện đắt nhất từ đầu dự án tới nay: nó nói rằng chính cơ chế lõi của Mira (Tỷ giá đời) có tác dụng phụ đã được đo.

Câu hỏi "thêm tiền có thêm hạnh phúc không" thì **không có đáp án gọn** — hai nghiên cứu tốt nói ngược nhau về ngưỡng (100.000 USD với 20% người kém hạnh phúc nhất, hay 200.000 USD cho tất cả), nên bài blog không được phát biểu chắc nịch chỗ này.

Đề xuất giảm giờ làm tư nhân xuống 44 giờ/tuần **chưa thành luật**: hồ sơ dự thảo đang ở Bộ Tư pháp thẩm định, dự kiến trình Quốc hội kỳ họp tháng 10/2026 — tức là sau khi các bài tuần 6 và tuần 7 nhiều khả năng đã publish.

## Phát hiện

### N-011 — Thu nhập và hạnh phúc: quan hệ tuyến tính theo log, phẳng chỉ ở 20% kém hạnh phúc nhất

- **Nội dung**: Hợp tác đối kháng (adversarial collaboration) giữa hai bên từng kết luận ngược nhau — Kahneman & Deaton 2010 (hạnh phúc chững lại quanh 75.000 USD/năm) và Killingsworth 2021 (tăng đều, không thấy chững). Kết quả hoà giải: hiện tượng chững **có thật nhưng chỉ giới hạn ở nhóm 20% kém hạnh phúc nhất**, và với nhóm đó thì hạnh phúc tăng theo thu nhập tới khoảng 100.000 USD/năm rồi phẳng. Với đa số còn lại, hạnh phúc tiếp tục tăng theo log của thu nhập vượt xa mốc 100.000 USD; ở nhóm hạnh phúc nhất còn tăng nhanh hơn.
- **Nguồn**: Killingsworth M.A., Kahneman D., Mellers B. — "Income and emotional well-being: A conflict resolved", PNAS 2023, tập 120, số 10, e2208661120 — https://www.pnas.org/doi/10.1073/pnas.2208661120 · DOI 10.1073/pnas.2208661120
- **Ngày công bố**: 01/03/2023 (PubMed ghi 07/03/2023) · **Truy cập**: 26/08/2026
- **Phương pháp/cỡ mẫu**: **33.391 người lớn đang đi làm tại Mỹ**, thu thập bằng experience sampling (hỏi cảm xúc nhiều lần trong ngày qua app, không phải hồi tưởng). Trung vị tuổi 33; trung vị thu nhập hộ 85.000 USD/năm (phân vị 25 = 45.000; phân vị 75 = 137.500); 36% nam, 37% đã kết hôn.
- **Độ tin**: cao — tạp chí bình duyệt hạng đầu, cỡ mẫu lớn, phương pháp công khai, và bản thân thiết kế nghiên cứu là để giải quyết một tranh cãi nên đã qua vòng phản biện gắt hơn bình thường.
- **Dùng được ở đâu**: các bài trụ cột về "kiếm thêm tiền có đáng không" — tuần 2 (vốn tự do), tuần 9. Chi tiết dùng được nhất **không phải** ngưỡng tiền, mà là chỗ **quan hệ tuyến tính theo log**: muốn tăng hạnh phúc thêm một nấc thì phải **nhân đôi** thu nhập, không phải cộng thêm. Đó là lập luận định lượng cho toàn bộ luận điểm của Mira mà không cần lên giọng đạo đức.
- **Cẩn thận**: dữ liệu Mỹ, thu nhập tính bằng USD/năm theo hộ. **Không quy đổi thẳng sang tiền Việt** — cấu trúc chi tiêu và giá cả khác hẳn (xem `nguon-va-do-tin.md` mục 1). Nếu dùng thì dùng **hình dạng quan hệ** (log), đừng dùng con số ngưỡng. Ngoài ra bài này có ít nhất một thư phản biện đăng cùng tạp chí — "Inappropriate causal assumptions underlie Killingsworth, Kahneman, and Mellers' conclusions", PNAS, https://www.pnas.org/doi/10.1073/pnas.2313712121 — chưa đọc, ghi lại để lần sau.
- **Mâu thuẫn với**: N-012

### N-012 — Phân tích lại cùng dữ liệu: mức phẳng nằm quanh 200.000 USD, không phải 100.000

- **Nội dung**: Một phân tích lại độc lập cho rằng kết luận của N-011 nhạy cảm với ngưỡng được chọn trước. Killingsworth và cộng sự đặt sẵn ngưỡng 100.000 USD rồi kiểm; tác giả này dùng cách để dữ liệu tự chọn ngưỡng tối ưu, và tìm thấy quan hệ giữa thu nhập hộ và cảm xúc **phẳng từ khoảng 200.000 USD/năm trở lên** — tức là có điểm bão hoà thật, chỉ là cao hơn nhiều so với các mốc đang được nhắc tới.
- **Nguồn**: Mikkel Bennedsen — "Income and emotional well-being: Evidence for well-being plateauing around $200,000 per year", arXiv:2401.05347 — https://arxiv.org/abs/2401.05347
- **Ngày công bố**: nộp 02/12/2023, bản sửa 24/01/2024 · **Truy cập**: 26/08/2026
- **Phương pháp/cỡ mẫu**: phân tích lại chính bộ dữ liệu của N-011 bằng phương pháp chọn ngưỡng từ dữ liệu (data-driven threshold). Cỡ mẫu kế thừa từ N-011.
- **Độ tin**: vừa — **preprint arXiv, chưa qua bình duyệt, một tác giả**. Theo `nguon-va-do-tin.md` thì preprint có tác giả và cơ quan rõ ràng được xếp `cao`, nhưng ở đây hạ một bậc vì đây là một tuyên bố phản bác một bài đã bình duyệt, và chưa thấy phản hồi từ phía bị phản bác.
- **Dùng được ở đâu**: **không dùng làm số trong bài.** Công dụng của nó là biên tập: nó chứng minh rằng "ngưỡng thu nhập mà tiền hết tác dụng" là chỗ khoa học chưa chốt. Bài nào của Mira định nói "trên X đồng thì thêm tiền không còn ý nghĩa" phải bỏ câu đó, hoặc nói rõ là chưa ai chốt được.
- **Cẩn thận**: hai bài dùng **cùng một bộ dữ liệu**, khác nhau ở phương pháp chọn ngưỡng — nên đây không phải hai bằng chứng độc lập, mà là một bằng chứng và hai cách đọc nó. Nói rõ chỗ này nếu đặt cạnh nhau.
- **Mâu thuẫn với**: N-011

### N-013 — Mua thời gian làm người ta hạnh phúc hơn — nhưng gần một nửa triệu phú không mua ⚑

- **Nội dung**: Khảo sát ở bốn nước cho thấy người chi tiền hằng tháng để mua lại thời gian (thuê người làm việc nhà, giao đồ, thuê dịch vụ thay vì tự làm) có mức hài lòng với cuộc sống cao hơn rõ rệt. Khoảng **28% người trả lời có chi khoản này, trung bình 148 USD/tháng**; chênh lệch hài lòng có cỡ tác động d = 0,24 (p < 0,001). Áp lực thời gian kéo giảm hài lòng ở nhóm không mua (B = −0,18, p < 0,001) nhưng gần như không ảnh hưởng ở nhóm có mua (B = −0,03, p = 0,144) — tức là mua thời gian có tác dụng như một tấm đệm. Chi tiết đắt nhất: trong 818 triệu phú được khảo sát, **gần một nửa không chi một đồng nào để thuê người làm những việc họ ghét**, dù thừa khả năng.
- **Nguồn**: Whillans A.V., Dunn E.W., Smeets P., Bekkers R., Norton M.I. — "Buying time promotes happiness", PNAS 2017 — https://www.pnas.org/doi/10.1073/pnas.1706541114 · bản đọc được: https://pmc.ncbi.nlm.nih.gov/articles/PMC5559044/
- **Ngày công bố**: 2017 · **Truy cập**: 26/08/2026
- **Phương pháp/cỡ mẫu**: **hơn 6.000 người** ở Mỹ, Canada, Đan Mạch, Hà Lan; sáu khảo sát tương quan, mỗi mẫu từ 326 đến 1.802 người. Kèm một **thí nghiệm hiện trường có tiền đăng ký (preregistered), n = 60** người đi làm ở Vancouver: mỗi người được 40 USD, một cuối tuần tiêu vào thứ mua lại thời gian, cuối tuần kia tiêu vào đồ vật, đo tâm trạng cuối mỗi ngày. Kết quả: cảm xúc tích cực cuối ngày 4,00 so với 3,71 (p = 0,007), cảm xúc tiêu cực và áp lực thời gian đều thấp hơn.
- **Độ tin**: cao — PNAS, mẫu khảo sát lớn ở bốn nước, thí nghiệm có tiền đăng ký (đây là điểm quan trọng: tiền đăng ký là biện pháp chống đúng loại vấn đề mà khủng hoảng lặp lại phơi ra).
- **Dùng được ở đâu**: **tuần 3 (quy đổi tiền ↔ giờ)** và mọi bài về việc dùng tiền để mua lại giờ. Chi tiết "gần một nửa triệu phú không mua" là nguyên liệu tốt nhất — nó nói thẳng rằng vấn đề không nằm ở khả năng chi trả mà ở chỗ **người ta không nghĩ tới việc quy đổi**, đúng chỗ Mira định đứng.
- **Cẩn thận**: (1) Phần khảo sát là **tương quan, không phải nhân quả** — người hạnh phúc sẵn có thể là người dễ chi tiền mua dịch vụ. Chỉ phần thí nghiệm mới nói được nhân quả, và phần đó **n = 60, rất nhỏ**; đừng trình bày như một sự thật chắc nịch. (2) d = 0,24 là **cỡ tác động nhỏ** — có thật nhưng khiêm tốn; bài viết không được thổi thành "mua thời gian đổi đời". (3) Bốn nước đều là nước giàu phương Tây, giá dịch vụ so với thu nhập khác Việt Nam rất nhiều — ở Việt Nam thuê người làm việc nhà rẻ hơn tương đối, nên hướng suy luận có thể còn mạnh hơn, nhưng đó là **suy đoán chưa kiểm**.

### N-014 — Trả lương theo giờ làm người ta tình nguyện ít hơn 36%, và kém vui hơn khi đang tình nguyện ⚑

- **Nội dung**: Khi việc quy đổi thời gian ra tiền trở nên sẵn trong đầu — vì ăn lương theo giờ, hoặc chỉ vì vừa tự tính mức lương giờ của mình — người ta cân nhắc lợi ích kinh tế nặng hơn khi quyết định dùng thời gian, và **dành ít thời gian tình nguyện hơn, cũng ít sẵn lòng tình nguyện hơn**. Dùng dữ liệu khảo sát sử dụng thời gian toàn quốc của Mỹ, người ăn lương theo giờ tình nguyện **ít hơn trung bình 36%** so với người không ăn lương theo giờ. Thêm một tầng nữa: không chỉ làm ít đi, mà **làm mà không vui**. Trong một thí nghiệm hiện trường tại một giải chạy từ thiện 36 giờ, một nửa người tham gia được cho biết mức thu nhập **theo giờ** của họ trước khi chạy, nửa kia được cho biết mức **theo năm**. Nhóm nghĩ theo giờ báo mức hạnh phúc **5,87** trên thang 1–7, nhóm nghĩ theo năm báo **6,5**. Cơ chế: người bị mồi để nghĩ về thời gian *của chính mình* bằng tiền thì ít sẵn lòng tình nguyện hơn người bị mồi nghĩ về thời gian *của người khác* bằng tiền — nghĩa là hiệu ứng đi qua việc tự nhìn mình như một người làm phép tính kinh tế.
- **Nguồn**: DeVoe S.E. & Pfeffer J. — "When time is money: The effect of hourly payment on the evaluation of time", *Organizational Behavior and Human Decision Processes* 2007, 104(1), 1–13 — https://ideas.repec.org/a/eee/jobhdp/v104y2007i1p1-13.html · số 36% từ nghiên cứu 2007 của cùng hai tác giả trên *Academy of Management Journal*; số thí nghiệm giải chạy từ DeVoe & Pai trên *Journal of Applied Social Psychology*. Cả hai đọc qua: UCLA Anderson Review — https://www.anderson-review.ucla.edu/a-salaryman-and-a-wage-earner-paid-equally-walk-into-a-bar-to-volunteer/
- **Ngày công bố**: nghiên cứu gốc 2007; bài tổng thuật của UCLA Anderson không ghi ngày rõ · **Truy cập**: 26/08/2026
- **Phương pháp/cỡ mẫu**: số 36% từ **American Time Use Survey** (khảo sát sử dụng thời gian của chính phủ Mỹ) — mẫu lớn nhưng **tương quan**. Phân tích của DeVoe & Pai dùng ATUS các năm 2010, 2012, 2013, hơn 400 người có tình nguyện. Thí nghiệm giải chạy là **thí nghiệm có phân nhóm ngẫu nhiên**, cỡ mẫu không nêu trong bài tổng thuật.
- **Độ tin**: vừa — nghiên cứu gốc đăng trên tạp chí bình duyệt loại tốt (đáng lẽ `cao`), nhưng hạ một bậc vì **mới đọc qua bài tổng thuật của trường, chưa mở bài gốc**; và vì con số 36% cùng con số 5,87/6,5 đều đến qua trung gian. Nâng lên `cao` sau khi đọc được bản PDF gốc.
- **Dùng được ở đâu**: **Đây là phát hiện quan trọng nhất từ đầu dự án, và nó không phải nguyên liệu cho một bài — nó là nguyên liệu cho một quyết định sản phẩm.** `docs/00-vision.md` liệt kê "định giá làm hỏng quan hệ" là rủi ro số 2, và cho tới hôm nay đó là một lo ngại suy đoán. Bây giờ nó có bằng chứng thực nghiệm: chính cái việc mà Mira làm — hiển thị Tỷ giá đời, quy đổi mọi thứ ra giờ — là thao tác mà nghiên cứu này đo được là làm giảm hành vi vị tha và giảm niềm vui trong lúc làm việc tốt. Đưa vào bài trụ cột tuần 5 và bàn ở phần thiết kế sản phẩm.
- **Cẩn thận**: (1) Đừng đọc thành "Mira sai". Nghiên cứu nói về **việc quy đổi thường trực trở thành thói quen**, không nói về việc tính một lần để nhìn rõ. Nhưng đó chính xác là ranh giới mà Mira dễ vượt qua nhất, vì sản phẩm hiển thị con số đó mỗi ngày. (2) Ràng buộc số 2 trong `SKILL.md` — "Giờ vàng không có giá" — nay có cơ sở thực nghiệm chứ không chỉ là lựa chọn thẩm mỹ. Chỗ này đáng viết hẳn một bài. (3) Dữ liệu Mỹ; chưa có gì tương đương cho Việt Nam, và tỷ lệ lao động ăn lương theo giờ ở Việt Nam thấp hơn nhiều — nên hiệu ứng "ăn lương theo giờ" có thể yếu hơn, còn hiệu ứng "tự tính lương giờ" thì không phụ thuộc cách trả lương và vẫn áp dụng được.

### N-015 — Cập nhật N-008: đề xuất 44 giờ/tuần chưa thành luật, dự kiến trình Quốc hội tháng 10/2026

- **Nội dung**: Kiểm lại tình trạng đề xuất giảm giờ làm khu vực tư từ 48 xuống 40–44 giờ/tuần đã ghi ở N-008. Tính tới nay **chưa thành luật**. Hồ sơ dự thảo Luật đang được **Bộ Tư pháp thẩm định**, dự kiến trình Quốc hội xem xét tại **kỳ họp tháng 10/2026**. Bộ luật Lao động 2019 hiện hành vẫn giữ mức tối đa 8 giờ/ngày và 48 giờ/tuần cho khu vực tư, trong khi khu vực công đã làm 40 giờ/tuần từ năm 1999 — khoảng cách đã kéo dài 27 năm. Lộ trình được nhắc tới: 44 giờ trước, 40 giờ vào 2030.
- **Nguồn**: Tuổi Trẻ — https://tuoitre.vn/kien-nghi-lo-trinh-giam-gio-lam-khu-vuc-tu-xuong-40-44-gio-tuan-100260810200504173.htm (10/08/2026) · Tuổi Trẻ — https://tuoitre.vn/lao-dong-khu-vuc-tu-lam-40-44-gio-tuan-duoc-khong-100260813210613915.htm (13/08/2026)
- **Ngày công bố**: 10/08/2026 và 13/08/2026 · **Truy cập**: 26/08/2026
- **Phương pháp/cỡ mẫu**: không áp dụng — tường thuật tiến trình lập pháp
- **Độ tin**: vừa — báo lớn tường thuật quy trình công khai; chưa đối chiếu với cổng thông tin của Bộ Tư pháp hay Quốc hội
- **Dùng được ở đâu**: gỡ được rủi ro biên tập đã nêu ở N-008. Các bài tuần 6, tuần 7, tuần 9 **viết theo luật hiện hành 48 giờ là đúng** ở thời điểm publish. Nhưng nếu bài nào định publish sau tháng 10/2026 mà có nhắc số 48 giờ, phải kiểm lại một lần nữa.
- **Cẩn thận**: "dự kiến trình kỳ họp tháng 10/2026" là **dự kiến**, lịch lập pháp hay trượt. Đừng viết bài theo kiểu "từ cuối năm nay sẽ là 44 giờ". Đặt một mốc kiểm lại vào cuối tháng 10/2026.

### N-016 — Việt Nam hạng 45 trong Báo cáo Hạnh phúc Thế giới 2026, điểm 6,428

- **Nội dung**: Việt Nam xếp thứ **45/147** quốc gia và vùng lãnh thổ trong World Happiness Report 2026, tăng một bậc so với hạng 46 năm 2025, với điểm **6,428/10**. Xếp thứ hai Đông Nam Á sau Singapore (hạng 36, tụt hai bậc). Quỹ đạo nhiều năm: 83 (2020) → 79 (2021) → 77 (2022) → 65 (2023) → 54 (2024) → 46 (2025) → 45 (2026). Việt Nam nằm trong nhóm 21 nước có mức cải thiện đáng kể so với giai đoạn 2006–2010.
- **Nguồn**: VnExpress International dẫn World Happiness Report — https://e.vnexpress.net/news/news/vietnam-rises-in-happiness-ranking-among-top-improvers-globally-5052822.html · báo cáo do Gallup và UN Sustainable Development Solutions Network thực hiện
- **Ngày công bố**: 2026 · **Truy cập**: 26/08/2026
- **Phương pháp/cỡ mẫu**: khoảng **100.000 người trả lời trên 147 quốc gia**; mỗi nước khoảng 1.000 người mỗi năm, phỏng vấn qua điện thoại hoặc trực tiếp. Người trả lời **tự chấm điểm cuộc sống của mình trên thang 0–10** (thang Cantril).
- **Độ tin**: vừa — số gốc từ tổ chức quốc tế có phương pháp công khai (đáng lẽ `cao`), hạ một bậc vì đọc qua báo và chưa mở báo cáo gốc để lấy khoảng tin cậy. Nâng lên `cao` sau khi tải được báo cáo.
- **Dùng được ở đâu**: bài mở đầu hoặc bài trụ cột cần một mốc bối cảnh trước khi nói tới đo lường cá nhân. Điểm dùng được nhất là ở chỗ **tăng 38 bậc trong sáu năm** — nó cho phép bài viết nói rằng mặt bằng đang đi lên, và vì vậy câu hỏi đáng hỏi không còn là "làm sao khá hơn" mà là "khá hơn rồi thì đổi lấy gì".
- **Cẩn thận**: (1) Điểm là **tự chấm về cuộc sống nói chung** (life evaluation), **không phải cảm xúc hằng ngày** — khác loại với thứ N-011 và N-013 đo. Đừng đặt cạnh nhau như cùng một thứ. (2) Mỗi nước chỉ khoảng 1.000 người, nên chênh lệch một hai bậc **nằm trong sai số**; nói "tăng một bậc so với năm ngoái" là đọc quá kỹ vào nhiễu. Dùng xu hướng nhiều năm thì được, dùng chênh lệch một năm thì không. (3) Thứ hạng nói về **so sánh giữa các nước**, không nói gì về người đọc bài.

## Đã tìm nhưng không ra

1. **Bản gốc bài Whillans 2017 trên pnas.org và bài Killingsworth 2023 trên pnas.org** — cả hai đều trả HTTP 403. Đọc được qua bản PMC (cho Whillans) và qua bài tổng thuật (cho Killingsworth). Hướng đã dùng được: **PubMed Central (pmc.ncbi.nlm.nih.gov) thay cho pnas.org** — ghi lại để lần sau khỏi mất lượt.

2. **Bản PDF gốc của DeVoe & Pfeffer 2007** — trang Rotman có file PDF nhưng là bài khác (bài trên PSPB, không phải bài có con số 36%). Vì vậy N-014 đang ở `vừa` thay vì `cao`. Hướng chưa thử: tìm bài trên *Academy of Management Journal* 2007 qua kho lưu trữ của trường, hoặc qua Semantic Scholar bằng DOI thay vì bằng tìm kiếm chữ.

3. **Nghiên cứu về đánh đổi thời gian ↔ tiền trong bối cảnh Việt Nam** — chưa thử truy vấn nào trong lần chạy này, nhưng cả bốn nghiên cứu ghi hôm nay đều là dữ liệu Mỹ hoặc Tây Âu. Đây là lỗ hổng có hệ thống, không phải chuyện của một hôm — mọi bài trụ cột của Mira hiện sẽ đứng trên nền học thuật phương Tây. Cần một lần chạy dành riêng cho nó.

4. **Thư phản biện trên PNAS đối với Killingsworth và cộng sự** (https://www.pnas.org/doi/10.1073/pnas.2313712121) — thấy tiêu đề, chưa đọc nội dung vì hết lượt trong ngày. Tiêu đề nói về giả định nhân quả không phù hợp.

## Đề xuất hướng cho lần sau

1. **Đào tiếp mạch N-014 — đây là mạch có giá trị cao nhất đang mở.** Ba câu hỏi cụ thể: (a) đọc bài gốc DeVoe & Pfeffer 2007 để nâng độ tin và lấy cỡ mẫu; (b) tìm xem có nghiên cứu nào đo hiệu ứng **ngược lại** không — tức là việc nhìn rõ tỷ giá thời gian có làm người ta **dành nhiều thời gian hơn** cho việc họ coi trọng không, vì nếu có thì đó là bằng chứng bênh Mira; (c) tìm xem có ai nghiên cứu **cách trình bày** làm dịu hiệu ứng này không — đó sẽ là chỉ dẫn thiết kế trực tiếp cho màn hình Tỷ giá đời.

2. **Một lần chạy riêng cho nghiên cứu bối cảnh châu Á / Việt Nam** về thời gian, tiền và hài lòng cuộc sống (điểm 3 ở mục trên). Nếu quả thật không có, thì bản thân việc đó là phát hiện đáng ghi, và các bài trụ cột phải nói rõ là đang dẫn nghiên cứu nước ngoài.

3. **Vẫn còn tồn từ hôm 25/08, chưa làm**: tải PDF Báo cáo Điều tra lao động việc làm 2024 (để nâng N-004 lên `cao`), và tìm dữ liệu vi mô VHLSS để lấy trung vị/phân vị thu nhập (để vá N-003). Cả hai đều cần tải file từ nso.gov.vn thay vì đọc trang landing.

4. **Nhóm 4 (tiết kiệm, đầu tư, quy tắc 4%) và nhóm 5 (thời gian với con và bố mẹ) vẫn chưa đụng.** Nhóm 5 giờ đáng ưu tiên hơn trước, vì N-014 vừa cho thấy chỗ giao giữa "định giá thời gian" và "quan hệ" là chỗ nhiều nguyên liệu nhất.

5. **Đặt mốc kiểm lại N-015 vào cuối tháng 10/2026** — sau kỳ họp Quốc hội.
