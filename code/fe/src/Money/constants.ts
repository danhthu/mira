/**
 * Hằng số riêng của trụ Tài chính ở tầng hiển thị và tầng đọc dữ liệu.
 * Ngưỡng nghiệp vụ (bốn nấc giàu, số tháng trung bình trượt) nằm ở `Core/constants.ts`
 * và không được nhân bản ở đây.
 */

/** Tiền VND tách nhóm ba chữ số. */
export const VND_GROUP_SIZE = 3;

export const THOUSAND = 1_000;
export const MILLION = 1_000_000;
export const BILLION = 1_000_000_000;

/** `03-formulas.md` §3: dưới 1 tháng hiện bằng ngày, trên 24 tháng hiện bằng năm. */
export const MONTHS_SHOWN_AS_DAYS = 1;
export const MONTHS_SHOWN_AS_YEARS = 24;

/**
 * Cửa sổ đọc bản ghi thời gian để suy giờ làm thật mỗi tuần. Bốn tuần đủ để san
 * phẳng tuần nghỉ lễ mà không kéo theo dữ liệu của một công việc đã nghỉ.
 */
export const WORK_LOOKBACK_WEEKS = 4;
