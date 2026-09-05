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
    mn_add: 'Thêm',
    mn_settings: 'Thiết lập',
    mn_staticlist: 'Danh sách cố định',
    mn_statistic: 'Thống kê',

    home_title: 'Thời gian của bạn',
    add_title: 'Ghi thời gian',
    detail_title: 'Thời gian sử dụng',
    tuannaycuaban: 'Thời gian trong tuần',
    hoatdonghangngay: 'Hoạt động hàng ngày',

    cat_label: 'Danh mục',
    cat_time: 'Thời gian',
    choose_cat: 'Chọn khoảng thời gian ',
    chonngay: 'Chọn ngày',
    danhmuc: 'Tất cả',
    tatca: 'Tất cả',
    settingsCat_title: 'Thiết lập danh mục thời gian',
    settings_group_desc_cat: 'Thiết lập danh mục thời gian',
    settings_group_label_cat: 'Danh mục thời gian',

    name: 'Hoạt động',
    label: 'Tên',
    day: 'Ngày',
    ngay: 'Ngày',
    thoiluong: 'Thời lượng',
    complete: 'Hoàn thành',
    edit: 'Sửa',
    save: 'Lưu',
    deleted: 'Đã xóa',

    work: 'Công việc',
    congviec: 'Công việc',
    family: 'Gia đình',
    personal: 'Cá nhân',
    thoiquen: 'Thói quen',
    waste: 'Trôi đi',

    for: text.for,
    translate: text.translate,
  } as {
    [Key: string]: any;
  };
};
