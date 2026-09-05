# Đồng hồ cát

## Trạng thái hiện tại

Xong màn hình 2 (`05-v1-spec.md` §"Màn hình 2 · Đồng hồ cát") và sáu mục đầu của
màn hình 4 (§Settings). Mục thứ bảy (Đồng bộ) đã có từ trước, không bị đụng tới.

```
src/Hourglass/
├── constants.ts                 khoá kho, giờ giới nghiêm mặc định, cửa sổ 7 ngày
├── index.tsx                    cửa duy nhất ra ngoài: HourglassApp + useQuietTime
├── Text/index.ts                toàn bộ chữ của module và của màn Cài đặt
├── Models/
│   ├── quietTime.ts             giới nghiêm + ngày trắng (hàm thuần, có test)
│   ├── calendar.ts              ngày tháng, nhóm nghìn (hàm thuần, có test)
│   ├── cards.ts                 dựng trạng thái từng card (hàm thuần, có test)
│   ├── store.ts                 kho cấu hình một khoá `hourglass_settings`
│   ├── people.ts                cầu nối tới `person` / `time_entry`
│   ├── stores.ts                suy danh sách kho — nguồn duy nhất, có test
│   ├── dataExport.ts            xuất JSON thật (web tải file, native ghi file)
│   └── dataWipe.ts              xoá mọi kho
├── Hooks/
│   ├── useHourglass.ts          người, card, và các thao tác ghi
│   └── useQuietTime.ts          hook cho màn khác đọc giới nghiêm / ngày trắng
├── Components/                  Basics, HourglassCardView, EnableSheet, ConfirmSheet
└── Screens/                     Overview, Container, SettingsSections
```

Tầng thuần thêm vào `src/Core/hourglass.ts` (`03-formulas.md` §5) — file mới, không
sửa file `Core/` nào đã có. `Core/index.ts` không export nó vì file đó do đợt khác
giữ; chỗ dùng import thẳng `../../Core/hourglass`, giống cách `Money/` đang làm.

Test: `tests/core/hourglass.spec.ts` (25) và `tests/hourglass/` (41) — tổng 66 test mới.

## Quyết định đã chốt

**Mặc định TẮT được cưỡng chế ở đúng một chỗ.** `visibleCards()` lọc theo
`person.hourglassEnabled`, và không hàm nào trong module có đường bật hộ. Entity đã
khởi tạo `false` ngay ở khai báo trường, nên mọi đường tạo `Person` đều tắt.

**Không nhánh nào của card thiếu hành động.** `HourglassCard.action` là trường bắt
buộc của kiểu, không phải nhánh tuỳ chọn — thiếu năm sinh thì hành động là "nhập năm
sinh", có số rồi thì là "đặt lịch gọi", đã hẹn rồi thì là "dời sang tuần sau". Trình
biên dịch không cho dựng card không hành động. Đây là chỗ chống rủi ro #1 của
`00-vision.md`; test `cards.spec.ts` kiểm từng nhánh.

**Không hiện số 0, không đoán.** Mọi hàm ở `Core/hourglass.ts` trả `MetricState`.
Thiếu năm sinh → `no_data` → card mở lối nhập. Người đã qua tuổi thọ trung bình, hoặc
con đã quá 18 → `not_applicable`, không kẹp về 0: câu "còn 0 lần gặp" là đúng thứ
rủi ro #1 cấm. Năm sinh ở tương lai hoặc trước 1900 → `inconsistent`.

**Card của bố mẹ không hiện số năm.** `03-formulas.md` §5 điều 3 cấm chữ đếm ngược
sinh tử. `CompanionshipHourglass` vẫn trả `yearsLeft` cho nơi khác dùng, nhưng
`Text/index.ts` chỉ dựng câu từ `visitsLeft` và `daysTogether`.

**Ẩn card lưu trong `hourglass_settings`, không lưu trong `person`.** Ẩn là quyết
định về màn hình, không phải thuộc tính của con người. Để trong entity thì nó sẽ đẩy
lên server qua allowlist đồng bộ và ẩn lây sang máy khác.

**Giới nghiêm bật sẵn, ngày trắng tắt sẵn.** `05-v1-spec.md` chỉ nói rõ ngày trắng
mặc định tắt, và nói giới nghiêm "mặc định 21h". Chọn phương án an toàn nhất theo
nghĩa ít áp lực nhất: giới nghiêm chỉ làm app im bớt, không đòi thêm việc gì, nên bật
sẵn. Khoảng giới nghiêm chạy từ giờ đã chọn tới 5h sáng hôm sau — nếu dừng ở nửa đêm
thì 0h–5h thành khoảng "không giới nghiêm", trái hẳn ý nghĩa của mục này.

**Giới nghiêm và ngày trắng có tác dụng thật ngay trong module này.** Khi đang trong
khoảng yên tĩnh, card chuyển sang trạng thái `quiet`: con số nghỉ, hành động ở lại.
Màn Hôm nay do agent khác giữ dùng hook `useQuietTime()` để làm điều tương tự.

**`daysPerVisit` hỏi lúc bật, không suy từ `distanceKm`.** Khung card trong spec có
dòng "2 ngày mỗi lần" nhưng `Person` không có cột này. Suy từ khoảng cách là đoán;
hỏi thẳng một ô, mặc định 1 ngày. Nhịp gặp điền sẵn theo vai
(`DEFAULT_MONTHLY_CADENCE`, lấy từ `05-v1-spec.md` §Onboarding bước 3) — người dùng
nhìn thấy và sửa được trước khi bấm, nên không phải giá trị đoán ngầm.

**Danh sách kho khi xoá được suy, không gõ tay.** Hai nguồn, cả hai tự theo kịp khi
dự án thêm kho mới:

1. `Common/Repositories/index.ts` — `registeredRepositories()` lọc mọi export là
   `instanceof Repository`. Thêm một dòng `getRepository<X>('x')` là hàm thấy ngay.
2. `AsyncStorage.getAllKeys()` — mọi khoá thật sự trên máy, kể cả khoá không đi qua
   `Repository` (`settings`, `sync_outbox`, `sync_watermark`, `hourglass_settings`).

Xoá đi hai lượt theo thứ tự: `empty()` từng repository trước (mỗi `Repository` giữ
một bản sao trong bộ nhớ; chỉ xoá khoá dưới đĩa thì lần ghi kế tiếp lưu lại bản cũ và
dữ liệu sống lại), rồi `multiRemove` mọi khoá còn lại. `tests/hourglass/stores.spec.ts`
so số repository tìm được với số repository đang export — sót một bảng là test đỏ.

**Gọi `AsyncStorage` thẳng trong `stores.ts`.** `DbProvider` chỉ có `getItem`/
`setItem`, không liệt kê được khoá. `AsyncStorageProvider` là hiện thực mặc định và
duy nhất của app nên hai đường nhìn cùng một kho.

## Nợ đã biết

**`Common/` đang import module này.** `Common/Screens/SettingScreen.tsx` và
`Common/Screens/Container.tsx` mỗi file import đúng một dòng từ `src/Hourglass`. Điều
này ngược luật import #1 ("Common không import feature"). Lý do: phạm vi file của đợt
này chỉ mở hai file đó bên `Common/`, và năm trong sáu mục Cài đặt là cấu hình của
chính module này. `scripts/soi-cau-truc.sh` hiện **không** đếm nó, vì danh sách
`FEATURES` trong script chưa có `Hourglass` — đừng thêm tên vào danh sách đó trước khi
dọn, sẽ tăng baseline.

Hướng dọn khi có đợt được phép sửa `Common/`: chuyển `Models/{quietTime,store,
dataExport,dataWipe,stores}.ts` và `Hooks/useQuietTime.ts` xuống `Common/Settings/`,
để `Common/Screens/SettingScreen.tsx` chỉ còn import xuống chứ không import ngang.
Bề mặt phụ thuộc cố tình gom vào `src/Hourglass/index.tsx` để lần dọn đó chỉ phải sửa
hai dòng import.

## Câu hỏi còn mở

- Dòng "Danh sách người quan trọng" trong Cài đặt gọi `navigate('PersonApp')`. Route
  đó đã được module Người quan trọng đăng ký (xác nhận trên bản web ngày 2026-09-05);
  nếu module ấy đổi tên route thì sửa `PERSON_ROUTE` trong `Screens/SettingsSections.tsx`.
- `05-v1-spec.md` còn ghi "chạm vào card → lịch sử gặp gỡ và nút hẹn lần tới". Đợt
  này chưa làm: lịch sử cần `moment` (chưa có entity) và `timeEntry` theo người, và
  "hẹn lần tới" đã có sẵn dưới dạng nút hành động trên card.
- "Đặt lịch gọi" hiện lưu ngày hẹn trong `hourglass_settings` chứ không tạo bản ghi
  `reminder`: bảng `reminder` là của Batify với kiểu `reminderOption` riêng, dùng nhờ
  sẽ trộn hai ngữ nghĩa. Khi module Nhắc việc của Mira có mặt thì nối vào đó.
- Tuổi thọ mặc định 78 đã "cho sửa" ở tầng `Core` (`lifeExpectancy` là tham số) nhưng
  chưa có ô nhập trong UI. Chưa rõ có thuộc V1 không.

## Bước tiếp theo

1. Đăng ký route `HourglassApp` trong `src/Main/MainScreen.tsx` (xem báo cáo) để màn
   Đồng hồ cát có đường vào từ navigator gốc, không chỉ từ trong Cài đặt.
2. Màn Hôm nay gọi `useQuietTime()` và im tiếng khi `reason` khác `null`.
3. Nối "chạm vào card → lịch sử gặp gỡ" khi entity `moment` có mặt.
