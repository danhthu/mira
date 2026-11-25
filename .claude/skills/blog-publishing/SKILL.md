---
name: blog-publishing
description: Quy trình đưa một bài blog Mira đã APPROVED từ draft sang bản live — draft:false, date, mirror sang growth/blog, cập nhật content-queue, kiểm ảnh, build Astro, kiểm sitemap, link UTM cho CTA, ghi PUBLISHED. Dùng khi nói "publish bài", "đăng bài blog", "đưa bài lên site", "lên live bài ngày N", "build blog", "publish post", "go live", "ship the article". KHÔNG dùng để viết/sửa nội dung (seo-content-production), KHÔNG dùng khi content chưa APPROVED, KHÔNG tự deploy (chưa có pipeline — việc của Founder).
---

# blog-publishing — từ APPROVED tới live

## Mục đích

Một bài chỉ được rời máy khi đủ bốn thứ: Founder đã duyệt, ảnh tồn tại, build không lỗi, link CTA đo được. Skill này làm đúng chuỗi đó, dừng ở chỗ repo chưa có pipeline deploy và trả việc cho Founder — không tự tìm cách đẩy lên server.

## Khi nào dùng

- `node growth/os/bin/os.mjs content list --status=APPROVED --channel=BLOG` có bài.
- Job `afternoon-distribution` gọi "publish đã duyệt".
- Nhịp mục tiêu: 1 bài/ngày theo thứ của `docs/07` §B; bài publish sớm nhất là ngày 1 (`mot-gio-doi-ban-gia-bao-nhieu`).

## Thứ tự và nhịp publish

- Đi theo `id` tăng dần trong `content-queue.json` (ngày 1 → 120); không nhảy cóc vì bài sau dẫn link và công cụ của bài trước.
- Mỗi tuần 7 bài theo thứ: T2 pillar · T3 longtail · T4 tool · T5 story · T6 counterpoint · T7 social · CN letter (`docs/07` §B). Nếu publish lùi so với lịch gốc, `date` là ngày publish thật, còn `week`/`day` giữ nguyên.
- Bài `type: tool` publish được dù widget chưa build — bài đã mô tả placeholder (HANDOFF); ghi note "widget chưa có" vào content để `conversion-optimization` biết.
- Bài `type: letter` chỉ publish khi placeholder `[link]` đã thay (ESP đã chọn) hoặc Founder đồng ý bỏ dòng đó.
- Bốn bài nhạy cảm HANDOFF nêu (ngày 29, 31, 39, 65/70): Founder đọc lại bằng mắt trước khi APPROVED; skill không tự publish dù đã có trạng thái.

## Đầu vào bắt buộc

`PROJECT_CONTEXT.md`, `growth/content/HANDOFF.md` (cơ chế draft-queue, dữ liệu còn thiếu: tên miền, ESP), `growth/content/content-queue.json`, bài nguồn `growth/content/vi/<NN>-<slug>.md`, `growth/blog/astro.config.mjs` (site `https://mira.trady360.com`, base `/blog`), `growth/os/config/channels.json` (BLOG = utm_source blog / medium referral).

## Các bước thực thi

1. **Kiểm cổng duyệt**: `node growth/os/bin/os.mjs content show K-xxxx` → `status` phải là `APPROVED`. Khác → dừng, ghi `task update ... --status=BLOCKED --note="content chưa APPROVED"`. Không có ngoại lệ "bài ngắn".
2. **Task**: `task add --title="Publish ngày <N>: <slug>" --agent=seo-content --impact=4 --confidence=0.9 --urgency=4 --effort=1 --deadline=<hôm nay> --expected="bài live trên site + PUBLISHED + UTM"` → IN_PROGRESS.
3. **Kiểm trùng/khớp bảng**: file `vi/<NN>-<slug>.md` tồn tại duy nhất cho số `NN`; `slug` trong frontmatter = `slugVi` trong queue. Lệch → BLOCKED (HANDOFF cảnh báo hai file cùng số).
4. **Sửa frontmatter trong `growth/content/vi/`**: `draft: false`; `date` = ngày publish thật (YYYY-MM-DD, hôm nay hoặc ngày lịch nếu đăng lùi theo lịch — ghi note). Chỉ đổi hai trường này; nội dung không chạm.
5. **Kiểm ảnh**: đọc `image:` (ví dụ `/blog/images/<slug>.png`) → file phải có ở `growth/blog/public/blog/images/<tên>` (base `/blog` trỏ vào `public/blog/`). Không có: (a) có ảnh placeholder đã Founder duyệt trong `growth/brand/` → đổi `image:` sang placeholder, ghi note; (b) không có → BLOCKED, `task add --title="Tạo ảnh bài <slug> từ image_prompt" --agent=creative-studio ...`, dừng.
6. **Mirror**: copy file sang `growth/blog/src/content/blog/<NN>-<slug>.md` (ghi đè bản cũ cùng tên nếu là cùng slug). Kiểm `diff` hai file bằng 0.
7. **Queue**: trong `content-queue.json` đổi dòng `id = NN` thành `"status": "published"` và thêm `"publishedAt": "YYYY-MM-DD"`. Không đổi dòng khác.
8. **Build**: `cd growth/blog && npm run build` (cần Node ≥ 22.12, `npm install` lần đầu). Lỗi → đọc lỗi, chỉ sửa nếu lỗi nằm trong bài (frontmatter sai kiểu); lỗi config/theme → không sửa `growth/blog` config (cần `code_change`), BLOCKED.
9. **Kiểm sitemap**: `grep "<slug>" growth/blog/dist/sitemap-0.xml` có dòng; URL dạng `https://mira.trady360.com/blog/<slug>/`. Kiểm `dist/blog/<slug>/index.html` tồn tại.
10. **UTM cho CTA**: `node growth/os/bin/os.mjs link --url=<URL đích CTA> --channel=BLOG --campaign=blog-120 --content=<slug>` → ghi link vào content: `content update K-xxxx --utm="<link>"`. URL đích là trang công cụ/waitlist/PWA đang có thật; chưa có đích → UTM trỏ trang chủ blog, note "đích tạm".
11. **Ghi PUBLISHED**: `content update K-xxxx --status=PUBLISHED --url=https://mira.trady360.com/blog/<slug>/`. Tên miền chưa chốt (HANDOFF) → vẫn ghi URL hiện tại, note "domain chờ Founder".
12. **Deploy**: repo **chưa có pipeline deploy** (không CI, không script). Tạo `task add --title="Deploy growth/blog/dist lên hosting" --agent=founder --impact=5 --confidence=1 --urgency=4 --effort=1 --deadline=<hôm nay> --expected="URL bài mở được công khai"` và ghi vào task publish `--note="dist sẵn, chờ Founder deploy"`. Bài chỉ "live" thật khi task deploy DONE có evidence URL.
13. `task update T-xxxx --status=DONE --evidence=growth/blog/src/content/blog/<NN>-<slug>.md --actual="mirror + build OK, K-xxxx PUBLISHED, chờ deploy T-yyyy"`.

## Đầu ra

Không file mới ngoài mirror. Trạng thái sau khi chạy:

```
growth/content/vi/<NN>-<slug>.md          draft:false, date:<ngày>
growth/blog/src/content/blog/<NN>-<slug>.md   bản sao y hệt
growth/content/content-queue.json         id NN → status "published", publishedAt
growth/blog/dist/blog/<slug>/index.html   build mới
DB: K-xxxx PUBLISHED, url, utm; T-xxxx DONE; T-yyyy (deploy) READY cho founder
```

## Kiểm chất lượng

- [ ] `content show K-xxxx` trước khi chạm file là APPROVED.
- [ ] `draft: false`, `date` hợp lệ; không trường frontmatter nào khác thay đổi; thân bài không đổi (`diff`).
- [ ] Ảnh tồn tại trên đĩa hoặc placeholder đã duyệt.
- [ ] `npm run build` exit 0; slug có trong sitemap; `dist/blog/<slug>/index.html` có.
- [ ] UTM tạo bằng CLI (utm_source=blog, utm_medium=referral), lưu vào content.
- [ ] Queue chỉ đổi đúng một dòng; JSON vẫn parse được (`node -e "JSON.parse(require('fs').readFileSync('growth/content/content-queue.json','utf8'))"`).
- [ ] Có task deploy cho founder; không có lệnh deploy/rsync/ftp nào được chạy.
- [ ] Không `git commit`.

## Khi lỗi / kẹt

- Build lỗi do dependency chưa cài → `npm install` trong `growth/blog` (không thêm package mới); vẫn lỗi → BLOCKED kèm log.
- Bài là `type: letter` có placeholder `[link]` newsletter (ESP chưa chọn) → BLOCKED, `approval request --kind=access --request="Chọn ESP newsletter để thay [link] trong thư Chủ nhật"`.
- Sitemap không có slug dù build OK → kiểm `draft` trong bản mirror; vẫn thiếu → BLOCKED, không sửa config sitemap.
- Founder yêu cầu gỡ bài đã live → đổi `draft: true` cả hai bản, queue `status: "unpublished"`, build lại, task deploy mới; `memory log --file=DECISION_LOG`.

## Agent liên quan

seo-content (chủ), creative-studio (ảnh), growth-analytics (nhận UTM), founder (APPROVED, deploy, domain/ESP).

## Công cụ dùng

Read, Edit (frontmatter, queue), Bash (`cp`, `diff`, `npm run build`, `grep` sitemap), CLI `os.mjs` (`content`, `link`, `task`). Skill `attribution-tracking` nếu cần link ngoài web (Play referrer, App Store).
