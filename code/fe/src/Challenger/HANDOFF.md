# Thử thách (Challenger) + Nhịp xem giá (Trading)

## Trạng thái hiện tại

Đợt 2026-09-05 thiết kế lại hai module. `Challenger` từ 35 file xuống **31 file mã nguồn** (32 kể cả HANDOFF.md này);
`Trading` từ 1 file lên 4 (tách chữ và hai tầng hàm thuần ra khỏi màn hình).
Phần đóng góp của hai module vào `scripts/soi-mau.mjs` từ **23 dòng xuống 0**.
Luật import: `Challenger` từ 7 vi phạm xuống **4**, và vòng lặp
`Challenger ↔ Work` đã đóng.

Đã kiểm bằng trình duyệt ở 375×812 với dữ liệu thật nạp vào kho: danh sách thử
thách, chi tiết, trạng thái rỗng, biểu mẫu thêm, và màn Nhịp xem giá. Không màn
nào trắng, không chỗ nào đỏ, không con số nào do màn hình tự bịa.

---

## A · Challenger

### 1. Dữ liệu giả — đã nối vào kho thật

`Models/ChallengerTrackerModel.ts` trước đây trả số cứng:

```ts
useCurrent : ():{total:number,done:number,status:0|1|number}=>{
  const [data,setData] = useState({ total:0,done:0,status:0 } );
  useEffect(()=>{ setData({ total:10,done:10,status:0 }); },[]);
  return data;
},
useCalendarData: (): Array<{ date: Date; status: 0|1|2 }> => {
  const [data, setData] = useState([] as Array<...>);
  useEffect(() => {
    const loadData = async () => { setData([{ date: new Date(), status: 0 }]); };
    return () => {};          // loadData khai ra rồi không ai gọi
  }, []);
  return data;
},
```

Bây giờ:

```ts
useCalendarData: (): CalendarDay[] =>
  useAsyncAction<CalendarDay[]>(async () => {
    const challenges = await challengeRepository.list();
    if (challenges.length === 0) return [];
    ...
    for (let back = CALENDAR_WINDOW_DAYS - 1; back >= 0; back--) {
      const date = new Date(today.getTime() - back * MS_PER_DAY);
      const covering = challenges.filter((c) => coversDay(c, date));
      if (covering.length === 0) continue;
      days.push({ date, status: covering.some(isReached) ? 2 : 1 });
    }
    return days;
  }, [useDectectDataChanged(challengeRepository)], []),
```

Kho rỗng thì trả mảng rỗng — lịch để trống, không tô một ngày bịa.

**`useCurrent` đã xoá.** Không file nào trong repo gọi tới nó
(`grep -rn "useCurrent"` chỉ còn bản của `HabitTracker`), nên sửa cho nó trả số
thật là dựng một hàm không ai dùng. Xoá hẳn là cách chống số bịa chắc nhất.

Hai con số bịa còn lại cũng đã gỡ:

| Số bịa | Ở đâu |
|---|---|
| `percentage: 0` gán cứng cho mọi thử thách, rồi vẽ vòng tròn ba ngưỡng màu trên nó | `Screens/Home.tsx:114-118` + `Components/RowItem.tsx:44-58` |
| `{ success: 2, failure: 3, running: 3 }` — ba con số đếm viết tay trên thẻ tổng quan | `Components/Card.tsx:35-39` (xoá cả file) |
| `let percentage: 0;` — khai kiểu chứ không gán, luôn `undefined`, vẫn trả ra ngoài | `Screens/Detail.tsx:74` |
| `details: []` không bao giờ nạp, nhưng màn vẫn dựng sẵn bảng "Ngày / Kết quả" cho nó | `Screens/Detail.tsx:23,73` |

### 2. Chữ "Thất bại" — quyết định

Rà `streak|liên tiếp|chuỗi|score|điểm|badge|huy hiệu|thất bại|failure`: không có
streak, không có điểm số, còn **hai** chỗ về "thất bại".

1. **`Components/Card.tsx:53`** — `text.thatbai || 'Thất bại'`. Đợt trước đã đổi
   nhãn trong `Text/index.ts` thành "Chưa đạt", nhưng chuỗi tiếng Việt dự phòng
   `|| 'Thất bại'` ngay trong JSX vẫn hiện nguyên khi key thiếu. Đây đúng là chỗ
   "lọt" mà đề bài đoán. File đã xoá (xem mục 5), và **toàn module giờ không còn
   mẫu `text.key || 'chuỗi dự phòng'`** — `useText()` trả
   `Record<ChallengerTextKey, string>`, gọi sai key thì hỏng lúc biên dịch.

2. **`Entities/CChallenge.ts`** — `status: 'CREATED'|'DOING'|'FAILURE'|'SUCCESS'`.
   Đã bỏ `'FAILURE'` khỏi union.

**Thử thách hết hạn mà chưa xong thì nói gì:** nói **"Đã khép lại"**, kèm câu
"Quãng thời gian này đã qua. Bạn có thể mở lại, hoặc để nó khép ở đây". Không có
trạng thái nào tên là thất bại, và app **không tự suy ra** đạt hay không đạt từ
dữ liệu thói quen/công việc — suy ra là chấm điểm. Chỉ người dùng tự bấm "Đánh
dấu đã đạt". Bốn trạng thái, không cái nào là điểm trừ:

| Trạng thái | Khi nào | Màu |
|---|---|---|
| Sắp bắt đầu | chưa tới ngày bắt đầu | `neutralSurface` |
| Đang diễn ra | trong quãng | `accentSurface` |
| Đã đạt | người dùng tự đánh dấu | `positiveSurface` |
| Đã khép lại | hết hạn, chưa đánh dấu | `neutralSurface` — **cùng màu với "sắp bắt đầu"** |

"Đã khép lại" cố ý dùng đúng màu trung tính của "sắp bắt đầu": hai đầu của một
quãng thời gian, không phải hai đầu của một thang điểm.

**Vì sao bỏ `'FAILURE'` mà không cần đường chuyển đổi:** `Repository<T>` lưu JSON
nguyên khối. Bản ghi cũ trên máy có thể còn `status: 'FAILURE'`; đọc lên vẫn hợp
lệ, và `challengeState` xử lý mọi giá trị không phải `'SUCCESS'` như nhau nên bản
ghi đó hiện ra là "đang diễn ra" hoặc "đã khép lại" tuỳ mốc thời gian. Đã kiểm
trên trình duyệt: nạp một bản ghi `status:'FAILURE'` vào kho, màn hình hiện "Sắp
bắt đầu", và giá trị `'FAILURE'` vẫn nằm nguyên trong kho sau khi ghi bản ghi
khác — không xoá dữ liệu của ai.

`Home/Models/load.ts:22` vẫn khai `CLOSED_STATUSES = ['SUCCESS', 'FAILURE']`.
Đó là file của composition root, ngoài phạm vi đợt này; để lại `'FAILURE'` trong
danh sách là vô hại (không còn ai ghi giá trị đó) nhưng nên dọn khi có người giữ
`Home/`.

### 3. Hạn mức ẩn trong liên kết — đã gỡ

`ChallengeAssociate.option` trước là `{ type: 'Target'|'Times'|'DONE'|'ONTIME',
link, value: number }`. Sau khi chọn một thói quen, app mở tiếp một hộp thoại
"Thiết lập mục tiêu" bắt chọn một hạn mức trong dải `totalDays * 0.5 … 1.0`
(`ChallengeLinkTo.tsx:319-388`, và một bản chép gần y hệt ở
`Screens/LinkToDetail.tsx`). **Không màn nào đọc lại `type` hay `value`** — hạn
mức ghi vào máy rồi nằm đó. Đó là một hệ chấm điểm ẩn, đúng nghĩa ràng buộc #3,
và nó tốn hai chạm mỗi lần gắn (ràng buộc #1).

Đã gỡ: `ChallengeOption` còn đúng `{ link: 'Work' | 'Habit' }`. Gắn một việc giờ
là một chạm. Khoá thừa trong bản ghi cũ đọc lên bị bỏ qua.

### 4. Bug đã sửa

- `Screens/Detail.tsx:74` `let percentage: 0;` — xoá cùng cả `loadData`; màn Chi
  tiết viết lại từ đầu, đọc `challengeRepository.findById` và
  `challengeAssociateRepository.filter` rồi hiện **tên thật** của những việc đã
  gắn thay cho bảng rỗng.
- `Screens/Home.tsx:143` và `Screens/IconSelection.tsx:84` mở route
  `'ChallengerAppModal'` — tên này không có trong navigator nào, chạm vào không
  có gì xảy ra. Đã trỏ về `'ChallengerApp'`.
- `Components/ImageSelection.tsx:59` mở route `'ChallengerModal'` — cũng không
  tồn tại. Xem mục 5.
- `Screens/WorkSelection.tsx:11` import `habitRepository` rồi không dùng.
- `Screens/Edit.tsx:23` `console.log('sav=============')` trong đường ghi dữ liệu.
- `Screens/HabitSelection.tsx:52-54` ba `console.log` mỗi lần mở màn, trong đó
  một cái chạy hẳn một truy vấn kho chỉ để in ra.

### 5. File đã gỡ (35 → 31 file mã nguồn)

| File | Vì sao |
|---|---|
| `Components/Card.tsx` + `Assets/card.jpg` | Ba con số bịa cứng, nhãn "Thất bại", `colors.error`. Không file nào import (`ChallengerApp.Components` chỉ được `Work/Screens/Edit.tsx` dùng, và nó gọi `LinkTo`). |
| `Screens/LinkToDetail.tsx` | Bản chép của `ChallengeTargetDialog`; `onChanged` của nó là `data => { console.log(data); }` — bấm "Xong" chỉ in ra console. Không route nào trỏ tới ngoài chính `Container`. |
| `Screens/IconSelection.tsx` | Không đăng ký trong navigator nào; đường duy nhất tới nó là route `'ChallengerModal'` không tồn tại. Bên trong còn `TabAsset` không `return` gì và một `EmptyData` không ai gọi. Lưới nó định mở gồm đúng hai ảnh mặc định. |
| `Assets/gif-icon-default.png` | Chỉ dùng bởi `Gif` trong `Add.tsx` — một component không bao giờ được render. |
| `Assets/no_challenge.png` | Ảnh **mặt buồn** ở trạng thái rỗng. Cùng lý do `HabitTracker` gỡ `no_habit.png`. |
| `Models/index.ts` | File rỗng. |
| `Screens/Add.tsx` / `Screens/Edit.tsx` (phần thân) | Hai bản chép tay của nhau; gộp thành `Components/ChallengeForm.tsx`, mỗi màn còn ~35 dòng lo đúng việc nạp và lưu. |

File mới: `Models/challengeState.ts` (hàm thuần, có test),
`Components/StateChip.tsx`, `Components/ChallengeForm.tsx`.

### 6. Màu — 18 mã viết cứng về 0

`#fff` (9 chỗ), `#000` (2), `#8b008b` (2), `'gray'`, `'black'`, `'pink'` và ba
ngưỡng `colors.success / colors.warning / colors.error` trên vòng tròn phần trăm.
Cả module giờ lấy màu qua `colors.token.*`. Không chỗ nào dùng `destructive` —
module không có thao tác xoá vĩnh viễn.

### 7. Luật import — 7 → 4

| Đã gỡ | Cách |
|---|---|
| `Screens/LinkToDetail.tsx` → `HabitTracker/Entities`, `Work/Entities` | xoá file |
| `Screens/WorkSelection.tsx` → `HabitTracker/Entities` | import thừa, không dùng |

**`Components/ChallengeLinkTo.tsx` đang được dùng thật — không xoá.** Nó là
control "Gắn với" trong cả hai biểu mẫu Thêm và Sửa, và đọc `habitRepository` /
`workRepository` để lấy tên thật của việc đã gắn. Xoá nó là cắt hẳn tính năng
liên kết. Bốn vi phạm còn lại đều là chuyện đọc tên qua ranh giới module:

- `Components/ChallengeLinkTo.tsx` → `HabitTracker/Entities`, `Work/Entities`
- `Screens/HabitSelection.tsx` → `HabitTracker/Entities`
- `Screens/WorkSelection.tsx` → `Work/Entities`

Vòng lặp `Challenger ↔ Work` **đã đóng**: `soi-cau-truc.sh` mục 4 báo sạch.

---

## B · Trading

### 1. Màu và chữ

`'red'` (danh sách "các ngày không đạt mục tiêu"), `'green'`, `'blue'`, `'gray'`,
`#f0f0f0` — về 0. Tiêu đề "Trading Time Tracker" và mọi chuỗi inline chuyển sang
`src/Trading/Text/index.ts`, kiểu `Record<TradingTextKey, string>`.

### 2. Bỏ hẳn hai danh sách "đạt / không đạt"

Đây là vi phạm #3 rõ nhất trong toàn bộ phạm vi đợt này: app chia lịch sử của
người dùng thành ngày xanh và ngày đỏ. Màn hình mới chỉ đếm — hôm nay bao nhiêu
lần, khoảng ngắn nhất giữa hai lần là bao nhiêu phút, bảy ngày gần đây mỗi ngày
bao nhiêu lần — cạnh khoảng cách người dùng tự đặt. Không câu nào phán xét.

Sửa luôn hai lỗi thật: `saveData` đọc state qua closure nên lần ghi nào cũng chậm
một nhịp, và biến `allTimesBelowGoal` thực ra kiểm `time >= goalTimeLimit` (tên
ngược với điều kiện).

### 3. Lưu trữ — giữ nguyên `AsyncStorage`, không đưa qua `Repository`

**Quyết định: giữ khoá `tradingData` và không chuyển sang `Repository`.**
`Repository<T>` lưu một mảng thực thể có `id` và cột sổ sách; dữ liệu đang nằm
trên máy người dùng là một đối tượng ba mảng phẳng. Chuyển đổi là một lần viết
lại kho mà nếu đứt giữa chừng thì mất lịch sử thật, đổi lại chỉ được sự nhất
quán về hình thức. Theo yêu cầu "không chắc thì giữ nguyên và ghi vào HANDOFF".

Bù lại, `Models/storage.ts` **không phá dữ liệu cũ**:

- Đọc `goalTimeLimit` (giây, bản cũ) làm `gapMinutes` nếu chưa có `gapMinutes`.
- Khi ghi, `saveTradingData` đọc lại bản cũ rồi `{...previous, viewTimes,
  gapMinutes}` — hai mảng `goalAchievedDays` / `nonGoalDays` không còn được dùng
  để hiển thị nhưng **vẫn nằm nguyên trong kho**, nên đợt sau còn đường chuyển
  đổi nếu muốn.

Đã kiểm trên trình duyệt: nạp dữ liệu kiểu cũ (kể cả `goalTimeLimit: 2700`), màn
hình hiện đúng "45 phút" và bảy ngày gần đây; bấm ghi một lần xem giá xong, đọc
lại `localStorage.tradingData` thấy `goalAchievedDays`, `nonGoalDays`,
`goalTimeLimit` vẫn còn nguyên.

`Home/Models/tiles.ts:108` có ghi chú "Trading giữ dữ liệu trong AsyncStorage
riêng, không có repository để đọc" — vẫn đúng sau đợt này.

---

## Câu hỏi còn mở

1. **Ô ngày trên web hiện chuỗi `Sat Sep 05 2026 14:03:23 GMT+0700`.**
   `libs/components/Input.tsx:113` viết `value={value + ''}`, và nhánh web của
   `InputDate` (dòng 163) đưa thẳng đối tượng `Date` vào đó. Cùng dòng này cũng
   là lý do ô rỗng từng hiện chữ `undefined` — trong phạm vi module đã chặn bằng
   cách không bao giờ truyền `undefined` (thử thách mới có sẵn quãng 30 ngày,
   các ô chữ truyền `|| ''`), nhưng phần định dạng ngày thì phải sửa trong
   `libs/`. `HabitTracker` và `Work` dùng đúng control này nên nó là một đợt
   riêng, không nên để một module tự tách ra.
2. **Tiêu đề màn Trading trong navigator vẫn là chữ "Trading"**
   (`Main/MainScreen.tsx:115`, và `Home/Text/index.ts:31`). Cả hai file ngoài
   phạm vi đợt này. Trong màn, tiêu đề đã là "Nhịp xem giá".
3. **`Home/Models/load.ts:22`** còn `'FAILURE'` trong `CLOSED_STATUSES` — xem
   mục A.2.
4. **`Screens/Selection.tsx`** (`Common.Screens.Selection<Challenge>`) chỉ được
   `Components/LinkTo.tsx` gọi tới, mà `LinkTo` thì chỉ `Work/Screens/Edit.tsx`
   dùng. Nếu `Work` bỏ ô "gắn với một thử thách" thì gỡ được cả hai file và
   `Challenger` sẽ không còn API công khai nào cho module khác.

## Bước tiếp theo

1. Đưa `libs/components/Input.tsx` về đúng định dạng ngày trên web (câu hỏi 1) —
   cần phối hợp với người giữ `libs/`.
2. Quyết định về liên kết Thói quen / Công việc (câu hỏi 4 + bốn vi phạm luật 2
   còn lại): hoặc đưa một `Common/Entities/Nameable` xuống tầng dùng chung để hai
   màn chọn không phải import feature, hoặc chấp nhận đây là ngoại lệ có chủ đích
   và ghi vào `docs/structure.md`.
3. Màn Chi tiết hiện chỉ liệt kê tên việc đã gắn. Nếu muốn nó nói được nhiều hơn
   thì phải cẩn thận: hiện "đã làm 12 / 30 ngày" là dựng lại đúng hệ chấm điểm
   vừa gỡ ở mục A.3.
