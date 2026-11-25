---
name: keyword-research
description: Lập bảng từ khoá tiếng Việt cho blog Mira (SEO) và cho store listing (ASO), có nguồn dấu vết, không bịa volume. Dùng khi nói "nghiên cứu từ khoá", "từ khoá cho bài", "keyword cho store", "người ta search gì", "ASO keyword", "keyword research", "search intent", "cụm từ khoá". KHÔNG dùng để viết bài (seo-content-production), KHÔNG dùng để soạn listing (app-store-optimization), KHÔNG đổi tiêu đề/slug bài đã có trong content-queue.
---

# keyword-research — từ khoá VN cho SEO và ASO

## Mục đích

Ra một CSV từ khoá mà `seo-content-production` và `app-store-optimization` dùng được ngay, với cột `source` nói rõ từ khoá đó đến từ đâu. Theo DECISION_LOG 2026-10-13, skill này **tái dùng lane `seo` của `mira-nghien-cuu`** để tìm dấu vết nhu cầu; phần riêng của nó là gom thành bảng, gán intent/cluster, và nối từng từ khoá với một trang đích hoặc listing cụ thể.

Không có Keyword Planner/Ahrefs trong môi trường này. Cột `est_volume` ghi **"chưa đo"** trừ khi có công cụ thật — số volume không nguồn là lỗi nặng nhất của skill này.

## Khi nào dùng

- Thứ Năm hằng tuần (trùng lane seo), hoặc trước khi viết cụm bài mới / soạn listing.
- Khi ASO cần 100 ký tự keywords iOS hoặc title Play.

## Đầu vào bắt buộc

`growth/os/memory/PROJECT_CONTEXT.md`, `CHANNEL_STRATEGY.md` mục SEO/BLOG, `docs/06-marketing-test.md` §4 (ba cụm gốc: tài chính / thời gian–gia đình / công cụ), `docs/07-blog-120-days.md` (tiêu đề bài đã chốt), `docs/nguon/nghien-cuu/INDEX.md`, file `growth/os/research/keywords-*.csv` gần nhất (nối tiếp, không làm lại).

## Định nghĩa intent và cluster (dùng thống nhất giữa các đợt)

| intent | Người tìm muốn gì | Ví dụ | Trang đích hợp |
|---|---|---|---|
| `tool` | một con số của chính họ | "tính thu nhập theo giờ" | bài `type: tool` / widget |
| `informational` | hiểu một khái niệm | "tỷ giá đời là gì" | pillar / longtail |
| `emotional` | nói ra một nỗi lo | "không có thời gian cho con" | story / counterpoint |
| `comparison` | so hai lựa chọn | "mua xe trả góp hay thuê" | counterpoint |
| `brand` | tìm đúng Mira | "app Mira giờ vàng" | landing / store |

Cluster trùng tên tuần chủ đề trong HANDOFF (`ty-gia-doi`, `von-tu-do`, `tien-gio`, `con`, `bo-me`, `chi-phi-an`, `noi-khong`) + `aso`. Không tự đặt cluster mới mà không ghi LEARNINGS.

## Các bước thực thi

1. `node growth/os/bin/os.mjs task add --title="Keyword research: cụm <X>" --agent=seo-content --impact=3 --confidence=0.8 --urgency=2 --effort=2 --deadline=<YYYY-MM-DD> --expected="keywords-<date>.csv ≥ 30 dòng có source"` → `task update T-xxxx --status=IN_PROGRESS`.
2. **Chọn 1–2 cụm** theo bảng trụ cột trong `.claude/skills/mira-nghien-cuu/references/lane-seo.md`, xoay vòng theo file lane gần nhất.
3. **Gọi skill `mira-nghien-cuu` lane `seo`** cho cụm đó. Nó ghi phát hiện N-xxx (cách hỏi thật, câu hỏi lặp, hiểu lầm phổ biến) vào `docs/nguon/nghien-cuu/`.
4. **Gom từ khoá hạt giống** từ: `docs/06` §4, tiêu đề 91 bài trong `growth/content/content-queue.json`, phát hiện N-xxx vừa có. Mỗi hạt giống: ghi cả bản có dấu và không dấu nếu lane seo thấy người dùng gõ cả hai.
5. **Mở rộng bằng dấu vết công khai** (WebSearch/WebFetch): gợi ý tự động Google, "Mọi người cũng hỏi", tiêu đề top 5 kết quả, câu hỏi trên Voz/Spiderum/nhóm FB. Mỗi từ khoá thêm vào phải ghi `source` = loại dấu vết + URL.
6. **Gán intent** (`informational` / `tool` / `comparison` / `emotional` / `brand`) và **cluster** (`ty-gia-doi`, `von-tu-do`, `tien-gio`, `con`, `bo-me`, `chi-phi-an`, `noi-khong`, `aso`). Từ khoá ASO: thêm cột `target_page/listing` = `play-title`, `play-short`, `ios-subtitle`, `ios-keywords`.
7. **difficulty_note**: mô tả định tính từ việc đọc top kết quả ("top 5 toàn Prudential/AIA, bài 2019", "top là 2 bài diễn đàn, không có công cụ") — không chấm điểm số.
8. **target_page**: slug bài trong `content-queue.json` nếu đã có bài khớp; `MỚI:<đề xuất tiêu đề>` nếu chưa có — chỉ đề xuất, không thêm vào queue.
9. Từ khoá khớp tìm kiếm nhưng phá giọng Mira (có "nên/phải/hãy", giật gân) → vẫn ghi, `note=phá giọng, không dùng nguyên văn`.
10. Ghi `growth/os/research/keywords-<YYYY-MM-DD>.csv`; `task update T-xxxx --status=DONE --evidence=<csv> --actual="<n> từ khoá, <m> ASO"`. Phát hiện đáng nhớ → `memory log --file=LEARNINGS --text="..."`.

## Đầu ra

`growth/os/research/keywords-<YYYY-MM-DD>.csv`, UTF-8, cột đúng thứ tự:

```csv
keyword,intent,cluster,est_volume,difficulty_note,target_page/listing,source,note
tính thu nhập theo giờ,tool,ty-gia-doi,chưa đo,"top 5: 2 trang tính lương gross-net, không ai tính giờ thật",may-tinh-ty-gia-doi,"docs/06 §4; gợi ý tự động Google 2026-10-16",
lương 30 triệu sống ở sài gòn được không,informational,ty-gia-doi,chưa đo,"top là bài báo 2024 + 1 thread Voz",luong-30-trieu-115-nghin-mot-gio,"N-021 (lane seo 2026-10-16)",cách hỏi thật khác tiêu đề bài 02
tính tự do tài chính,tool,von-tu-do,chưa đo,"top là 3 trang bảo hiểm, công thức ×25",may-tinh-von-tu-do,"Mọi người cũng hỏi, 2026-10-16",
app quản lý thời gian tiếng việt,tool,aso,chưa đo,"ít kết quả app Việt thật",play-short,"gợi ý tự động Play Store 2026-10-16",
```

## Kiểm chất lượng

- [ ] Không ô `est_volume` nào có số mà không có công cụ đo ghi trong `source`.
- [ ] Mỗi dòng có `source` cụ thể (loại dấu vết + ngày; URL nếu là trang).
- [ ] ≥ 30 dòng, ≥ 3 cluster, có ít nhất 5 dòng `cluster=aso` khi ASO sắp cần.
- [ ] `target_page` trỏ tới slug có thật trong `content-queue.json` hoặc ghi `MỚI:`.
- [ ] Không sửa `growth/content/**`, `content-queue.json`, `docs/07`.
- [ ] Từ khoá có dấu và không dấu được tách dòng riêng.

## Khi lỗi / kẹt

- Google chặn fetch trang kết quả → chuyển sang diễn đàn/nhóm; ghi "SERP không đọc được <ngày>" trong `note`.
- Cần Search Console (sau khi blog live) → `approval request --kind=access --request="Xác minh domain trên Search Console để lấy query thật"`; task BLOCKED.
- Lane seo tuần này rỗng → CSV vẫn tạo từ hạt giống docs/06 + queue, mọi dòng `source=docs/06 §4` hoặc `content-queue`, ghi rõ chưa có dấu vết ngoài.

## Agent liên quan

seo-content (chủ), aso-specialist (dùng cluster aso), market-intelligence (bổ sung từ lane doi-thu).

## Công cụ dùng

Skill `mira-nghien-cuu` (lane seo), WebSearch, WebFetch, Read, Write (CSV), CLI `os.mjs`.
