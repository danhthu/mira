---
name: mira-nghien-cuu
description: Đi tìm nguyên liệu thật từ bên ngoài cho Mira — số liệu Việt Nam về giờ làm/thu nhập/chi phí sống, nghiên cứu học thuật về thời gian và hạnh phúc, đối thủ cùng ngách, từ khoá SEO tiếng Việt, và bằng chứng phản biện lại chính luận điểm của Mira. Dùng skill này mỗi khi người dùng nói "nghiên cứu", "tìm số liệu", "tìm nguồn", "kiểm chứng con số", "đối thủ có gì", "chủ đề nào đang hot", "phản biện lại luận điểm này", "chạy job nghiên cứu", "quét nguồn hôm nay" — và cả khi một scheduled task gọi tới để chạy vòng nghiên cứu định kỳ. Cũng dùng khi đang viết bài blog Mira mà cần một con số có nguồn truy vết được thay vì số ước chừng. KHÔNG dùng cho phân tích yêu cầu phần mềm từ tài liệu nội bộ — việc đó thuộc skill phan-tich-yeu-cau.
---

# Mira — nghiên cứu nguyên liệu nội dung

## Việc này khác phân tích ở chỗ nào

Phân tích yêu cầu (`quy-trinh-phan-mem:phan-tich-yeu-cau`) nhận một tập tài liệu hữu hạn, có thẩm quyền, rồi cấu trúc hoá nó. Nghiên cứu thì ngược lại: đầu vào vô hạn, không ai có thẩm quyền, phần lớn là nhiễu. Nên phần khó không phải là tìm ra thứ gì đó — mà là **quyết định thứ tìm được có đủ tin để đưa vào bài không**, và ghi lại đủ dấu vết để ba tháng sau còn truy ngược được.

Đó là toàn bộ lý do skill này tồn tại. Một con số không nguồn thì tệ hơn không có số, vì nó tạo cảm giác chắc chắn giả.

## Bối cảnh Mira — đọc trước khi tìm

Mira đo hai thứ: người dùng còn bao nhiêu giờ cho người quan trọng, và đã mua được bao nhiêu tự do. Ba chỉ số lõi: **Giờ vàng** (h/tuần), **Tỷ giá đời** (đ/giờ), **Vốn tự do** (số tháng sống được không cần đi làm).

Ba ràng buộc từ `docs/00-vision.md` chi phối mọi thứ tìm về:

1. **Giọng điềm đạm, không phán xét.** Nguồn nào có giọng huấn luyện viên, giật gân, "5 thói quen của người thành công" — ghi nhận số liệu nếu số liệu tốt, nhưng đừng bê giọng về.
2. **Giờ vàng không có giá.** Bất cứ nghiên cứu nào quy đổi thời gian với con/bố mẹ ra tiền đều là nguyên liệu cho lane phản biện, không phải nguyên liệu cho bài chính.
3. **Ba rủi ro đã biết** (đồng hồ cát gây tê liệt, định giá làm hỏng quan hệ, vốn tự do làm người ta thấy tệ) — nếu tìm được bằng chứng thực nghiệm cho hoặc chống ba cái này, đó là phát hiện có giá trị cao nhất, đánh dấu `⚑` trong file.

Bối cảnh đầy đủ: `docs/00-vision.md`, `docs/03-formulas.md` (công thức thật), `docs/07-blog-120-days.md` (lịch 120 bài), `growth/content/HANDOFF.md` (đã viết tới đâu, luật anti-AI).

## Trước khi gõ truy vấn đầu tiên

Ba bước này ngăn skill lặp lại chính nó ngày qua ngày — thất bại thường gặp nhất của một job nghiên cứu tự động:

1. **Đọc `docs/nguon/nghien-cuu/INDEX.md`.** Nó liệt kê mọi phát hiện đã ghi, kèm mã `N-xxx`. Nếu chưa có file này, tạo nó.
2. **Xác định lane hôm nay** theo bảng xoay vòng bên dưới (lấy thứ trong tuần từ ngày thật, đừng đoán).
3. **Đọc file lane gần nhất** trong `docs/nguon/nghien-cuu/` để biết lần trước đã moi hướng nào, chỗ nào bí. Lặp lại truy vấn cũ là lãng phí; đi tiếp chỗ lần trước dừng mới là giá trị.

## Bốn lăng kính và lịch xoay vòng

Bốn lane cùng chạy mỗi ngày sẽ ra file dài không ai đọc. Xoay vòng để mỗi ngày một file gọn, đọc hết trong ba phút:

| Thứ | Lane | Đọc hướng dẫn |
|---|---|---|
| Hai, Tư, Sáu | Nguyên liệu blog | `references/lane-nguyen-lieu.md` |
| Ba | Đối thủ và sản phẩm tương tự | `references/lane-doi-thu.md` |
| Năm | Xu hướng và từ khoá SEO | `references/lane-seo.md` |
| Bảy | Phản biện | `references/lane-phan-bien.md` |
| Chủ nhật | Tổng hợp tuần | mục "Tổng hợp tuần" bên dưới |

Lane nguyên liệu chiếm ba ngày vì đó là thứ 92 bài draft trong `growth/content/vi/` đang thiếu — theo `growth/content/HANDOFF.md`, số liệu trong bài phải bắt nguồn từ nguồn thật chứ không phải số tròn chọn cho khớp tiêu đề.

Nếu người dùng gọi tay và chỉ định lane ("chạy lane đối thủ đi"), làm theo họ, bỏ qua lịch.

## Luật nguồn

Đọc `references/nguon-va-do-tin.md` trước lần chạy đầu tiên. Ba điều cốt lõi, tóm ở đây để khỏi phải mở file mỗi lần:

- **Mỗi con số phải có: URL + ngày công bố + ngày mình truy cập + cơ quan/tác giả + cỡ mẫu hoặc phương pháp nếu là khảo sát.** Thiếu một trong số đó thì hạ một bậc độ tin và ghi rõ thiếu gì.
- **Ba bậc độ tin: `cao` / `vừa` / `thấp`.** Cao = cơ quan thống kê nhà nước, tổ chức quốc tế, tạp chí bình duyệt. Vừa = báo lớn có dẫn nguồn gốc, báo cáo doanh nghiệp có phương pháp. Thấp = blog, mạng xã hội, báo không dẫn nguồn. Số bậc `thấp` **không được dùng làm số chính trong bài**, chỉ làm gợi ý để đi tìm nguồn gốc.
- **Phân biệt "số đo được" với "số suy ra".** Nếu mình lấy số A nhân số B để ra số C, C là số suy ra — ghi rõ phép tính, đừng trình bày như số đo được.

## Khuôn file đầu ra

Mỗi lần chạy ghi đúng một file: `docs/nguon/nghien-cuu/YYYY-MM-DD-<lane>.md`, với `<lane>` là một trong `nguyen-lieu`, `doi-thu`, `seo`, `phan-bien`, `tong-hop-tuan`.

```markdown
# <Lane> — <ngày dd/mm/yyyy>

> Chạy bởi skill `mira-nghien-cuu`. Lane: <lane>. Số truy vấn đã dùng: <n>.

## Tóm tắt ba dòng

<Ba dòng. Người đọc lướt chỉ đọc phần này. Nếu hôm nay không tìm được gì
đáng kể, nói thẳng "không tìm được gì mới đáng ghi" — đừng độn cho đầy.>

## Phát hiện

### N-042 — <tiêu đề phát hiện> ⚑
- **Nội dung**: <con số hoặc luận điểm, một đến ba câu>
- **Nguồn**: <tên cơ quan/tác giả> — <URL>
- **Ngày công bố**: <ngày> · **Truy cập**: <ngày mình đọc>
- **Phương pháp/cỡ mẫu**: <nếu có; ghi "không nêu" nếu nguồn không nói>
- **Độ tin**: cao | vừa | thấp — <một câu vì sao xếp bậc đó>
- **Dùng được ở đâu**: <bài nào trong docs/07-blog-120-days.md, hoặc chỗ nào
  trong sản phẩm; ghi "chưa rõ chỗ dùng" nếu chưa nghĩ ra — đừng bịa liên hệ>
- **Cẩn thận**: <chỉ ghi khi có: số cũ, mẫu lệch, nguồn có lợi ích liên quan,
  đơn vị không khớp bối cảnh VN...>

## Đã tìm nhưng không ra

<Liệt kê hướng đã moi mà rỗng. Phần này quan trọng ngang phần phát hiện:
nó ngăn lần chạy sau đâm lại đúng bức tường đó.>

## Đề xuất hướng cho lần sau

<Một đến ba hướng cụ thể, kèm lý do.>
```

Dấu `⚑` chỉ dùng cho phát hiện chạm trực tiếp vào ba rủi ro đã biết trong `00-vision.md`, hoặc lật ngược một con số đang được dùng trong bài đã draft. Đánh dấu bừa thì dấu mất nghĩa.

Sau khi ghi file, **thêm dòng vào `docs/nguon/nghien-cuu/INDEX.md`** cho mỗi phát hiện mới:

```markdown
| N-042 | 25/08/2026 | nguyen-lieu | Giờ làm trung bình VN 2025 | cao | [file](2026-08-25-nguyen-lieu.md) |
```

Mã `N-xxx` chạy liên tục, không reset theo ngày hay theo lane — lấy số lớn nhất trong INDEX rồi cộng một.

## Tổng hợp tuần (Chủ nhật)

Không tìm gì mới. Đọc sáu file trong tuần rồi trả lời ba câu:

1. **Phát hiện nào đủ chắc để đưa vào bài ngay tuần tới?** Kèm mã `N-xxx` và tên bài cụ thể.
2. **Con số nào đang dùng trong bài draft mà tuần này tìm được bằng chứng ngược?** Đây là mục quan trọng nhất — sai số trong bài đã publish thì gỡ rất đắt.
3. **Hướng nào moi ba lần vẫn rỗng?** Ngừng moi, ghi lại lý do.

## Ranh giới — đừng vượt

Skill này **chỉ ghi vào `docs/nguon/nghien-cuu/`**. Cụ thể là không:

- Sửa file trong `growth/content/vi/**` hay `content-queue.json`. Nghiên cứu ra nguyên liệu; quyết định đưa vào bài nào là việc của người, ở một phiên khác. Trộn hai việc này lại thì một job tự động có thể lặng lẽ đổi nội dung 92 bài draft.
- Sửa `docs/nguon/kiem-ke*.md` — đó là kiểm kê nguồn đặc tả của skill `phan-tich-yeu-cau`, khác loại hoàn toàn.
- Chạm vào `code/`.
- `git commit`, `git push`. `PROJECT.yaml` cấm tự động commit.
- Đăng, gửi, hay chia sẻ bất cứ thứ gì ra ngoài.

Và một ranh giới về nội dung: **không chép nguyên văn từ nguồn**. Tóm ý bằng lời mình, trích tối đa một câu ngắn trong ngoặc kép kèm nguồn khi câu chữ gốc thực sự quan trọng. Nguyên liệu chép về sẽ chui vào bài blog và thành vấn đề bản quyền của người dùng.

## Khi nguồn nói ngược nhau

Đừng chọn bên rồi ghi một số. Ghi cả hai, mỗi cái một mục `N-xxx`, và thêm một dòng `**Mâu thuẫn với**: N-xxx` ở cả hai. Hai con số đánh nhau là thông tin — nó nói rằng đây là chỗ không nên phát biểu chắc nịch trong bài. Xoá một bên đi là vứt mất thông tin đó.

## Chi phí mỗi lần chạy

Nhắm **8–15 truy vấn tìm kiếm** và **3–8 phát hiện** một lần chạy. Đây là job chạy hằng ngày, không phải một bản báo cáo thị trường. Nếu một hướng hay và cần đào sâu, ghi vào "Đề xuất hướng cho lần sau" rồi dừng — mai đào tiếp, còn hơn hôm nay ra một file 40 trang không ai đọc.

Ít mà chắc hơn nhiều mà loãng. Một file có hai phát hiện độ tin `cao` giá trị hơn file có mười lăm phát hiện `thấp`.
