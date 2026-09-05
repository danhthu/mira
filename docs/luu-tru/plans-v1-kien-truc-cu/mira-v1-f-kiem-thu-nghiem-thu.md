# Mira · Phase F — Kiểm thử và đối chiếu định nghĩa xong

Tạo: 2026-08-25
Ứng với: nhóm F trong `PLAN.md`
Điều kiện trước: Phase A đến E

Hiện chỉ có 62 unit test cho `src/core/`. Toàn bộ tầng repository, màn hình và điều hướng chưa có test nào — mọi lỗi hồi quy ở đó chỉ phát hiện được bằng tay. R-063 liệt 8 tiêu chí xong V1, chưa ai đối chiếu đủ. Xong phase khi có bộ test chạy được bằng một lệnh, và 8 tiêu chí đều có bằng chứng.

---

## F1 · Test cho tầng repository

**Nguồn:** R-049, R-050, R-052; `code/fe/src/db/repositories/`

Ba repository (`person`, `timeEntry`, `moment`) chưa có test nào. Viết test chạy trên SQLite in-memory, phủ: tạo có sinh uuid v7 và `createdAt`/`updatedAt`, cập nhật có đổi `updatedAt`, xoá mềm set `deletedAt`, và mọi hàm đọc đều lọc `deletedAt IS NULL` (điểm này gắn với C2).

Mở rộng script test trong `package.json` — hiện `vitest run src/core` chỉ chạy đúng thư mục `core`, nên test mới sẽ không bao giờ chạy nếu không sửa.

Ước lượng: vừa

**Nghiệm thu:**
- [ ] `npm test` trong `code/fe` chạy cả `src/core` lẫn `src/db`, không còn giới hạn ở `src/core`
- [ ] 62 test cũ vẫn pass, không sửa file nào trong `src/core/`
- [ ] Có test khẳng định `findAllPersons` không trả về bản ghi đã set `deletedAt`
- [ ] Có test khẳng định `id` sinh ra khớp định dạng uuid v7 (R-052)

---

## F2 · Test luồng cho các use case ghi dữ liệu

**Nguồn:** UC-02, UC-03, UC-05, UC-09; R-048

Bốn luồng ghi là chỗ hỏng thì người dùng mất dữ liệu thật. Viết test mức component cho: bắt đầu và dừng phiên đếm ra đúng số phút, ghi nhanh 30/60/120/tự nhập, ghi khoảnh khắc chữ, và xoá mềm một người.

Không cố phủ hết giao diện. Bốn luồng này thôi, đúng những chỗ ghi xuống DB.

Ước lượng: vừa

**Nghiệm thu:**
- [ ] `npm test` pass toàn bộ
- [ ] Có test dựng phiên đếm với `startedAt` cách hiện tại 90 phút rồi dừng → `timeEntry.minutes === 90`
- [ ] Có test cho "Ghi nhanh" nhánh tự nhập với giá trị không hợp lệ (chuỗi rỗng, số âm) → không tạo `timeEntry` nào
- [ ] Có test đếm số thao tác của luồng ghi nhanh ≤ 3 (R-048)

---

## F3 · Rà lại chuỗi hiển thị và một chỗ lệch giữa R-020 và R-026

**Nguồn:** R-008, R-020, R-026, R-005, R-007

Hai việc:

Một, `i18n/vi.ts` đang viết `headline: (hours) => 'Tuần này bạn có ${hours} giờ vàng.'` trong khi R-020 ghi nguyên văn "Hôm nay bạn có N giờ vàng." còn R-026 lại tính theo cửa sổ 7 ngày. Bản thân đặc tả mâu thuẫn ở đây, không phải code sai. Ghi câu hỏi vào `docs/dac-ta/cau-hoi.md` chờ chốt, rồi sửa hoặc chuỗi hoặc yêu cầu cho khớp — không để hai bản khác nhau.

Hai, đọc soát toàn bộ `i18n/vi.ts`: sentence case, không dấu chấm than, không "nên/phải/hãy" (R-008); không chuỗi nào đếm ngược theo năm sống (R-005); không streak, badge, phần trăm, màu đỏ báo thiếu (R-007).

Ước lượng: nhỏ

**Nghiệm thu:**
- [ ] `docs/dac-ta/cau-hoi.md` có mã Q mới về chỗ lệch R-020/R-026, và sau khi chốt thì `i18n/vi.ts` khớp với yêu cầu
- [ ] `grep -n "!" code/fe/src/i18n/vi.ts` không ra dấu chấm than nào trong chuỗi hiển thị
- [ ] `grep -nE "hãy|bạn nên|bạn phải" code/fe/src/i18n/vi.ts` không ra kết quả
- [ ] Đọc hết file, không chuỗi nào chứa "còn N năm" hay ngôn ngữ đếm ngược sinh tử

---

## F4 · Chạy thật trên iOS và Android

**Nguồn:** R-051, R-063 tiêu chí thứ 8

Chưa có bằng chứng nào app từng chạy trên máy thật — HANDOFF chỉ nói "có thể compile TypeScript". Cài bản development từ E1 lên một máy iOS và một máy Android, đi hết bốn tab, chụp màn hình lại.

Ước lượng: nhỏ

**Nghiệm thu:**
- [ ] App mở được trên iOS thật, đi hết 4 tab không crash
- [ ] App mở được trên Android thật, đi hết 4 tab không crash
- [ ] Onboarding từ máy sạch chạy tới màn Hôm nay trên cả hai
- [ ] Ảnh chụp màn hình cả hai nền tảng lưu vào `code/docs/` để đối chiếu về sau

---

## F5 · Đối chiếu 8 tiêu chí định nghĩa xong V1

**Nguồn:** R-063

Lập bảng 8 dòng, mỗi dòng một tiêu chí, cột bằng chứng ghi rõ step nào và lệnh/thao tác nào chứng minh:

1. onboarding dưới 90 giây → C4, F4
2. ghi giờ vàng 3 chạm có widget → E3, F2
3. ghi khoảnh khắc dưới 15 giây có ảnh → D1, D5
4. đồng hồ cát bật/tắt, mặc định tắt, luôn kèm hành động → B3, B5
5. `core/` có test phủ biên → sẵn có, xác nhận lại ở F1
6. dữ liệu local, xuất JSON → sẵn có, xác nhận lại ở C2
7. không streak, badge, thông báo đỏ → F3
8. chạy iOS và Android → F4

Tiêu chí nào chưa có bằng chứng thì để trống, không tự nhận đạt. R-064 (50 người dùng thật, 30% giữ lại tuần 4) là chỉ số sau khi phát hành, không thuộc phạm vi kỹ thuật của phase này — ghi nhận rồi để đó.

Ước lượng: nhỏ

**Nghiệm thu:**
- [ ] Bảng 8 dòng nằm trong `code/docs/`, mỗi dòng có cột bằng chứng
- [ ] Không dòng nào ghi đạt mà cột bằng chứng để trống
- [ ] Dòng nào chưa đạt thì trỏ về đúng step còn dở trong `PLAN.md`

---

## Cổng phase

```bash
cd code/fe && npx tsc --noEmit && npm test
```

Kiểm tay:
- [ ] `npm test` chạy cả `src/core` lẫn `src/db`, toàn bộ pass
- [ ] Bảng 8 tiêu chí R-063 điền đủ, mỗi dòng đạt đều chỉ được ra bằng chứng
- [ ] App chạy được trên máy iOS thật và máy Android thật
