import { dayLabel } from '../lib/byDay';

/**
 * Đầu một ngày trong danh sách: số ngày to, thứ và tháng nhỏ, tổng của ngày bên phải.
 *
 * Khuôn lấy đúng từ Money Lover. Nó làm hai việc mà danh sách phẳng không làm được:
 * ngày chỉ nói một lần thay vì nhắc lại ở từng dòng, và **tổng của ngày** — câu "hôm đó
 * tiêu hết bao nhiêu" trước đây không chỗ nào trả lời.
 */
export function DayHead({ date, total }: { readonly date: string; readonly total: string }) {
  const n = dayLabel(date);
  return (
    <div className="day-head">
      <b className="day-head__so">{n.day}</b>
      <span className="day-head__giua">
        <span className="day-head__thu">{n.weekday}</span>
        <span className="sm">{n.month}</span>
      </span>
      <b className="day-head__tong">{total}</b>
    </div>
  );
}
