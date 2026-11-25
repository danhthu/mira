---
name: community-research
description: Lập cơ sở dữ liệu cộng đồng Việt Nam nơi người dùng Mira đang ở — nhóm Facebook, Voz, Tinhte, Spiderum, Reddit, Threads, Discord — mỗi dòng có URL, số thành viên kèm ngày đọc, luật đăng link, admin, chủ đề khớp góc A/B/C, rủi ro, tần suất tối đa. Dùng khi nói "tìm cộng đồng", "nhóm nào để đăng", "danh sách nhóm FB", "community list", "community research", "where do they hang out", "Voz Tinhte Spiderum". KHÔNG tham gia, không đăng, không bình luận, không nhắn admin trong skill này — chỉ đọc và ghi; việc đăng thuộc social-media-content sau khi APPROVED.
---

# community-research — DB cộng đồng VN, chỉ đọc

## Mục đích

CHANNEL_STRATEGY mục COMMUNITY và AUDIENCE_PROFILE mục "Nơi họ ở" đang toàn nhãn [A]. Skill này thay giả định bằng một CSV có URL và số đếm được, để social-growth biết đăng ở đâu, đăng kiểu gì, bao lâu một lần, và chỗ nào tuyệt đối không đăng. Luật cứng của kênh: góp giá trị trước, dẫn link sau, không nhiều tài khoản — nên cột "luật đăng link" là cột quan trọng nhất.

## Khi nào dùng

- Phase 1 (ngày 1–14) để có ≥ 20 cộng đồng; sau đó mỗi tháng rà lại số thành viên và luật.
- Trước khi `social-media-content` lập lịch tuần có mục "nơi đăng".

## Đầu vào bắt buộc

`PROJECT_CONTEXT.md`, `CHANNEL_STRATEGY.md` (COMMUNITY, REDDIT), `AUDIENCE_PROFILE.md`, `docs/06-marketing-test.md` §2 (ba góc), `growth/os/research/communities-*.csv` gần nhất (nối tiếp), `docs/nguon/nghien-cuu/` lane seo/doi-thu (diễn đàn đã thấy).

## Truy vấn gợi ý theo nền tảng và góc

| Nền tảng | Góc A (tự do tài chính) | Góc B (con / bố mẹ) | Góc C (tỷ giá đời, đổi việc) |
|---|---|---|---|
| Facebook group | "nhóm FIRE Việt Nam", "tài chính cá nhân cho người đi làm" | "mẹ đi làm", "bố mẹ bỉm sữa", "con xa quê" | "dân văn phòng", "review công ty", "nhảy việc" |
| Voz / Tinhte | box Tài chính, thread "tiết kiệm", "nghỉ hưu sớm" | thread "về quê", "bố mẹ già" | thread "lương bao nhiêu đủ sống", "tăng ca" |
| Spiderum | tag tiền, FIRE, đầu tư | tag gia đình, trưởng thành | tag công việc, burnout |
| Reddit | r/vietnam_personal_finance | r/VietNam (bài tâm sự) | r/VietNam (việc làm) |
| Threads | hashtag #tudotaichinh #tietkiem | #lamme #xaque | #danvanphong #luong |
| Discord | server FIRE/đầu tư VN công khai | hiếm — ghi nếu thấy | server nghề (IT, marketing) |

Mỗi ô là điểm xuất phát; ghi truy vấn thật đã dùng vào cột `source` của CSV để đợt sau không lặp.

## Các bước thực thi

1. `node growth/os/bin/os.mjs task add --title="Community DB đợt <n>" --agent=community-partnerships --impact=4 --confidence=0.8 --urgency=3 --effort=3 --deadline=<YYYY-MM-DD> --expected="communities-<date>.csv ≥ 20 dòng có URL + luật"` → IN_PROGRESS.
2. **Tìm theo bảy nền tảng**, mỗi nền tảng 3–6 truy vấn WebSearch bằng tiếng Việt: nhóm FB ("nhóm tài chính cá nhân", "FIRE Việt Nam", "mẹ bỉm sữa đi làm", "dân văn phòng", "làm xa nhà"), Voz (box Tài chính/Chuyện trò), Tinhte, Spiderum (chủ đề tiền/công việc), Reddit (r/VietNam, r/vietnam_personal_finance, r/TaiChinh nếu có), Threads (tài khoản/hashtag tự sự về lương, đổi việc), Discord (server tài chính/FIRE VN nếu công khai).
3. **Với mỗi cộng đồng**: WebFetch trang công khai, ghi số thành viên **kèm ngày đọc** (`members_read_date`), mô tả nhóm, luật nhóm (tìm "quy định", "nội quy", "không quảng cáo", "không link"); admin/mod nếu hiển thị công khai (tên hiển thị, không thu thập thêm thông tin cá nhân); 3 chủ đề gần nhất để xếp góc A/B/C.
4. **Xếp loại**: `link_policy` = `cấm` / `cho phép có điều kiện (ghi điều kiện)` / `cho phép` / `không rõ`; `risk` = `thấp` / `vừa` / `cao` (cao: nhóm spam nặng, nhóm bán khoá học, nhóm từng ban sản phẩm tương tự — ghi lý do); `max_freq` = tần suất tối đa đề xuất (ví dụ `1 bài/tháng`, `chỉ trả lời comment`), không bao giờ vượt luật nhóm.
5. **Loại bỏ** nhóm riêng tư không xem được luật (ghi dòng với `note=riêng tư, cần Founder vào xem`), nhóm < 500 thành viên trừ khi rất đúng ngách.
6. **Ghi CSV** `growth/os/research/communities-<YYYY-MM-DD>.csv`; nối dòng mới vào file ≤ 30 ngày tuổi nếu có.
7. **Cập nhật AUDIENCE_PROFILE** mục "Nơi họ ở": thay [A] bằng [F] + "communities-<date>.csv dòng N" cho nền tảng đã có ≥ 3 cộng đồng thật. **Cập nhật CHANNEL_STRATEGY** mục COMMUNITY: dòng "Danh sách cộng đồng: `growth/os/research/communities-<date>.csv` (<n> dòng)".
8. `memory log --file=LEARNINGS --text="community-research <date>: <n> cộng đồng, <m> cấm link, nền tảng đông nhất: ... (communities-<date>.csv)"`.
9. `task update T-xxxx --status=DONE --evidence=growth/os/research/communities-<date>.csv --actual="<n> cộng đồng"`.

## Đầu ra

```csv
name,platform,url,members,members_read_date,link_policy,admin_public,topics_fit,angle,risk,risk_note,max_freq,last_activity,source,note
"Tài chính cá nhân & FIRE Việt Nam",facebook_group,https://www.facebook.com/groups/...,48200,2026-10-15,cho phép có điều kiện: chỉ khi trả lời câu hỏi,"Nguyễn A (admin hiển thị)","FIRE;tiết kiệm;nghỉ hưu sớm",A,vừa,"nhiều bài bán khoá học",1 bài/tháng + trả lời comment,2026-10-14,WebFetch trang nhóm,
"Voz — box Tài chính",voz,https://voz.vn/f/...,chưa đo,2026-10-15,cấm link quảng cáo,"mod ẩn","lương;đổi việc;tiết kiệm",C,cao,"ban nhanh với link app",chỉ trả lời có phép tính,2026-10-15,WebFetch,
```

`members` không đọc được → `chưa đo`. `platform` ∈ {facebook_group, facebook_page, voz, tinhte, spiderum, reddit, threads, discord, other}.

## Kiểm chất lượng

- [ ] ≥ 20 dòng, ≥ 4 nền tảng; mỗi dòng có URL thật đã fetch (không URL đoán).
- [ ] Mọi `members` có `members_read_date`; không số bịa.
- [ ] `link_policy` điền từ luật nhóm đọc được; không đọc được → `không rõ`, không đoán "cho phép".
- [ ] `angle` ∈ {A,B,C,AB,AC,BC,ABC}; `max_freq` không vượt luật nhóm.
- [ ] Không có hành động tham gia/đăng/bình luận/nhắn tin nào; không tạo tài khoản.
- [ ] Không thu thập thông tin cá nhân admin ngoài tên hiển thị công khai.
- [ ] AUDIENCE_PROFILE/CHANNEL_STRATEGY chỉ đổi dòng tương ứng, có dẫn file.

## Khi lỗi / kẹt

- Facebook chặn fetch nhóm khi chưa đăng nhập → ghi `members=chưa đo`, `link_policy=không rõ`, note "cần Founder xem bằng tài khoản thật"; tạo task founder gộp (một task cho cả đợt, không mỗi nhóm một task).
- Cần tài khoản để đọc Discord/nhóm kín → `approval request --kind=access --request="..."`; không tự tạo.
- Nền tảng nào moi 3 lần vẫn rỗng → CSV không có chỗ cho việc này; ghi vào LEARNINGS kèm số lần thử để đợt sau không đâm lại.

## Agent liên quan

community-partnerships (chủ), social-growth (dùng để lập lịch), market-intelligence (nhận diễn đàn từ lane seo), founder (xem nhóm kín).

## Công cụ dùng

WebSearch, WebFetch (chỉ trang công khai), Read, Write (CSV), Edit (hai file memory), CLI `os.mjs`. Không dùng trình duyệt đăng nhập của Founder.
