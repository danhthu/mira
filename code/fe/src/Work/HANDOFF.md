# Công việc (Work)

## Trạng thái hiện tại

Đợt 2026-09-05 thiết kế lại cả nhận diện lẫn luồng dùng. Module từ **54 file
xuống 17 file** (16 file mã + `HANDOFF.md`). Năm cổng kiểm đều qua; phần đóng góp của module vào
`soi-mau.mjs` từ **68 dòng xuống 0**, và tám vi phạm luật import cùng hai vòng
lặp `Challenger ↔ Work`, `Goal ↔ Work` đã đóng.

Ba màn chính đã kiểm bằng trình duyệt ở 375×812: danh sách, thêm việc, nhìn lại
(và cả màn chi tiết). Không màn nào trắng, không chỗ nào dùng màu đỏ hay cam.

Cây file sau đợt này:

```
HANDOFF.md
Components/DayPicker.tsx
Entities/{Work.ts, Repository.ts, index.ts}
Screens/{Home, Add, Detail, Assign, Statistic, Container}.tsx + index.ts
Setup/{clean, initialize, sample}.ts
Text/index.ts
index.tsx
```

## Quyết định đã chốt

### 1. Cờ `mandatory` — gỡ hẳn, không đổi tên

Đây là quyết định trọng tâm của đợt. Cờ này chia danh sách trong ngày làm hai
khối "bắt buộc" / phần còn lại, rồi màn thống kê hiện tỷ lệ hoàn thành của khối
"bắt buộc" (`Statistic.tsx:98`). `00-vision.md` viết thẳng: *"Không phải app năng
suất. Không giúp làm được nhiều hơn."* và *"Không bao giờ nói người dùng làm chưa
đủ."* Một khối việc do chính người dùng tự dán nhãn "bắt buộc", kèm mẫu số, là cơ
chế áp lực đúng nghĩa — ràng buộc cứng #3.

**Vì sao gỡ chứ không đổi thành "việc quan trọng" không kèm tỷ lệ:** áp lực không
nằm ở chữ mà ở hai thứ — phép chia đôi danh sách, và mẫu số. Đổi tên chỉ bỏ được
mẫu số; khối thứ hai vẫn đọc ra là "khối mình đang nợ". Thêm nữa, mỗi việc thêm
vào sẽ phải quyết định thêm một lần "cái này có quan trọng không", mà ràng buộc
#1 tính ngân sách nhập theo giây. Danh sách phẳng nói đủ.

Mười một chỗ đã gỡ (đường dẫn tính theo cây file trước đợt này):

| Chỗ | Nó làm gì |
|---|---|
| `Entities/Work.ts:32` | trường `mandatory?: boolean` |
| `Screens/Home.tsx:191–205` | chia `NormalSection` thành ba khối, khối đầu là "mandatory" |
| `Screens/Home.tsx:225–235` | dải màu riêng + nhan đề `t('Mandatory')` cho khối đó |
| `Screens/Home.tsx:445–532` | `StatusWidget` — vòng tròn đếm việc "bắt buộc" còn lại, nền `colors.error` (không ai gọi tới) |
| `Screens/Statistic.tsx:90–101` | dòng "Mandatory 10/50 (20%)" |
| `Screens/Statistic.tsx:203–303` | `StatusWidget2` — cùng vòng tròn đó, cũng không ai gọi |
| `Screens/StatisticScore.tsx` | bản sao của cả hai thứ trên |
| `Screens/MandatorySelector.tsx` | cả một màn chỉ để bật/tắt cờ, không navigator nào trỏ tới |
| `Screens/Choose.tsx:167–179` | cột "Bắt buộc" trong bảng chọn việc, cũng không ai trỏ tới |
| `Screens/Tools/Plan.tsx:45–52` | công tắc bật cờ cạnh mỗi việc |
| `Entities/Repository.ts:96–102` | `getTaskByDate` trả `{ mandatory, total }` |
| `Setup/sample.ts:19` | dữ liệu mẫu gán `mandatory` ngẫu nhiên cho từng bản ghi |
| `Text/index.ts` | năm khoá `batbuoc`, `mandatory`, `xongtrongngay`, `mandatory_completed`, `no_work_mandatory` |

`grep -rni "mandatory" src/Work` giờ trả **0**.

`Common/FormControls/MantatoryCtrl.tsx` vẫn còn trong `Common/` (ngoài phạm vi
sửa), nhưng không còn ai import nó.

### 2. Các vi phạm ràng buộc #3 khác đã gỡ

- **"Đúng hạn" / "Quá hạn"** (`Statistic.tsx:103–126`) — hai tỷ lệ nữa, trong đó
  "quá hạn" phán xét thẳng. Màn nhìn lại giờ chỉ có hai con số đếm được (đã xong,
  đang mở) và một dòng phụ "n việc chưa có ngày". Không mẫu số nào.
- **`colors.error`** ở `Home.tsx:491`, `Home.tsx:693` (`arrowdown`),
  `Detail.tsx:82–83` (nút xoá), `Add.tsx:120` (biểu tượng "Due Date"),
  `AddGroup.tsx:118`. Chỗ duy nhất còn cần màu "nặng" là liên kết xoá vĩnh viễn ở
  màn chi tiết — dùng token `destructive` (tím mận), không phải đỏ.
- **`'orange'`** ở `Components/Priority.tsx:32` (biểu tượng mức ưu tiên) và
  `Tools/TabCalendar.tsx:139, 208, 281` (chấm lịch + biểu tượng sao).
- **Trạng thái rỗng gây tội lỗi**: `Home_OLD.tsx:559–560` và `:604–605` — chữ nâu
  cam `#664d03` trên nền `#fff3cd`, kèm biểu tượng cảnh báo, với hai câu *"Hôm nay
  chưa có việc nào…"* và *"Chưa có việc nào được đánh dấu bắt buộc…"*. Thay bằng
  một câu xám trung tính "chưa có việc nào cho ngày này", ngay dưới dòng soạn
  nhanh — câu trung tính, hành động ở sát bên.

### 3. Luồng dùng — số chạm đo thật

| Việc | Trước | Sau |
|---|---|---|
| Thêm một việc cho hôm nay | **2 chạm** (nút `+` → biểu mẫu 12 control → "Save") | **0 chạm** — gõ vào dòng soạn nhanh rồi gửi |
| Đánh dấu một việc xong | **2 chạm** (chạm 1 → `DOING`, chạm 2 → `DONE`) | **1 chạm** |
| Mở chi tiết một việc | **không mở được** — `Home.tsx:343` gọi `Router.Open(nav, 'WorkApp', …)`, mà `'WorkApp'` không phải route nào đăng ký trong `MainScreen.tsx` (chỉ có `'WorkAppModal'`); chạm vào không có gì xảy ra | 1 chạm |
| Từ danh sách sang màn nhìn lại | **2 chạm** qua ngăn kéo | 1 chạm |
| Xem việc của ngày khác | tab "Scheduled" → `TabCalendar` | 1 chạm mũi tên ‹ › ngay dưới tiêu đề |

Dòng soạn nhanh là thay đổi lớn nhất cho ràng buộc #1: đường thêm việc hằng ngày
không còn đi qua biểu mẫu nào. Biểu mẫu đầy đủ vẫn còn sau liên kết "thêm chi
tiết", cho việc cần lặp hoặc lời nhắc.

Ba đường điều hướng hỏng khác đã gỡ cùng lúc:

- `Home.tsx:104–110` — thanh ba tab `[Today, Scheduled, All]` mà `onChange` **luôn**
  mở `Scheduler` bất kể bấm tab nào. Chạm "Today" cũng nhảy sang lịch tháng.
- Cùng chỗ đó: tab "All" là chỉ số 2, nhưng thân màn render `TabAll` ở
  `tabIndex == 3`. Chọn tab thứ ba ra **màn trắng**.
- Nút kính lúp ở góc phải mở `Dashboard` (màn "Profile"), nút bánh răng mở
  `TabSettings` — mà `TabSettings` là `return <View />`.

### 4. Bỏ tầng drawer

`HomeContainer.tsx` là một drawer khai sáu mục, trong đó ba mục ("Danh sách công
việc", "Lịch làm việc", "Thống kê") trỏ về cùng một `Statistic`, và một mục trỏ
về `TabSettings` rỗng. Đây đúng mẫu mà đợt `HabitTracker` vừa gỡ. Bỏ hẳn tầng
drawer; `Container` là stack năm màn phẳng.

### 5. Màn stub rỗng và code chết — gỡ hết

`Components/{Mandatory,Task,ETA}.tsx` đều `return <View/>`, `Tools/TabToday.tsx`
và `Tools/TabSettings.tsx` cũng vậy, `Tools/Tab_Statistic.tsx` là file 0 byte,
`Styles/index.ts` rỗng, `Styles/GroupStyle.ts` là `export const GroupStyle = []`.

`Screens/StatisticScore.tsx` (437 dòng) là bản chép của `Statistic.tsx` bỏ bớt
một nhánh lọc — không file nào import. Xoá.

`Screens/Home_OLD.tsx` (1066 dòng, **19 màu viết cứng, 6 màu đỏ/cam**) tên có hậu
tố `_OLD` nhưng `Screens/index.ts:4` vẫn `import { Home } from './Home_OLD'`. Đã
kiểm trước khi xoá: đường sống duy nhất là `WorkApp.Screens.Home`, và cả repo chỉ
dùng `WorkApp.Screens.Container` (`Main/MainScreen.tsx:111`). Không ai gọi tới.

Không có importer nào, cùng loạt: `Tools/{TabList,TabThisWeek,TabBacklog,Colors,
Tags}.tsx`, `Components/{Card,WorkItem,HeaderBackground}.tsx`, `Components/index.ts`,
`Utils/sort.ts`, `Styles.ts`, `Styles/HomeStyle.ts`, `Assets/`, `readme.txt`,
`Entities/Repository.ts` (`class TodoRepository` rỗng + `todoRepository`).

`Tools/TabAll.tsx` chỉ tới được qua nhánh `tabIndex == 3` không bao giờ đúng; và
`Groups` đọc `totals[d.id].done` ngay lượt render đầu khi `totals` còn là `{}` —
tức là nó sẽ ném lỗi nếu có ai mở được. Xoá.

### 6. `ETA` / `estimated` / `did` — gỡ khỏi giao diện, giữ trường

`Components/ETA.tsx` là `return <View/>`, nên `estimated` không có control nhập.
`Add.tsx:135` có một ô ETA riêng với giá trị mặc định ma thuật `data.estimated || 52`
— và vì `onChanged` chỉ chạy khi người dùng sửa, con số 52 chỉ hiển thị chứ không
bao giờ được ghi. `did` chỉ ghi được qua thanh phần trăm ở `Detail.tsx:46`, mà
không màn nào trong Work đọc lại.

Đã gỡ cả ba khỏi giao diện. **Không gỡ khỏi entity**, vì
`TimeTracker/Models/index.ts:79–81` đọc `w.timeCatId` và `w.did || w.estimated`
khi dựng dòng thời gian; bỏ trường thì `TimeTracker/` không biên dịch được, mà
module đó ngoài phạm vi sửa của đợt này. Hành vi không đổi: dữ liệu thật của người
dùng vốn đã không có hai trường này.

`endDate` và `finishDate` cũng vào diện đó — `TimeTracker` đọc, Work không còn
control nhập. Một ô "hạn" không kèm hành động nào chỉ để sinh ra ô "quá hạn" vừa
gỡ ở màn nhìn lại.

### 7. Hai lỗi trong `Entities/Repository.ts`

**Đọc mà ghi.** `getListByDate` gọi `this.add({...h, id: uuid(), ref: h.id})` cho
mỗi việc lặp rơi vào ngày đang xem, rồi `this.save(true)` — ngay trong hàm đọc.
Mỗi lần mở màn danh sách lại nhân thêm một bản sao của mọi việc lặp vào kho. Hàm
giờ thuần đọc; đã có test `tests/work/clean.spec.ts` gọi ba lần liên tiếp và
khẳng định số bản ghi không đổi.

**Việc đã xoá vẫn hiện.** Biến `kk` ở dòng 79 tính đúng bộ lọc `deleted` rồi bị
vứt đi (`return result`). Chuyện này có hậu quả thật: `delete3` xoá cứng khỏi
mảng cục bộ, nhưng `Common/Sync/applyRemoteChanges.ts:54` đặt `row.deleted = true`
cho bản ghi bị xoá ở máy khác về qua đồng bộ — những bản đó nằm nguyên trong mảng.
Đã trả về bộ lọc, kèm test.

Sửa thêm hai chỗ cùng hàm:

- `dateEqual(undefined, date)` coi `undefined` là "bây giờ", nên mọi việc **chưa
  xếp ngày** đều hiện ở **mọi ngày**. Đã chốt `h.startDate &&` trước khi so.
  Chúng có chỗ ở riêng: dòng "n việc chưa có ngày" ở cuối danh sách, dẫn sang màn
  `Assign`.
- Lọc `h.kind != 'group'` để bản ghi nhóm cũ không lọt vào danh sách ngày
  (xem mục 9).

### 8. Luật import — tám vi phạm và hai vòng lặp đã đóng

| File | Import | Luật |
|---|---|---|
| `Screens/Add.tsx:21–22` | `Goal/Components`, `Goal/Components/LinkTo` | #2, và một đầu vòng `Goal ↔ Work` |
| `Screens/AddGroup.tsx:22–23` | như trên | #2 |
| `Screens/Edit.tsx:6–7` | `Challenger`, `Challenger/Components/LinkTo` | #2, và một đầu vòng `Challenger ↔ Work` |
| `Screens/Edit.tsx:15–16` | `Goal/Components`, `Goal/Components/LinkTo` | #2 |

Cả tám đều là control "liên kết việc này với một mục tiêu / thử thách". Đã gỡ khỏi
biểu mẫu: chúng là đường ống giữa các module chứ không phải thứ đổi hành vi của
một việc, và ràng buộc #1 không có chỗ cho hai control liên kết trong đường nhập.
`§4` của `soi-cau-truc.sh` giờ báo **sạch** — cả hai vòng lặp biến mất.

Chiều ngược lại (`Challenger/`, `Goal/`, `TimeTracker/` import vào `Work/Entities`)
là nợ của phía bên kia, ngoài phạm vi.

Còn một chiều nữa **chưa gỡ được**: bốn file trong `Common/Components` import
`useText` từ `Work/Text` (vi phạm luật #1). `Common/` ngoài phạm vi sửa, nên
`Work/Text` cố ý vẫn khai đủ mười sáu khoá mà bốn file đó đọc — xem mục 10.

### 9. `Edit.tsx` và `AddGroup.tsx` — gộp và gỡ

`Add` và `Edit` là hai biểu mẫu gần trùng nhau; `Detail` thì chỉ xem, và không có
đường nào từ danh sách tới `Edit` (chỉ `Detail` có route được gọi). Kết quả: vào
từ danh sách thì **không sửa được tên việc**. Gộp: `Detail` giờ vừa xem vừa sửa,
`Edit.tsx` xoá.

`AddGroup.tsx` tạo bản ghi `kind: 'group'` — tính năng gom việc thành dự án của
Batify. Toàn bộ đường hiển thị nhóm (`TabAll`, `getRootGroups`, `getChildren`,
`getChildrenCounts`, `TaskSelection`) đều đã chết hoặc ném lỗi, nên nhóm là thứ
tạo được mà không xem được. Gỡ màn tạo nhóm.

**Giữ lại trường `Work.kind`** dù không còn ai ghi vào: bản ghi nhóm cũ vẫn nằm
trên máy người dùng, và `Home/Models/load.ts:33` lọc theo `kind !== 'group'` để
không đếm nhầm chúng. `getListByDate` và `getUnscheduled` cũng lọc như vậy, nên
bản ghi nhóm cũ không hiện lẫn vào danh sách việc — chúng chỉ nằm im trong kho.
`workRef` thì gỡ vì không ai còn đọc.

### 10. Chữ — gom vào `Text/index.ts`, kiểu chặt

Không còn chuỗi inline trong JSX và không còn mẫu `text.key || 'fallback'`. Kiểu
trả về của `useText()` từ `{ [Key: string]: any }` (vi phạm luật "không `any`")
thành `Record<WorkTextKey, string> & { for, translate }`: gọi sai khoá thì hỏng
lúc biên dịch.

Chữ tiếng Anh của Batify đã thay hết: `Todo`, `Today`, `Scheduled`, `All`,
`Daily tasks`, `Mandatory`, `Done`, `tasks has done`, `Add Todo`, `ETA`,
`Due Date`, `Properties`, `Tools`, `Create Group`, `Add Task`, `Profile`,
`Plan`, `Miss`, `UnPlan`, `Choose priority`, `high/medium/low`.

Mười sáu khoá cuối từ điển (`quaylai`, `xong`, `homnay`, `ngaymai`, `tuantoi`,
`cuoingay`, `loaibo`, `ngaylam`, `chongnay`, `chonngaygio`, `chongio`,
`chonthoigian`, `xemtruoc`, `chinhsua`, `ghichu`, `hoanthanh`) là chữ mà bốn file
`Common/Components` đọc qua `useText` của module này. Trước đợt này **không khoá
nào trong số đó tồn tại**, nên mọi câu đều rơi về nhánh `|| 'chữ tiếng Việt'` nằm
rải trong JSX của `Common/`. Khai đủ ở đây để chữ có một chỗ ở duy nhất; nhánh
fallback bên `Common/` vẫn còn (ngoài phạm vi) nhưng không bao giờ chạy nữa.

Giọng: sentence case, không "nên/phải/hãy", không chấm than, không câu nào nói
người dùng làm chưa đủ.

### 11. `DayPicker` — vì sao không dùng `B.TextBox dataType="date"`

`libs/components/Input.tsx:161–163`: trên `Platform.OS == 'web'`, `InputDate` rơi
về `InputText` thường và in nguyên `Date.toString()` (`"Sat Sep 05 2026 00:00:00
GMT+0700…"`), hoặc chuỗi `"undefined"` khi chưa có giá trị. Đã thấy tận mắt ở lần
chụp đầu. `libs/` ngoài phạm vi sửa, nên `Components/DayPicker.tsx` thay bằng bốn
lựa chọn một chạm (hôm nay / ngày mai / tuần tới / chưa có ngày) — chạy đúng ở cả
web lẫn native, và hợp ràng buộc #1 hơn một cuốn lịch.

### 12. Màu — 68 dòng `soi-mau` về 0

Cả module lấy màu từ `theme/Tokens.ts` qua `colors.token.*`. Không còn mã hex,
không còn tên màu chuỗi.

## Dữ liệu người dùng

**Không đổi tên kho, không đổi hình dạng bản ghi, không cần đường chuyển đổi.**

- Tên kho giữ nguyên `work`. (`todo` — kho thứ hai chưa từng có ai ghi vào — đã bỏ
  cùng `todoRepository`.)
- Chỉ **bỏ trường tuỳ chọn**, không đổi tên và không đổi kiểu trường nào:
  `mandatory`, `priority`, `checkList`, `tags`, `color`, `icon`, `timeStart`
  (+ lớp `Timespan`), `doing`, `focus`, `deps`, `workRef`.
- `Repository<T>` lưu JSON nguyên khối; bản ghi cũ trên máy vẫn còn các khoá đó
  trong JSON, đọc lên thì khoá thừa bị bỏ qua, không lỗi. Đây đúng cách
  `HabitTracker` bỏ trường `score` ở đợt trước.
- `status` vẫn dùng chung kiểu `STATUS` của `Common`. Luồng mới chỉ ghi `'PLAN'`
  và `'DONE'`; bản ghi cũ mang `'DOING'`, `'PAUSE'`, `'CREATED'` vẫn đọc được và
  hiện ở nhóm "đang mở" (mọi thứ khác `'DONE'`).
- `Setup/sample.ts` gọi `empty()` trước khi nạp, y như trước. Nó chỉ chạy khi có
  người gọi `AppSetup/sample` — không nằm trong đường mở app bình thường.
- `Setup/initialize.ts` cố ý không gieo gì: danh sách trống là trạng thái khởi đầu
  đúng cho một app không hứa giúp làm được nhiều hơn.

## Câu hỏi còn mở

1. **Bốn file `Common/Components` import `Work/Text`** (`CustomCalendarView`,
   `DateTimeBottomModal`, `ReminderBottomModal`, `RichEditorBottomModal`) — vi
   phạm luật import #1, và là bốn trong chín vi phạm còn lại của `§1`. Chữ chúng
   cần là chữ dùng chung (hôm nay, ngày mai, xong, quay lại), chỗ đúng là `lang/`
   hoặc một `Common/Text`. Cần một đợt phối hợp với người giữ `Common/`.
2. **`Common/Components/CCalendarStrip.tsx` có ba màu cứng `'red'` / `'orange'` /
   `'blue'`** (đợt `HabitTracker` cũng ghi lại). `Work` không còn dùng file này
   sau khi gỡ `Tools/Plan.tsx`, nên đây chỉ là ghi chú chuyển tiếp.
3. **`Common/FormControls/MantatoryCtrl.tsx` giờ mồ côi** — không module nào
   import. Ứng viên xoá ở đợt dọn `Common/`.
4. **`repeatOption` chưa có test cho `weekly` / `monthly`.** `repeatsOn` đã tách
   thành hàm thuần nên test được dễ dàng; đợt này chỉ có test cho `daily` (kế thừa
   từ `tests/work/list.spec.ts`).
5. **`Work.timeCatId` không có control nhập trong Work** nhưng `TimeTracker` đọc
   để phân loại dòng thời gian. Hoặc `TimeTracker` tự gán, hoặc Work cần một chỗ
   chọn danh mục — cần quyết định chung giữa hai module.

## Bước tiếp theo

1. Trả bốn khoá chữ dùng chung về `lang/` và cắt phụ thuộc `Common → Work/Text`
   (câu hỏi mở 1) — việc này cần làm cùng người giữ `Common/`.
2. Thêm test cho `repeatsOn` với `weekly` và `monthly` (câu hỏi mở 4).
3. Quyết định về `timeCatId` (câu hỏi mở 5); nếu chốt là Work không quản danh mục
   thời gian thì gỡ nốt trường, sau khi `TimeTracker/` đổi theo.
