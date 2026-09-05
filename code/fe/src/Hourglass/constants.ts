/** Hằng số của module Đồng hồ cát và của các mục Cài đặt mà nó giữ. */

/**
 * Một khoá AsyncStorage duy nhất cho toàn bộ cấu hình do module này giữ: giới nghiêm,
 * ngày trắng, và cấu hình đồng hồ cát của từng người. Gom một chỗ để "xoá toàn bộ dữ
 * liệu" không phải nhớ thêm khoá nào — và vì `Repository` không nhận kiểu này.
 */
export const STORAGE_KEY_HOURGLASS = 'hourglass_settings';

/** `05-v1-spec.md` §Settings: giới nghiêm buổi tối mặc định 21h. */
export const DEFAULT_CURFEW_HOUR = 21;

/**
 * Giới nghiêm kéo từ giờ đã chọn tới 5h sáng hôm sau. Nếu chỉ tính tới nửa đêm thì
 * 0h–5h là khoảng "không giới nghiêm" — trái hẳn ý nghĩa của mục này.
 */
export const QUIET_MORNING_END_HOUR = 5;

/** `05-v1-spec.md` §Settings: ngày trắng mặc định tắt. Chủ nhật là giá trị điền sẵn. */
export const DEFAULT_WHITE_DAY_WEEKDAY = 0;

/** Một lần gặp mặc định tính một ngày; người dùng sửa được lúc bật. */
export const DEFAULT_DAYS_PER_VISIT = 1;

/** Số ngày của một tuần, dùng khi dời lịch liên lạc sang tuần sau. */
export const DAYS_IN_WEEK = 7;

/** Cửa sổ tính nhịp giờ hiện tại với con: 7 ngày gần nhất. */
export const RECENT_WINDOW_DAYS = 7;

export const EXPORT_FORMAT_VERSION = 1;
export const EXPORT_FILE_PREFIX = 'mira-export-';
