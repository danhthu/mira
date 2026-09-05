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

    title: 'Thử thách của bạn',
    add_title: 'Thêm thử thách',
    edit_title: 'Điều chỉnh',
    add_tips: 'Thử thách là một việc bạn tự đặt cho mình trong một quãng thời gian có hạn.',
    empty_row: 'Chưa có thử thách nào. Nhấn dấu cộng để tạo thử thách đầu tiên.',

    LinkActionSheet: 'Chọn liên kết',
    LinkActionSheetCancel: 'Hủy',
    LinkActionTypeHabit: 'Liên kết thói quen',
    LinkActionTypeWork: 'Liên kết công việc',
    chonthuthach: 'Liên kết thử thách',
    habitSelectionTitle: 'Chọn thói quen',
    lienket: 'Liên kết',

    batdau: 'Chọn thời gian bắt đầu',
    ketthuc: 'Chọn thời gian kết thúc',
    cancel: 'Hủy',
    save: 'Lưu',
    sua: 'Sửa',
    completed: 'Đã xong',
    done: 'Xong',
    current: 'Hiện tại',
    result: 'Kết quả',
    running: 'Đang chạy',
    thanhcong: 'Đã đạt',
    thatbai: 'Chưa đạt',
    onTime: 'Đúng thời hạn',
    orther: 'Khác',
    target: 'Mục tiêu',
    configure_target: 'Thiết lập mục tiêu',
    ten: 'Tên thử thách',
    thuthach: 'Thử thách',
    ghichu: 'Ghi chú',
    gif: 'Phần thưởng',
    gift: 'Phần thưởng',
    day: 'ngày',
    days: ' ngày',

    chonanh: 'Chọn ảnh',
    chonanhthuvien: 'Chọn ảnh từ thư viện',
    chonanhtumay: 'Chọn ảnh từ máy',
    title_icon_selection: 'Chọn hình ảnh',

    for: text.for,
    translate: text.translate,
  } as {
    [Key: string]: any;
  };
};
