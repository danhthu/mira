# Google Play listing — Mira — 2026-10-13 — v1

> Trạng thái: DRAFT · Task: T-0018 · Nguồn từ khoá: growth/os/research/keywords-2026-10-13.csv (cluster aso, con, bo-me) · Nguồn tính năng: docs/05-v1-spec.md, GAME_PROFILE.md (commit b385e3b)
>
> **Đây là listing cho bản V1 tương lai, không mô tả app hiện tại.** Code/fe hiện là khung Batify (TimeTracker, HabitTracker, Work, Emotion, Trading): chưa có Giờ vàng, Đồng hồ cát, Khoảnh khắc, widget, xuất JSON (GAME_PROFILE, bảng "Tính năng V1 ↔ code": tất cả "chưa có"). Mọi tính năng dưới đây lấy từ spec V1 và chỉ được đăng khi build V1 thật chạy đúng như viết. Tỷ giá đời và Vốn tự do thuộc V2 (docs/04-roadmap.md) vì vậy không có trong listing này.
>
> **Điều kiện chặn trước khi khai hoặc đăng**: T-0023. App.tsx hàm setup đang xoá dữ liệu và nạp dữ liệu mẫu mỗi lần mở. Chưa sửa thì câu "dữ liệu nằm trên máy", Data safety và Privacy label đều không được khai.

## Bảng đếm ký tự (đếm bằng node, code point)

| Trường | Giới hạn | Đã dùng | OK |
|---|---|---|---|
| Title A | 30 | 28 | OK |
| Title B | 30 | 30 | OK |
| Short A | 80 | 72 | OK |
| Short B | 80 | 76 | OK |
| Full description | 4000 | 2075 | OK |

## Title (≤ 30), hai biến thể

A (28):
```
Mira – giờ vàng bên gia đình
```
B (30):
```
Mira: thời gian cho người thân
```

## Short description (≤ 80), hai biến thể

A (72), góc nhập nhanh và cam kết:
```
Ghi giờ bên con, bố mẹ dưới 60 giây. Dữ liệu nằm trên máy, không streak.
```
B (76), góc khoảnh khắc:
```
Nhật ký khoảnh khắc và giờ bên người quan trọng. Ghi nhanh, không trách móc.
```

## Full description (≤ 4000), 2075 ký tự

```
Hôm nay bạn đã ở bên người quan trọng bao nhiêu giờ? Nhiều người trả lời bằng cảm giác. Mira trả lời bằng con số do chính bạn ghi.

Mira là app tiếng Việt giúp bạn giữ lại thời gian cho con, bố mẹ, bạn đời, bạn thân và cả bản thân. Bạn ghi, Mira cộng lại, rồi đặt con số lên màn hình đầu tiên: "Hôm nay bạn có 2 giờ vàng".

Mira làm gì
• Giờ vàng: số giờ thật sự bên người quan trọng trong tuần, cộng từ những lần bạn ghi. Tuần chưa đủ dữ liệu thì Mira nói là đang tính, không đoán thay bạn.
• Bắt đầu và ghi nhanh: bấm Bắt đầu, chọn người, đồng hồ chạy nền. Hoặc ghi sau với 30 phút, 1 giờ, 2 giờ, hay số tự nhập. Mỗi lần ghi tối đa 3 chạm.
• Khoảnh khắc: một dòng chữ, thêm ảnh nếu muốn, gắn với người liên quan. Các mục xếp thành dòng thời gian theo tháng. Cuối tháng bạn xem lại dưới dạng trình chiếu.
• Đồng hồ cát: ước tính còn khoảng bao nhiêu lần gặp một người, từ tuổi và tần suất bạn nhập. Mặc định tắt. Bạn bật cho từng người, và tắt lại bất cứ lúc nào, vì con số này có thể làm bạn thấy nặng lòng. Đây là ước tính, chứ không là bản án.
• Widget màn hình chính: ba người bạn hay gặp nhất, chạm một lần là bắt đầu đếm.
• Giới nghiêm buổi tối (mặc định 21 giờ) và Ngày trắng (chọn thứ trong tuần, mặc định tắt).

Dùng trong dưới 60 giây mỗi ngày
Lần đầu, bạn chọn người muốn giữ thời gian cho, gõ tên, chọn tần suất muốn gặp. Bỏ qua bước nào cũng được. Mira không hỏi thu nhập, không hỏi tuổi lúc cài đặt. Sau đó mỗi ngày chỉ cần vài chạm. Mira cần bạn sống nhiều hơn là mở app nhiều.

Cam kết
• Không streak, không huy hiệu, không màu đỏ trách móc.
• Không thông báo kiểu "bạn chưa ghi hôm nay".
• Dữ liệu nằm trên máy của bạn. Mira không có tài khoản, không gửi dữ liệu lên máy chủ, không dùng công cụ phân tích.
• Xuất toàn bộ dữ liệu ra tệp JSON, hoặc xoá hết bằng một thao tác trong Cài đặt.
• Miễn phí, không quảng cáo.

Mira không thay cho gì
Mira không quản lý công việc, không là sổ kế toán, không liên kết ngân hàng, không tư vấn đầu tư và không có mạng xã hội. Nó chỉ đếm giờ và giữ khoảnh khắc.

Nếu mở app vào tối nay, bạn muốn ghi lại giờ nào đầu tiên?
```

Chú thích: "dữ liệu nằm trên máy", "không dùng công cụ phân tích", "miễn phí, không quảng cáo" chỉ đúng khi T-0023 xong và V1 không có SDK hay quảng cáo. Khi V2 trả phí 59k/tháng, bản mô tả V2 cần thêm "có mua trong ứng dụng".

## Từ khoá đã gài (đối chiếu CSV)

| Từ khoá | Xuất hiện ở | Nguồn CSV |
|---|---|---|
| app theo dõi thời gian với gia đình | Title A ("giờ vàng bên gia đình"), short A | dòng 43 (aso) |
| thời gian cho người thân | Title B | cách đặt suy luận, chưa đo |
| app quản lý thời gian tiếng việt | full description ("app tiếng Việt", "giờ") | dòng 42 |
| app không streak không thông báo trách móc | short A/B, mục Cam kết | dòng 50 (brand, để nhớ giọng) |
| còn bao nhiêu lần gặp bố mẹ | không đưa vào title/short (rủi ro hook, docs/06 §8); chỉ ở đồng hồ cát opt-in | dòng 36 |

Không gài: "tính thu nhập theo giờ", "tự do tài chính", "quản lý chi tiêu" vì tính năng thuộc V2 và tránh tranh với app chi tiêu. "cân bằng công việc cuộc sống app" (dòng 49) bỏ vì V1 không đo công việc. Volume mọi từ khoá "chưa đo": kiểm gợi ý tự động trên Play Console khi có tài khoản.

## Screenshot brief (8 tấm điện thoại, 1080×1920), mockup thiết kế cho V1

Không màn hình nào tồn tại trong code/fe. Mockup chỉ để duyệt thiết kế; ảnh nộp lên Play cần chụp từ build thật (ảnh cần phản ánh app). Không dùng ảnh trẻ em thật. Nền xanh đậm, số vàng ấm theo growth/brand/voice.md. Dựng ảnh: creative-studio qua CGO. Số ở tấm 1 là dữ liệu mẫu minh hoạ, không phải số người dùng thật.

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

Feature graphic 1024×500 và icon 512×512: chờ creative-studio (growth/brand chưa có logo).

## A/B ý tưởng (chưa chạy; chỉ khi ≥ 500 visitors mỗi biến thể)

| Biến thể | Góc (docs/06 §2) | Title | Short | Giả thuyết | Chỉ số |
|---|---|---|---|---|---|
| A | B · thời gian với con, bố mẹ | Mira – giờ vàng bên gia đình | Ghi giờ bên con, bố mẹ dưới 60 giây. Dữ liệu nằm trên máy, không streak. | "Gia đình" và cam kết dữ liệu trên máy tạo niềm tin nhanh hơn | store_visitors → installs |
| B | B nhẹ, thiên khoảnh khắc | Mira: thời gian cho người thân | Nhật ký khoảnh khắc và giờ bên người quan trọng. Ghi nhanh, không trách móc. | "Nhật ký khoảnh khắc" ít nặng cảm xúc hơn "giờ vàng" lạ tai | store_visitors → installs |
| C | C · tỷ giá đời | chưa thử | chưa thử | V1 chưa có Tỷ giá đời | không áp dụng |

Góc A (tự do tài chính) và C chưa thử được ở V1; xem mục tiếp theo.

## Mâu thuẫn cần Founder

Blog, chiến lược nội dung và phần lớn từ khoá xoay quanh Tỷ giá đời và Vốn tự do (V2). V1 chỉ có Giờ vàng, Khoảnh khắc, Đồng hồ cát. Người đến từ bài "tính thu nhập theo giờ" sẽ không thấy tính năng đó ở bản V1 trên store. Cần quyết: giữ V1 theo spec (listing này), hay đưa Tỷ giá đời vào V1 rồi soạn lại listing.

## Rủi ro chính sách (rà từ hiểu biết sẵn có, chưa kiểm lại bản hiện hành)

- Financial services: app không tư vấn đầu tư, không cho vay, không liên kết ngân hàng; V1 không chạm tiền. Giữ câu "không liên kết ngân hàng, không tư vấn đầu tư". https://support.google.com/googleplay/android-developer/answer/9876821
- Metadata: không "best", "#1", không tên đối thủ, không nhồi từ khoá. https://support.google.com/googleplay/android-developer/answer/9898842
- Data safety: khai "không thu thập, không chia sẻ" chỉ khi T-0023 xong và rà code/fe không có SDK gửi dữ liệu (Sentry đã comment ở App.tsx; chưa rà hết các package). Ảnh Khoảnh khắc chọn từ thư viện máy, lưu cục bộ. https://support.google.com/googleplay/android-developer/answer/10787469
- Ảnh trẻ em: không dùng ảnh trẻ thật. Target audience chọn người lớn, không chọn trẻ em để tránh Families policy. https://support.google.com/googleplay/android-developer/answer/9893335
- Claim tâm lý: không viết giảm stress hay trị liệu. Đồng hồ cát có câu "có thể nặng lòng".

## Tên vỏ Batify trong app.json (đề xuất, Founder chốt)

| Trường | Hiện tại | Đề xuất |
|---|---|---|
| expo.name | DailyOps | Mira |
| expo.slug | DailyOps | mira |
| ios.bundleIdentifier | com.wai.dailyops | com.trady360.mira (hoặc vn.mira.app nếu Founder dùng tên miền khác) |
| android.package | (chưa có) | cùng chuỗi với bundle id |

Tên miền chưa chốt (T-0002) vì vậy id này chỉ là đề xuất. Package id Play và Bundle ID Apple không đổi được sau khi phát hành. Approval code_change tạo kèm ref T-0018. Không sửa code/fe/app.json.

## Checklist Play Console (điền khi có app)

- [ ] App name / default language vi-VN · [ ] Category: Lifestyle (đề xuất) · [ ] Content rating
- [ ] Data safety form (sau T-0023) · [ ] Privacy policy URL: CHỜ FOUNDER · [ ] Target audience: người lớn
- [ ] Tài khoản Play Console: cần `approval request --kind access` · [ ] Store listing experiments: bật sau 2 tuần có số
