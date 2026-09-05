# Core — tầng hàm thuần

## Trạng thái hiện tại

Đã dựng tầng đáy `src/Core/` cho hai trụ đầu của `docs/08-three-pillars.md`.
Hàm thuần, không import React, không import `Common/Repositories`, không import feature nào.
Luật này được `scripts/soi-cau-truc.sh` mục 6 soi tự động (đã thử bằng file mồi: cả ba
detector đều bắt được, không phải "sạch" rỗng).

```
src/Core/
├── constants.ts    hằng số: 168 giờ/tuần, 30 ngày/tháng, ngưỡng 4 nấc giàu, ngưỡng đủ dữ liệu
├── types.ts        union dùng chung: PersonRole, DunbarRing, TimeBucket, TimeEntrySource, TimeGroup
├── dataState.ts    MetricState<T> ba trạng thái + helper
├── time.ts         trụ Thời gian
├── money.ts        trụ Tài chính
└── index.ts
```

Ba entity mới trong `src/Common/Entities/`: `Person`, `TimeEntry`, `Money`, kế thừa `base`.
Repository đăng ký trong `src/Common/Repositories/index.ts` với tên bảng `person`,
`time_entry`, `money` — cả ba nằm trong allowlist `src/Common/Sync/constants.ts` nên
tầng đồng bộ tự nhận, không phải sửa gì bên đó.

Test: `tests/core/` — 61 test, 4 suite.

## Bản đồ hàm → điều khoản

| Hàm | Công thức | Nguồn |
|---|---|---|
| `awakeMinutes` | Giờ tỉnh = 168 − giờ ngủ | 08 §Trụ 1 |
| `sumMinutes(entries, 'meaningful')` | Giờ ý nghĩa = Σ nhóm MEANINGFUL | 08 §Trụ 1 |
| `weeklyTime().necessaryMinutes` | Giờ cần thiết = tỉnh − lãng phí − ý nghĩa | 08 §Trụ 1 |
| `miraIndex` | Chỉ số Mira = ý nghĩa / tỉnh | 08 §Trụ 1 |
| `weeklyShift` | mục tiêu chuyển dịch, delta so tuần trước | 08 §"Mục tiêu của trụ Thời gian" |
| `trueLivingCost` | ô2 + ô3 | 08 §Trụ 2 |
| `freedomMonths` | max(0, netWorth) / chi phí sống thật | 08 §Trụ 2 · 03 §3 |
| `evaporation` | ô1 − ô2 − ô3 − ô4 | 08 §"Bốc hơi" |
| `savingsRate` | ô4 / ô1 | 08 §Trụ 2 |
| `freedomDaysGained` | ô4 / (ô2+ô3) × 30 | 08 §Trụ 2 · 03 §3 |
| `wealthStanding` | nấc giàu + khoảng cách tới nấc kế tiếp | 08 §"Bốn nấc giàu" · 00 rủi ro #3 |
| `averageNetIncome` | trung bình trượt 3 tháng | 03 §2 biên |
| `lifeRatePerHour` | netIncome / (giờ thật × 52/12) | 03 §2 |
| `amountToLifeHours` | amount / lifeRate | 03 §4 |
| `amountToFreedomDays` | amount / chi phí sống thật × 30 | 03 §4 |

## Quyết định đã chốt

**`MetricState<T>` thay cho `number`.** Mọi hàm tính trả về union ba nhánh
`empty | learning | ready`. Nếu chỉ trả `number`, màn hình không phân biệt được
"0 vì chưa có dữ liệu" với "0 thật" — đúng cái bẫy mà `00-vision.md` rủi ro #3 và các
mục "Biên" của `03-formulas.md` cấm. Trạng thái `learning` giữ nguyên giá trị thật,
không ngoại suy (03 §1 biên: "không ngoại suy").

**Ràng buộc cứng #2 cưỡng chế bằng kiểu, không bằng comment.** `amountToLifeHours`
chỉ nhận `ConvertibleAmount`, và chỉ hai hàm `expenseAmount()` / `workLoadAmount()`
tạo ra được kiểu đó. `TimeEntry` với `bucket = 'people'` không có đường nào đi vào
phép quy đổi — trình biên dịch chặn ngay ở tham số. Không có hàm nào trong `Core/`
quy đổi giờ với người thân ra tiền.

**`hourglassEnabled` khởi tạo `false` ngay trong khai báo trường.** Ràng buộc cứng #4.
Đặt ở entity chứ không ở màn hình tạo mới, để mọi đường tạo `Person` đều tắt mặc định.

**Nấc giàu là bốn khoảng liền nhau, không có kẽ hở.** `08` ghi "Linh hoạt 1–5 năm ·
Tự do > 25 năm" — khoảng 5–25 năm không thuộc nấc nào. Chọn phương án an toàn: Linh
hoạt kéo từ 12 tháng tới 300 tháng, Tự do từ 300 tháng trở lên. Không ai bị rơi ra
ngoài thang, và không ai bị đôn lên nấc cao hơn spec cho phép.

**`wealthStanding` trả union `in_debt | on_ladder`, không trả số trần.**
`00-vision.md` rủi ro #3. Khi `netWorth < 0` thì trả quãng đường về vạch 0
(`shortfall`, `monthsOfSavingToBreakEven`) chứ không trả số âm, đúng 03 §3 biên.
Khi `savings ≤ 0` thì `monthsOfSaving*` là `null` — không hứa quãng đường không tính được.

**`necessaryMinutes` là phần dư, không phải tổng bản ghi khoang `work`.** Bản ghi
`bucket = 'work'` vẫn đọc được qua `sumMinutes(entries, 'necessary')` nếu màn hình
cần, nhưng công thức phần dư không trừ nó lần nữa — nó đã nằm sẵn trong phần dư.

**Ghi vượt quỹ giờ tỉnh trả `empty('inconsistent')`, không kẹp về 0.** Số 0 sẽ trông
như "tuần này không có việc cần thiết nào", tệ hơn là nói thẳng dữ liệu đang lệch.

**`weeklyShift.shiftedMinutes` chỉ đếm phần vừa tăng ý nghĩa vừa giảm lãng phí.**
Tăng giờ ý nghĩa bằng cách cắt giấc ngủ không phải chuyển dịch và không được khen —
`08` §"Mục tiêu của trụ Thời gian" nói rõ đây là mục tiêu chuyển dịch, không phải
mục tiêu tuyệt đối.

**`Common/Entities/` được import `Core/`.** Không phá luật 1 ("Common không import
feature"): `Core/` không phải feature, nó nằm dưới cả `Common/`. Chiều mũi tên vẫn
đi xuống. Union type (`PersonRole`, `TimeBucket`…) đặt ở `Core/types.ts` để entity và
công thức dùng chung một nguồn — giống cách `be/src/shared/types/enums.ts` làm ở backend.

## Lệch spec đã phát hiện

1. **`Money.savings` — thiếu cột trong `02-data-model.md`.** `08` §"Chỉ 5 ô nhập" cần
   5 ô, trong đó ô4 là "Tiết kiệm + đầu tư / tháng"; `02` chỉ khai 4 cột
   (`netIncome`, `monthlyExpense`, `netWorth`, `debt`). Thiếu ô4 thì **không tính được
   bốc hơi** — phát hiện chính của cả trụ Tài chính. Đã thêm `savings`.
   `code/be/src/entities/Money.ts` cũng thiếu cột này, cần đồng bộ bên backend và
   trong hợp đồng `docs/09-sync-contract.md`.

2. **`TimeBucket` thiếu giá trị `waste`.** `02` khai 6 khoang
   `work|health|people|learn|rest|self`; `08` §Trụ 1 gom thành 3 nhóm mà nhóm LÃNG PHÍ
   không ánh xạ được vào khoang nào trong 6 khoang đó. Không có `waste` thì không tính
   được giờ cần thiết, tức là hỏng "quyết định thiết kế quan trọng nhất của toàn app".
   Đã thêm `'waste'` thành khoang thứ bảy. Ánh xạ đang dùng:
   `people|health|learn|rest|self → meaningful`, `work → necessary`, `waste → waste`.
   `be/src/shared/types/enums.ts` cần thêm giá trị tương ứng.

3. **`Money.debt` nghĩa gì.** `02` chỉ ghi tên cột. `08` ô3 là "Trả nợ / tháng
   (gốc + lãi)", còn `08` §"Nợ, vay, đầu tư" nói dư nợ đã trừ sẵn trong tài sản ròng.
   Chọn: `debt` = **tiền trả nợ mỗi tháng**, không phải dư nợ còn lại. Nếu hiểu ngược
   lại thì `trueLivingCost` sẽ phồng lên hàng trăm lần và mọi chỉ số của trụ Tài chính sai.

4. **Nấc giàu hở khoảng 5–25 năm** — xem "Quyết định đã chốt".

5. **`03-formulas.md` §3 dùng `monthlyExpense` làm mẫu số, `08` dùng `ô2 + ô3`.**
   Theo `08` vì nó mới hơn và nói rõ "chi phí sống thật". Hệ quả: `freedomMonths` ở
   Core chia cho `monthlyExpense + debt`, không chia cho `monthlyExpense` một mình.

6. **`03-formulas.md` §3 biên nói `X = |netWorth| / monthlySaving`, nhưng "monthlySaving"
   không phải cột nào trong `02`.** Đã ánh xạ vào `savings` (ô4).

## Câu hỏi còn mở

- Ai chốt việc bổ sung `savings` và `waste` sang `code/be` và `docs/09-sync-contract.md`?
  Tầng FE đã đi trước; nếu backend không theo, bản ghi `money` đẩy lên sẽ rụng mất ô4.
- Ngưỡng "đủ tin" hiện là 7 ngày (thời gian) và 3 tháng (thu nhập), lấy từ `03-formulas.md`.
  Chưa có ngưỡng nào cho `wealthStanding` — hiện một tháng dữ liệu là đã `ready`.
  Cần quyết có bắt buộc 2–3 tháng trước khi hiện nấc giàu không.
- `workLoad` (giờ làm thật) chưa có entity ở FE. `lifeRatePerHour` đang nhận
  `realWorkMinutesPerWeek` dạng số trần; khi dựng bảng `work_load` thì nối vào.

## Bước tiếp theo

1. Thêm entity + repository `work_load` (`work_load` đã có trong allowlist đồng bộ),
   nối vào `lifeRatePerHour`.
2. Viết selector đọc `timeEntryRepository` / `moneyRepository` rồi gọi hàm Core —
   selector thuộc tầng `Models/` của feature, **không** thuộc `Core/`.
3. Dựng màn hình "bốn con số" của `08` §"Bảng điều khiển", phân nhánh đủ ba trạng thái
   `MetricState` cho từng con số.
4. Trụ 3 (Mục tiêu) — `03-formulas.md` §7 và `08` §Trụ 3, gồm luật vàng "khai nguồn"
   và cảnh báo xung đột. Chưa động tới.
