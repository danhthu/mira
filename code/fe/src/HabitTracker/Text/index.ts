/**
 * Toàn bộ chuỗi hiển thị của module Thói quen.
 *
 * Giọng theo `docs/00-vision.md`: sentence case, không "nên/phải/hãy", không dấu
 * chấm than, không bao giờ nói người dùng làm chưa đủ. Bỏ một ngày là một sự
 * thật trung tính, không phải thất bại — nên mọi câu ở đây chỉ mô tả trạng thái
 * và luôn kèm được một hành động.
 *
 * Kiểu trả về là bảng chuỗi tường minh (không `any`) để chỗ gọi sai key thì hỏng
 * lúc biên dịch chứ không im lặng ra `undefined` rồi rơi vào chuỗi tiếng Anh dự
 * phòng — đó là cách các câu Batify cũ sống sót qua nhiều đợt dọn.
 */

export type HabitTextKey =
  | 'screen_home'
  | 'screen_statistic'
  | 'screen_add'
  | 'screen_edit'
  | 'screen_detail'
  | 'today'
  | 'save'
  | 'add'
  | 'edit'
  | 'delete'
  | 'cancel'
  | 'keep_history'
  | 'drop_history'
  | 'delete_question'
  | 'habit_name'
  | 'end_date'
  | 'note'
  | 'add_own'
  | 'add_own_hint'
  | 'pick_one'
  | 'tab_suggested'
  | 'tab_all'
  | 'tab_week'
  | 'tab_overall'
  | 'week_of'
  | 'marked_today'
  | 'marked_none_today'
  | 'total_marked'
  | 'total_days'
  | 'days_this_month'
  | 'volume_this_month'
  | 'volume_total'
  | 'volume_daily'
  | 'month_view'
  | 'record_view'
  | 'select_habit'
  | 'empty_habit'
  | 'empty_habit_action'
  | 'empty_week'
  | 'empty_week_action'
  | 'empty_overall'
  | 'empty_overall_action'
  | 'empty_record'
  | 'empty_template'
  | 'future_day'
  | 'unit_day'
  | 'unit_time'
  | 'repeat_daily'
  | 'repeat_weekly'
  | 'repeat_monthly'
  | 'no_repeat'
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'sun';

const vi: Record<HabitTextKey, string> = {
  screen_home: 'Thói quen',
  screen_statistic: 'Nhìn lại',
  screen_add: 'Thêm thói quen',
  screen_edit: 'Sửa thói quen',
  screen_detail: 'Chi tiết',

  today: 'Hôm nay',
  save: 'Lưu',
  add: 'Thêm',
  edit: 'Sửa',
  delete: 'Xoá thói quen này',
  cancel: 'Bỏ qua',
  keep_history: 'Xoá, giữ lại lịch sử',
  drop_history: 'Xoá cả lịch sử',
  delete_question: 'Bạn muốn giữ lại lịch sử đã ghi của thói quen này chứ',

  habit_name: 'Tên thói quen',
  end_date: 'Ngày kết thúc',
  note: 'Ghi chú',

  add_own: 'Tự đặt một thói quen',
  add_own_hint: 'Chạm dấu cộng để thêm ngay, sửa lại sau cũng được',
  pick_one: 'Chọn một thói quen',
  tab_suggested: 'Gợi ý',
  tab_all: 'Tất cả',

  tab_week: 'Tuần này',
  tab_overall: 'Tổng thể',
  week_of: 'Tuần',

  marked_today: 'đã ghi hôm nay',
  marked_none_today: 'chưa ghi gì hôm nay',
  total_marked: 'Lần đã ghi',
  total_days: 'Số ngày có ghi',
  days_this_month: 'Ngày có ghi trong tháng',
  volume_this_month: 'Khối lượng trong tháng',
  volume_total: 'Khối lượng cộng dồn',
  volume_daily: 'Trung bình mỗi ngày',

  month_view: 'Theo tháng',
  record_view: 'Số liệu',
  select_habit: 'Chọn thói quen',

  empty_habit: 'Chưa có thói quen nào ở đây',
  empty_habit_action: 'Thêm thói quen đầu tiên',
  empty_week: 'Tuần này chưa có thói quen nào để nhìn lại',
  empty_week_action: 'Thêm một thói quen',
  empty_overall: 'Chưa có ngày nào được ghi',
  empty_overall_action: 'Về danh sách thói quen',
  empty_record: 'Chưa có số liệu cho khoảng thời gian này',
  empty_template: 'Chưa có gợi ý nào ở nhóm này',

  future_day: 'Ngày này chưa tới, bạn ghi lại sau nhé',

  unit_day: 'ngày',
  unit_time: 'lần',

  repeat_daily: 'Mỗi ngày',
  repeat_weekly: 'ngày mỗi tuần',
  repeat_monthly: 'ngày mỗi tháng',
  no_repeat: 'Không lặp lại',

  mon: 'T2',
  tue: 'T3',
  wed: 'T4',
  thu: 'T5',
  fri: 'T6',
  sat: 'T7',
  sun: 'CN',
};

export const useText = (): Record<HabitTextKey, string> => vi;
