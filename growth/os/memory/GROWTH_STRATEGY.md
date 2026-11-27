# GROWTH_STRATEGY — 90 ngày, 1.000 người dùng, ≤100 USD

Chủ sở hữu: growth-orchestrator. Sửa chiến lược = ghi DECISION_LOG trước.

## Luận điểm

Mira chưa lên store, nhưng đã có 91 bài blog draft, 6 công cụ tính mô tả sẵn và một kế hoạch test 3 góc. Tài sản rẻ nhất để tạo install là **công cụ tính + bài blog + PWA**: người dùng thử máy tính → thấy con số của mình → cài PWA / để lại email → cài app khi lên store. Paid chỉ dùng để **đo góc nào bán được** (≤ 40 USD), không để mua install.

## Thứ tự kênh (Priority Score ban đầu — sẽ sửa theo số thật)

| # | Kênh | Vì sao | Điều kiện |
|---|---|---|---|
| 1 | BLOG + công cụ tính (SEO dài hạn) | 91 bài sẵn, công cụ = demo sản phẩm, backlink tự nhiên | Chốt domain, GA4, deploy, build 2 widget đầu |
| 2 | THREADS + FACEBOOK_ORGANIC | Đối tượng 25–40 Việt; bài T7 trong lịch blog đã cắt sẵn cho social | Tài khoản Mira, lịch đăng, 6 hook |
| 3 | COMMUNITY (nhóm FB, Voz, Spiderum) | Nơi người ta thật sự hỏi "lương 30 triệu có nên đổi việc" | Luật từng nhóm, không spam |
| 4 | NEWSLETTER (Thư Chủ nhật) | Tài sản lớn nhất theo `docs/07`, demo tính năng | ESP (chọn miễn phí) |
| 5 | TIKTOK / YOUTUBE Shorts | 6 hook đã viết; cần footage thật | Có app chạy được để quay |
| 6 | PARTNERSHIP (newsletter/podcast nhỏ) | 1 shout-out = vài chục install | Có landing + PWA để gửi |
| 7 | META_ADS (test góc) | Theo `docs/06` §6, thu nhỏ còn ≤ 40 USD | Landing + pixel + Founder duyệt |
| 8 | GOOGLE_ADS | Search intent có nhưng CPC VN thấp; thử ≤ 20 USD từ khoá công cụ | Sau khi SEO có trang đích tốt |
| — | REDDIT | Ưu tiên thấp, 1 bài/tháng r/VietNam | — |

## Giai đoạn (cột mốc là kế hoạch; CGO sửa dự báo theo thực tế)

| GĐ | Ngày | Việc chính | Mốc |
|---|---|---|---|
| 1 Foundation | 1–14 | Hệ thống này; chốt domain; GA4 blog; deploy blog + 14 bài; landing + waitlist; PWA công khai; tài khoản social; 20 cộng đồng | 50 installs (PWA) · 100 waitlist |
| 2 Acquisition | 15–30 | Đăng đều (1 bài/ngày, 1 post social/ngày); 2 widget; bắt đầu cộng đồng; ASO chuẩn bị listing | 150 |
| 3 Validation | 31–45 | So 3 góc bằng số organic; test paid ≤ 40 USD (sau duyệt); 10 phỏng vấn | 350 |
| 4 Scaling | 46–60 | Dồn kênh thắng; partnership; **lên store nếu có build** | 600 |
| 5 Optimization | 61–90 | Scale organic đã kiểm chứng; paid còn lại nếu CPI tốt; retention | 1.000 |

## Ràng buộc không thương lượng

- Không chi tiền khi chưa có `campaign` APPROVED bởi founder. Trần 100 USD, trần 30 USD/campaign, 5 USD/ngày.
- Không đụng `code/fe` vì mục đích marketing nếu chưa duyệt (kể cả thêm GA4 vào PWA — cần approval `code_change`).
- Không đăng hook "bố mẹ" (hook 3) làm quảng cáo trả phí trước khi test organic và đọc bình luận.
- Không bịa số. Số 0 = chưa đo.

## Phụ thuộc Founder (xem CURRENT_STATE)

Domain · GA4 · ESP · tài khoản social · ngày có build store · định nghĩa install.
