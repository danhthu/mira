/**
 * Giờ được coi là "sáng hôm sau". Dùng chung cho hai chỗ: giới nghiêm kết thúc,
 * và ma sát cố ý mở lại mục tiêu mới. Hai chỗ này phải cùng một mốc, nếu không
 * sẽ có khoảng thời gian app đã hết im lặng nhưng vẫn chưa cho thêm mục tiêu.
 *
 * Hằng số của lớp da nằm ở đây chứ không ở `core/constants.ts` vì `core/` là
 * tầng công thức ba chỉ số lõi, không biết gì về cấu hình im lặng.
 */
export const MORNING_HOUR = 6;
