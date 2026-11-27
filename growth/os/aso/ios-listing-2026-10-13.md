# App Store listing — Mira — 2026-10-13 — v1

> Trạng thái: DRAFT · Task: T-0018 · Nguồn từ khoá: growth/os/research/keywords-2026-10-13.csv (cluster aso, con, bo-me) · Nguồn tính năng: docs/05-v1-spec.md, GAME_PROFILE.md (commit b385e3b)
>
> **Đây là listing cho bản V1 tương lai, không mô tả app hiện tại.** Code/fe hiện là khung Batify (TimeTracker, HabitTracker, Work, Emotion, Trading): chưa có Giờ vàng, Đồng hồ cát, Khoảnh khắc, widget, xuất JSON (GAME_PROFILE, bảng "Tính năng V1 ↔ code": tất cả "chưa có"). Mọi tính năng dưới đây lấy từ spec V1 và chỉ được đăng khi build V1 thật chạy đúng như viết. Tỷ giá đời và Vốn tự do thuộc V2 (docs/04-roadmap.md) vì vậy không có trong listing này.
>
> **Điều kiện chặn trước khi khai hoặc đăng**: T-0023. App.tsx hàm setup đang xoá dữ liệu và nạp dữ liệu mẫu mỗi lần mở. Chưa sửa thì câu "dữ liệu nằm trên máy", Data safety và Privacy label đều không được khai.

## Bảng đếm ký tự (đếm bằng node, code point)

| Trường | Giới hạn | Đã dùng | OK |
|---|---|---|---|
| Name A | 30 | 15 | OK |
| Name B | 30 | 24 | OK |
| Subtitle A | 30 | 24 | OK |
| Subtitle B | 30 | 23 | OK |
| Promotional text | 170 | 136 | OK |
| Keywords | 100 | 91 | OK |
| Description | 4000 | 1631 | OK |

## Name (≤ 30), hai biến thể

A (15):
```
Mira – giờ vàng
```
B (24):
```
Mira: giờ bên người thân
```

## Subtitle (≤ 30), hai biến thể

A (24):
```
Thời gian cho người thân
```
B (23):
```
Ghi nhanh, không streak
```

Ghép: Name A + Subtitle A, Name B + Subtitle B khi chạy Product Page Optimization. Keywords bên dưới đã loại mọi từ có trong cả hai cặp (giờ, vàng, bên, người, thân, thời, gian, cho, ghi, nhanh, không, streak).

## Promotional text (≤ 170), 136 ký tự

```
Hôm nay bạn có bao nhiêu giờ vàng bên người quan trọng? Ghi dưới 60 giây, dữ liệu nằm trên máy, không streak, không thông báo trách móc.
```

Không ghi "đang mở beta" vì chưa có beta.

## Keywords (≤ 100), 91 ký tự

```
khoảnh khắc,nhật ký,con,bố mẹ,gia đình,bạn đời,đồng hồ cát,cân bằng,theo dõi,offline,widget
```

Dấu phẩy không khoảng trắng; không lặp từ trong name/subtitle (đã kiểm bằng script). Không tên đối thủ (Guideline 2.3.7). Bản không dấu (gia dinh, bo me) chưa thêm vì chưa có số đo.

## Description (≤ 4000), 1631 ký tự

```
Bạn còn nhớ lần gần nhất ngồi ăn tối cùng bố mẹ, không nhìn điện thoại, là khi nào? Mira giữ lại những giờ như thế, bằng số bạn tự ghi, không bằng lời nhắc.

Mira là app tiếng Việt cho người đi làm bận rộn muốn biết mình thật sự ở cạnh người quan trọng bao lâu. Màn hình đầu tiên chỉ có một dòng: "Hôm nay bạn có 2 giờ vàng." Không bảng điều khiển, không biểu đồ, không so sánh với tuần trước.

GIỜ VÀNG
Số giờ mỗi tuần bạn ở cùng con, bố mẹ, bạn đời, bạn thân hoặc chính mình. Bấm Bắt đầu để đồng hồ chạy nền, hoặc ghi sau bằng 30 phút, 1 giờ, 2 giờ. Tuần chưa đủ dữ liệu, Mira ghi "đang tính" thay vì đoán.

KHOẢNH KHẮC
Gõ một dòng, thêm ảnh nếu muốn, chọn người liên quan. Mọi thứ xếp thành dòng thời gian theo tháng. Hết tháng, bạn xem lại như một đoạn trình chiếu ngắn.

ĐỒNG HỒ CÁT, DO BẠN BẬT
Với từng người, Mira ước tính còn khoảng bao nhiêu lần gặp nếu nhịp gặp hiện tại giữ nguyên. Tính năng tắt sẵn. Mira hỏi tuổi chỉ khi bạn bật, và nói thẳng rằng con số có thể nặng lòng. Bỏ qua cũng được.

NHẬP DƯỚI 60 GIÂY
Widget trên màn hình chính cho ba người bạn gặp nhiều nhất. Chạm một lần là bắt đầu. Có lối tắt ghi một giờ với một người. Mỗi lần ghi tối đa 3 chạm.

NHỮNG ĐIỀU MIRA CAM KẾT
Không streak. Không huy hiệu. Không màu đỏ cảnh báo. Không thông báo trách móc.
Không tài khoản, không máy chủ, không công cụ phân tích. Dữ liệu ở trên máy của bạn.
Xuất ra JSON hoặc xoá toàn bộ trong Cài đặt.
Miễn phí, không quảng cáo.

MIRA KHÔNG LÀM GÌ
Mira không quản lý công việc, không ghi sổ chi tiêu, không liên kết ngân hàng, không tư vấn đầu tư. Chỉ giờ và khoảnh khắc.

Tối nay, nếu chỉ ghi được một giờ, bạn chọn giờ nào?
```

## Từ khoá đã gài (đối chiếu CSV)

| Từ khoá | Xuất hiện ở | Nguồn CSV |
|---|---|---|
| app theo dõi thời gian với gia đình | Subtitle A, keywords "gia đình" | dòng 43 |
| app ghi chi tiêu offline | chỉ lấy ý "offline" trong keywords (V1 không có chi tiêu) | dòng 45 |
| còn bao nhiêu lần gặp bố mẹ | keywords "bố mẹ"; đồng hồ cát opt-in | dòng 36, rủi ro hook |
| lịch tuần cuộc đời, đồng hồ đếm ngược cuộc đời | không dùng: gần chủ đề cái chết, Mira tránh giọng đó | dòng 47, 48 |

## Screenshot brief (8 tấm, 6.7" 1290×2796 và 6.5" 1284×2778), mockup thiết kế cho V1

Cùng 8 tấm với Play, xuất hai cỡ. Ảnh nộp cần chụp từ build thật (Guideline 2.3.3). Không ảnh trẻ em thật. Số ở tấm 1 là dữ liệu mẫu minh hoạ.

| # | Màn hình nguồn | Caption (ký tự) | Dữ liệu mẫu | Trạng thái |
|---|---|---|---|---|
| 1 | Hôm nay (docs/05 Màn hình 1); không có trong code/fe | Hôm nay có 2 giờ vàng (21) | Dòng chính "Hôm nay bạn có 2 giờ vàng"; 2 avatar mẫu: Con 90 phút, Mẹ 30 phút; nút Bắt đầu và Ghi nhanh | CHỜ BUILD, mockup thiết kế V1 |
| 2 | Bắt đầu + chọn người (docs/05 Màn hình 1); không có trong code/fe | Bắt đầu, chọn người, đếm giờ (28) | Chọn Con; đồng hồ 00:42:10 chạy nền | CHỜ BUILD, mockup thiết kế V1 |
| 3 | Ghi nhanh (docs/05 Màn hình 1); không có trong code/fe | Ghi sau chỉ với 3 chạm (22) | Chip 30p / 1h / 2h / tự nhập; chọn Bố mẹ + 1h | CHỜ BUILD, mockup thiết kế V1 |
| 4 | Khoảnh khắc (docs/05 Màn hình 3); không có trong code/fe | Giữ lại khoảnh khắc (19) | Dòng thời gian tháng 8, 3 mục chữ + 1 ảnh minh hoạ (không ảnh trẻ thật); banner "Tháng 8 của bạn có 12 khoảnh khắc" | CHỜ BUILD, mockup thiết kế V1 |
| 5 | Đồng hồ cát, đã bật cho 1 người (docs/05 Màn hình 2); không có trong code/fe | Bật hoặc tắt, tuỳ bạn (21) | Card "Mẹ, gặp 4 lần/năm, 2 ngày mỗi lần, còn khoảng 68 lần gặp" kèm chữ "ước tính"; nút Đặt lịch gọi và Ẩn card. Hook bố mẹ có rủi ro nặng nề (docs/06 §8) vì vậy không đặt ở tấm 1 | CHỜ BUILD, mockup thiết kế V1 |
| 6 | Khối cam kết (nền chữ, không phải màn hình app); không có trong code/fe | Không streak. Dữ liệu trên máy (30) | 3 dòng: không streak, không thông báo trách móc, dữ liệu nằm trên máy. Chỉ dựng sau khi T-0023 xong | CHỜ BUILD, mockup thiết kế V1 |
| 7 | Widget màn hình chính (docs/05 mục Widget); không có trong code/fe | Chạm một lần là bắt đầu (23) | Widget 3 avatar (Con, Mẹ, Bạn đời), tên giả | CHỜ BUILD, mockup thiết kế V1 |
| 8 | Cài đặt (docs/05 Màn hình 4); không có trong code/fe | Giới nghiêm 21 giờ, Ngày trắng (30) | Giới nghiêm 21:00, Ngày trắng tắt, Xuất JSON, Xoá toàn bộ dữ liệu | CHỜ BUILD, mockup thiết kế V1 |

## A/B ý tưởng (Product Page Optimization, chưa chạy; ≥ 500 visitors mỗi biến thể)

| Biến thể | Góc | Subtitle | Screenshot #1 | Giả thuyết |
|---|---|---|---|---|
| A | B · thời gian với người thân | Thời gian cho người thân | Hôm nay bạn có 2 giờ vàng | Nêu thẳng đối tượng, dễ hiểu |
| B | Cam kết riêng tư | Ghi nhanh, không streak | Khối cam kết (tấm 6 đưa lên đầu) | Người ngại streak và theo dõi phản ứng tốt hơn với cam kết |

## Rủi ro chính sách (rà từ hiểu biết sẵn có, chưa kiểm lại bản hiện hành)

- Guideline 2.3 Accurate Metadata: mô tả và ảnh cần đúng app; mô tả V1 chỉ đăng khi V1 chạy. https://developer.apple.com/app-store/review/guidelines/#accurate-metadata
- Guideline 5.1 Privacy: nutrition label "Data Not Collected" chỉ khi T-0023 xong và rà code/fe không SDK (Sentry đã comment ở App.tsx; chưa rà hết package). Khoảnh khắc có ảnh: cần chuỗi mục đích NSPhotoLibraryUsageDescription, ảnh lưu cục bộ. https://developer.apple.com/app-store/review/guidelines/#data-collection-and-storage
- Tài chính: không tư vấn đầu tư, không liên kết ngân hàng; V1 không chạm tiền. Ghi rõ trong Review notes.
- Ảnh trẻ em: không dùng ảnh trẻ thật.

## Tên vỏ Batify trong app.json (đề xuất, Founder chốt)

| Trường | Hiện tại | Đề xuất |
|---|---|---|
| expo.name | DailyOps | Mira |
| expo.slug | DailyOps | mira |
| ios.bundleIdentifier | com.wai.dailyops | com.trady360.mira (hoặc vn.mira.app nếu Founder dùng tên miền khác) |
| android.package | (chưa có) | cùng chuỗi với bundle id |

Tên miền chưa chốt (T-0002) vì vậy id này chỉ là đề xuất. Package id Play và Bundle ID Apple không đổi được sau khi phát hành. Approval code_change tạo kèm ref T-0018. Không sửa code/fe/app.json.

## Checklist App Store Connect (điền khi có app)

- [ ] Bundle ID khớp app.json đã đổi · [ ] Category: Lifestyle (đề xuất) · [ ] Age rating
- [ ] Privacy policy URL: CHỜ FOUNDER · [ ] App privacy (sau T-0023) · [ ] Review notes
- [ ] Tài khoản App Store Connect: cần `approval request --kind access`
