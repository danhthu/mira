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
    mn_listwork: 'Danh sách công việc',
    mn_schedule: 'Lịch làm việc',
    mn_settings: 'Thiết lập',

    congviec: 'Công việc',
    todo: 'Công việc',
    day: 'Việc trong ngày',
    today: 'Trong ngày',
    tomorrow: 'Ngày mai',
    ngaymai: 'Ngày mai',
    month: 'Tháng',
    viecton: 'Tồn đọng',
    unknow: 'Chưa sắp xếp',
    chuasapxep: 'Chưa lên lịch',
    scheduler: 'Sắp xếp thời gian',
    moveToTomorrow: 'Mai làm',
    pending: 'Khác',
    filter: 'Tùy chỉnh thống kê',
    chon: 'Chọn',
    chonngay: 'Chọn',
    chongaybatdau: 'Ngày bắt đầu',
    ngayketthuc: 'Ngày kết thúc',

    batbuoc: 'Bắt buộc',
    mandatory: 'Bắt buộc',
    xongtrongngay: 'Bắt buộc',
    complete: 'Hoàn thành',
    hoanthanh: 'Đã xong',
    dunghan: 'Đúng hạn',
    quahan: 'Sau hạn',
    total: 'Tổng',
    ontime: 'Việc một lần',
    work_logan: ' một lúc một việc ',
    trytocomplete: 'Làm xong rồi nghỉ',
    nhiemvuhoantattronghomnay: 'Đã hoàn thành hôm nay ',
    mandatory_completed: 'Các việc bắt buộc hôm nay đã xong',
    daxonghetviec: 'Việc hôm nay đã xong hết',

    deleted: 'Xóa',
    confirm_deleted: 'Xóa mục này chứ?',
    xoathanhcong: 'Đã xóa công việc',
    donesuccess: 'Đã đánh dấu xong',
    Ok: 'Ok',
    ok: 'Ok',

    no_work_today: 'Hôm nay chưa có việc nào. Nhấn dấu cộng để thêm việc đầu tiên.',
    no_work_mandatory: 'Chưa có việc nào được đánh dấu bắt buộc. Chạm vào một việc để đánh dấu.',

    for: text.for,
    translate: text.translate,
  } as {
    [Key: string]: any;
    translate: (name: string, def?: string) => string
  };
};
