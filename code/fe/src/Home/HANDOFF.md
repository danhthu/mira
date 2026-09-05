# Home — màn hình chính

## Trạng thái hiện tại

Viết lại toàn bộ theo `docs/08-three-pillars.md` §"Bảng điều khiển: bốn con số duy
nhất". Màn hình còn đúng bốn khối:

```
src/Home/
├── Text/index.ts          mọi chuỗi, không chuỗi nào nằm trong JSX
├── Entities/index.ts      MomentNote + repository `moment` (đặt tạm, xem bên dưới)
├── Models/
│   ├── constants.ts       khoảng ghi nhanh, ngưỡng đổi đơn vị tiền, khoá phiên đếm
│   ├── format.ts          định dạng kiểu Việt (dấu phẩy thập phân, ngày tiếng Việt)
│   ├── week.ts            cắt tuần thứ hai → chủ nhật, lọc bản ghi theo tuần
│   ├── dashboard.ts       chọn dữ liệu → gọi Core, không có công thức nào ở đây
│   ├── presenter.ts       MetricState → chữ, phân nhánh đủ ba trạng thái
│   └── logging.ts         ghi time_entry / person / moment, phiên đếm giờ
├── Components/            Board · Metric · PeopleRow · WasteRow · MomentInput · QuickSheet
└── Screens/Home.tsx       lắp bốn khối, không còn ImageBackground
```

Test: `tests/home/` — 28 test, 3 suite (format, week, dashboard+presenter).

## Đã gỡ khỏi màn chính

Donut biểu đồ (`TimeUsedSection`), hàng mood tuần (`EmotionApp.Components.Card`),
thẻ mục tiêu (`GoalApp.Components.Card`), thẻ Việc/Thói quen, nút "Trading
Monitoring", ảnh nền `Assets/bg.jpg` (xoá file), câu động lực lấy từ repository
`wish`, và toàn bộ `Tools` chết.

Năm nút trỏ vào route không tồn tại đã biến mất cùng chúng: `navigate('Trading')`,
`TabScreen{screen:'WorkApp'}`, `TabScreen{screen:'HabitApp'}`, `WorkApp`,
`HabitApp`. Màn hình giờ chỉ còn một đường điều hướng duy nhất là `SettingApp`
(đã đăng ký sẵn trong `MainScreen.tsx`), nên không cần thêm route nào để chạy.

## Quyết định đã chốt

**Bỏ hẳn câu động lực tiếng Anh.** `08` nói màn chính chỉ có bốn con số, và
`00-vision.md` §Giọng nói Mira là "người bạn điềm đạm, không phải huấn luyện
viên". Câu động lực vừa là chữ tiếng Anh sót lại trong dữ liệu, vừa là giọng sai.
Không dịch, không thay bằng câu tiếng Việt — gỡ.

**Hai con số thời gian không đi qua `weeklyTime()`.** Hàm đó cần giờ ngủ để suy
giờ cần thiết; FE chưa có bảng `health` nên chưa có giờ ngủ thật. Bịa một con số
ngủ mặc định sẽ làm `weeklyTime` trả `inconsistent` mỗi khi tổng giờ ghi vượt quỹ
giả định, tức là làm biến mất chính hai con số quan trọng nhất. `Models/dashboard.ts`
gọi thẳng `sumMinutes` + `daysCovered` + `metricByCoverage` của Core — hai con số
này không phụ thuộc giờ tỉnh, và ngưỡng "đủ 7 ngày" vẫn là ngưỡng của Core.

**Delta tính tại chỗ thay vì gọi `weeklyShift()`** — cùng một lý do: `weeklyShift`
gọi `weeklyTime` nên cũng đòi giờ ngủ. Delta ở đây chỉ là hiệu hai tổng, không phải
`shiftedMinutes`. Khi có bảng `health`, chuyển cả hai sang `weeklyTime`/`weeklyShift`
và hiện thêm dòng "bạn đã chuyển được N giờ" của `08`.

**Nhóm chưa có bản ghi nào thì trạng thái là `empty`, không phải 0.** Tuần đầu cả
bốn ô đều hiện dấu gạch kèm một dòng mời nhập. Không ô nào hiện "0", không ô nào
hiện số âm — `00-vision.md` rủi ro #3.

**Dưới một giờ thì hiện phút, không hiện "0,0 h".** Ghi 15 phút xong mà ô hiện
"0,0 h" thì trông hệt như chưa ghi gì — đúng cái bẫy mà `MetricState` sinh ra để
tránh, chỉ là ở dạng làm tròn. Đổi đơn vị thay vì đổi con số.

**`wealthStanding` luôn hiện kèm quãng đường.** Đang trên thang thì "ở nấc an toàn ·
còn 2,5 tháng nữa tới linh hoạt" và, nếu biết tiết kiệm, thêm "ở nhịp tiết kiệm
này, khoảng 8,0 tháng nữa". Tài sản ròng âm thì không hiện số tháng nào cả, chỉ
hiện "chưa tới vạch 0" kèm quãng đường về vạch 0.

**Bốc hơi âm đổi nhãn, không đổi dấu.** Thu nhỏ hơn chi thì nhãn thành "tháng này
tiêu quá thu" và số vẫn dương. Sự thật giữ nguyên, màn hình không có số âm.

**Dòng "= 43 giờ đời" chỉ hiện khi biết giờ làm thật.** `lifeRatePerHour` nhận
`sumMinutes(tuần này, 'necessary')`, tức là tổng bản ghi khoang `work`. Chưa ai ghi
khoang đó thì hàm trả `not_applicable` và dòng này biến mất — không hiện "0 giờ đời".
Nối vào bảng `work_load` khi bảng đó có entity.

**Ràng buộc cứng #2 không bị lách.** Chỗ duy nhất gọi `amountToLifeHours` là dòng
bốc hơi, và nó đi qua `expenseAmount()`. Không có đường nào từ `TimeEntry` khoang
`people` tới phép quy đổi ra tiền.

**Số chạm để ghi một giờ.** Chạm avatar = bắt đầu đếm, chạm "dừng và ghi" = xong →
**2 chạm**. Giữ avatar rồi chọn "1 giờ" → **2 thao tác**. Lãng phí: chạm nhãn = ghi
30 phút → **1 chạm**. Khoảnh khắc: gõ rồi enter → **1 thao tác**. Tất cả dưới trần
3 chạm của `05-v1-spec.md` DoD #2.

**Phiên đếm giờ nằm trong AsyncStorage, không phải bảng nghiệp vụ.** Khoá
`home_running_session`. Đóng app giữa chừng vẫn đếm tiếp; phiên trỏ vào người đã bị
xoá thì tự dọn, không thì số giờ đang đếm treo vĩnh viễn mà không có nút dừng nào.

**Không dùng màu theo dấu của delta.** Dấu trừ ở dòng lãng phí là tin tốt, dấu trừ
ở dòng ý nghĩa thì không — tô màu theo dấu sẽ phán xét sai (ràng buộc cứng #3).
Toàn màn hình 0 màu viết cứng (trước đợt này là 16).

## Câu hỏi còn mở

- `MomentNote` và repository `moment` đang đặt ở `src/Home/Entities/` vì đợt này chỉ
  được sửa `src/Home/**`. Chỗ đúng của nó là `src/Common/Entities/` cạnh `person`
  và `time_entry` — chuyển khi thư mục đó rảnh. Tên bảng `moment` đã nằm sẵn trong
  allowlist đồng bộ nên không phải sửa gì bên `Common/Sync`.
- Nút "thêm người" ngay trên màn chính là tạm: chỉ hỏi tên, đặt `role = 'other'` và
  `dunbarRing = 5`. Khi module Người có route riêng thì thay bằng đường dẫn sang đó
  và bỏ ô nhập tại chỗ. Không có nó thì màn hình chết cứng ở lần mở đầu tiên vì
  chưa có ai để chạm.
- Hai dòng tiền chưa có đường dẫn sang màn nhập năm ô — module Tài chính đang được
  agent khác dựng, chưa đăng ký route. Khi có route, nối dòng "chưa có năm ô tài
  chính" vào đó.
- Ngưỡng "đủ 7 ngày" khiến tuần nào cũng ở trạng thái `learning` cho tới chủ nhật.
  Đúng `03-formulas.md` §1 biên, nhưng cần xem người dùng thật có thấy phiền không.

## Bước tiếp theo

1. Nối hai dòng tiền vào màn nhập năm ô khi module Tài chính đăng ký route.
2. Thay nút "thêm người" bằng đường sang module Người.
3. Có bảng `health` thì chuyển sang `weeklyTime`/`weeklyShift` và hiện dòng
   "bạn đã chuyển được N giờ" của `08` §"Mục tiêu của trụ Thời gian".
4. Chuyển `MomentNote` xuống `src/Common/Entities/`.
