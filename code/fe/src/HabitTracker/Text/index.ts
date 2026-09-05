import { useText as useCommonText } from '../../../lang';

export const useText = () => {
  const text = useCommonText();
  return {
    Name: 'Tên',
    Description: 'Mô tả',
    DoDate: 'Ngày bắt đầu',
    EndDate: 'Ngày kết thúc',
    IsMandatory: 'Bắt buộc',
    Estimated: 'Dự kiến',
    Reminder: 'Nhắc',

    mn_home: 'Tổng quan',
    mn_listwork: 'Danh sách thói quen',
    mn_schedule: 'Lịch',
    mn_settings: 'Thiết lập',
    mn_statistic: 'Thống kê',

    add_habit: 'Thêm thói quen',
    Add_my_own: 'Tự thêm',
    add_my_own: 'Tự thêm',
    click_create_to_add_a_custom_habit: 'Nhấn "tạo" để thêm một thói quen của riêng bạn',
    Popular_collections: 'Bộ sưu tập phổ biến',
    popular: 'Phổ biến',
    pick_a_new_one: 'Chọn một cái mới',
    No_results: 'Không có kết quả',
    Monitor_that_you_have_unsaved_changes: 'Còn thay đổi chưa lưu',

    All: 'Tất cả',
    all: 'Tất cả',
    Today: 'Hôm nay',
    Weekly: 'Hàng tuần',
    Statistic: 'Thống kê',
    Summary: 'Tóm tắt:',
    summary: 'Tóm tắt:',
    overall: 'Tổng thể',
    successRate: 'Tỷ lệ hoàn thành',
    totalDaysDone: 'Số ngày đã làm',
    totalDone: 'Tổng đã làm',
    perfectDays: 'Ngày làm đủ',
    completedHabits: 'Thói quen đã xong',
    deleted: 'Đã xóa',
    done: 'Xong',
    edit: 'Sửa',
    save: 'Lưu',
    chinhsua: 'Chỉnh sửa',
    chon: 'Chọn thói quen',
    ghichu: 'Ghi chú',
    lienket: 'Liên kết',
    LinkActionSheet: 'Chọn liên kết',
    LinkActionSheetCancel: 'Hủy',
    LinkActionTypeHabit: 'Liên kết thói quen',
    LinkActionTypeWork: 'Liên kết công việc',
    batdau: 'Chọn thời gian kết thúc',

    // Câu ghép ở ScoreComponent: {your} {daily_habits} {are} {habits_are_completed}
    // hoặc {your} {daily_habits} {are_not_completed}. Bản cũ nói "are not
    // completed" kèm màu đỏ — đúng thứ ràng buộc #3 cấm. Bản này chỉ mô tả trạng
    // thái, không kèm phán xét.
    your: 'Thói quen',
    daily_habits: 'hàng ngày',
    are: 'đã',
    habits_are_completed: 'xong.',
    are_not_completed: 'còn đang mở.',
    completed: 'Đã xong',

    // Một key dùng cho cả trường hợp tăng và giảm (lỗi có sẵn của Batify), nên
    // câu phải đọc xuôi ở cả hai chiều.
    your_habits_score_dropped: 'Thói quen hôm nay chênh',
    compared_to_yesterday: 'so với hôm qua.',

    Ohno: 'Ghi nhận',
    error_completed_habit: 'Thói quen của hôm nay đang ở đây',

    no_habit: 'Chưa có thói quen nào.',
    no_habit_callaction: 'Nhấn dấu cộng để thêm thói quen đầu tiên.',
    no_habit_tracker: 'Chưa có dữ liệu cho khoảng thời gian này.',
    no_habit_statistic: 'Chưa đủ dữ liệu để vẽ thống kê. Đánh dấu vài ngày rồi quay lại đây.',

    // Trục ngày của biểu đồ chỉ đủ chỗ cho một ký tự. Bản cũ dùng M T W T F S S
    // nên hai cặp trùng key; ở đây mỗi thứ một key riêng.
    d_mon: '2',
    d_tue: '3',
    d_wed: '4',
    d_thu: '5',
    d_fri: '6',
    d_sat: '7',
    d_sun: 'C',

    Mon: 'T2',
    Tue: 'T3',
    Web: 'T4',
    Thu: 'T5',
    Fri: 'T6',
    Sat: 'T7',
    Sun: 'CN',

    for: text.for,
    translate: text.translate,
  } as {
    [Key: string]: any;
  };
};
