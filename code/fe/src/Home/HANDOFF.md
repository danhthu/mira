# Home — màn hình chính

## Trạng thái hiện tại

Màn chính là **bảng dẫn vào các module**, không còn là bảng bốn con số của
`docs/08-three-pillars.md`. Bố cục từ trên xuống:

```
ngày tiếng Việt                      ← "thứ bảy, 5 tháng 9"
lưới 2 cột, 8 ô module               ← Công việc · Thói quen · Thử thách · Trading
                                       Cảm xúc · Mục tiêu · Thời gian · Cài đặt
ô ghi khoảnh khắc                    ← gõ rồi enter là xong
```

```
src/Home/
├── Text/index.ts          mọi chuỗi, không chuỗi nào nằm trong JSX
├── Entities/index.ts      MomentNote + repository `moment` (đặt tạm, xem bên dưới)
├── Models/
│   ├── format.ts          giờ/phút kiểu Việt (dấu phẩy thập phân), ngày tiếng Việt
│   ├── summary.ts         MetricState cho từng module — hàm thuần, không repository
│   ├── load.ts            đọc repository của 6 module → HomeSummary (chỉ đọc)
│   ├── tiles.ts           HomeSummary + Text → 8 ô có sẵn chữ và route (hàm thuần)
│   └── logging.ts         ghi khoảnh khắc
├── Components/            ModuleTile · MomentInput · styles
└── Screens/Home.tsx       lắp lưới ô + ô khoảnh khắc
```

Test: `tests/home/` — 2 suite (`format`, `tiles`), 28 test.

## Tám ô và câu mỗi ô nói

| Ô | Route | Có dữ liệu | Chưa có dữ liệu |
|---|---|---|---|
| Công việc | `WorkAppModal` | `còn 3 việc hôm nay` · `việc hôm nay đã xong` | `chưa có việc nào hôm nay` |
| Thói quen | `HabitAppModal` | `hôm nay có 3 thói quen` · `đã làm 2 trong 4 thói quen hôm nay` · `đã làm cả 3 thói quen hôm nay` | `chưa có thói quen nào hôm nay` |
| Thử thách | `ChallengerApp` | `đang theo 2 thử thách` | `chưa có thử thách nào` |
| Trading | `Trading` | `nhịp xem bảng giá` (tĩnh) | — |
| Cảm xúc | `EmotionApp` | `hôm nay đã ghi 1 lần` | `chưa ghi cảm xúc hôm nay` |
| Mục tiêu | `GoalApp` | `đang theo 3 mục tiêu` | `chưa có mục tiêu nào` |
| Thời gian | `TimeApp` | `hôm nay đã ghi 2,5 giờ` · `hôm nay đã ghi 15 phút` | `chưa ghi giờ nào hôm nay` |
| Cài đặt | `SettingApp` `{screen:'Setting'}` | `đồng bộ, giao diện, dữ liệu` (tĩnh) | — |

## Quyết định đã chốt

**Bỏ bảng bốn con số.** Hai con số tài chính (`Bạn giàu`, `Tháng này bốc hơi`) đọc
từ bảng `money`, mà màn nhập năm ô của trụ Tài chính đã bị gỡ khỏi navigator ngày
2026-09-05. Không có đường nào nhập dữ liệu thì hai ô đó kẹt ở `chưa có năm ô tài
chính` vĩnh viễn — một màn chính mà nửa nội dung là chỗ trống không bao giờ đầy thì
tệ hơn là không có. Hai con số thời gian đi cùng vì chúng đọc `time_entry`, cũng chỉ
được ghi từ hàng avatar vừa bỏ.

**Bỏ hàng avatar người quan trọng.** Module Người tạm ẩn, và nút "thêm người" ngay
trên màn chính vốn chỉ là tạm (chỉ hỏi tên, đặt `role='other'`). Giữ lại thì màn
chính sinh dữ liệu cho một module không có đường vào.

**Bỏ luôn hàng nhãn lãng phí và bảng ghi nhanh 30p/1h/2h.** Chúng ghi `time_entry`
khoang `waste`, và chỗ duy nhất đọc lại con số đó là dòng "Giờ lãng phí tuần này"
vừa bị gỡ. Một nút ghi vào chỗ không ai đọc được thì tệ hơn là không có nút. Ghi giờ
giờ đi qua ô **Thời gian** (`TimeApp`), là module có cả màn nhập lẫn màn thống kê.

**Giữ ô khoảnh khắc.** Nó tự đủ: ghi vào bảng `moment` của chính `Home/`, không phụ
thuộc module nào đang ẩn, và vẫn đúng "gõ và enter là xong" của `05-v1-spec.md`.
Thêm một nhãn "Khoảnh khắc" phía trên để ô không lơ lửng sau lưới.

**Cài đặt là một ô trong lưới, không phải nút trên đầu màn hình.** Trước đây nó nằm
ở góc phải header. Đưa xuống lưới thì tám lối vào nằm cùng một chỗ, và header còn
đúng một dòng ngày — bớt một vùng chạm nhỏ khó trúng.

**Không ô nào hiện số 0.** Mọi ô đi qua `MetricState` của `src/Core/dataState.ts`:
`countState(0)` và `progressState(0, 0)` trả `empty`, và nhánh `empty` của mỗi ô là
một câu riêng chứ không phải dấu gạch dùng chung. Câu "chưa làm cái nào" cũng không
được hiện "đã làm 0 trong 4" — nó chuyển sang đếm số thói quen của ngày (`hôm nay có
4 thói quen`). Số âm cũng vào nhánh `empty`: màn hình không có dấu trừ.

**Không màu nào phân biệt xong với chưa xong.** Tám ô dùng đúng một nền `surface`,
một viền `border`, một cỡ chữ. Khác nhau chỉ ở câu chữ. Ràng buộc cứng #3 cấm màu đỏ
báo "chưa đủ", và cách chắc chắn nhất để không lách là không có thang màu nào cả.
Toàn màn hình 0 màu viết cứng (`node scripts/soi-mau.mjs` không in dòng nào cho
`src/Home`).

**`load.ts` chỉ đọc, không ghi.** `workRepository.getListByDate()` và
`habitRepository.getHabitsForThisWeek()` có tác dụng phụ: hàm đầu tự `add()` bản ghi
lặp vào kho. Một màn tổng quan không được sinh bản ghi thay người dùng, nên ô Công
việc lọc `list()` theo `startDate` thay vì gọi `getListByDate`. Ô Thói quen thì gọi
`habitRepository.getListByDate` — bản của HabitTracker không ghi gì, chỉ tính lặp
trong bộ nhớ.

**`getDay()` của `Common/Utils/common` đặt lại giờ ngay trên đối tượng nhận vào.**
`load.ts` bọc mọi lần gọi bằng `new Date(date.getTime())`; không có bước đó thì
`today` của màn hình bị hàm tính ngày ghi đè, và `habitRepository.getListByDate` cũng
`setHours` trên tham số.

**Trading không có repository.** Module giữ dữ liệu trong `AsyncStorage` khoá
`tradingData` dưới dạng JSON tự do, không đi qua `Repository<T>`. Đọc thẳng khoá đó
từ `Home/` là buộc màn chính vào định dạng nội bộ của một module đang được thiết kế
lại, nên ô Trading chỉ nói module làm gì. Nối số thật khi module có kho dữ liệu chung.

**Ngày của màn hình cố định lúc mở** (`useState(() => new Date())`). Mọi ô đều nói về
"hôm nay"; để `new Date()` chạy mỗi lần render thì qua nửa đêm câu chữ đổi mà người
dùng không chạm gì.

## Đã xoá

`Models/dashboard.ts`, `Models/presenter.ts`, `Models/week.ts`, `Models/constants.ts`,
`Components/Board.tsx`, `Components/Metric.tsx`, `Components/PeopleRow.tsx`,
`Components/WasteRow.tsx`, `Components/QuickSheet.tsx` — không ai gọi sau khi bỏ bảng
bốn con số. `tests/home/dashboard.spec.ts` và `tests/home/week.spec.ts` xoá theo.

`Models/format.ts` giữ lại `formatHours`, `formatMinutes`, `formatVietnameseDate`;
gỡ `MINUS_SIGN`, `formatHourDelta`, `formatMoneyShort`, `formatMonths`,
`formatMonthLabel`, `formatWhole` — chúng chỉ phục vụ bốn con số. `Models/constants.ts`
xoá hẳn chứ không để rỗng: sau khi gỡ ghi nhanh, phiên đếm giờ và ngưỡng tiền thì
không còn hằng số nào của riêng màn này; `MINUTES_PER_HOUR` lấy từ `Core/constants`.

`Models/logging.ts` còn đúng `saveMoment`. Phiên đếm giờ trong `AsyncStorage`
(`home_running_session`) không còn ai đọc — khoá cũ nằm lại trên máy người dùng cũ,
vô hại vì không phải bảng nghiệp vụ và không đồng bộ.

## Câu hỏi còn mở

- `MomentNote` và repository `moment` vẫn ở `src/Home/Entities/`. Chỗ đúng của nó là
  `src/Common/Entities/` cạnh `person` và `time_entry`; đợt này chỉ được sửa
  `src/Home/**`. Tên bảng `moment` đã nằm trong allowlist đồng bộ.
- Chưa có màn nào **đọc lại** khoảnh khắc đã ghi. Ô ghi thì có, danh sách thì chưa —
  cùng loại vấn đề đã khiến hàng nhãn lãng phí bị gỡ. Nếu đợt sau vẫn chưa có màn
  đọc, cân nhắc bỏ nốt ô này thay vì để nó ghi vào chỗ không ai xem.
- Ô Trading chờ module có repository.
- Khi ba module `Money` / `Person` / `Hourglass` mở lại, thêm ô cho chúng vào
  `Models/tiles.ts` — bảng ô là một mảng, thêm một phần tử là đủ, không phải sửa
  `Screens/Home.tsx`.

## Bước tiếp theo

1. Nối số thật cho ô Trading khi module chuyển sang `Repository<T>`.
2. Dựng màn đọc lại khoảnh khắc, hoặc bỏ ô ghi khoảnh khắc.
3. Chuyển `MomentNote` xuống `src/Common/Entities/`.
4. Thêm ô cho `Money` / `Person` / `Hourglass` khi ba module đó đăng ký route lại.
