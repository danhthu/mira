---
name: app-store-optimization
description: Soạn và kiểm store listing cho Mira trên Google Play và App Store — đúng giới hạn ký tự từng trường, screenshot brief theo ba chỉ số lõi, luật chính sách, ý tưởng A/B, checklist Play Console / App Store Connect. Dùng khi nói "ASO", "store listing", "mô tả app trên store", "title Play", "subtitle iOS", "keywords 100 ký tự", "screenshot store", "app store optimization", "Play Console listing", "chuẩn bị lên store". KHÔNG dùng để tìm từ khoá (keyword-research), KHÔNG tự sửa code/fe/app.json (cần approval code_change), KHÔNG dùng cho landing/blog.
---

# app-store-optimization — listing Play và App Store

## Mục đích

Có sẵn hai bản listing đã kiểm ký tự, đúng giọng Mira, chỉ nói về tính năng **có trong code** (theo `GAME_PROFILE.md` cột "Nói ra ngoài được không"), để ngày có build native Founder dán lên console là xong. App chưa lên store (xem PROJECT_CONTEXT) — nên đầu ra là file, không phải thao tác trên console.

## Khi nào dùng

- Khi `GAME_PROFILE.md` đổi (sau `product-analysis`), khi `keywords-*.csv` có cluster `aso`, hoặc tối thiểu 2 tuần trước ngày dự kiến build store.
- Khi Founder hỏi "tên app trên store là gì".

## Đầu vào bắt buộc

`PROJECT_CONTEXT.md`, `GAME_PROFILE.md`, `AUDIENCE_PROFILE.md`, `COMPETITOR_INTELLIGENCE.md` (listing 5 app chuẩn), `growth/os/research/keywords-*.csv` mới nhất (dòng `cluster=aso`), `docs/06-marketing-test.md` §1 (mô tả 1 câu / 1 đoạn đã chốt), `docs/00-vision.md` (giọng), `code/fe/app.json` (tên vỏ hiện tại).

## Giới hạn ký tự — đếm bằng máy, không đếm tay

| Trường | Play | iOS |
|---|---|---|
| Tên app | title ≤ 30 | name ≤ 30 |
| Dòng phụ | short description ≤ 80 | subtitle ≤ 30 |
| Khuyến mãi | — | promotional text ≤ 170 |
| Từ khoá | (không có trường riêng; nằm trong title/short/full) | keywords ≤ 100, phân cách dấu phẩy, không lặp từ trong name/subtitle |
| Mô tả | full ≤ 4000 | description ≤ 4000 |

Đếm: `node -e "console.log([...process.argv[1]].length)" "<chuỗi>"` (đếm code point — tiếng Việt có dấu an toàn hơn `.length`).

## Các bước thực thi

1. `node growth/os/bin/os.mjs task add --title="ASO listing Play + iOS v<n>" --agent=aso-specialist --impact=4 --confidence=0.7 --urgency=2 --effort=3 --deadline=<YYYY-MM-DD> --expected="2 file listing đã kiểm ký tự + screenshot brief"` → `task update T-xxxx --status=IN_PROGRESS`.
2. **Chốt danh sách điều được nói**: lấy từ GAME_PROFILE bảng "Tính năng V1 ↔ code", chỉ dòng `có` hoặc `có, kèm chữ sắp`. Tính năng `KHÔNG` không xuất hiện ở bất kỳ trường nào, kể cả screenshot.
3. **Từ khoá**: lấy ≤ 15 dòng `cluster=aso` từ keywords CSV; xếp ưu tiên theo intent `tool` > `emotional` > `informational`. Không có CSV → gọi `keyword-research` trước.
4. **Soạn Play** theo `templates/play-listing.md`, **soạn iOS** theo `templates/ios-listing.md`. Dùng mô tả 1 câu/1 đoạn của `docs/06` §1 làm xương; giọng: sentence case, không dấu chấm than, không "nên/phải/hãy".
5. **Luật chính sách** (kiểm từng dòng): không "best", "#1", "tốt nhất"; không hứa kết quả tài chính ("giàu nhanh", "nghỉ hưu sớm chắc chắn"); không claim sức khoẻ/tâm lý ("giảm stress", "chữa burnout"); không nhắc tên đối thủ; không nói "miễn phí" nếu V2 có trả phí mà không ghi "có mua trong ứng dụng"; dữ liệu nằm trên máy → nói đúng (Play Data safety: không thu thập — chỉ khi GAME_PROFILE xác nhận không có SDK).
6. **Screenshot brief 6–8 tấm** theo thứ tự: (1) Giờ vàng, (2) Tỷ giá đời, (3) Vốn tự do, (4) nhập ≤ 60 giây, (5) cam kết "không streak, dữ liệu trên máy", (6) Khoảnh khắc, (7–8) tuỳ chọn. Mỗi tấm: màn hình nào trong code (đường dẫn file), caption ≤ 6 từ, dữ liệu mẫu. Màn hình chưa có trong code → tấm đó ghi `CHỜ BUILD`, không mock-up giả.
7. **A/B ý tưởng**: 3 biến thể title/short theo 3 góc A/B/C `docs/06` §2, ghi giả thuyết và chỉ số (store_visitors → installs). Chưa chạy — chỉ đề xuất; khi có store mới `experiment add`.
8. **Checklist console** cuối file (điền khi có app): Play Console (Data safety, content rating, target audience, privacy policy URL, category) và ASC (privacy nutrition label, age rating, category, review notes).
9. **Tên app trong code**: `app.json` còn `DailyOps` / `com.wai.dailyops` → `approval request --kind=code_change --request="Đổi name/slug/bundleIdentifier/android.package trong code/fe/app.json sang Mira (đề xuất: name 'Mira', slug 'mira', id com.<domain>.mira)" --ref=T-xxxx` và `task add --title="Đổi tên app trong code/fe/app.json" --agent=founder --needs-approval ...`. Không tự sửa.
10. Ghi file, kiểm ký tự lần cuối, `task update T-xxxx --status=REVIEW --evidence=growth/os/aso/play-listing-<date>.md --note="chờ Founder duyệt câu chữ"`. DONE chỉ khi Founder duyệt.

## Đầu ra

- `growth/os/aso/play-listing-<YYYY-MM-DD>.md` — khuôn `templates/play-listing.md`.
- `growth/os/aso/ios-listing-<YYYY-MM-DD>.md` — khuôn `templates/ios-listing.md`.
- Mỗi file mở đầu bằng bảng đếm ký tự thật:

```markdown
| Trường | Giới hạn | Đã dùng | OK |
|---|---|---|---|
| title | 30 | 24 | ✓ |
```

## Kiểm chất lượng

- [ ] Mọi trường đếm bằng lệnh node, số ghi vào bảng, không trường nào vượt.
- [ ] iOS keywords không lặp từ đã có trong name/subtitle, không khoảng trắng sau dấu phẩy.
- [ ] Không tính năng nào ngoài GAME_PROFILE cột "có".
- [ ] Không từ cấm chính sách (best/#1/tốt nhất/giàu nhanh/giảm stress) — grep lại file.
- [ ] Giọng: 0 dấu chấm than, 0 "nên/phải/hãy", sentence case.
- [ ] Screenshot brief ghi đường dẫn màn hình thật hoặc `CHỜ BUILD`.
- [ ] Có approval request cho `app.json`; không file nào trong `code/` bị sửa.

## Khi lỗi / kẹt

- GAME_PROFILE chưa có bảng tính năng ↔ code → dừng, gọi `product-analysis` trước.
- Không có keywords CSV cluster aso → gọi `keyword-research`.
- Chưa có privacy policy URL / tên miền chốt → trường đó ghi `CHỜ FOUNDER`, task BLOCKED cho founder.
- Founder muốn tên khác "Mira" → ghi DECISION_LOG, soạn lại.

## Agent liên quan

aso-specialist (chủ), market-intelligence (listing đối thủ), creative-studio (screenshot thật khi có build), founder (duyệt, sửa app.json).

## Công cụ dùng

Read, Write, Bash (đếm ký tự, grep từ cấm), CLI `os.mjs`; WebFetch chỉ để đọc listing đối thủ công khai.
