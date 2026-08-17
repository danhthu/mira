# 05 — Đặc tả V1

Phạm vi V1: **M1 Thời gian** (Giờ vàng + Đồng hồ cát) và **M5 Khoảnh khắc**.
Không AI. Không sync. Không tài chính. Không mục tiêu.

---

## Cấu trúc thư mục

```
src/
  core/                  ← hàm thuần, có test, không import React
    goldenHours.ts
    hourglass.ts
    constants.ts
  db/
    schema.ts            ← Drizzle, viết đủ 13 bảng ngay
    migrations/
    repositories/
  screens/
    Today.tsx
    Hourglass.tsx
    Moments.tsx
    Settings.tsx
  components/
  i18n/vi.ts             ← toàn bộ chuỗi hiển thị
  store/                 ← Zustand
```

---

## Onboarding

Đây là phần khó nhất. Phải hỏi tuổi bố mẹ và người thân mà không làm người ta bỏ chạy.

**Nguyên tắc: 4 bước, mỗi bước 1 câu hỏi, bỏ qua được hết.**

1. **"Ai là người bạn muốn giữ thời gian cho?"**
   Chọn từ gợi ý: Con · Bố mẹ · Bạn đời · Bạn thân · Bản thân. Chọn nhiều được. Chưa hỏi tên.
2. **Nhập tên từng người.** Một màn hình, danh sách, gõ nhanh.
3. **"Bạn muốn gặp họ bao nhiêu lần một tháng?"** Slider, mặc định theo vai trò (con: hằng ngày, bố mẹ: 2 lần/tháng).
4. **Xong.** Không hỏi tuổi. Không hỏi thu nhập.

Tuổi và khoảng cách chỉ hỏi **sau này**, khi người dùng chủ động bật Đồng hồ cát trong Settings. Kèm giải thích thẳng thắn tại sao cần: *"Để tính con số này, Mira cần biết tuổi. Con số có thể khiến bạn thấy nặng — bạn có thể tắt bất cứ lúc nào."*

---

## Màn hình 1 · Hôm nay

Nội dung tối giản, một dòng chính:

> **Hôm nay bạn có 2 giờ vàng.**

Dưới đó:
- Danh sách người đã ở cùng hôm nay (avatar + số phút)
- Nút lớn **"Bắt đầu"** → chọn người → đếm giờ chạy nền
- Nút phụ **"Ghi nhanh"** → chọn người + chọn khoảng (30p / 1h / 2h / tự nhập)
- Ghi khoảnh khắc: một ô input luôn hiện, gõ và enter là xong

**Không có**: dashboard, biểu đồ, phần trăm, so sánh với tuần trước.

---

## Màn hình 2 · Đồng hồ cát

Mặc định màn hình này **trống**, chỉ có một dòng giải thích và nút bật.

Khi đã bật, mỗi người một card:

```
┌─────────────────────────────────┐
│ Mẹ                              │
│ Gặp 4 lần/năm · 2 ngày mỗi lần  │
│                                 │
│ Còn khoảng 68 lần gặp           │
│                                 │
│ [ Đặt lịch gọi ]  [ Ẩn card ]   │
└─────────────────────────────────┘
```

Chạm vào card → lịch sử gặp gỡ (từ `timeEntry` + `moment` liên quan) và nút "hẹn lần tới".

---

## Màn hình 3 · Khoảnh khắc

Dòng thời gian ngược, gộp theo tháng. Mỗi mục: 1 dòng chữ, ảnh nếu có, người liên quan.
Nút ghi mới luôn nổi ở góc.

Cuối mỗi tháng: banner "Tháng 8 của bạn có 12 khoảnh khắc" → chạm để xem lại dạng slideshow. (Thước phim đầy đủ để V4.)

---

## Màn hình 4 · Settings

- Danh sách người quan trọng (thêm/sửa/xóa)
- Bật/tắt Đồng hồ cát cho từng người
- Giới nghiêm buổi tối (giờ, mặc định 21h)
- Ngày trắng (chọn thứ trong tuần, mặc định tắt)
- Xuất dữ liệu ra JSON
- Xóa toàn bộ dữ liệu

---

## Widget & nhập nhanh

- **Widget màn hình chính**: 3 avatar người hay gặp nhất, chạm 1 phát là bắt đầu đếm.
- **iOS Shortcut / Android quick tile**: "Ghi 1 giờ với [người]".
- **Ngân sách**: ghi một lần phải xong trong ≤ 3 chạm.

---

## Định nghĩa xong (Definition of Done) cho V1

1. Cài app, onboarding xong trong dưới 90 giây.
2. Ghi được giờ vàng bằng 3 chạm, có widget.
3. Ghi được khoảnh khắc dưới 15 giây, có ảnh.
4. Đồng hồ cát bật/tắt được, mặc định tắt, luôn kèm hành động.
5. Toàn bộ `src/core/` có test, phủ hết các trường hợp biên trong `03-formulas.md`.
6. Dữ liệu nằm hoàn toàn trên máy, xuất được JSON.
7. Không có streak, badge, thông báo đỏ ở bất kỳ đâu.
8. Chạy được trên cả iOS và Android.

---

## Việc đầu tiên cho Claude Code

1. Scaffold Expo + TypeScript strict + Drizzle + Zustand.
2. Viết `src/db/schema.ts` đầy đủ 13 bảng theo `02-data-model.md`.
3. Viết `src/core/goldenHours.ts` và `src/core/hourglass.ts` kèm test, theo `03-formulas.md`.
4. Dựng 4 màn hình rỗng với navigation.
5. Nối màn hình Hôm nay với dữ liệu thật.

Làm xong bước nào báo lại rồi mới sang bước tiếp.
