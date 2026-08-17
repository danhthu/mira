# 03 — Công thức

Toàn bộ nội dung file này phải được implement trong `src/core/` dưới dạng **hàm thuần** và có test.

---

## 1 · Giờ vàng

```
goldenHoursPerWeek = Σ timeEntry.minutes / 60
                     WHERE bucket = 'people' OR bucket = 'self'
                     AND date trong 7 ngày qua
```

Hiển thị: làm tròn 1 chữ số thập phân. "14,5 giờ".

**Biên:**
- Tuần chưa đủ 7 ngày dữ liệu → hiển thị "đang tính, cần thêm N ngày", không ngoại suy.
- Không có dữ liệu → không hiện 0. Hiện lời mời ghi lần đầu.

---

## 2 · Tỷ giá đời

```
realWorkHours = (workMinutes + commuteMinutes + prepMinutes + recoveryMinutes) / 60
lifeRate = netIncome / (realWorkHours × 52 / 12)
```

`netIncome` là thu nhập **sau thuế và bảo hiểm**, theo tháng.

**Biên:**
- **Thu nhập không đều / freelance**: dùng trung bình trượt 3 tháng gần nhất. Nếu chưa đủ 3 tháng, dùng trung bình số tháng có.
- **Nhiều nguồn thu**: cho phép nhập nhiều dòng income, mỗi dòng có giờ riêng. Tỷ giá tổng = Σincome / Σgiờ. Đồng thời hiện tỷ giá từng nguồn — đây là insight mạnh ("nghề tay trái trả cao gấp đôi nghề chính").
- **Thu nhập thụ động** (cho thuê, cổ tức): KHÔNG tính vào tỷ giá đời (0 giờ → chia cho 0). Tính riêng vào `netWorth`.
- **realWorkHours = 0** → không hiển thị chỉ số, hiện "cần nhập giờ làm việc".
- **Người không đi làm** (nội trợ, sinh viên) → ẩn hoàn toàn chỉ số này, không hiện 0đ/giờ.

---

## 3 · Vốn tự do

```
freedomMonths = max(0, netWorth) / monthlyExpense
```

`netWorth` = tài sản thanh khoản (tiền mặt, tiết kiệm, chứng khoán) − nợ ngắn hạn.
**Không tính** nhà đang ở, xe đang dùng — chúng không bán được để sống.

Hiển thị:
- < 1 tháng → hiện bằng ngày
- 1–24 tháng → hiện bằng tháng
- > 24 tháng → hiện bằng năm, 1 chữ số thập phân

**Biên:**
- **netWorth âm (đang nợ)**: KHÔNG hiện số âm. Hiện "Bạn đang cách vạch tự do X tháng tiết kiệm" với `X = |netWorth| / monthlySaving`.
- **monthlyExpense = 0** → không hiển thị.
- **monthlySaving ≤ 0** → không tính quãng đường, chỉ hiện trạng thái hiện tại.

### Delta tự do (quan trọng hơn con số tuyệt đối)

```
freedomDaysGained = monthlySaving / monthlyExpense × 30
```

> "Tháng này bạn mua thêm 20 ngày tự do."

Đây là con số nên hiện to nhất, không phải `freedomMonths`. Nó luôn khả thi kể cả với người mới bắt đầu.

---

## 4 · Quy đổi chi tiêu

```
hoursCost      = expense.amount / lifeRate
freedomDaysCost = expense.amount / monthlyExpense × 30
```

> Điện thoại 25.000.000đ = **217 giờ đời bạn** = **41 ngày tự do bị đẩy lùi**

**Ràng buộc cứng**: phép quy đổi này CHỈ áp cho `expense` và `workLoad`.
Tuyệt đối không áp cho `timeEntry` có `bucket = 'people'`. Giờ vàng không có giá.

---

## 5 · Đồng hồ cát

### Với con
```
yearsLeft   = 18 − childAge
hoursLeft   = currentWeeklyHours × 52 × yearsLeft
hoursIfMore = targetWeeklyHours × 52 × yearsLeft
```

### Với bố mẹ ở xa
```
yearsLeft    = max(0, lifeExpectancy − parentAge)     // lifeExpectancy mặc định 78, cho sửa
visitsLeft   = visitsPerYear × yearsLeft
daysTogether = visitsLeft × daysPerVisit
```

**Bắt buộc khi hiển thị:**
1. Chỉ hiện khi `person.hourglassEnabled = true`.
2. Luôn kèm một hành động cụ thể ngay bên dưới ("đặt lịch gọi", "chọn cuối tuần về").
3. Không dùng từ ngữ đếm ngược sinh tử. Viết "còn khoảng 68 lần gặp", không viết "bố mẹ bạn còn 10 năm".
4. Có nút "ẩn vĩnh viễn" ngay trên card.

---

## 6 · Ngân sách 168 giờ

```
allocated  = Σ bucket.plannedMinutes
unallocated = 168×60 − allocated
borrowed[bucket] = actualMinutes − plannedMinutes   // dương = vay
```

Ràng buộc: `allocated ≤ 168×60`. Nếu người dùng phân bổ vượt, chặn và hiện khoang nào phải giảm.

---

## 7 · Giá của mục tiêu (V3)

```
goalCostHours  = costMinutesPerWeek / 60
goalCostMoney  = costAmountPerMonth
freedomDelay   = costAmountPerMonth / monthlyExpense × 30   // ngày/tháng
conflict       = Σ tất cả goal.costMinutesPerWeek > quỹ giờ khoang tương ứng
```

Nếu tổng chi phí mọi mục tiêu vượt 168h/tuần → chặn thêm mục tiêu mới.
