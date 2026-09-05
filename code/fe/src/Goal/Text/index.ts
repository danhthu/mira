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

    title: 'Mục tiêu của bạn',
    add_title: 'Thêm mục tiêu',
    add_tips: 'Mục tiêu là điều bạn muốn tới, viết ra để lần sau còn nhớ mình đang đi đâu.',
    empty_row: 'Chưa có mục tiêu nào. Nhấn dấu cộng để viết ra mục tiêu đầu tiên.',

    LinkActionSheet: 'Chọn liên kết',
    LinkActionSheetCancel: 'Hủy',
    LinkActionTypeHabit: 'Liên kết thói quen',
    LinkActionTypeWork: 'Liên kết công việc',
    habitSelectionTitle: 'Chọn thói quen',
    lienket: 'Liên kết',

    cancel: 'Hủy',
    save: 'Lưu',
    sua: 'Sửa',
    completed: 'Đã xong',
    done: 'Xong',
    current: 'Hiện tại',
    datduoc: 'Đạt được',
    result: 'Kết quả',
    onTime: 'Đúng thời hạn',
    orther: 'Khác',
    target: 'Mục tiêu',
    configure_target: 'Thiết lập mục tiêu',
    muctieu: 'Mục tiêu',
    long: 'Dài hạn',
    short: 'Ngắn hạn',
    milestone_title: 'Thiết lập cột mốc',
    milestones: 'Cột mốc',
    ghichu: 'Ghi chú',
    gift: 'Phần thưởng',
    day: 'ngày',
    days: ' ngày',

    chonanh: 'Chọn ảnh',
    chonanhthuvien: 'Chọn ảnh từ thư viện',
    chonanhtumay: 'Chọn ảnh từ máy',

    for: text.for,
    translate: text.translate,
  } as {
    [Key: string]: any;
  };
};
