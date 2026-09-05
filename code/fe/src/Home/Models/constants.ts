/** Hằng số riêng của màn hình chính. Không số ma thuật trong JSX. */

/** Ba khoảng của nút ghi nhanh (`05-v1-spec.md` §"Màn hình 1"). */
export const QUICK_MINUTES: readonly number[] = [30, 60, 120];

/** Một chạm vào nhãn lãng phí ghi bằng khoảng ngắn nhất; giữ để chọn khoảng khác. */
export const WASTE_TAP_MINUTES = 30;

/** Bấm dừng ngay sau khi bắt đầu vẫn phải ra một bản ghi có nghĩa. */
export const MIN_LOGGED_MINUTES = 1;

/** Ngưỡng đổi đơn vị tiền khi hiển thị: triệu, rồi nghìn. */
export const VND_PER_MILLION = 1000000;
export const VND_PER_THOUSAND = 1000;

export const MILLISECONDS_PER_MINUTE = 60000;

/** Nhịp cập nhật đồng hồ đang chạy trên màn hình. */
export const RUNNING_TICK_MS = 30000;

/** Khoá AsyncStorage của phiên đếm giờ đang chạy — không phải bảng nghiệp vụ. */
export const RUNNING_SESSION_KEY = 'home_running_session';

/** Số người hiện trên hàng avatar. Hàng cuộn ngang nên đây chỉ là trần an toàn. */
export const MAX_PEOPLE_SHOWN = 12;
