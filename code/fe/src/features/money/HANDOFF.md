# Tài chính (M2)

## Trạng thái hiện tại

Xong ba khối của màn Tài chính: Tỷ giá đời, Vốn tự do (kèm Delta tự do), danh sách
chi tiêu có quy đổi. Hai form nhập: số liệu tháng (`money`) và khoản chi (`expense`).

- `lib/deriveMoney.ts` — hàm thuần gom dữ liệu bảng thành input cho `core/`. 9 test.
- `hooks/useMoneyData.ts` — đọc `money` + `work_load` + `expense` tháng hiện tại,
  gọi ba hàm `core/` đã có, không tự tính lại công thức nào.
- `components/` — `LifeRateCard`, `FreedomCard`, `ExpenseRow`, `AmountField`,
  `MonthFormModal`, `ExpenseFormModal`.
- Repository mới: `db/repositories/moneyRepository.ts`, `db/repositories/expenseRepository.ts`.

## Quyết định đã chốt

- **Q-010 (lệch 52/12 giữa `03-formulas.md` và `core/lifeRate.ts`)**: chọn cách hiểu
  của code — `WorkPeriodInput` nhận tổng phút THẬT của cả tháng. `buildWorkPeriods`
  cộng dồn các dòng `work_load` theo tuần vào tháng của `weekStart` rồi mới gọi
  `calculateLifeRate`, nên không nhân thêm `52/12`. Đây là lựa chọn an toàn: dùng số
  thật thay vì ngoại suy từ một tuần đại diện, và không phải sửa 9 test đang pass.
  Nếu chốt ngược lại thì sửa ở `lib/deriveMoney.ts`, không sửa `core/`.
- **`netWorth` cho Vốn tự do = `money.netWorth − money.debt`**. Bảng tách hai cột,
  công thức mục 3 cần hiệu của chúng.
- **`monthlySaving` = `netIncome − monthlyExpense`**, suy ra từ bảng chứ không bắt
  người dùng nhập thêm một trường nữa (ngân sách nhập liệu ≤60 giây/ngày).
- **Đọc `work_load` đặt trong `moneyRepository.ts`** chứ không tách repository riêng:
  chỉ đúng chỗ tính tỷ giá đời cần bảng này, và phạm vi file của đợt làm này không
  cho tạo `workLoadRepository.ts`.
- **`upsertMoney` sửa đè theo `month`**, một bản ghi mỗi tháng. Nhập hai lần cùng
  tháng mà tạo hai dòng thì trung bình trượt 3 tháng sẽ đếm tháng đó hai lần.
- **R-002 giữ nguyên**: không có chỗ nào trong module này nhân giờ với người ra tiền.
  Quy đổi chỉ chạy qua `convertExpense` trên bản ghi `expense`.
- **Không màu đỏ**: trạng thái đang nợ và vốn tự do thấp dùng `colors.textSecondary`
  xám trung tính, giống mọi dòng phụ khác.
- `findLatestMoney` bị bỏ: bản web mock DB không hỗ trợ `.limit()`, mà
  `findAllMoneyRecords` đã sắp xếp giảm dần theo tháng nên phần tử đầu là bản mới nhất.

## Câu hỏi còn mở

- **Thiếu key i18n** (không tự thêm vào `i18n/vi.ts` theo phạm vi được giao):
  - `vi.money.cancel` — hai modal đang mượn `vi.today.cancel`, `vi.today.save`.
  - `vi.money.expensesEmpty` — danh sách chi tiêu rỗng hiện không hiện chữ gì.
  - Chuỗi cho trạng thái `in_debt` mà `monthlySaving ≤ 0` (không đo được quãng đường).
    Đang tạm dùng `vi.money.freedomDays(0)` — đúng nghĩa và không âm, nhưng nên có
    câu riêng.
- **R-070 nhiều nguồn thu**, **R-071 thu nhập thụ động**: bảng `money` chỉ có một cột
  `netIncome`, không phân biệt được nguồn hay chủ động/thụ động. Cần đổi lược đồ.
- **R-073 người không đi làm → ẩn hoàn toàn** khác **R-072 `realWorkHours = 0` → hiện
  lời mời nhập giờ**. `core/lifeRate.ts` chỉ có một trạng thái `no_work_hours` chung,
  nên màn hình hiện đang gộp hai trường hợp làm một.
- Chưa có màn nhập `work_load`. Chưa có tuần nào thì tỷ giá đời luôn ra `no_work_hours`.

## Bước tiếp theo

1. Bổ sung các key i18n trên vào `i18n/vi.ts`, thay chỗ đang mượn từ `vi.today`.
2. Màn nhập tải công việc theo tuần (`work_load`) — thiếu nó thì Tỷ giá đời không
   bao giờ tính được từ dữ liệu người dùng.
3. R-086 đọc chi tiêu từ SMS/notification, xác nhận một chạm (cột `confirmed` và
   `sourceType` đã sẵn trong lược đồ, repository đã ghi đúng).
4. Sửa/xoá khoản chi trên giao diện — `softDeleteExpense` đã có, còn thiếu chuỗi hiển thị.
