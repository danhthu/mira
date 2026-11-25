# Đề xuất campaign trả phí — <C-id> <tên campaign>

> Agent: paid-acquisition · Ngày: YYYY-MM-DD · Task: T-xxxx · Trạng thái: PENDING_APPROVAL

## 1. Kênh
META_ADS | GOOGLE_ADS. Vị trí/định dạng (Feed, Reels, Search…).

## 2. Mục tiêu
Một câu đo được. Ví dụ: "So CTR và cost/waitlist của góc C với góc A trên cùng đối tượng, 7 ngày".

## 3. Đối tượng
Địa lý · tuổi · giới · sở thích/từ khoá · loại trừ. Nguồn giả định: AUDIENCE_PROFILE.md mục nào, nhãn [A]/[H].

## 4. Creative
| Ad | Content id | Hook (docs/06 §5) | Định dạng | URL đích (tracking link) |
|---|---|---|---|---|
| 1 | K-xxxx | hook 1 | ảnh + caption | https://…?utm_source=facebook&utm_medium=cpc&utm_campaign=… |

## 5. Budget
Tổng: __ USD (≤ 30). Phần còn lại của trần sau campaign này: __ USD (giữ reserve 30).

## 6. Cap ngày
__ USD/ngày (≤ 5) × __ ngày = tổng.

## 7. CPI kỳ vọng
Công thức: budget ÷ installs ước. Ví dụ: 20 USD ÷ (20 ÷ 0.07 CPC × 1.5% CTR… ) — ghi rõ từng giả định. Nếu không có số nền, ghi "chưa có nền, mục tiêu campaign này là tạo nền".

## 8. Giả định chuyển đổi
impression → click (CTR giả định __%) → landing (bounce __%) → waitlist/PWA (__%). Nguồn của mỗi tỷ lệ; nếu là đoán, ghi [A].

## 9. Tiêu chí thành công
Theo docs/06 §7 thu nhỏ cho ngân sách này: CTR > 1.5% · tỷ lệ email trên landing > 8% · cost/waitlist < 1 USD. Ít nhất __ waitlist để kết luận.

## 10. Tiêu chí dừng
Từ budget.json: sau khi chi ≥ 8 USD mà CTR < 1% hoặc CPI > 1.5 USD hoặc cost/waitlist > 1 USD → PAUSED. Thêm: bình luận "nặng nề/áp lực" > 10% → STOP (docs/06 §8).

## Gắn thử nghiệm
X-xxxx (nếu có): hypothesis, metric, baseline, target.

## Cần Founder
- Duyệt budget __ USD → `campaign update <C-id> --status APPROVED --actor founder`
- Tài khoản Ads Manager: ai cầm, ai dựng.
