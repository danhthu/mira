# Mira · Phase D — Khoảnh khắc cho đủ ba dạng

Tạo: 2026-08-25
Ứng với: nhóm D trong `PLAN.md`
Điều kiện trước: không có (chạy song song được với Phase B và C)

R-038 nói ghi khoảnh khắc hỗ trợ chữ, ảnh và giọng. Hiện có chữ và ảnh. R-035 nói mỗi mục hiện cả người liên quan, nhưng luồng ghi không cho chọn người nên `personIds` luôn rỗng. R-037 có dòng đếm số khoảnh khắc trong tháng nhưng chạm vào không ra gì. Xong phase khi cả ba dạng ghi được, gắn được người, và banner tháng mở ra slideshow.

---

## D1 · Ghi khoảnh khắc bằng giọng

**Nguồn:** R-038, UC-05 luồng phụ 1b

`code/fe/package.json` chưa có thư viện thu âm nào. Thêm `expo-audio` (bản đi kèm SDK 54), xin quyền micro, khai `NSMicrophoneUsageDescription` và `RECORD_AUDIO` trong `app.json`.

Trong modal ghi khoảnh khắc ở `MomentsScreen.tsx`, thêm nút thu âm: nhấn giữ hoặc nhấn để bắt đầu/dừng, lưu file vào thư mục app qua `expo-file-system`, ghi `mediaUri` và `mediaType = 'audio'`.

Một khoảnh khắc chỉ mang một `mediaUri` theo schema hiện tại — chọn giọng thì thay ảnh và ngược lại, hiện rõ cái nào đang gắn để người dùng không mất bản ghi mà không biết.

Ước lượng: vừa

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Thu 5 giây rồi lưu → có `moment` mới với `mediaType = 'audio'` và `mediaUri` trỏ tới file tồn tại thật
- [ ] Từ chối cấp quyền micro → hiện lời giải thích, không crash, vẫn ghi được bằng chữ
- [ ] Đang thu mà bấm Huỷ → không tạo `moment`, không để lại file rác trong thư mục app
- [ ] Bấm đồng hồ đo từ lúc mở app tới lúc lưu xong: dưới 15 giây (R-038)

---

## D2 · Phát lại khoảnh khắc giọng trong dòng thời gian

**Nguồn:** R-035 ("mỗi mục một dòng chữ kèm ảnh nếu có"), R-038

`MomentItem.tsx` hiện chỉ dựng ảnh. Với `mediaType = 'audio'`, hiện nút phát kèm độ dài. Chỉ một bản ghi phát tại một thời điểm — bấm bản ghi khác thì bản đang phát dừng lại.

Ước lượng: nhỏ

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Khoảnh khắc giọng hiện nút phát, bấm nghe được đúng đoạn vừa thu
- [ ] Bấm phát bản ghi thứ hai khi bản thứ nhất đang chạy → bản thứ nhất dừng
- [ ] Khoảnh khắc chỉ có chữ và khoảnh khắc có ảnh hiển thị y như trước, không lỗi bố cục

---

## D3 · Gắn người liên quan khi ghi khoảnh khắc

**Nguồn:** R-035 ("kèm ... người liên quan"), UC-05

`createMoment` trong cả `MomentsScreen.tsx` lẫn `TodayScreen.tsx` đều không truyền `personIds`, nên cột này luôn là `'[]'`. `MomentItem` đã nhận sẵn danh sách `persons` để hiển thị nhưng không bao giờ có gì để hiện. Chuỗi `vi.moments.withPeople` cũng đã có sẵn, chưa ai dùng.

Thêm bộ chọn người (chọn nhiều) vào modal ghi khoảnh khắc, ghi vào `personIds`. Ô nhập nhanh ở màn Hôm nay giữ nguyên không có bộ chọn — R-024 yêu cầu gõ và enter là xong, thêm bước chọn người là phá ràng buộc đó.

Ước lượng: vừa

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Ghi một khoảnh khắc chọn 2 người → mục đó trong dòng thời gian hiện tên cả 2
- [ ] Không chọn ai → mục hiện bình thường, không có dòng tên trống
- [ ] Ghi từ ô nhập nhanh màn Hôm nay vẫn đúng 2 thao tác (gõ + enter), không phát sinh bước chọn người
- [ ] Khoảnh khắc gắn người xuất hiện trong lịch sử gặp gỡ ở màn chi tiết Đồng hồ cát (nối với B2)

---

## D4 · Banner tháng chạm được, mở slideshow

**Nguồn:** R-037, UC-06 bước 3 và 4

`renderSectionHeader` trong `MomentsScreen.tsx` đã hiện chuỗi "Tháng N của bạn có X khoảnh khắc" nhưng là `View` trơ, chạm không ra gì — bước 4 của UC-06 chưa có.

Bọc banner bằng vùng chạm, mở một modal slideshow duyệt qua các khoảnh khắc của đúng tháng đó: ảnh full, chữ bên dưới, vuốt qua lại. Khoảnh khắc chỉ có chữ vẫn nằm trong slideshow, hiện chữ trên nền trơn.

Tháng không có khoảnh khắc nào thì không có section, nên tự nhiên không có banner — đúng A-001 mục (3), không cần code thêm, chỉ cần kiểm.

Ước lượng: vừa

**Nghiệm thu:**
- [ ] `npx tsc --noEmit` trong `code/fe` sạch
- [ ] Chạm banner tháng có 5 khoảnh khắc → mở slideshow, vuốt qua đủ 5, thoát được
- [ ] Tháng không có khoảnh khắc nào → không hiện banner cho tháng đó
- [ ] Slideshow không có nút chấm điểm, không có streak, không có phần trăm nào (R-039, R-007)

---

## D5 · Sửa lỗi nút Lưu khoá khi khoảnh khắc chỉ có ảnh

**Nguồn:** UC-05 luồng phụ 1a, R-038; `MomentsScreen.tsx`

`handleSave` cho phép lưu khi có ảnh mà không có chữ (`if (!text && !newPhotoUri) return;`), nhưng nút Lưu lại đặt `disabled={!newText.trim()}` — chọn ảnh xong không bấm Lưu được. Luồng phụ 1a của UC-05 (chọn ảnh, tạo `moment` với `mediaType = 'photo'`) hiện không đi tới đích.

Sửa điều kiện `disabled` cho khớp với điều kiện trong `handleSave`, tính cả nhánh audio thêm ở D1.

Ước lượng: nhỏ

**Nghiệm thu:**
- [ ] Chọn một ảnh, không gõ chữ → nút Lưu bấm được, tạo ra `moment` với `mediaType = 'photo'`
- [ ] Thu một đoạn giọng, không gõ chữ → nút Lưu bấm được
- [ ] Không chữ, không ảnh, không giọng → nút Lưu vẫn khoá

---

## Cổng phase

```bash
cd code/fe && npx tsc --noEmit && npm test
```

Kiểm tay:
- [ ] Ghi ba khoảnh khắc: một chữ, một ảnh, một giọng — cả ba lưu được và hiện đúng trong dòng thời gian
- [ ] Một khoảnh khắc gắn 2 người → tên hiện ra, và mục đó xuất hiện trong lịch sử gặp gỡ của cả hai
- [ ] Chạm banner tháng → slideshow chạy
- [ ] Đo đồng hồ luồng ghi nhanh nhất: dưới 15 giây (R-038)
