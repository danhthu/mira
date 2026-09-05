/**
 * Chuỗi hiển thị của module Nhịp xem giá.
 *
 * Bản cũ mở đầu bằng "Trading Time Tracker" và chia mọi ngày thành hai danh
 * sách: "các ngày đạt mục tiêu" tô xanh, "các ngày không đạt mục tiêu" tô đỏ.
 * Đó đúng là thứ ràng buộc cứng #3 cấm — dùng màu đỏ để báo người dùng làm chưa
 * đủ. Ở đây không còn chữ "đạt"/"không đạt" nào: app chỉ đếm và kể lại.
 */

export type TradingTextKey =
  | 'screen_title'
  | 'intro'
  | 'gap_label'
  | 'gap_hint'
  | 'gap_unit'
  | 'gap_save'
  | 'gap_invalid'
  | 'today_count'
  | 'today_times'
  | 'log_view'
  | 'recent_days'
  | 'empty_today'
  | 'empty_days'
  | 'shortest_gap'
  | 'unit_minute';

export type TradingText = Record<TradingTextKey, string>;

const vi: TradingText = {
  screen_title: 'Nhịp xem giá',
  intro:
    'Mỗi lần mở bảng giá là một lát thời gian rời khỏi việc khác. Ở đây chỉ có số lần và khoảng cách giữa chúng',

  gap_label: 'Khoảng cách bạn muốn giữa hai lần xem',
  gap_hint: 'Nhập số phút',
  gap_unit: 'phút',
  gap_save: 'Lưu khoảng cách',
  gap_invalid: 'Khoảng cách tính bằng phút, là một số lớn hơn 0',

  today_count: 'Hôm nay',
  today_times: 'lần',
  log_view: 'Ghi một lần xem giá',
  recent_days: 'Bảy ngày gần đây',

  empty_today: 'Hôm nay chưa ghi lần nào',
  empty_days: 'Chưa có ngày nào được ghi',

  shortest_gap: 'khoảng ngắn nhất',
  unit_minute: 'phút',
};

export const useText = (): TradingText => vi;
