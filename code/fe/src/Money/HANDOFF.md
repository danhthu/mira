# Money — trụ 2, Tài chính

## Trạng thái hiện tại

Hai màn hình đã chạy được trên web, đã soi bằng trình duyệt cả ba kịch bản biên
(đủ dữ liệu · tài sản ròng âm · chưa nhập gì).

```
src/Money/
├── constants.ts              quy ước hiển thị + cửa sổ đọc dữ liệu (không có ngưỡng nghiệp vụ)
├── Text/index.ts             toàn bộ chữ, không chuỗi nào nằm trong .tsx
├── Models/                   hàm thuần, test được, không React
│   ├── format.ts             tách nhóm nghìn, dấu phẩy thập phân, đổi đơn vị theo 03 §3
│   ├── month.ts              khoá tháng YYYY-MM theo giờ máy
│   ├── summary.ts            selector: bản ghi tháng → cụm MetricState
│   ├── lifeRate.ts           suy giờ làm thật từ bản ghi thời gian
│   ├── dashboard.ts          ghép hai nguồn thành một cụm
│   └── storage.ts            đọc/ghi moneyRepository, đọc timeEntryRepository
├── Hooks/useMoneyDashboard.ts
├── Components/               AmountInput · Card · StandingCard · EvaporationCard · StatCard · PrimaryButton
└── Screens/                  Overview · MonthlyEntry · Container
```

Không có phép chia nào trong `.tsx`. Mọi công thức gọi thẳng `src/Core/money.ts`;
`Models/` chỉ gom dữ liệu và giữ nguyên `MetricState` của Core.

Test: `tests/money/format.spec.ts` + `tests/money/summary.spec.ts` — 22 test.

## Quyết định đã chốt

**Không có màn ghi từng khoản chi, không có màn danh mục đầu tư.** `08` §"Những gì
bị cắt" và §"Nợ, vay, đầu tư" gọi đây là ranh giới cứng. Ô 4 gộp tiết kiệm và đầu
tư thành một dòng, và chú thích ngay dưới ô nói rõ Mira không theo dõi danh mục.

**Ô 5 nhập độ lớn, dấu do một công tắc quyết định.** Bàn phím số không có dấu trừ,
mà tài sản ròng âm là trạng thái có thật. Công tắc "đang nợ nhiều hơn có" giữ cho
màn nhập lẫn màn hiển thị không có ký tự `-` nào — `03` §3 biên cấm hiện số âm.
`formatDecimal` cũng bọc `Math.abs`, nên kể cả gọi nhầm cũng không lọt ra dấu trừ.

**Thu nhập dùng trung bình trượt 3 tháng, không dùng con số tháng vừa nhập.**
`03` §2 biên. Hệ quả: chưa đủ 3 tháng thì cả cụm chỉ số ở trạng thái `learning` và
màn hình nói "con số đang hình thành, đã có N trên 3 tháng" — không hiện "0 tháng",
cũng không giấu hẳn con số đã có.

**Số của tháng gần nhất được điền sẵn khi mở màn nhập.** Bốn trong năm ô hiếm khi
đổi, nên vòng lặp tháng còn là sửa chỗ nào lệch. Đo thật trên trình duyệt: gõ đủ
năm ô ở nhịp 4 phím/giây mất **11,9 giây**, xa dưới trần 2 phút của `08` §"Ba vòng lặp".
Chỉ điền sẵn một lần mỗi lần mở màn (`useRef`), để bản ghi đổi sau khi lưu không đè
lên chữ đang gõ.

**Giờ đời suy từ bản ghi thời gian nhóm CẦN THIẾT trong 4 tuần gần nhất.** Chưa có
bảng `work_load` (`src/Core/HANDOFF.md` §"Câu hỏi còn mở"), mà `08` §"Bốc hơi" đòi
câu "5 triệu = 43 giờ đời bạn". Đọc `timeEntryRepository` qua `Common/` là hợp luật
import (feature không import feature khác, nhưng được import `Common/`). Chưa có bản
ghi nào thì `lifeRatePerHour` trả `not_applicable` và **dòng giờ đời biến mất hẳn** —
không hiện 0đ/giờ cho người nội trợ, đúng `03` §2 biên.

**Bốc hơi âm không quy ra giờ đời.** Tháng chi vượt thu thì con số đó là tiền đã rút
khỏi tài sản, không phải phần "không nhớ đi đâu". Màn hình nói "tháng này chi vượt
thu X" bằng số dương, không có dấu trừ, không có màu.

**Không màu nào mang nghĩa cảnh báo.** Cả màn dùng `surface` / `border` /
`textPrimary` / `textSecondary` / `accent`; không có token đỏ hoặc cam để mà dùng.
Vòng focus của ô nhập trên web bị ép về `token.accent` — mặc định của trình duyệt
nằm trong dải cam, đúng thứ ràng buộc cứng #3 không cho xuất hiện.

**Ràng buộc cứng #2 không cần canh bằng mắt.** Quy đổi tiền → giờ đời chỉ đi qua
`expenseAmount()`. Trong cả thư mục này không có chỗ nào tạo `ConvertibleAmount` từ
thời gian với người thân, và cũng không có phép ép kiểu nào quanh `ConvertibleAmount`.

## Lệch spec đã phát hiện

1. **Ví dụ "còn 7 tháng tiết kiệm" trong `08` không khớp chính số liệu của nó.**
   180tr → nấc Linh hoạt cần 12 × 19tr = 228tr, thiếu 48tr, chia cho 6tr tiết kiệm
   ra **8 tháng**. Màn hình hiện 8 vì đó là kết quả của `Core.wealthStanding()`;
   không sửa Core, không viết cứng số 7.

2. **`02-data-model.md` không có cột nào cho "tháng" của bản ghi `money`.**
   Entity đã có `month`, dùng khoá `YYYY-MM` tính theo giờ máy. Ghi lại ở đây vì
   hợp đồng đồng bộ cần biết đây là khoá tự nhiên của bảng.

## Câu hỏi còn mở

- Route `MoneyApp` chưa được đăng ký trong `src/Main/MainScreen.tsx` (file của agent
  khác). Cần thêm một `Stack.Screen name="MoneyApp"` trỏ vào `MoneyApp.Screens.Container`.
- Ngưỡng bao nhiêu tháng dữ liệu thì `wealthStanding` mới đáng tin vẫn chưa ai chốt
  (câu hỏi cũ của `Core/HANDOFF.md`). Hiện tại lấy tạm ngưỡng của thu nhập trung bình
  trượt: dưới 3 tháng thì cả cụm là `learning`.
- Bản ghi `work_load` chưa tồn tại. Khi có, `Models/lifeRate.ts` chuyển sang đọc
  bảng đó thay vì suy từ `time_entry`, và cửa sổ 4 tuần bỏ đi được.
- Người dùng chưa có đường sửa lại tháng cũ — màn nhập luôn ghi cho tháng hiện tại.
  Chưa rõ có cần lịch sử theo tháng trong V1 không.

## Bước tiếp theo

1. Nối route (xem "Câu hỏi còn mở") rồi bỏ dòng này.
2. Khi trụ Mục tiêu bắt đầu: `08` §Trụ 3 luật vàng "tiền này lấy từ đâu" đọc thẳng
   `summarizeMoney().evaporation` — không cần thêm gì ở đây.
