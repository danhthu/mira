# Người quan trọng — module Person + onboarding

## Trạng thái hiện tại

Hai việc trong một đợt: màn "Người quan trọng" (`src/Person/`) và onboarding bốn
bước viết lại từ đầu (`src/Welcome/`).

```
src/Person/
├── Text/index.ts          mọi chuỗi, không chuỗi nào nằm trong JSX
├── Models/
│   ├── constants.ts       thứ tự vai, vòng Dunbar theo vai, nhịp mặc định, năm nấc nhịp
│   ├── week.ts            cắt tuần thứ hai → chủ nhật
│   ├── people.ts          hàm thuần: lọc theo người, giờ tuần, lần gần nhất, gom theo vai
│   ├── presenter.ts       MetricState → chữ, phân nhánh đủ ba trạng thái
│   └── store.ts           thêm / sửa / xoá mềm bảng `person`
├── Components/            styles · PersonCard · PersonForm
├── Screens/People.tsx
└── index.ts               PersonApp = { Screens }

src/Welcome/
├── Text/index.ts
├── Models/
│   ├── constants.ts       bản sao bảng vai (xem "Câu hỏi còn mở")
│   ├── draft.ts           hàm thuần: bật/tắt vai, thêm/bỏ hàng, đổi tên, đổi nhịp
│   ├── labels.ts          vai và nhịp → chữ
│   └── save.ts            ghi danh sách vào bảng `person`
├── Components/            styles · Chip · CadenceSlider · StepRoles · StepNames
│                          · StepCadence · StepDone
└── Screens/Home.tsx       lắp bốn bước
```

Test: `tests/person/` — 3 suite, 35 test (`people`, `presenter`, `onboarding`).

## Cần đăng ký route

`src/Main/MainScreen.tsx` chưa có route nào trỏ tới màn Người. Cần thêm:

```tsx
<Stack.Screen name="PersonApp" component={PersonApp.Screens.People}
  options={{ headerShown: false }} />
```
với `import { PersonApp } from '../Person';`

Sau khi có route: nút "thêm người" tạm trên `src/Home/` (chỉ hỏi tên, đặt
`role = 'other'`, `dunbarRing = 5`) nhường chỗ cho `Router.Open(nav, 'PersonApp')`.

## Quyết định đã chốt

**Onboarding không hỏi tuổi, khoảng cách, thu nhập.** `05-v1-spec.md` §Onboarding
nói thẳng, và `00-vision.md` rủi ro #1 là lý do: con số "còn 68 lần gặp" gây tội
lỗi với người không đổi được hoàn cảnh. `toPerson()` để `birthYear` và `distanceKm`
trống; `hourglassEnabled` giữ mặc định `false` của entity (ràng buộc cứng #4). Màn
cuối nói trước rằng tuổi chỉ được hỏi khi người dùng tự bật Đồng hồ cát, để về sau
không ai bị hỏi bất ngờ.

**Bỏ qua được hết, kể cả bước 1.** Mỗi bước có "bỏ qua" nhảy thẳng tới bước xong;
nút "tiếp" không bao giờ bị khoá. Hàng không có tên bị bỏ lúc lưu (`namedDrafts`),
nên chọn vai rồi bỏ qua bước tên là danh sách rỗng chứ không phải một người tên
rỗng — người tên rỗng thì màn Hôm nay có avatar không chạm được.

**Lưu ngay khi vào bước 4, không đợi chạm "bắt đầu".** Đóng app ở màn "xong" vẫn
giữ được danh sách. Đây cũng là chỗ duy nhất onboarding ghi dữ liệu.

**Vòng Dunbar suy từ vai, không hỏi.** `02-data-model.md` để `dunbarRing` là cột
bắt buộc nhưng spec onboarding chỉ cho bốn câu hỏi. Người nhà (con, bố mẹ, bạn đời,
bản thân) vào vòng 5, bạn thân vòng 15, nhóm gom `other` vòng 50. Thêm một câu hỏi
nữa là phá nguyên tắc "mỗi bước một câu hỏi".

**Nhịp gặp là năm nấc chạm được, không phải thanh kéo.** Spec ghi "slider", nhưng
dự án không có gói thanh trượt tuyến tính nào (`@react-native-community/slider`
không nằm trong `package.json`), còn tự viết bằng `PanResponder` thì hành vi trên
web khác trên máy và không test được. Năm nấc — hằng ngày · 8 · 4 · 2 · 1 lần một
tháng — cho cùng kết quả trong **một** thao tác thay vì một cú kéo, hợp trần ba
chạm của `05-v1-spec.md` DoD #2 hơn. Giao diện vẫn là một thanh có vạch và chấm
chạy, không phải hàng nút.

**Nhịp mặc định theo vai.** Spec chốt hai vai: con hằng ngày, bố mẹ 2 lần/tháng.
Bạn đời và bản thân xếp cùng nhịp với con (sống cùng nhà), bạn thân và `other` lấy
nhịp của bố mẹ. Vì mặc định đã đúng nên bước 3 không đụng vào cũng đi tiếp được.

**Đổi vai không ghi đè nhịp của người đã có.** Trong `PersonForm`, đổi vai chỉ kéo
theo nhịp mặc định khi đang **thêm mới**. Người dùng đã chọn nhịp riêng thì lựa
chọn đó là của họ.

**Xoá là xoá mềm.** `removePerson` đặt `deleted` + `deleted_date` qua
`Repository.update`, không gọi `delete()` (hàm đó xoá cứng khỏi mảng rồi mới dựng
bia mộ). `list()` đã lọc `!deleted` nên người biến khỏi màn hình ngay, còn tầng
đồng bộ đọc `deleted` để phân biệt "đã xoá" với "chưa từng có". Bản ghi `time_entry`
trỏ vào người bị xoá **giữ nguyên**: giờ đã sống cùng nhau không bị xoá theo, và
tổng giờ ý nghĩa của các tuần cũ không tự đổi sau lưng người dùng.

**Chưa có giờ nào thì không hiện "0 giờ".** `weeklyMinutesOf` trả
`empty('no_data')` khi người đó chưa có bản ghi nào trong tuần; thẻ hiện dấu gạch
kèm hai dòng trung tính: "chưa ghi giờ nào tuần này" và lối đi "màn hôm nay có nút
bắt đầu đếm". `00-vision.md` rủi ro #3 và #4. Cùng lý do với `Home/`: dưới một giờ
thì đổi đơn vị sang phút thay vì hiện "0,0 h".

**Độ phủ tính trên cả tuần, không riêng từng người.** `weeklyMinutesOf` nhận số
ngày cả tuần đã có bản ghi. Nếu đòi mỗi người phải có bản ghi bảy ngày mới `ready`
thì bố mẹ ở xa sẽ vĩnh viễn "đang tính" — ngưỡng bảy ngày của `03-formulas.md` §1
nói về độ phủ của tuần, không nói về từng người.

**Không xếp hạng, không chấm điểm, không nhắc gây tội lỗi** (ràng buộc cứng #3).
Thứ tự nhóm cố định theo vai; trong nhóm giữ nguyên thứ tự thêm vào. Không có thanh
tiến độ so nhịp gặp thực tế với nhịp mong muốn, không có phần trăm, không có màu
theo mức. Nhịp mong muốn chỉ hiện lại đúng con số người dùng đã chọn. Màu duy nhất
mang nghĩa "nặng" là `destructive` ở nút xoá — tím mận, không phải đỏ.

**Màn Người không ghi giờ.** Thêm nút ghi nhanh ở đây sẽ là tính năng ngoài spec
(`05-v1-spec.md` §"Màn hình 4" chỉ có thêm/sửa/xoá) và trùng với màn Hôm nay. Lối
đi trong trạng thái rỗng là một dòng chữ chỉ sang màn Hôm nay, không phải một nút.

## Câu hỏi còn mở

- **Onboarding hiện không vào được.** `App.tsx` đặt `is_first_init = true` ngay
  lần chạy đầu, còn `MainScreen.tsx` lại dùng chính cờ đó để chọn
  `initialRouteName` — nên nhánh `'Welcome'` không bao giờ chạy. Cần một cờ riêng
  cho "đã đi qua onboarding" (`hasSetupProfile` mà bản cũ dùng là đúng ý này).
  Hai file đó nằm ngoài phạm vi đợt này.
- **Bảng vai bị chép hai bản** (`Person/Models/constants.ts` và
  `Welcome/Models/constants.ts`), cùng với hàm cắt tuần (`Person/Models/week.ts`
  chép của `Home/Models/week.ts`). Luật import 2 cấm feature gọi feature và chỗ
  đúng của cả hai là `Common/` — đợt này không được sửa `Common/`. Chuyển xuống khi
  thư mục đó rảnh; `roleName`/`cadenceName` cũng gộp làm một lúc đó.
- Nhịp gặp mong muốn hiện chỉ để hiện lại. Đối chiếu nó với nhịp thật là việc của
  Đồng hồ cát; làm ở đây sẽ thành đúng kiểu nhắc gây tội lỗi mà ràng buộc #3 cấm.
- `desiredCadence` là số lần **một tháng** theo entity. Nấc "hằng ngày" đang lưu
  30. Nếu sau này cần phân biệt "hằng ngày" với "30 lần rải rác trong tháng" thì
  phải thêm cột, không nới nghĩa cột này.

## Bước tiếp theo

1. Đăng ký route `PersonApp` trong `src/Main/MainScreen.tsx` (xem trên).
2. Sửa cờ vào onboarding trong `App.tsx` + `MainScreen.tsx`.
3. Thay nút "thêm người" tạm trên `src/Home/` bằng đường sang `PersonApp`.
4. Khi `Common/` rảnh: chuyển bảng vai và hàm cắt tuần xuống đó, bỏ hai bản chép.
5. Màn Đồng hồ cát (agent khác) là chỗ hỏi tuổi và khoảng cách — `Person` đã để sẵn
   `birthYear`/`distanceKm` trống và `hourglassEnabled = false`.
