# Thói quen (HabitTracker)

## Trạng thái hiện tại

Đợt 2026-09-05 thiết kế lại cả nhận diện lẫn luồng dùng, không chỉ đổi màu. Module
từ 92 file xuống 73 file. Năm cổng kiểm đều qua; phần đóng góp của module vào
`soi-mau.mjs` từ 78 dòng xuống 0.

Ba màn chính đã kiểm bằng trình duyệt ở 375×812: danh sách, thêm, thống kê. Không
màn nào trắng, không chỗ nào dùng màu đỏ để báo người dùng làm chưa đủ.

## Quyết định đã chốt

### 1. Gỡ toàn bộ cơ chế chấm điểm (ràng buộc cứng #3)

Đợt trước đã gỡ streak, nhưng bên dưới vẫn còn nguyên một hệ thống điểm số đầy đủ
mà không ai rà tới:

| Thứ đã gỡ | Ở đâu |
|---|---|
| `getWeeklyScores` / `getDailyScore` / `getMonthlyScore` + hai bộ nhớ đệm điểm | `Entities/habitRepository.ts:407–571` |
| Trường `Habit.score` (mặc định 20 điểm/thói quen) | `Entities/Habit.ts:36–37` |
| `ScoreComponent` — vòng tròn điểm số cỡ 50px, kèm câu "your daily habits **are not completed**" | `Components/ScoreComponent.tsx` (xoá) |
| `WeeklyScoreView` — điểm tuần cỡ 48px + **một đến ba ngôi sao vàng** `#FFD700` | `Components/WeekScore.tsx` (xoá) |
| Tab "Hôm nay": "điểm hôm nay giảm x% so với hôm qua", nền `colors.error` | `Screens/Statistic/StatisticToday.tsx` (xoá) |
| Ô "Success Rate" / "Perfect days" + `getRecord` trả `successRate`/`monthlyRate`/`perfect` | `Screens/Statistic/StatisticOverall.tsx:34–112`, `habitRepository.ts:350–399` |
| Ngưỡng màu theo tỷ lệ hoàn thành (`< 50%` → xám đậm, `> 50%` → `colors.warning`) | `Screens/Statistic/StatisticSumary.tsx:103–105` (xoá) |
| Icon sao vàng cạnh mỗi thói quen | `Screens/Statistic/StatisticSelection.tsx:79` (xoá) |
| Ảnh **mặt buồn** `no_habit.png` / `no_habit_tracker.png` ở mọi trạng thái rỗng | `Assets/` (xoá) |
| Chữ trạng thái rỗng tô `colors.error` / `colors.errorColors[200]` | `HomeScreen.tsx:260`, `StatisticSumary.tsx:117` |
| Icon chuông màu `'orange'` kèm câu "You not set alarm" | `Screens/DetailScreen.tsx:213` |

`getRecord` thay bằng `getTotals`: ba con số đếm được (lần đã ghi, số ngày có ghi,
ngày có ghi trong tháng). Không còn mẫu số nào để người dùng tự chấm điểm mình.

**Vì sao gỡ trường `score` mà không cần đường chuyển đổi:** `Repository<T>` lưu
JSON nguyên khối, `score` là trường tuỳ chọn chỉ dùng để cộng điểm. Bản ghi cũ trên
máy vẫn còn khoá `score` trong JSON; đọc lên thì khoá thừa bị bỏ qua, không lỗi.
Không đổi tên khoá lưu trữ nào (`habits`, `habit_tracker`, `habitTemplate` giữ
nguyên), không đổi hình dạng `HabitTracker`. Xem mục "Dữ liệu người dùng".

### 2. Luồng dùng — số chạm để ghi một thói quen

| Việc | Trước | Sau |
|---|---|---|
| Đánh dấu một thói quen của hôm nay | 1 chạm | 1 chạm (giữ nguyên) |
| Thêm một thói quen từ gợi ý | 3 chạm + một biểu mẫu 8 mục | **1 chạm** |
| Từ danh sách sang màn thống kê | **không có đường nào** | 1 chạm |

Ghi hằng ngày vốn đã là một chạm nên không rút thêm được — đó là con số đúng cho
ràng buộc #1. Chỗ tốn oan là màn Thêm: dấu cộng trên thẻ gợi ý mở
`AddFromTemplate`, một biểu mẫu tám mục đã điền sẵn từ chính mẫu đó, rồi phải chạm
"Add" lần nữa. Hai chạm sau không hỏi thêm gì mà người dùng chưa thấy, nên dấu
cộng giờ ghi thẳng vào máy; muốn sửa màu/lịch lặp/lời nhắc thì vào Chi tiết → Sửa,
việc làm một lần chứ không phải hằng ngày.

Ba đường điều hướng hỏng đã gỡ cùng lúc: thẻ bộ sưu tập và nút "Tất cả" của mỗi
nhóm đều trỏ tới `HabitTrackerAppModal`, một tên route không tồn tại trong bất kỳ
navigator nào — chạm vào không có gì xảy ra.

### 3. Bỏ tầng drawer, mở lối vào màn thống kê

`HomeContainer` là một drawer navigator khai sáu mục menu nhưng chỉ render
`[menu[0]]`. Hệ quả: nút hamburger mở ra ngăn kéo có đúng một dòng, và màn Thống kê
— tuy đã đăng ký ở stack — **không có đường nào bấm tới**. Bỏ hẳn tầng drawer;
`HomeScreen` là màn gốc, góc trái header là liên kết "Nhìn lại" dẫn thẳng sang
thống kê.

### 4. Màn thống kê: ba tab xuống hai

- **Bỏ tab "Hôm nay".** Sau khi gỡ vòng tròn điểm, tab này không nói được gì mà màn
  danh sách chưa nói rõ hơn. Nút "Add Habit" trong đó cũng không có `onPress` —
  chạm vào không làm gì.
- **Giữ "Tuần này"** (lưới 7 ngày mỗi thói quen) và **"Tổng thể"** (ba con số đếm +
  lưới 15 tuần). Cả hai trả lời được một câu hỏi thật: ngày nào tôi đã ghi.
- `StatisticSumary` và `StatisticSelection` không có đường điều hướng nào trỏ tới,
  đã xoá.

### 5. Màn stub rỗng — gỡ hết

Sáu chỗ trả về khung rỗng hoặc không ai gọi tới:

- `Screens/Settings/Settings.tsx` — `return <View />`
- `Screens/Add/SearchModal.tsx` — ô tìm kiếm và khối "phổ biến" đều `<View />`
- `Screens/Add/HomeDetailModal.tsx` — đọc `route.params.cat` trong khi nơi gọi
  truyền `collection`/`group`; danh sách luôn rỗng
- `Screens/TemplateScreen.tsx` — có nội dung nhưng không route nào trỏ tới
- `Components/DataTimeLine.tsx` — dữ liệu là chuỗi giả `"Description for ..."`
- `Components/Card.tsx` — ba con số bịa cứng `{health: 2, happyness: 3, others: 5}`
- `Styles/GroupStyle.ts` (`= []`), `Styles/index.ts` (rỗng), `Screens/ModalTransition.tsx`

### 6. Bộ gợi ý thói quen — viết lại

`Setup/initialize.ts` sinh 50 bản ghi tên `"Templates : 0" … "Templates : 49"`, mô
tả `"Generated template sample..."`, nhóm/bộ sưu tập đặt tên tiếng Anh, màu bốc
ngẫu nhiên từ sáu mã viết cứng. Người dùng mở màn Thêm ra chỉ thấy danh sách vô
nghĩa. Thay bằng 13 thói quen thật, tiếng Việt, chia năm nhóm — trong đó nhóm
"Người thân" ("Quỹ thời gian này không đầy lại được") nối module này về Giờ vàng.

### 7. Màu — 28 mã viết cứng ở `Styles/HomeStyle.ts` về 0

Cả module giờ lấy màu từ `theme/Tokens.ts` qua `colors.token.*`. `habitColors`
trước là sáu mã pastel viết cứng, nay là dải nhấn rút từ token; nó chỉ để phân biệt
các thói quen với nhau, không mã hoá "đủ/chưa đủ". Chỗ duy nhất dùng token "nặng"
là liên kết xoá vĩnh viễn ở màn Chi tiết — dùng `destructive` (tím mận), không phải
đỏ.

`StatisticOverall` còn một mã đỏ ẩn: ô lưới nhiệt khai `backgroundColor: 'red'` làm
nền mặc định, bị đè trong mọi nhánh nên không ai thấy, nhưng nằm sẵn chờ lộ ra.

### 8. Chữ — gom hết vào `Text/index.ts`

Không còn chuỗi inline trong JSX và không còn mẫu `text.key || 'English fallback'`
— chính mẫu đó giữ cho các câu tiếng Anh của Batify sống sót qua nhiều đợt dọn, vì
mọi key thiếu đều lặng lẽ rơi về bản tiếng Anh. `useText()` giờ trả
`Record<HabitTextKey, string>`: gọi sai key thì hỏng lúc biên dịch. Kiểu cũ là
`{ [Key: string]: any }` — cũng là một vi phạm luật "không `any`".

Giọng: sentence case, không "nên/phải/hãy", không chấm than, không câu nào nói
người dùng làm chưa đủ. Ví dụ trạng thái rỗng: "Chưa có thói quen nào ở đây" +
"Thêm thói quen đầu tiên".

### 9. Luật import — hai vi phạm đã gỡ hết

`Components/LinkTo.tsx` import `Challenger/Entities` và `Goal/Entities` (luật 2), và
là một đầu của hai vòng lặp `Challenger ↔ HabitTracker`, `Goal ↔ HabitTracker`
(luật 4). Không ai import component này, và `RowLinkItem` bên trong nó trả về
`<View />`. Xoá file → cả hai vi phạm và cả hai vòng lặp biến mất. `HabitTracker`
giờ **không import feature nào khác**.

Còn lại là chiều ngược: `Challenger/`, `Goal/`, `TimeTracker/` và
`Common/Screens/Profile.tsx` import vào `HabitTracker/Entities`. Đó là nợ của phía
bên kia, nằm ngoài phạm vi file của đợt này.

## Dữ liệu người dùng

**Không đổi lược đồ, không cần đường chuyển đổi.** Cụ thể:

- Tên kho giữ nguyên: `habits`, `habit_tracker`, `habitTemplate`.
- `HabitTracker` (bản ghi ngày) không đổi một trường nào.
- `Habit` chỉ **bỏ** trường tuỳ chọn `score`. Bỏ trường là thay đổi tương thích với
  `Repository<T>`: dữ liệu cũ đọc lên vẫn hợp lệ, khoá thừa bị bỏ qua.
- `Setup/initialize.ts` gọi `habitTemplateRepository.empty()` trước khi nạp bộ gợi
  ý mới. Kho `habitTemplate` chỉ chứa **mẫu gợi ý do app sinh ra**, không phải thói
  quen của người dùng — thói quen người dùng nằm ở kho `habits` và không bị đụng.

## Câu hỏi còn mở

1. **`Common/Components/CCalendarStrip.tsx` có ba mã màu viết cứng `'red'` /
   `'orange'` / `'blue'`** (dòng 26–38). Dải lịch này hiện ngay đầu màn danh sách
   thói quen, nên đó là màu đỏ đang nằm trong luồng dùng của module. File thuộc
   `Common/`, ngoài phạm vi được sửa của đợt này — cần một đợt riêng.
2. **`getListByDate` trả `list` chứ không trả `result`** (`HabitTrackerModel.ts:113`
   cũng vậy): nhánh tính lịch lặp chạy xong rồi bị bỏ. Mọi thói quen chưa hết hạn
   đều hiện mỗi ngày, bất kể `repeatOption`. Đây là lỗi có sẵn của Batify, sửa nó
   đổi hành vi hiển thị của dữ liệu đang có trên máy nên không gộp vào đợt thiết kế
   lại này.
3. `Selection.tsx` (chọn thói quen cho module khác) vẫn đăng ký ở navigator nhưng
   chỉ có `Challenger/` và `Goal/` gọi tới. Nếu hai module đó bị cắt theo `PLAN.md`
   thì gỡ luôn màn này.

## Bước tiếp theo

1. Đưa `CCalendarStrip` về token (câu hỏi mở 1) — cần phối hợp với người giữ
   `Common/`.
2. Quyết định về `getListByDate` (câu hỏi mở 2): sửa cho đúng `repeatOption`, kèm
   test cho ba kiểu lặp.
3. `Screens/Add/AddModal.tsx` và `Screens/EditScreen.tsx` là hai biểu mẫu gần giống
   hệt nhau (cùng tám control, khác mỗi nguồn dữ liệu). Gộp thành một.
