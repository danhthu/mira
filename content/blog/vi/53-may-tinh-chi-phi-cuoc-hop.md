---
title: "[Công cụ] Máy tính chi phí cuộc họp"
slug: "may-tinh-chi-phi-cuoc-hop"
altSlug: null
locale: "vi"
date: "2026-10-08"
draft: true
type: "tool"
week: 8
day: 53
description: "Nhập thời lượng và số người, nhận về số giờ đời cùng số tiền tương đương. Có thêm hai khoản mà lịch làm việc không bao giờ hiển thị."
tags: ["ty-gia-doi", "noi-khong", "cong-cu"]
image: null
image_prompt: "A phone screen face-up on a stack of printed meeting agendas beside a cup of Vietnamese iced coffee on an office desk, morning light, deep green and gold color grade, no text, documentary photography style"
cta: "meeting-cost-calculator"
widget: "meeting-cost-calculator"
---

Nhập ba con số: thời lượng, số người, tỷ giá đời trung bình. Nhận về hai con số: giờ đời và tiền.

*(Công cụ hiển thị ở đây. Nếu chưa có tỷ giá đời, công cụ dẫn sang bài tính tỷ giá đời trước, vì con số đầu vào đó quyết định toàn bộ phần còn lại.)*

## Hai công thức, một cái thật hơn cái kia

```
Giờ đời      = thời lượng × số người
Chi phí      = giờ đời × tỷ giá đời
```

Đây là bản cơ bản, và nó thiếu. Một cuộc họp không bắt đầu lúc nó bắt đầu.

Trước cuộc họp có phần đọc lại tài liệu, mở file, tìm cái link trong nhóm chat. Sau cuộc họp có phần ngồi lại vài phút để nhớ mình đang dở việc gì. Lấy tròn mỗi phía 15 phút, tức thêm nửa giờ cho mỗi người:

```
Giờ đời thật = (thời lượng + 0,5) × số người
```

## Chạy thử với cuộc họp hôm qua

Một tiếng, tám người, tỷ giá đời 115 nghìn.

Bản cơ bản: 1 nhân 8 là 8 giờ đời. 8 nhân 115 nghìn là 920 nghìn.

Bản có chuẩn bị và lấy lại nhịp: 1 cộng 0,5 là 1,5 giờ mỗi người. 1,5 nhân 8 là 12 giờ đời. 12 nhân 115 nghìn là 1.380.000.

Nếu cuộc họp này lặp lại hằng tuần: 12 nhân 52 là 624 giờ đời một năm. 624 nhân 115 nghìn ra khoảng 71,8 triệu.

Bảy mươi mốt triệu tám cho một cuộc họp định kỳ mà phần lớn nơi làm việc không bao giờ rà lại. Đây là khoản chi duy nhất tôi biết có thể chạy nhiều năm liền mà không ai ký duyệt lần nào.

## Dùng để cắt, không phải để bỏ

Công cụ này hữu ích nhất khi bạn thử hai lần liên tiếp với hai kịch bản.

Giữ nguyên tám người, cắt xuống ba mươi phút: (0,5 cộng 0,5) nhân 8 là 8 giờ đời.

Giữ nguyên một tiếng, mời bốn người, bốn người còn lại nhận biên bản: 1,5 nhân 4 là 6 giờ đời.

Làm cả hai: 1 nhân 4 là 4 giờ đời. Từ 12 xuống 4, tức còn một phần ba, mà nội dung cuộc họp gần như không đổi.

Cắt số người thường hiệu quả hơn cắt thời lượng, vì nó tác động thẳng vào phép nhân. Nhưng nó cũng khó hơn về mặt quan hệ, vì không mời ai đó là một tín hiệu, còn rút ngắn thì không.

## Ranh giới của công cụ này

Chỉ dùng cho giờ công việc. Cuộc họp, buổi đào tạo, chuyến công tác, buổi tiếp khách bắt buộc — những thứ tồn tại vì công việc, có thể quy ra tiền, và nên quy.

Đừng dùng nó cho bữa cơm gia đình bốn người. Bốn người nhân một tiếng ra bốn giờ, và bốn giờ đó không nhân với con số nào cả. Công cụ không có ô để bạn thử làm việc đó, và đấy là chủ ý.

Cuộc họp định kỳ dài nhất trong lịch của bạn, nếu chạy con số một năm của nó, bạn có đủ tự tin để đưa con số đó cho người đã đặt lịch không?
