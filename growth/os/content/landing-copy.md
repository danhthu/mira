# Landing Mira — bản copy và cấu trúc (T-0010)

Ngày soạn: 2026-10-13 · Tác giả: seo-content · Trạng thái: REVIEW (Founder đọc lại bằng giọng thật; chưa nối ESP; chưa ghi đè `growth/blog/src/pages/index.astro`, chờ approval `code_change`)

Nguồn khuôn: `docs/06-marketing-test.md` §1 và §3. Ràng buộc nội dung: `GAME_PROFILE.md` (bảng "Tính năng V1 ↔ code") và dòng DECISION_LOG 2026-10-13 (tạm dừng mọi câu "dữ liệu nằm trên máy bạn").

## Sự thật hiện tại mà trang không được vượt

| Điều | Hiện trạng | Hệ quả cho copy |
|---|---|---|
| App Mira | Chưa có màn hình nào của Mira trong code, chưa có build, chưa lên store | Không nói "tải app", không nói app "tính", "đếm" ở thì hiện tại. Mọi chỗ về app dùng "đang xây" |
| 6 công cụ tính trên web | Chưa build (PROJECT_CONTEXT) | Không có khối nào "thử ngay" lúc này. Cả ba khối ghi "đang xây" |
| "Dữ liệu nằm trên máy bạn" | Tạm dừng (DECISION_LOG): app đang xoá dữ liệu mỗi lần mở | Câu này không xuất hiện ở bất kỳ đâu |
| "Không bán dữ liệu" | Đúng hôm nay: Mira chưa thu dữ liệu nào ngoài email người tự để lại | Giữ, nói về email |
| Không streak, không thông báo trách móc | Cam kết thiết kế cho app, chưa kiểm hết trong code | Ghi là cam kết, không mô tả như tính năng đang chạy |
| ESP, GA4 | Chưa có | Form chưa nối, dòng "N người đang chờ" ẩn, không đo (xem phần Đo) |

Hệ quả cho CTA: yêu cầu giao việc nêu CTA chính là "thử công cụ tính trên web + để email chờ". Phần thử công cụ chưa tồn tại, nên bản này để **một CTA duy nhất là form email**, cộng một liên kết phụ "đọc cách tính" tới blog (bài giải thích cách tính). Khi widget đầu tiên (`real-work-hours-calculator` hoặc tương đương) ra đời, thêm nút "Thử tính" cạnh form theo mục "Khi có công cụ" cuối file; không thay form.

## Thẻ trang

- Title (56 ký tự): `Một giờ đời bạn giá bao nhiêu? Tính thu nhập thật | Mira`
- Meta description (130 ký tự): `Mira tính thu nhập thật theo giờ, sau khi trừ kẹt xe, tăng ca và kiệt sức. Đang xây dựng. Để email nhận bản dùng thử khi sẵn sàng.`
- Từ khoá chính theo `keywords-2026-10-13.csv`: "tính thu nhập theo giờ" (hạt giống số 1 cụm công cụ), phụ "một giờ làm việc của tôi đáng giá bao nhiêu". Title chứa "thu nhập thật" thay vì khoá nguyên cụm để giữ câu hỏi của góc C ở đầu; meta chứa nguyên "thu nhập thật theo giờ".
- Số ký tự đếm bằng node (xem phần Kiểm cuối file).

## Hero (biến thể A, mặc định)

Eyebrow: `Đang xây dựng`

H1: `Một giờ đời bạn giá bao nhiêu?`

Đoạn dưới:
> Mira tính thu nhập thật của bạn theo giờ, sau khi trừ kẹt xe, tăng ca và những buổi tối nằm vật ra vì kiệt sức. Rồi cho thấy mỗi khoản chi tốn bao nhiêu giờ, và bạn còn bao nhiêu giờ cho những người quan trọng. Hiện chưa có bản nào để dùng. Để lại email, khi có bản dùng thử Mira báo bạn.

(Đủ 3 ý của checklist mục 2: thu nhập thật theo giờ · chi tốn bao nhiêu giờ · còn bao nhiêu giờ cho người quan trọng. Câu cuối thay cho "dùng thử ngay" vì chưa có gì để dùng.)

Form (một ô):
- Nhãn ô: `Email của bạn`
- Nút: `Nhận bản dùng thử`
- Dòng nhỏ dưới form: `Mira chỉ dùng email này để báo khi có bản dùng thử. Không bán, không chia sẻ.`
- Dòng chờ (ẩn mặc định): `Đang xây dựng. {N} người đang chờ.` Chỉ hiện khi N là số thật từ ESP và N lớn hơn 0. Chưa có thì bỏ nguyên dòng, không thay bằng số làm tròn hay chữ "hàng trăm".

## Hero biến thể B (A/B)

H1: `Bạn nghĩ mình kiếm 167.000đ một giờ. Con số thật là bao nhiêu?`

Đoạn dưới giữ nguyên bản A. Lý do thử: B mở bằng một con số cụ thể, có thể kéo tò mò mạnh hơn câu hỏi trừu tượng; rủi ro là người đọc không có lương 30 triệu thấy ví dụ xa mình. Cả hai vẫn thuộc góc C, không đụng B (bố mẹ/con) ở phần đầu trang theo docs/06 §8.

Cách chạy (theo skill conversion-optimization, bước 4): Astro tĩnh không chia tải. Chạy tuần tự (tuần A rồi tuần B) hoặc chia theo nguồn traffic, ghi rõ hạn chế khi mở experiment. Chỉ mở experiment khi có GA4 + ESP; metric là `waitlist`, ngưỡng docs/06 §7 > 8% và mẫu từ 300 pageviews trở lên. Đề xuất, chưa mở:

```
node growth/os/bin/os.mjs experiment add --hypothesis "Hero mở bằng con số 167.000đ thay vì câu hỏi trừu tượng tăng tỷ lệ để lại email" --channel BLOG --metric waitlist --baseline "chưa đo" --target ">8% trên >=300 pv" --variables "hero: câu hỏi A vs con số B; chạy tuần tự, không chia tải" --start-date <ngày> --end-date <ngày>
```

## Ba khối giữa

Tiêu đề khối: `Ba con số Mira đang xây`. Mỗi khối có nhãn trạng thái ở góc: `Đang xây`. Không khối nào có công cụ thử ngay lúc này (6 widget chưa build).

### Tỷ giá đời — trạng thái: đang xây (công cụ web dự kiến đầu tiên: `real-work-hours-calculator`)

> Bạn nghĩ mình kiếm 167.000đ một giờ. Chia theo giờ thật, con số là 115.000đ. Chênh lệch nằm ở những giờ không ai trả tiền: kẹt xe, tăng ca, buổi tối hồi sức.

Ghi chú số: 30 triệu / 60 giờ thật mỗi tuần ≈ 115.000đ/giờ (bộ số xuyên suốt, `GAME_PROFILE.md`). 167.000đ lấy từ docs/06 §3 (30 triệu chia theo giờ hợp đồng). Cụm "15 giờ mỗi tuần" trong bản gốc docs/06 **không dùng** ở đây: `docs/03-formulas.md` không có số này và chưa rõ cách đếm (60 giờ thật trừ giờ hợp đồng nào); Founder chốt cách đếm trước khi đưa lại.

### Vốn tự do — trạng thái: đang xây (`goal-cost-calculator` / máy tính vốn tự do, chưa build)

> Giàu không phải là có bao nhiêu. Là mai nghỉ việc thì sống được bao lâu. Mira gọi đó là số tháng tự do: tài sản chia cho chi tiêu một tháng. Cái này chạy thử bằng tay được, trong bài viết.

Ghi chú: "đếm mỗi tháng mua thêm bao nhiêu ngày" (bản gốc) bỏ vì là tính năng chưa có và chưa có công thức trong docs/03. Liên kết "trong bài viết" trỏ `/blog` (bài `10-may-tinh-von-tu-do`, cần kiểm bài đã publish trước khi dùng URL bài cụ thể).

### Giờ vàng — trạng thái: đang xây (chưa có công cụ web, chưa có màn hình app)

> Con bạn 10 tuổi. Còn 8 năm nữa nó rời nhà. Ở nhịp hiện tại, bạn còn khoảng 2.500 giờ bên nó. Đó là ước tính, không phải bản án. Nếu con số này nặng lòng, bỏ qua nó cũng được.

Ghi chú: 2.500 giờ lấy từ docs/06 §3; công thức `docs/03-formulas.md` §1 (Giờ vàng) cần đối chiếu lại phép tính trước khi publish (seo-content chưa tự suy ra con số này từ công thức; đánh dấu cho Founder). Không quy giờ này ra tiền (docs/00, rủi ro #2). Hai câu cuối lấy từ bảng Đúng/Sai của `voice.md`, giữ để giảm rủi ro cảm giác tội lỗi (docs/06 §8).

## Khối cam kết (không bỏ)

Tiêu đề: `Mira cam kết gì`

Phân hai nhóm để không nói quá sự thật:

Nhóm 1, đúng hôm nay:
> Không bán dữ liệu. Hôm nay Mira chỉ giữ một thứ bạn tự để lại: địa chỉ email.

Nhóm 2, cam kết thiết kế (viết rõ là cam kết, vì app chưa ra mắt):
> Khi có bản dùng thử, Mira sẽ không có streak và không gửi thông báo trách móc. Công cụ tính trên web sẽ chạy ngay trong trình duyệt của bạn, số bạn nhập không gửi về Mira.

Câu chốt:
> Mira không cần bạn mở app nhiều. Mira cần bạn sống nhiều.

Chú thích nội bộ (không in lên trang):
- "Dữ liệu nằm trên máy bạn" bị bỏ có chủ đích (DECISION_LOG 2026-10-13, T-0023). Khi Founder quyết xong lỗi xoá dữ liệu và app thật sự lưu tại máy, thêm lại thành câu thứ 4 của nhóm 2, có kiểm chứng. Checklist mục 8 vì vậy ghi "3/4 ý, thiếu ý thứ 4 có chủ đích".
- Câu "công cụ web không gửi số đi đâu" chỉ đúng khi widget được build đúng spec. Nó nằm ở nhóm cam kết thiết kế, có chữ "sẽ". Spec widget phải ghi: tính ở trình duyệt, không `fetch` số nhập, sự kiện GA4 không mang giá trị nhập (khớp ga4-plan §3.4).
- Không dùng chữ "an toàn", "bảo mật tuyệt đối", "mã hoá".

## CTA cuối

Tiêu đề: `Khi có bản dùng thử, Mira báo bạn`

Nội dung ngắn:
> Để lại email, không cần gì thêm. Bạn có thấy con số 115.000đ vừa rồi gần với con số của mình không?

Form lặp lại y hệt hero (cùng nhãn, nút, dòng nhỏ). Dòng "N người đang chờ" cũng chỉ hiện khi có N thật.

Liên kết phụ cạnh form: `Đọc cách tính trong blog` tới `/blog` (nội bộ, không UTM, không `data-cta`).

## Dưới cùng: bài mới nhất

Giữ khối "Bài viết mới nhất" (3 bài) của trang hiện tại; không đổi.

## Đo (GA4 chưa có, ghi chưa đo)

Theo hợp đồng `growth/os/analytics/ga4-plan.md` §2-3:

| Phần tử | `data-cta` | `data-widget` | `data-target` |
|---|---|---|---|
| Nút form ở hero | `hero-waitlist` | `hero` | `waitlist` |
| Nút form ở cuối trang | `footer-waitlist` | `footer` | `waitlist` |

- `cta_click` với `target=waitlist` không nạp vào `clicks`, chỉ dùng cho tỷ lệ bước phễu.
- `waitlist_submit` bắn trong nhánh thành công của `fetch` ESP, không bắn lúc bấm nút, không gửi email (chú thích trong file proposal).
- Chưa có GA4, chưa có ESP: mọi tỷ lệ của trang này "chưa đo". Không ước.
- Link ra store/PWA/công cụ có UTM từ `os.mjs link`: **chưa có link nào** (không có store, PWA chưa deploy, công cụ chưa build). Các liên kết trên trang đều nội bộ nên không cần UTM. Khi có, tạo bằng `link --url ... --channel BLOG --campaign <tuần> --content <slug>`.

## Khi có công cụ (kế hoạch, chưa làm)

1. Widget đầu tiên ra đời (sau approval spec `code_change`): thêm nút phụ `Thử tính` cạnh form hero, `data-cta="hero-tool"` `data-widget="hero"` `data-target="pwa"`, link tạo bằng `os.mjs link`; khối tương ứng đổi nhãn từ `Đang xây` sang `Dùng thử`.
2. Viết lại câu hero thành hiện tại ("Mira tính...") chỉ khi công cụ chạy được.
3. Ngưỡng dùng thử công cụ > 30% khách vào landing (docs/06 §7) chỉ đo được sau bước này.

## Checklist landing (templates/landing-checklist.md)

Tick theo **bản proposal** (chưa live), trừ khi ghi khác.

- [x] 1. H1 là câu hỏi góc C "Một giờ đời bạn giá bao nhiêu?" (biến thể B là biến thể thử nghiệm, X-id sẽ gán khi mở experiment)
- [x] 2. Đoạn hero nêu đủ 3 ý
- [x] 3. Form một ô ngay dưới hero, nút "Nhận bản dùng thử", không dấu chấm than
- [x] 4. Dòng "N người đang chờ" ẩn mặc định, chỉ hiện khi N thật từ ESP
- [x] 5. Tỷ giá đời có ví dụ số 167.000đ → 115.000đ. Phần "15 giờ/tuần" bỏ có chủ đích (xem ghi chú số), không còn trong khối
- [x] 6. Vốn tự do: "sống được bao lâu nếu mai nghỉ việc", đếm theo tháng
- [x] 7. Giờ vàng: con 10 tuổi, ~2.500 giờ, không quy ra tiền. Cần Founder đối chiếu công thức
- [ ] 8. Khối cam kết: 3/4 ý (không streak, không thông báo trách móc, không bán dữ liệu). Thiếu "dữ liệu nằm trên máy" có chủ đích theo DECISION_LOG, chờ T-0023
- [x] 9. Câu "Mira không cần bạn mở app nhiều. Mira cần bạn sống nhiều."
- [x] 10. Form lặp lại cuối trang. Chưa có PWA nên không có nút cài
- [ ] 11. Link ra store/PWA/công cụ có UTM: không áp dụng được, chưa có link ngoài nào. Tick khi có link đầu tiên
- [ ] 12. GA4 bắn `cta_click`/`waitlist_submit`/`tool_use`/`appinstalled`: **chưa có GA4, chưa đo**. Thuộc tính `data-*` đã gắn sẵn trong proposal

Tổng: 9/12 tick, 3 mục treo kèm lý do. Không mục nào bị tick bằng cách nới sự thật.

Giọng, rà cả trang: không "nên/phải/hãy", không "!", không đếm ngược, không đỏ, sentence case, không em-dash liên tiếp, không "tóm lại", "hãy cùng", "không thể phủ nhận", "trong thế giới hiện đại". Không hứa tính năng chưa có.

## Việc cần Founder

1. Đọc lại toàn bộ bằng giọng thật (luật #5 HANDOFF).
2. Chốt "15 giờ mỗi tuần" nếu muốn giữ (cách đếm), và đối chiếu 2.500 giờ với docs/03 §1.
3. Chọn ESP (Buttondown, MailerLite, Kit...) trước khi form có action. Cho tới lúc đó **không deploy** trang này công khai: form hiện chưa lưu gì, người để email sẽ không có phản hồi.
4. Quyết T-0023 để quyết có đưa lại câu "dữ liệu nằm trên máy bạn".
5. Domain chưa chốt (`mira.trady360.com` tạm): chưa canonical/OG chính thức.

## Kiểm cuối file (node, đếm ký tự Unicode)

Title 56 (giới hạn 60) · meta description 130 (giới hạn 155). Quét `nên/phải/hãy/!` trên phần chữ hiển thị của proposal: 0 vi phạm (các kết quả "!" còn lại chỉ là `<!doctype>`, `<!--` và toán tử `!==`).
