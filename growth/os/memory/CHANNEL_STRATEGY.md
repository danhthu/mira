# CHANNEL_STRATEGY

Taxonomy chuẩn ở `growth/os/config/channels.json`. Mỗi kênh dưới đây: mục tiêu, nhịp, luật, cách đo. Cập nhật mục "Kết quả" từ số thật mỗi tuần (skill weekly-growth-review).

## SEO / BLOG
- Nội dung: `growth/content/vi/` (91 bài), nhịp theo `docs/07` (T2 trụ cột … CN thư).
- Từ khoá: chiếm **từ khoá công cụ** ("tính thu nhập theo giờ", "tính tự do tài chính") và **đuôi dài cảm xúc** — không đấu "tự do tài chính là gì".
- Đo: GA4 pageviews + click CTA (event `cta_click`), Search Console impressions. Install từ blog = click ra store có UTM `utm_source=blog`.
- Kết quả: chưa đo.

## FACEBOOK_ORGANIC
- Page Mira + đăng chéo bài T7 (300–500 từ) và ảnh kết quả máy tính. 1 post/ngày.
- Luật: không đăng cùng nội dung vào nhiều nhóm trong một ngày; trả lời bình luận trong 24h.
- Đo: UTM `facebook/social`; waitlist/installs theo link.
- Kết quả: chưa đo.

## THREADS
- Giọng tự sự, 1–3 câu + con số. 1–2 post/ngày. Thử 3 góc A/B/C xoay vòng.
- Đo: UTM `threads/social`.
- Kết quả: chưa đo.

## TIKTOK / YOUTUBE
- 6 hook trong `docs/06` §5, 15–25 giây, footage thật của app (không mock-up giả). Bắt đầu khi app chạy được trên điện thoại để quay.
- Đo: link in bio có UTM; tạm xếp `estimated` nếu chỉ đếm bằng lượt vào landing cùng khung giờ.
- Kết quả: chưa đo.

## COMMUNITY
- Danh sách cộng đồng: `growth/os/research/communities-2026-10-13.csv` (25 dòng, đọc ngày 2026-10-13). Chỉ 7 dòng đọc được luật đăng (Voz f17/f92/f95, Tinhte, ChungKhoanOnline, và 2 nhóm FB lệch chủ đề); 18 dòng `chưa đo`/`không rõ` cần Founder xem bằng tài khoản thật. Mỗi cộng đồng: luật, admin, chủ đề hợp, tần suất tối đa.
- Phát hiện: Voz f17 và Tinhte cấm quảng cáo/PR/quảng bá sản phẩm (Voz khoá vĩnh viễn) → chỉ trả lời bằng phép tính, 0 link, không nhắc Mira. Nhóm Facebook tài chính đông (VWA 305,1K, nhóm chứng khoán 100K–873K) lệch chủ đề hoặc nhiều bán hàng. Nhóm FIRE Việt Nam trên Facebook chỉ 27 thành viên. `r/vietnam_personal_finance` chưa xác nhận tồn tại; Reddit bị chặn khi đọc.
- Luật cứng: góp giá trị trước (trả lời câu hỏi thật bằng phép tính), dẫn link sau; không đăng bài quảng cáo vào nhóm cấm; không nhiều tài khoản.
- Đo: UTM `community/referral` + utm_content = tên nhóm.
- Kết quả: chưa đo.

## PARTNERSHIP
- Mục tiêu: 5 newsletter/podcast/blog cá nhân VN về tài chính – gia đình, ≤ 10k người theo dõi (dễ trả lời).
- Outreach cá nhân hoá, Founder duyệt danh sách trước khi gửi. Không mass message.
- Đo: UTM `partner/referral` + utm_content = tên đối tác.
- Kết quả: chưa đo.

## NEWSLETTER
- Thư Chủ nhật (bài `type: letter`). ESP chưa chọn — ưu tiên miễn phí tới 1k subscriber (Buttondown/MailerLite/Substack — chờ Founder chọn).
- Đo: open/click; UTM `newsletter/email`.
- Kết quả: chưa đo.

## META_ADS
- Chỉ sau: landing + pixel + Founder duyệt. Ngân sách thử ≤ 40 USD: 3 góc × 1 hook, 2–3 USD/ngày × 5 ngày. Dừng theo `config/budget.json.stop_rules`.
- Đo: Ads Manager (clicks, CPC) + GA4 (waitlist) + Play referrer khi có store. **Không** tin con số "installs" tự báo của Meta nếu không có SDK — xếp `estimated`.
- Kết quả: chưa chạy.

## GOOGLE_ADS
- Search từ khoá công cụ, ≤ 20 USD, chỉ khi trang đích có widget thật. App campaigns chỉ sau khi lên store.
- Kết quả: chưa chạy.

## REDDIT
- r/VietNam, r/vietnam_personal_finance: 1 bài/tháng dạng chia sẻ công cụ, đọc luật sub trước.
- Kết quả: chưa đo.
