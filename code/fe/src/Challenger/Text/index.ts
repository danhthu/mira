/**
 * Toàn bộ chuỗi hiển thị của module Thử thách.
 *
 * Giọng theo `docs/00-vision.md`: sentence case, không "nên/phải/hãy", không dấu
 * chấm than. Không có chữ "thất bại" ở bất kỳ đâu — một thử thách hết hạn mà
 * người dùng chưa đánh dấu thì chỉ *khép lại*, và buông một mục tiêu là một lựa
 * chọn chứ không phải một điểm trừ.
 *
 * Kiểu trả về là bảng chuỗi tường minh (không `any`): gọi sai key thì hỏng lúc
 * biên dịch chứ không im lặng rơi về chuỗi tiếng Anh dự phòng — chính mẫu
 * `text.key || 'English fallback'` đã giữ các câu tiếng Anh của Batify sống sót
 * qua nhiều đợt dọn.
 */

export type ChallengerTextKey =
  | 'screen_home'
  | 'screen_add'
  | 'screen_edit'
  | 'screen_detail'
  | 'screen_habit_selection'
  | 'screen_work_selection'
  | 'save'
  | 'cancel'
  | 'edit'
  | 'pick_image'
  | 'empty_title'
  | 'empty_action'
  | 'home_hint'
  | 'name'
  | 'note'
  | 'start_date'
  | 'end_date'
  | 'reward'
  | 'reward_hint'
  | 'link'
  | 'link_habit'
  | 'link_work'
  | 'link_empty'
  | 'link_challenge'
  | 'link_remove'
  | 'state_upcoming'
  | 'state_doing'
  | 'state_reached'
  | 'state_closed'
  | 'mark_reached'
  | 'mark_reopen'
  | 'closed_note'
  | 'unit_day'
  | 'days_left'
  | 'days_passed'
  | 'starts_in'
  | 'window'
  | 'empty_selection';

export type ChallengerText = Record<ChallengerTextKey, string>;

const vi: ChallengerText = {
  screen_home: 'Thử thách',
  screen_add: 'Thử thách mới',
  screen_edit: 'Sửa thử thách',
  screen_detail: 'Chi tiết',
  screen_habit_selection: 'Chọn thói quen',
  screen_work_selection: 'Chọn công việc',

  save: 'Lưu',
  cancel: 'Bỏ qua',
  edit: 'Sửa',
  pick_image: 'Đổi ảnh',

  empty_title: 'Chưa có thử thách nào ở đây',
  empty_action: 'Tạo thử thách đầu tiên',
  home_hint:
    'Một thử thách là việc bạn tự đặt cho mình trong một quãng thời gian có hạn',

  name: 'Tên thử thách',
  note: 'Ghi chú',
  start_date: 'Bắt đầu',
  end_date: 'Kết thúc',
  reward: 'Phần thưởng',
  reward_hint: 'Thứ bạn tự thưởng khi thử thách trọn vẹn',

  link: 'Gắn với',
  link_habit: 'Một thói quen',
  link_work: 'Một công việc',
  link_empty: 'Chưa gắn với việc nào',
  link_challenge: 'Gắn với một thử thách',
  link_remove: 'Bỏ liên kết',

  state_upcoming: 'Sắp bắt đầu',
  state_doing: 'Đang diễn ra',
  state_reached: 'Đã đạt',
  state_closed: 'Đã khép lại',

  mark_reached: 'Đánh dấu đã đạt',
  mark_reopen: 'Mở lại thử thách',
  closed_note:
    'Quãng thời gian này đã qua. Bạn có thể mở lại, hoặc để nó khép ở đây',

  unit_day: 'ngày',
  days_left: 'còn lại',
  days_passed: 'đã qua',
  starts_in: 'bắt đầu sau',
  window: 'Khoảng thời gian',

  empty_selection: 'Không còn mục nào để chọn',
};

export const useText = (): ChallengerText => vi;
