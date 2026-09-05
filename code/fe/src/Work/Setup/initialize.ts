/**
 * Work không gieo dữ liệu mẫu. Danh sách trống là trạng thái khởi đầu đúng: một
 * app không hứa giúp làm được nhiều hơn thì không có lý do gì đặt sẵn việc vào
 * ngày của người dùng. Hàm vẫn tồn tại vì `AppSetup/initialize.ts` gọi lần lượt
 * `initialize` của mọi module, và file đó nằm ngoài phạm vi sửa của đợt này.
 */
export async function initialize() {
  return;
}
