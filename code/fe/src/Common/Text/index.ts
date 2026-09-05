import { useText as useCommonText } from '../../../lang';

/**
 * Chuỗi dùng chung. Kiểu trả về giữ nguyên `[Key: string]: any` của Batify —
 * hơn 100 màn đang đọc key tự do trên object này, siết kiểu ở đây là vỡ hết.
 */
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

    checklistDesc: 'Những mục cần đánh dấu khi làm xong',
    chinhsua: 'Chỉnh sửa',
    chongio: 'Chọn giờ',
    chongnay: 'Chọn ngày',
    chonmau: 'Chọn màu',
    chonngaygio: 'Chọn ngày và giờ',
    chonthoigian: 'Chọn thời gian',
    cuoingay: 'Cuối ngày',
    ghichu: 'Ghi chú',
    goal: 'Mục tiêu',
    hangnay: 'Hàng ngày',
    hangthang: 'Hàng tháng',
    hangtuan: 'Hàng tuần',
    hoanthanh: 'Xong',
    homnay: 'Hôm nay',
    lamtrongngay: 'Bắt buộc trong ngày',
    laplai: 'Lặp lại',
    laplaimoi: 'Lặp lại mỗi...',
    loaibo: 'Loại bỏ',
    ngaylam: 'Ngày làm',
    ngaymai: 'Ngày mai',
    ngaytrongtuan: 'Ngày trong tuần',
    perday: 'mỗi ngày',
    quaylai: 'Quay lại',
    reminder: 'Nhắc tôi',
    save: 'Lưu',
    setagoal: 'Đặt một mục tiêu',
    tag: 'Thẻ',
    them: 'Thêm',
    tuantoi: 'Tuần tới',
    tuychinh: 'Tùy chỉnh',
    xemtruoc: 'Xem trước',
    xong: 'Xong',

    glasses: 'ly',
    km: 'km',
    m: 'm',
    miles: 'dặm',
    mins: 'phút',
    ml: 'ml',
    oz: 'oz',
    pages: 'trang',
    times: 'lần',

    Common: text,
    for: text.for,
    translate: text.translate,
  } as {
    [Key: string]: any;
  };
};
