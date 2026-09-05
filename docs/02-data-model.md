# 02 — Mô hình dữ liệu

## Quy ước

- Tiền: số nguyên **VND**. Không float.
- Thời lượng: số nguyên **phút**. Không giờ thập phân.
- Ngày: chuỗi `YYYY-MM-DD`. Thời điểm: ISO 8601 có timezone.
- Mọi bảng có `id` (uuid v7), `createdAt`, `updatedAt`, `deletedAt` (soft delete cho sync sau này).

## 13 bảng

### person
Người quan trọng của người dùng.
```
id · name · role (child|parent|partner|friend|self|other)
birthYear? · distanceKm? · dunbarRing (5|15|50)
desiredCadence (số lần/tháng mong muốn) · hourglassEnabled (bool, default false)
```

### timeEntry
Một khoảng thời gian đã dùng.
```
id · date · minutes · bucket (work|health|people|learn|rest|self|waste)
personId? (null nếu không với ai) · note? · source (manual|calendar|widget)
```

### workLoad
Tải công việc theo tuần. Một bản ghi mỗi tuần.
```
id · weekStart · workMinutes · commuteMinutes · prepMinutes · recoveryMinutes
```

### money
Ảnh chụp tài chính. Một bản ghi mỗi tháng.

> `savings` (tiết kiệm + đầu tư/tháng) thêm 2026-09-05: `08-three-pillars.md §Trụ 2` cần 5 ô nhập, bản đầu của file này chỉ khai 4. `savings` là số trừ cuối cùng của công thức bốc hơi — thiếu nó thì bốc hơi, phát hiện quan trọng nhất của trụ Tài chính, không tính được. Đã thêm vào cả FE, BE (`003_savings_and_waste.sql`) và registry đồng bộ.
>
> `time_entry.bucket` cùng ngày thêm khoang `waste`: mô hình ba nhóm của `08` cần nhóm LÃNG PHÍ mà sáu khoang gốc không khoang nào ánh xạ được, và công thức "giờ cần thiết = tỉnh − lãng phí − ý nghĩa" hỏng nếu thiếu.
```
id · month (YYYY-MM) · netIncome · monthlyExpense · netWorth · debt · savings
```

### expense
Một khoản chi.
```
id · occurredAt · amount · description · bucket
sourceType (manual|sms|notification) · confirmed (bool)
→ derived: hoursCost, freedomDaysCost (tính, không lưu)
```

### goal
```
id · tier (identity|season|rhythm) · title · startedAt · expiresAt
costMinutesPerWeek? · costAmountPerMonth?
status (active|renewed|expired|released) · releaseReason?
```

### moment
```
id · occurredAt · text? · mediaUri? · mediaType (photo|audio)
personIds (json array) · bucket?
```

### health
```
id · date · sleepMinutes? · steps? · energySelfRated? (1-5)
```

### mood
```
id · occurredAt · level (1-5) · note?
```

### weightOnMind
"Điều đang đè nặng."
```
id · text · writtenAt · reviewAt (writtenAt + 7 ngày)
reviewed (bool) · stillHeavy? (bool)
```

### item
Đồ đạc.
```
id · name · price? · purchasedAt? · useCount · releasedAt?
```

### space
Không gian chung.
```
id · type (pair|circle) · name · memberIds (json) · sharedModules (json)
```

### letter
Lá thư Chủ nhật đã gửi.
```
id · weekStart · body · userReaction? (helpful|neutral|off)
```

---

## Lõi vốn sống

**Không phải bảng.** Là một view/selector tổng hợp:

```
capitalLedger = f(timeEntry, expense, person, moment)
```

Mỗi giao dịch được biểu diễn dưới dạng delta trên 4 trục:

```ts
type CapitalDelta = {
  time: number;      // phút, âm = tiêu
  money: number;     // VND, âm = tiêu
  people: number;    // điểm quan hệ, dương = bồi đắp
  feeling: number;   // -2..+2, từ moment/mood liên quan
}
```

Ví dụ:
- Làm thêm 4h kiếm 1tr → `{ time: -240, money: +1_000_000, people: 0, feeling: -1 }`
- Về quê thăm bố mẹ 2 ngày → `{ time: -1440, money: -800_000, people: +8, feeling: +2 }`

Đây là thứ cho phép lá thư Chủ nhật nói được những câu ở phần "giao điểm" trong `01-modules.md`.

---

## Bảng nào thuộc phiên bản nào

| Bảng | V1 | V2 | V3 | V4 | V5 |
|---|:-:|:-:|:-:|:-:|:-:|
| person | ✓ | | | | |
| timeEntry | ✓ | | | | |
| moment | ✓ | | | | |
| workLoad | | ✓ | | | |
| money | | ✓ | | | |
| expense | | ✓ | | | |
| goal | | | ✓ | | |
| space | | | ✓ | | |
| letter | | | | ✓ | |
| health | | | | ✓ | |
| mood, weightOnMind, item | | | | | ✓ |

Schema nên viết đầy đủ ngay từ đầu, chỉ migration dần. Đừng thiết kế lại giữa chừng.
