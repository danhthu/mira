---
name: market-research
description: Nghiên cứu thị trường cho Mira, gộp luôn phân tích đối thủ (quyết định 2026-10-13 trong DECISION_LOG) — bảng app đối thủ có số từ store, hồ sơ đối tượng, báo cáo tuần. Dùng khi nói "nghiên cứu thị trường", "phân tích đối thủ", "đối thủ có gì", "app nào giống Mira", "cập nhật competitor", "audience profile", "market research", "competitor analysis", "weekly market report". KHÔNG dùng để tìm số liệu cho bài blog (gọi thẳng mira-nghien-cuu lane nguyen-lieu), KHÔNG dùng cho từ khoá (keyword-research), KHÔNG dùng để liệt kê cộng đồng (community-research).
---

# market-research — đối thủ, đối tượng, báo cáo tuần

## Mục đích

Điền ba chỗ đang trống bằng số có nguồn: bảng app đối thủ trong `COMPETITOR_INTELLIGENCE.md` (hiện "chưa có dữ liệu đã kiểm"), nhãn [A]→[F] trong `AUDIENCE_PROFILE.md`, và một báo cáo tuần ngắn để orchestrator biết thị trường đổi gì. Skill này **không tự đi tìm phát hiện** — việc đó đã có `mira-nghien-cuu` làm với luật nguồn chặt; skill này gọi nó rồi cấu trúc hoá kết quả thành bảng và quyết định.

## Khi nào dùng

- Thứ Ba hằng tuần (trùng lane đối thủ của `mira-nghien-cuu`), hoặc khi task READY của market-intelligence yêu cầu.
- Trước `app-store-optimization` lần đầu (cần 5 listing đối thủ làm chuẩn).
- Khi Founder hỏi "có ai làm giống Mira chưa".

## Đầu vào bắt buộc

`growth/os/memory/PROJECT_CONTEXT.md`, `COMPETITOR_INTELLIGENCE.md`, `AUDIENCE_PROFILE.md`, `docs/nguon/nghien-cuu/INDEX.md` (mã N-xxx đã có), file `growth/os/research/competitors-*.csv` gần nhất nếu có (để nối tiếp, không làm lại).

## Các bước thực thi

1. `node growth/os/bin/os.mjs task add --title="Market research tuần <W>" --agent=market-intelligence --impact=3 --confidence=0.8 --urgency=2 --effort=3 --deadline=<YYYY-MM-DD> --expected="competitors CSV + COMPETITOR_INTELLIGENCE cập nhật + weekly-<date>.md"` → `task update T-xxxx --status=IN_PROGRESS`.
2. **Gọi skill `mira-nghien-cuu`, chỉ định lane `doi-thu`**, chọn một trong bốn nhóm (time-tracking / FIRE / app gia đình / app Việt) theo nhóm chưa làm trong file lane gần nhất. Nó ghi phát hiện `N-xxx` vào `docs/nguon/nghien-cuu/` — không ghi lại chỗ khác.
3. **Bổ sung số store** cho mỗi app đáng ghi (WebFetch trang Play Store / App Store công khai; không cài, không đăng ký): tên, store, lượt tải (Play ghi dải "100K+"), rating + số đánh giá, giá/mô hình, từ khoá nổi trong title/subtitle/short description, ngày cập nhật gần nhất, điểm họ không làm (so với ba chỉ số lõi). Mỗi ô có ngày đọc; không có số → `chưa đo`.
4. **Ghi CSV** `growth/os/research/competitors-<YYYY-MM-DD>.csv` (UTF-8, dấu phẩy, giá trị có dấu phẩy thì bọc ngoặc kép). Nối thêm dòng vào file cũ nếu đã có trong 30 ngày; khác thì tạo file mới.
5. **Cập nhật `COMPETITOR_INTELLIGENCE.md`**: điền bảng "App" từ CSV (tối đa 10 dòng, dòng nào có số), thêm mục "Ngôn ngữ họ dùng" (câu hứa trên store, trích ≤1 câu, có nguồn), đánh dấu app nào chạm ba rủi ro `docs/00-vision.md`. Dòng mới phải có ngày + nguồn.
6. **Audience profile**: với mỗi dòng [A] trong `AUDIENCE_PROFILE.md`, nếu tuần này có N-xxx chứng minh/bác bỏ → đổi thành [F] kèm mã, hoặc giữ [A] và ghi "tìm 1 lần, chưa ra". Không tự nâng nhãn nếu không có mã N.
7. **Báo cáo tuần** `growth/os/research/weekly-<YYYY-MM-DD>.md` theo khuôn dưới. Dưới 60 dòng.
8. Phát hiện làm đổi định vị (ví dụ có app Việt đã đo "giàu bằng tháng") → `memory log --file=DECISION_LOG --text="..."`; phát hiện thường → `memory log --file=LEARNINGS --text="..."`.
9. `task update T-xxxx --status=DONE --evidence=growth/os/research/weekly-<date>.md --actual="<n> app có số, <m> nhãn A→F"`.

## Đầu ra

CSV cột (đúng thứ tự):

```csv
name,store,url,installs_range,rating,rating_count,price_model,aso_keywords,last_update,what_they_dont_do,touches_risk,source_date,note
Money Lover,play,https://play.google.com/...,10M+,4.5,"312,000",freemium 1.99$/th,"quản lý chi tiêu;ví;ngân sách",2026-09-30,không quy tiền ra giờ,không,2026-10-14,
```

Báo cáo tuần:

```markdown
# Thị trường — tuần <W> (<dd/mm/yyyy>)

> Nguồn: N-xxx…N-yyy (docs/nguon/nghien-cuu), competitors-<date>.csv.

## Ba dòng
1. ...
2. ...
3. ...

## Đối thủ đáng chú ý tuần này
| App | Vì sao đáng chú ý | Mira khác ở đâu | N-xxx |

## Đối tượng — nhãn đổi
| Dòng AUDIENCE_PROFILE | Trước | Sau | Bằng chứng |

## Hệ quả cho kênh / nội dung (đề xuất, chưa quyết)
- ...

## Chưa tìm ra / hướng lần sau
```

## Kiểm chất lượng

- [ ] Mọi số trong CSV có `source_date`; không có ô bịa, ô trống ghi `chưa đo`.
- [ ] Mỗi app có URL store thật đã fetch được (không phải URL đoán).
- [ ] Phát hiện gốc nằm ở `docs/nguon/nghien-cuu/` với mã N; CSV/memory chỉ dẫn lại mã.
- [ ] Không đề xuất tính năng cho `code/` (chỉ ghi "quan sát").
- [ ] AUDIENCE_PROFILE chỉ đổi nhãn khi có mã N.
- [ ] Không chép đoạn dài từ trang đối thủ (≤1 câu trích, có nguồn).

## Khi lỗi / kẹt

- Store trả 403/chặn fetch → ghi `installs_range=chưa đo`, note "fetch bị chặn <ngày>", tạo task cho Founder xem tay trên điện thoại.
- `mira-nghien-cuu` báo lane hôm nay rỗng → vẫn ghi weekly với mục "không có gì mới", không độn.
- Cần tài khoản (AppFollow, Sensor Tower, data.ai) → `approval request --kind=access --request="..."`; task sang BLOCKED, làm việc khác.

## Agent liên quan

market-intelligence (chủ); aso-specialist, growth-orchestrator (đọc); founder (duyệt access).

## Công cụ dùng

Skill `mira-nghien-cuu` (lane doi-thu), WebSearch, WebFetch, Read, Write (CSV/weekly), Edit (hai file memory), CLI `os.mjs`.
