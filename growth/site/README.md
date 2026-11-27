# growth/site

Chỗ dành cho landing page + calculator khi tách khỏi `growth/blog/`. Hiện landing page và blog vẫn nằm chung trong `growth/blog/`.

## widgets/

### Tỷ giá đời (`life-rate`) — task T-0011

Máy tính web thuần, không thư viện ngoài, không gửi dữ liệu đi đâu ("Số bạn nhập không rời máy bạn"). Khớp bài `growth/content/vi/03-may-tinh-ty-gia-doi.md` và `docs/03-formulas.md` §2.

| File | Vai trò |
|---|---|
| `life-rate-core.mjs` | Hàm thuần `lifeRate`, `itemHours`, `roundThousand`, `formatVnd`, `formatHours`. Nguồn sự thật của công thức. |
| `life-rate.template.html` | Giao diện (mobile-first, dark mode theo `prefers-color-scheme`, màu từ `growth/brand/tokens.json`). |
| `life-rate.html` | Bản build một file tự chứa (core được inline), mở thẳng bằng file:// hoặc nhúng. **Không sửa tay**. |
| `build-life-rate.mjs` | Ghép core vào template: `node growth/site/widgets/build-life-rate.mjs`. |
| `check-syntax.mjs` | Kiểm cú pháp script inline. |
| `life-rate.test.mjs` | `node --test growth/site/widgets/life-rate.test.mjs` (10 test; có test báo lệch nếu quên build). |

Công thức: `lifeRate = netIncome / (realWorkHours × 52 / 12)`, `realWorkHours` = làm việc + di chuyển + chuẩn bị + hồi sức (giờ/tuần). Ô "chuẩn bị và hồi sức" trên giao diện là một ô gộp. Tỷ giá trên hợp đồng = lương / (giờ làm việc × 52 / 12). Biên: tổng giờ = 0 thì hiện "cần nhập giờ làm việc", thu nhập ≤ 0 thì không hiện chỉ số. Hiển thị làm tròn nghìn (30 triệu, 60 giờ: 115.385 hiện 115.000đ).

Chưa làm trong bản này: nhiều dòng thu nhập (bài 03 có nhắc), trung bình trượt 3 tháng tự động, nút chia sẻ ảnh, ẩn chỉ số cho người không đi làm (hiện chỉ yêu cầu nhập đủ ô). Bài 03 hiện hứa "công cụ cho phép thêm nhiều dòng": cần sửa bài hoặc build thêm trước khi nhúng.

Thuộc tính đo (chưa nhúng gtag): vùng `data-widget="calculator-ty-gia"`; nút quy đổi `data-cta="life-rate-convert" data-target="none"` (target `none` không phải CTA ra store/PWA, ga4-plan cần quyết có đếm không).

#### Cách nhúng vào bài

- iframe: `<iframe src="/widgets/life-rate.html" title="Máy tính tỷ giá đời" width="100%" height="640" loading="lazy"></iframe>` (cần copy file build vào `public/` của blog).
- Hoặc copy phần `<main>`, `<style>`, `<script>` vào component Astro.

**Chưa nhúng vào blog.** Sửa `growth/blog` cần approval `code_change`; khi nhúng xong phải bỏ dòng giữ chỗ "Widget chưa được dựng" trong bài 03.
