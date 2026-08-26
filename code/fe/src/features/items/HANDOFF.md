# Đồ đạc (M11)

## Trạng thái hiện tại

- `screens/ItemsScreen.tsx`: số món đang sở hữu, thẻ hỏi buông món trong tuần, danh sách món.
- `components/ItemRow.tsx`: tên món, số lần đã dùng, chi phí mỗi lần dùng, nút cộng một lượt dùng, nút buông.
- `itemCost.ts`: `costPerUse`, `pickWeeklyRelease` — hàm thuần, có test ở `itemCost.test.ts` (8 ca).
- `db/repositories/itemRepository.ts`: `findOwnedItems`, `createItem`, `markItemUsed`, `releaseItem`.

## Quyết định đã chốt

- **`costPerUse` trả `null` khi chưa có giá hoặc `useCount = 0`**, và màn hình không hiện dòng nào cả. Không hiện "chưa tính được", không hiện dấu gạch. Món mới mua chưa dùng lần nào không phải là một thiếu sót cần thông báo.
- **Gợi ý buông món xoay theo tuần, cùng một tuần luôn ra cùng một món.** Xếp theo `useCount` tăng dần rồi lấy chỉ số theo mã băm của `weekStart`. Nếu mỗi lần mở app lại ra một món khác thì đó không còn là câu hỏi, chỉ là tiếng ồn.
- **Không có màu cảnh báo, không đếm ngược, không so sánh.** Món ít dùng hiển thị y hệt món dùng nhiều; chỉ khác con số. `vi.items.suggestRelease` là câu hỏi, người dùng bỏ qua bao nhiêu tuần cũng được.
- **Buông món = đặt `releasedAt`, không xoá.** `findOwnedItems` lọc `releasedAt is null`, nên món đã buông biến khỏi danh sách nhưng dữ liệu vẫn còn.
- **`markItemUsed` cộng dồn bằng SQL (`use_count + 1`) và trả `void`; màn hình tự cộng 1 vào state.** Hai lý do: đọc-rồi-ghi sẽ mất lượt khi chạm nhanh hai lần; và driver `expo-sqlite` không hỗ trợ `returning()` trên `update` (đã dựng lên và gặp `TypeError: ... .returning is not a function` ngay trên trình duyệt). `insert().returning()` thì chạy bình thường.
- `itemCost.ts` đặt trong feature chứ không ở `core/` vì đợt này không được chạm `core/`.

## Câu hỏi còn mở

1. **Thiếu chuỗi i18n cho nút cộng lượt dùng.** Đang hiển thị `+1` (chữ số, không cần dịch) thay vì một nhãn tiếng Việt. Cần một khoá kiểu `vi.items.markUsed`.
2. **Thiếu nhãn chung `save`/`cancel`** — đang mượn `vi.moments.save` / `vi.moments.cancel`.
3. **Món đã buông chưa xem lại được.** Chưa có màn hình hay mục nào liệt kê chúng, và cũng chưa có chuỗi i18n cho mục đó.
4. **Liên thông tài chính mới đi một chiều.** `costPerUse` dùng `formatVND` để hiển thị, nhưng chưa nối với tỷ giá đời (`core/lifeRate.ts`) để nói "món này bằng bao nhiêu giờ làm".
5. `purchasedAt` có trong lược đồ và trong `CreateItemDto` nhưng màn hình chưa hỏi ngày mua.

## Bước tiếp theo

1. Thêm hai khoá i18n ở mục 1 và 2, đổi `+1` thành nhãn chữ.
2. Chuyển `itemCost.ts` sang `core/` khi được phép sửa `core/`, giữ nguyên bộ test.
3. Nối chi phí mỗi lần dùng với tỷ giá đời (mục 4) — cần chốt với người làm M5 trước.
